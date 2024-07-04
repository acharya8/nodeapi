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
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.pass,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'Bank Policy';
const insertUpdateBankPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Bank Policies');
        let requiredFields = ['bankId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let bankId = req.body.bankId;
                let policyResult;
                let ids = [];
                if (req.body.policies && req.body.policies.length > 0) {
                    let length = req.body.policies.length;
                    for (let i = 0; i < req.body.policies.length; i++) {
                        let bankLoanPolicyId = req.body.policies[i].id ? req.body.policies[i].id : null;
                        let serviceId = req.body.policies[i].serviceId;
                        let bankLoanId = req.body.policies[i].bankLoanId ? req.body.policies[i].bankLoanId : null;
                        let employmentTypeId = req.body.policies[i].employmentTypeId ? req.body.policies[i].employmentTypeId : null;
                        let cibilScore = req.body.policies[i].cibilScore ? req.body.policies[i].cibilScore : null;
                        let minIncome = req.body.policies[i].minIncome ? req.body.policies[i].minIncome : null;
                        let itrRequired = req.body.policies[i].itrRequired ? req.body.policies[i].itrRequired : null;
                        let vintage = req.body.policies[i].vintage ? req.body.policies[i].vintage : null;
                        let minTurnOver = req.body.policies[i].minTurnOver ? req.body.policies[i].minTurnOver : null;
                        let maxTurnOver = req.body.policies[i].maxTurnOver ? req.body.policies[i].maxTurnOver : null;
                        let tenure = req.body.policies[i].tenure ? req.body.policies[i].tenure : "";
                        let ROI = req.body.policies[i].ROI ? req.body.policies[i].ROI : null;
                        let minLoanAmount = req.body.policies[i].minLoanAmount ? req.body.policies[i].minLoanAmount : null;
                        let maxLoanAmount = req.body.policies[i].maxLoanAmount ? req.body.policies[i].maxLoanAmount : null;
                        let companyCategoryTypeId = req.body.policies[i].companyCategoryTypeId ? req.body.policies[i].companyCategoryTypeId : null;
                        let sql = `CALL adminInsertUpdateBankPolicy(` + bankLoanPolicyId + `,` + bankId + `,` + serviceId + `,` + bankLoanId + `,` + employmentTypeId + `,'` + cibilScore + `'
                ,` + minIncome + `,` + vintage + `,` + minTurnOver + `,` + maxTurnOver + `,'` + tenure + `',` + ROI + `,` + minLoanAmount + `,` + maxLoanAmount + `,` + itrRequired + `,` + currentUser.id + `,` + companyCategoryTypeId + `)`;
                        let result = yield query(sql);
                        if (result && result.affectedRows >= 0) {
                            if (req.body.policies[i].id) {
                                ids = ids.filter(c => c == req.body.policies[i].id);
                            }
                            if (i == length - 1) {
                                policyResult = result;
                            }
                        }
                        else
                            break;
                        policyResult = result;
                    }
                    if (policyResult.affectedRows >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Bank Loan Policy', policyResult, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "bankPolicies.insertUpdateBankPolicy() Error", policyResult, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bankPolicies.insertUpdateBankPolicy() Exception', error, '');
        next(errorResult);
    }
});
const getBankPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Bank Policies');
        let requiredFields = [];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let bankIdsql = `SELECT DISTINCT(bankId) as bankId FROM bankloanpolicies `;
                if (req.body.bankId)
                    bankIdsql += ` WHERE bankId = ` + req.body.bankId;
                // bankIdsql += ` ORDER BY id DESC `
                if (req.body.startIndex && req.body.fetchRecord)
                    bankIdsql += ` limit ` + req.body.fetchRecord + `OFFSET ` + req.body.startIndex;
                let bankIdResult = yield query(bankIdsql);
                if (bankIdResult && bankIdResult.length > 0) {
                    for (let i = 0; i < bankIdResult.length; i++) {
                        let policySql = `SELECT blp.*,banks.name as bankName,emp.name as employmentType,emp.parentId,services.name as serviceName,companycategorytype.name as companyCategoryType,itryear.name as itrYear  FROM  bankloanpolicies blp 
                        LEFT JOIN banks ON blp.bankId = banks.id 
                        LEFT JOIN employmenttypes emp ON emp.id = blp.employmentTypeId
                        LEFT JOIN companycategorytype ON companycategorytype.id = blp.companyCategoryTypeId
                        LEFT JOIN itryear ON itryear.id = blp.itrRequired
                        LEFT JOIN services ON services.id = blp.serviceId WHERE blp.isDelete = 0 AND bankId = ?`;
                        let policyResult = yield query(policySql, bankIdResult[i].bankId);
                        bankIdResult[i].policies = policyResult;
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Bank Loan Policy', bankIdResult, bankIdResult.length);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Bank Loan Policy', [], 0);
                    return res.status(200).send(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bankPolicies.getBankPolicy() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { insertUpdateBankPolicy, getBankPolicy };
