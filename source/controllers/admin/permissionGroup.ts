import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Permission Group';

const getPermissionGroup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Permission Group');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;

                let countResult = await query("SELECT COUNT(id) as totalCount FROM permissiongroup");
                let sql = "SELECT * FROM permissiongroup ORDER BY id DESC";
                if (startIndex >= 0 && fetchRecords > 0) {
                    sql += ` LIMIT ` + fetchRecords + ` OFFSET ` + startIndex;
                }
                let result = await query(sql);
                if (result && result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        let pageSql = `SELECT pgp.*, p.displayName as displayName FROM permissiongrouppages pgp INNER JOIN pages p ON p.id = pgp.pageId WHERE pgp.permissionGroupId = ` + result[i].id;
                        let pageResult = await query(pageSql);
                        if (pageResult && pageResult.length > 0) {
                            result[i].pages = pageResult;
                        }
                    }
                    let successResult = new ResultSuccess(200, true, 'Get Group Permission', result, countResult[0].totalCount);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(200, true, "Data Not Found", result, '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'permissionGroup.getPermissionGroup() Exception', error, '');
        next(errorResult);
    }
};

const insertPermissionGroup = async (req: Request, res: Response, next: NextFunction) => {
    await beginTransaction();
    try {
        logging.info(NAMESPACE, 'Inserting Permission Group');
        var requiredFields = ['name', 'pagePermissions'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let insertGroupSql = `INSERT INTO permissiongroup(name, createdBy, modifiedBy) VALUES('` + req.body.name + `', ` + userId + `, ` + userId + `)`;
                let result = await query(insertGroupSql);
                if (result && result.insertId > 0) {
                    if (req.body.pagePermissions && req.body.pagePermissions.length > 0) {
                        let groupId = result.insertId;
                        for (let u = 0; u < req.body.pagePermissions.length; u++) {
                            let pagePermissionSql = `INSERT INTO permissiongrouppages(permissionGroupId, pageId, readPermission, writePermission, editPermission, deletePermission, isAdminVerificationRequired, createdBy, modifiedBy) 
                            VALUES(`+ groupId + `, ` + req.body.pagePermissions[u].pageId + `, ` + req.body.pagePermissions[u].readPermission + `, ` + req.body.pagePermissions[u].writePermission + `
                            , ` + req.body.pagePermissions[u].editPermission + `, ` + req.body.pagePermissions[u].deletePermission + `, ` + req.body.pagePermissions[u].isAdminVerificationRequired + `, ` + userId + `, ` + userId + `)`;
                            result = await query(pagePermissionSql);
                            if (result && result.insertId > 0) {
                                //
                            } else {
                                await rollback();
                                let errorResult = new ResultError(400, true, "Error While Inserting Page Permission", result, '');
                                next(errorResult);
                            }
                        }
                    }
                } else {
                    await rollback();
                    let errorResult = new ResultError(400, true, "Error While Inserting Page Group Permission", result, '');
                    next(errorResult);
                }
                await commit();
                let successResult = new ResultSuccess(200, true, 'Inserting Page Permission Successfully', [], 0);
                return res.status(200).send(successResult);
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'permissionGroup.getPermissionGroup() Exception', error, '');
        next(errorResult);
    }
};

const updatePermissionGroup = async (req: Request, res: Response, next: NextFunction) => {
    await beginTransaction();
    try {
        logging.info(NAMESPACE, 'Updating Permission Group');
        var requiredFields = ['id', 'name', 'pagePermissions'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let insertGroupSql = `UPDATE permissiongroup SET name = '` + req.body.name + `', modifiedBy=` + userId + `, modifiedDate = CURRENT_TIMESTAMP() WHERE id = ` + req.body.id;
                let result = await query(insertGroupSql);
                if (result && result.affectedRows > 0) {
                    if (req.body.pagePermissions && req.body.pagePermissions.length > 0) {
                        let groupId = req.body.id;
                        for (let u = 0; u < req.body.pagePermissions.length; u++) {
                            if (req.body.pagePermissions[u].id) {
                                let updateQuery = `UPDATE permissiongrouppages SET pageId = ` + req.body.pagePermissions[u].pageId + `, readPermission = ` + req.body.pagePermissions[u].readPermission + `
                                , writePermission = ` + req.body.pagePermissions[u].writePermission + `, editPermission = ` + req.body.pagePermissions[u].editPermission + `, deletePermission = ` + req.body.pagePermissions[u].deletePermission + `
                                , isAdminVerificationRequired = ` + req.body.pagePermissions[u].isAdminVerificationRequired + `, modifiedBy = ` + userId + `, modifiedDate = CURRENT_TIMESTAMP() WHERE id = ` + req.body.pagePermissions[u].id;
                                result = await query(updateQuery);
                                if (result && result.affectedRows > 0) {
                                    //
                                } else {
                                    await rollback();
                                    let errorResult = new ResultError(400, true, "Error While Updating Page Permission", result, '');
                                    next(errorResult);
                                }
                            } else {
                                let pagePermissionSql = `INSERT INTO permissiongrouppages(permissionGroupId, pageId, readPermission, writePermission, editPermission, deletePermission, isAdminVerificationRequired, createdBy, modifiedBy) 
                                VALUES(`+ groupId + `, ` + req.body.pagePermissions[u].pageId + `, ` + req.body.pagePermissions[u].readPermission + `, ` + req.body.pagePermissions[u].writePermission + `
                                , ` + req.body.pagePermissions[u].editPermission + `, ` + req.body.pagePermissions[u].deletePermission + `, ` + req.body.pagePermissions[u].isAdminVerificationRequired + `, ` + userId + `, ` + userId + `)`;
                                result = await query(pagePermissionSql);
                                if (result && result.insertId > 0) {
                                    //
                                } else {
                                    await rollback();
                                    let errorResult = new ResultError(400, true, "Error While Inserting Page Permission", result, '');
                                    next(errorResult);
                                }
                            }
                        }
                    }
                    await commit();
                    let successResult = new ResultSuccess(200, true, 'Inserting Page Permission Successfully', [], 0);
                    return res.status(200).send(successResult);
                } else {
                    await rollback();
                    let errorResult = new ResultError(400, true, "Error While Inserting Page Group Permission", result, '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'permissionGroup.getPermissionGroup() Exception', error, '');
        next(errorResult);
    }
};


export default { getPermissionGroup, insertPermissionGroup, updatePermissionGroup }