import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { Menu } from '../../classes/output/admin/menu';

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
})

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'User Pages';

const getPages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Pages');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminGetPageList()`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0].length > 0) {
                        let response = new Array<Menu>();
                        if (result[0] && result[0].length > 0) {
                            for (let i = 0; i < result[0].length; i++) {
                                let obj = new Menu();
                                if (result[0][i].parentId) {
                                    let childObj = new Menu();
                                    childObj.id = result[0][i].id;
                                    childObj.title = result[0][i].displayName;
                                    childObj.path = result[0][i].url;
                                    childObj.name = result[0][i].name;
                                    childObj.icon = result[0][i].icon;
                                    childObj.type = result[0][i].type;
                                    childObj.isActive = result[0][i].isActive;
                                    childObj.isDelete = result[0][i].isDelete;
                                    childObj.parentId = result[0][i].parentId;
                                    childObj.children = [];
                                    if (response && response.length > 0) {
                                        let ind = response.findIndex(c => c.id == result[0][i].parentId);
                                        if (ind >= 0) {
                                            response[ind].children.push(childObj);
                                        }
                                    }
                                    //  else {

                                    // }
                                } else {
                                    obj.id = result[0][i].id;
                                    obj.title = result[0][i].displayName;
                                    obj.path = result[0][i].url;
                                    obj.name = result[0][i].name;
                                    obj.icon = result[0][i].icon;
                                    obj.type = result[0][i].type;
                                    obj.isActive = result[0][i].isActive;
                                    obj.isDelete = result[0][i].isDelete;
                                    obj.active = false;
                                    obj.parentId = result[0][i].parentId;
                                    obj.children = [];
                                    response.push(obj);
                                }
                            }
                        }
                        let successResult = new ResultSuccess(200, true, 'Get Pages Successfully', response, response.length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Get Pages Successfully', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "userPages.getPages() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'userPages.getPages() Exception', error, '');
        next(errorResult);
    }
}

const getUserPages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting User Pages');
        var requiredFields = ['userId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminGetUserPagePermission(` + req.body.userId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Get User Pages Successfully', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Get User Pages Successfully', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "userPages.getUserPages() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'userPages.getUserPages() Exception', error, '');
        next(errorResult);
    }
}

const insertUserPages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await beginTransaction();
        let result;
        logging.info(NAMESPACE, 'Inserting User Pages');
        var requiredFields = ['userPages', 'userId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;

                let getSql = `SELECT * FROM userpages WHERE  userId = ` + req.body.userId;
                let getResult = await query(getSql);
                if (getResult && getResult.length > 0) {
                    let ar1 = getResult.map(c => c.pageId);
                    let ar2 = req.body.userPages.map(c => c.pageId)
                    var elmts = ar1.filter(f => !ar2.includes(f));
                    console.log(elmts);
                    if (elmts && elmts.length > 0) {
                        let delSql = "DELETE FROM userpages WHERE userId = " + req.body.userId + " AND pageId IN(" + elmts.toString() + ")";
                        result = await query(delSql);
                    }
                }

                if (req.body.userPages && req.body.userPages.length > 0) {
                    for (let i = 0; i < req.body.userPages.length; i++) {
                        req.body.userPages[i].readPermission = req.body.userPages[i].readPermission ? req.body.userPages[i].readPermission : false;
                        req.body.userPages[i].writePermission = req.body.userPages[i].writePermission ? req.body.userPages[i].writePermission : false;
                        req.body.userPages[i].editPermission = req.body.userPages[i].editPermission ? req.body.userPages[i].editPermission : false;
                        req.body.userPages[i].deletePermission = req.body.userPages[i].deletePermission ? req.body.userPages[i].deletePermission : false;

                        if (req.body.userPages[i].id && req.body.userPages[i].id > 0) {
                            let sql = `UPDATE userpages SET userId = ` + req.body.userId + `, pageId = ` + req.body.userPages[i].pageId + `, readPermission = ` + req.body.userPages[i].readPermission + `, writePermission = ` + req.body.userPages[i].writePermission + `
                            , editPermission = ` + req.body.userPages[i].editPermission + `, deletePermission = ` + req.body.userPages[i].deletePermission + `, modifiedBy = ` + currentUser.id + `, modifiedDate = CURRENT_TIMESTAMP() WHERE id = ` + req.body.userPages[i].id;
                            result = await query(sql);
                            if (result && result.affectedRows > 0) {
                                //
                            } else {
                                await rollback();
                                let errorResult = new ResultError(400, true, "Error While Updating User Page Permission", result, '');
                                next(errorResult);
                            }
                        } else {
                            let sql = `INSERT INTO userpages(userId, pageId, readPermission, writePermission, editPermission, deletePermission, createdBy, modifiedBy) VALUES(` + req.body.userId + `,` + req.body.userPages[i].pageId + `,` + req.body.userPages[i].readPermission + `,` + req.body.userPages[i].writePermission + `
                            ,` + req.body.userPages[i].editPermission + `,` + req.body.userPages[i].deletePermission + `,` + currentUser.id + `,` + currentUser.id + `)`;
                            result = await query(sql);
                            if (result && result.affectedRows > 0) {
                                //
                            } else {
                                await rollback();
                                let errorResult = new ResultError(400, true, "Error While Updating User Page Permission", result, '');
                                next(errorResult);
                            }
                        }
                    }
                    await commit();
                    let successResult = new ResultSuccess(200, true, 'Updating User Page Permission Successfully', [], 0);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Page Permission List is Required", new Error('Page Permission List is Required'), '');
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
        await rollback();
        let errorResult = new ResultError(500, true, 'userPages.insertUserPages() Exception', error, '');
        next(errorResult);
    }
}

export default { getPages, getUserPages, insertUserPages };