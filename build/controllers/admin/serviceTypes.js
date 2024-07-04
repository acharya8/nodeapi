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
const AWS = require('aws-sdk');
var crypto = require('crypto');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
var connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.pass,
    database: config_1.default.mysql.database
});
const S3 = new AWS.S3({
    accessKeyId: config_1.default.s3bucket.aws_Id,
    secretAccessKey: config_1.default.s3bucket.aws_secret
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'Service Types';
const getServiceTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Service Types');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let sql = `CALL adminGetServiceTypes(` + startIndex + `,` + fetchRecords + `)`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1]) {
                    if (result[1].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Service Type Successfully', result[1], result[0][0].totalCount);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Service Type Successfully', [], result[0][0].totalCount);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "serviceTypes.getServiceTypes() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceTypes.getServiceTypes() Exception', error, '');
        next(errorResult);
    }
});
const insertServiceTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Service Types');
        var requiredFields = ['name', 'displayName', 'iconUrl'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let name = req.body.name;
                let displayName = req.body.displayName;
                let description = req.body.description ? req.body.description : "";
                let colorCode = req.body.colorCode ? req.body.colorCode : "";
                let userId = currentUser.id;
                let imgSplit = req.body.iconUrl.split(',');
                let contentType = imgSplit[0].split(";")[0].split(":")[1];
                let fileExt = contentType.split("/")[1].split("+")[0];
                let buf = Buffer.from(imgSplit[1], 'base64');
                let keyName = displayName.replace(" ", "_");
                let params = {
                    Bucket: 'servicetype',
                    Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                    Body: buf,
                    ContentEncoding: 'base64',
                    ContentType: contentType,
                    ACL: 'public-read'
                };
                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                    if (error) {
                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                        next(errorResult);
                        return;
                    }
                    console.log(data);
                    let sql = `CALL adminInsertServiceTypes('` + name + `','` + displayName + `','` + description + `','` + data.Location + `','` + colorCode + `',` + userId + `);`;
                    console.log(sql);
                    var result = yield query(sql);
                    console.log(result);
                    if (result && result.length > 0) {
                        if (result[0][0].nameExist == 1) {
                            let errorResult = new resulterror_1.ResultError(400, true, "", new Error("ServiceType Already Exist"), '');
                            next(errorResult);
                        }
                    }
                    else if (result && result.affectedRows > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Service Type ', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "serviceTypes.insertServiceTypes() Error", new Error('Error While Inserting Data'), '');
                        next(errorResult);
                    }
                }));
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceTypes.insertServiceTypes() Exception', error, '');
        next(errorResult);
    }
});
const updateServiceTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Updating Service Types');
        var requiredFields = ['id', 'name', 'displayName', 'iconUrl'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let displayName = req.body.displayName;
                let description = req.body.description ? req.body.description : "";
                let colorCode = req.body.colorCode ? req.body.colorCode : "";
                let userId = currentUser.id;
                if (req.body.iconUrl.includes("https:")) {
                    let sql = `CALL adminUpdateServiceTypes(` + id + `,'` + displayName + `','` + description + `','','` + colorCode + `',` + userId + `);`;
                    console.log(sql);
                    var result = yield query(sql);
                    console.log(result);
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Service Type', result[0], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let checkSql = `CALL adminCheckServiceTypeImage(` + id + `)`;
                    let checkResult = yield query(checkSql);
                    if (checkResult && checkResult.length > 0 && checkResult[0].length > 0 && checkResult[0][0].iconUrl) {
                        let splt = checkResult[0][0].iconUrl.split("/");
                        const delResp = yield S3.deleteObject({
                            Bucket: 'servicetype',
                            Key: splt[splt.length - 1],
                        }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                            if (err) {
                                console.log("Error: Object delete failed.");
                                let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                next(errorResult);
                            }
                            else {
                                let imgSplit = req.body.iconUrl.split(',');
                                let contentType = imgSplit[0].split(";")[0].split(":")[1];
                                let fileExt = contentType.split("/")[1].split("+")[0];
                                let buf = Buffer.from(imgSplit[1], 'base64');
                                let keyName = displayName.replace(" ", "_");
                                let params = {
                                    Bucket: 'servicetype',
                                    Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: contentType,
                                    ACL: 'public-read'
                                };
                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (error) {
                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                        next(errorResult);
                                        return;
                                    }
                                    console.log(data);
                                    let sql = `CALL adminUpdateServiceTypes(` + id + `,'` + displayName + `','` + description + `','` + data.Location + `','` + colorCode + `',` + userId + `);`;
                                    console.log(sql);
                                    var result = yield query(sql);
                                    console.log(result);
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Service Type', result[0], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                }));
                            }
                        }));
                    }
                    else {
                        let imgSplit = req.body.iconUrl.split(',');
                        let contentType = imgSplit[0].split(";")[0].split(":")[1];
                        let fileExt = contentType.split("/")[1].split("+")[0];
                        let buf = Buffer.from(imgSplit[1], 'base64');
                        let keyName = displayName.replace(" ", "_");
                        let params = {
                            Bucket: 'servicetype',
                            Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                            Body: buf,
                            ContentEncoding: 'base64',
                            ContentType: contentType,
                            ACL: 'public-read'
                        };
                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                            if (error) {
                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                next(errorResult);
                                return;
                            }
                            console.log(data);
                            let sql = `CALL adminUpdateServiceTypes(` + id + `,'` + displayName + `','` + description + `','` + data.Location + `','` + colorCode + `',` + userId + `);`;
                            console.log(sql);
                            var result = yield query(sql);
                            if (result && result.length > 0) {
                                if (result[0][0].nameExist == 1) {
                                    let errorResult = new resulterror_1.ResultError(400, true, "", new Error("ServiceType Already Exist"), '');
                                    next(errorResult);
                                }
                            }
                            else if (result && result.affectedRows > 0) {
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Service Type', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "serviceTypes.updateServiceTypes() Error", new Error('Error While Updating Data'), '');
                                next(errorResult);
                            }
                        }));
                    }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceTypes.updateServiceTypes() Exception', error, '');
        next(errorResult);
    }
});
const activeInactiveServiceTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive Service Types');
        var requiredFields = ['id', 'isActive'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let isActive = req.body.isActive;
                let userId = currentUser.id;
                let sql = `CALL adminActiveInactiveServiceTypes(` + id + `,` + userId + `,` + isActive + `);`;
                console.log(sql);
                var result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Service Status', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceTypes.activeInactiveServiceTypes() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getServiceTypes, insertServiceTypes, updateServiceTypes, activeInactiveServiceTypes };
