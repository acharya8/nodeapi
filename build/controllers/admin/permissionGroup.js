"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../../config/logging"));
const config_1 = __importDefault(require("../../config/config"));
const mysql = require('mysql');
const util = require('util');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
var connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.pass,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'Permission Group';
const getPermissionGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Permission Group');
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let countResult = yield query("SELECT COUNT(id) as totalCount FROM permissiongroup");
                let sql = "SELECT * FROM permissiongroup ORDER BY id DESC";
                if (startIndex >= 0 && fetchRecords > 0) {
                    sql += ` LIMIT ` + fetchRecords + ` OFFSET ` + startIndex;
                }
                let result = yield query(sql);
                if (result && result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        let pageSql = `SELECT pgp.*, p.displayName as displayName FROM permissiongrouppages pgp INNER JOIN pages p ON p.id = pgp.pageId WHERE pgp.permissionGroupId = ` + result[i].id;
                        let pageResult = yield query(pageSql);
                        if (pageResult && pageResult.length > 0) {
                            result[i].pages = pageResult;
                        }
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Group Permission', result, countResult[0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(200, true, "Data Not Found", result, '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'permissionGroup.getPermissionGroup() Exception', error, '');
        next(errorResult);
    }
});
const insertPermissionGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield beginTransaction();
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Permission Group');
        var requiredFields = ['name', 'pagePermissions'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let insertGroupSql = `INSERT INTO permissiongroup(name, createdBy, modifiedBy) VALUES('` + req.body.name + `', ` + userId + `, ` + userId + `)`;
                let result = yield query(insertGroupSql);
                if (result && result.insertId > 0) {
                    if (req.body.pagePermissions && req.body.pagePermissions.length > 0) {
                        let groupId = result.insertId;
                        for (let u = 0; u < req.body.pagePermissions.length; u++) {
                            let pagePermissionSql = `INSERT INTO permissiongrouppages(permissionGroupId, pageId, readPermission, writePermission, editPermission, deletePermission, isAdminVerificationRequired, createdBy, modifiedBy) 
                            VALUES(` + groupId + `, ` + req.body.pagePermissions[u].pageId + `, ` + req.body.pagePermissions[u].readPermission + `, ` + req.body.pagePermissions[u].writePermission + `
                            , ` + req.body.pagePermissions[u].editPermission + `, ` + req.body.pagePermissions[u].deletePermission + `, ` + req.body.pagePermissions[u].isAdminVerificationRequired + `, ` + userId + `, ` + userId + `)`;
                            result = yield query(pagePermissionSql);
                            if (result && result.insertId > 0) {
                                //
                            }
                            else {
                                yield rollback();
                                let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Page Permission", result, '');
                                next(errorResult);
                            }
                        }
                    }
                }
                else {
                    yield rollback();
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Page Group Permission", result, '');
                    next(errorResult);
                }
                yield commit();
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Inserting Page Permission Successfully', [], 0);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'permissionGroup.getPermissionGroup() Exception', error, '');
        next(errorResult);
    }
});
const updatePermissionGroup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    yield beginTransaction();
    try {
        logging_1.default.info(NAMESPACE, 'Updating Permission Group');
        var requiredFields = ['id', 'name', 'pagePermissions'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let insertGroupSql = `UPDATE permissiongroup SET name = '` + req.body.name + `', modifiedBy=` + userId + `, modifiedDate = CURRENT_TIMESTAMP() WHERE id = ` + req.body.id;
                let result = yield query(insertGroupSql);
                if (result && result.affectedRows > 0) {
                    if (req.body.pagePermissions && req.body.pagePermissions.length > 0) {
                        let groupId = req.body.id;
                        for (let u = 0; u < req.body.pagePermissions.length; u++) {
                            if (req.body.pagePermissions[u].id) {
                                let updateQuery = `UPDATE permissiongrouppages SET pageId = ` + req.body.pagePermissions[u].pageId + `, readPermission = ` + req.body.pagePermissions[u].readPermission + `
                                , writePermission = ` + req.body.pagePermissions[u].writePermission + `, editPermission = ` + req.body.pagePermissions[u].editPermission + `, deletePermission = ` + req.body.pagePermissions[u].deletePermission + `
                                , isAdminVerificationRequired = ` + req.body.pagePermissions[u].isAdminVerificationRequired + `, modifiedBy = ` + userId + `, modifiedDate = CURRENT_TIMESTAMP() WHERE id = ` + req.body.pagePermissions[u].id;
                                result = yield query(updateQuery);
                                if (result && result.affectedRows > 0) {
                                    //
                                }
                                else {
                                    yield rollback();
                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Updating Page Permission", result, '');
                                    next(errorResult);
                                }
                            }
                            else {
                                let pagePermissionSql = `INSERT INTO permissiongrouppages(permissionGroupId, pageId, readPermission, writePermission, editPermission, deletePermission, isAdminVerificationRequired, createdBy, modifiedBy) 
                                VALUES(` + groupId + `, ` + req.body.pagePermissions[u].pageId + `, ` + req.body.pagePermissions[u].readPermission + `, ` + req.body.pagePermissions[u].writePermission + `
                                , ` + req.body.pagePermissions[u].editPermission + `, ` + req.body.pagePermissions[u].deletePermission + `, ` + req.body.pagePermissions[u].isAdminVerificationRequired + `, ` + userId + `, ` + userId + `)`;
                                result = yield query(pagePermissionSql);
                                if (result && result.insertId > 0) {
                                    //
                                }
                                else {
                                    yield rollback();
                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Page Permission", result, '');
                                    next(errorResult);
                                }
                            }
                        }
                    }
                    yield commit();
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Inserting Page Permission Successfully', [], 0);
                    return res.status(200).send(successResult);
                }
                else {
                    yield rollback();
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Page Group Permission", result, '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'permissionGroup.getPermissionGroup() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getPermissionGroup, insertPermissionGroup, updatePermissionGroup };
