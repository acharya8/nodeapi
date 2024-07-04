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
const NAMESPACE = 'Service Documents';
const getServiceDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Service Documents');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let serviceId = req.body.serviceId ? req.body.serviceId : 0;
            let sql = `CALL adminGetServiceTypeDocuments(` + startIndex + `,` + fetchRecords + `,` + serviceId + `)`;
            let result = yield query(sql);
            if (result) {
                if (result[1] && result[1].length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Service Documents Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else if (result[1] && result[1].length == 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Service Documents Successfully', [], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "documentMasters.getDocumentMaster() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceDocuments.getServiceDocuments() Exception', error, '');
        next(errorResult);
    }
});
const insertServiceDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Service Documents');
        var requiredFields = ['serviceId', 'documentId', 'displayName', 'documentCount', 'isRequired', 'employmentTypeId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let serviceId = req.body.serviceId;
                let documentId = req.body.documentId;
                let displayName = req.body.displayName;
                let documentCount = req.body.documentCount;
                let isRequired = req.body.isRequired;
                let isPdf = req.body.isPdf;
                let userId = currentUser.id;
                let employmentTypeId = req.body.employmentTypeId;
                let checkSql = `Select * FROM servicetypedocuments where serviceId = ` + serviceId + ` AND employmentTypeId = ` + employmentTypeId + ` AND documentId =` + documentId;
                let checkResult = yield query(checkSql);
                if (checkResult && checkResult.length > 0) {
                    let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Data Already Exist"), '');
                    next(errorResult);
                }
                else {
                    let sql = `CALL adminInsertServiceTypeDocuments(` + serviceId + `,` + documentId + `,'` + displayName + `',` + documentCount + `,` + isRequired + `,` + isPdf + `,` + userId + `,` + employmentTypeId + `,` + req.body.isRequiredForTransfer + `,` + req.body.isRequiredForNew + `)`;
                    console.log(sql);
                    var result = yield query(sql);
                    console.log(result);
                    if (result && result.affectedRows) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Service Documents', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "serviceDocuments.insertServiceDocuments() Error", new Error("Service Document Not Inserted."), '');
                        next(errorResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceDocuments.insertServiceDocuments() Exception', error, '');
        next(errorResult);
    }
});
const updateServiceDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Updating Service Documents');
        var requiredFields = ['id', 'serviceId', 'documentId', 'displayName', 'documentCount', 'isRequired'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let serviceId = req.body.serviceId;
                let documentId = req.body.documentId;
                let displayName = req.body.displayName;
                let documentCount = req.body.documentCount;
                let isRequired = req.body.isRequired;
                let isPdf = req.body.isPdf;
                let userId = currentUser.id;
                let employmentTypeId = req.body.employmentTypeId;
                let checkSql = `Select * FROM servicetypedocuments where serviceId = ` + serviceId + ` AND employmentTypeId = ` + employmentTypeId + ` AND documentId =` + documentId;
                let checkResult = yield query(checkSql);
                if (checkResult && checkResult.length > 0) {
                    let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Data Already Exist"), '');
                    next(errorResult);
                }
                else {
                    let sql = `CALL adminUpdateServiceTypeDocuments(` + id + `, ` + serviceId + `, ` + documentId + `, '` + displayName + `', ` + documentCount + `, ` + isRequired + `, ` + isPdf + `, ` + userId + `,` + employmentTypeId + `,` + req.body.isRequiredForTransfer + `,` + req.body.isRequiredForNew + `)`;
                    console.log(sql);
                    var result = yield query(sql);
                    console.log(result);
                    if (result && result.affectedRows) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Service Documents', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "serviceDocuments.updateServiceDocuments() Error", new Error("Service Document Not Updated."), '');
                        next(errorResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceDocuments.insertServiceDocuments() Exception', error, '');
        next(errorResult);
    }
});
const activeInactiveServiceDocuments = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive Service Documents');
        var requiredFields = ['id', 'isActive'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let isActive = req.body.isActive;
                let userId = currentUser.id;
                let sql = `CALL adminActiveInactiveServiceTypeDocuments(` + id + `, ` + isActive + `, ` + userId + `); `;
                console.log(sql);
                var result = yield query(sql);
                console.log(result);
                if (result && result.affectedRows) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Service Documents Status Changed', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "serviceDocuments.activeInactiveServiceDocuments() Error", new Error("Service Document Not Updated."), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'serviceDocuments.insertServiceDocuments() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getServiceDocuments, insertServiceDocuments, updateServiceDocuments, activeInactiveServiceDocuments };
