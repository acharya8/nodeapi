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
const NAMESPACE = 'Service Employment Types';
const getServiceEmploymentTypes = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Service Employment Types');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
            req.body.serviceId = req.body.serviceId ? req.body.serviceId : 0;
            let sql = `CALL adminGetServiceEmploymentTypes(` + startIndex + `,` + fetchRecords + `,` + req.body.serviceId + `)`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get  Service Employment Type Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                if (result[0]) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get  Service Employment Type Successfully', [], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "serviceEmploymentType.getServiceEmploymentType() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceEmploymentType.getServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
});
const insertServiceEmploymentType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Service Employment Type');
        var requiredFields = ['serviceId', 'employmentTypeIds'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                if (req.body.employmentTypeId && req.body.employmentTypeIds.length > 0) {
                    let employmentTypeIds;
                    for (let index = 0; index < req.body.employmentTypeIds.length; index++) {
                        if (index == 0) {
                            employmentTypeIds = req.body.employmentTypeIds[index];
                        }
                        else
                            employmentTypeIds = employmentTypeIds + "," + req.body.employmentTypeIds[index];
                    }
                    req.body.employmentTypeIds = employmentTypeIds;
                }
                let sql = `CALL adminInsertServiceEmploymentType(` + req.body.serviceId + `,'` + req.body.employmentTypeIds + `',` + currentUser.id + `)`;
                console.log(sql);
                var result = yield query(sql);
                console.log(result);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Service Employment Type', result[0], 1);
                console.log(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceEmploymentTypes.insertServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
});
const updateServiceEmploymentType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Updating Service Employment Type');
        var requiredFields = ['id', 'serviceId', 'employmentTypeId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                if (req.body.employmentTypeId && req.body.employmentTypeIds.length > 0) {
                    let employmentTypeIds;
                    for (let index = 0; index < req.body.employmentTypeIds.length; index++) {
                        if (index == 0) {
                            employmentTypeIds = req.body.employmentTypeIds[index];
                        }
                        else
                            employmentTypeIds = employmentTypeIds + "," + req.body.employmentTypeIds[index];
                    }
                    req.body.employmentTypeIds = employmentTypeIds;
                }
                let sql = `CALL (` + req.body.serviceId + `,'` + req.body.employmentTypeIds + `',` + currentUser.id + `);`;
                console.log(sql);
                var result = yield query(sql);
                console.log(result);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update  Service EmploymentType', result[0], 1);
                console.log(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceEmploymentType.updateServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
});
const activeInactiveServiceEmploymentType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive Service EmploymentType');
        var requiredFields = ['id'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let serviceId = req.body.serviceId ? req.body.serviceId : 0;
                let sql = `CALL adminActiveIactiveServiceEmploymentType(` + id + `,` + serviceId + `,` + currentUser.id + `)`;
                console.log(sql);
                var result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Change Service Employment Type Status', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceEmploymentType.activeInActiveServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getServiceEmploymentTypes, insertServiceEmploymentType, updateServiceEmploymentType, activeInactiveServiceEmploymentType };
