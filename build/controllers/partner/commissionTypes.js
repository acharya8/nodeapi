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
const commissionTypeResponse_1 = require("../../classes/output/partner/commissionTypeResponse");
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
const NAMESPACE = 'Commission Type';
const getCommissionType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Commission Type');
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "CALL dsaBazarGetCommissionType()";
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let commissionType = result[0];
                        let parentObj = [];
                        for (let i = 0; i < commissionType.length; i++) {
                            if (commissionType[i] && commissionType[i].parentId) {
                                let childObj = new commissionTypeResponse_1.CommissionTypesReponse(commissionType[i].id, commissionType[i].name, null);
                                if (parentObj && parentObj.length > 0) {
                                    let ind = parentObj.findIndex(c => c.id == commissionType[i].parentId);
                                    if (ind >= 0) {
                                        parentObj[ind].child.push(childObj);
                                    }
                                    else {
                                        let obj = new commissionTypeResponse_1.CommissionTypesReponse(commissionType[i].parentId, commissionType[i].parentTypeName, [childObj]);
                                        parentObj.push(obj);
                                    }
                                }
                                else {
                                    let obj = new commissionTypeResponse_1.CommissionTypesReponse(commissionType[i].parentId, commissionType[i].parentTypeName, [childObj]);
                                    parentObj.push(obj);
                                }
                            }
                            else {
                                let obj = new commissionTypeResponse_1.CommissionTypesReponse(commissionType[i].id, commissionType[i].name, []);
                                parentObj.push(obj);
                            }
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Commission Types', parentObj, parentObj.length);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "commissionTypes.getCommissionType() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'commissionTypes.getCommissionType() Exception', error, '');
        next(errorResult);
    }
});
const getCommissionTemplate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Commission Template');
        var requiredFields = [""];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
                let sql = `CALL adminGetCommissionTemplates(` + startIndex + `,` + fetchRecord + `,'` + '' + `','` + '' + `')`;
                var result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0][0].totalCount > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Commission Template Successfully', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else if (result[1]) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Commission Template Successfully', [], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "commissionTemplates.getCommisionTemplate() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'commissionTemplates.getCommisionTemplate() Exception', error, '');
        next(errorResult);
    }
});
const getCommisionTemplateByBankAndServiceId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Commission By Ids');
        var requiredFields = ['bankId', 'serviceId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let bankId = req.body.bankId;
                let sql = `CALL getCommissionTemplateByBankAndServiceId('` + bankId + `','` + serviceId + `')`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get CommissionTemplate By Ids', result[0], result[0].length);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Templates", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'commissionTemplates.getCommisionTemplateByBankAndServiceId()', error, '');
        next(errorResult);
    }
});
exports.default = { getCommissionType, getCommissionTemplate, getCommisionTemplateByBankAndServiceId };
