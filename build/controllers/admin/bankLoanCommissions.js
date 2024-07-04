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
const NAMESPACE = 'Bank Loan Commission';
const getBankLoanCommission = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Bank Loan Commission');
        let requiredFields = [];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let bankId = (req.body.bankIds && req.body.bankIds.length > 0) ? req.body.bankIds.toString() : "";
                let serviceId = (req.body.serviceIds && req.body.serviceIds.length > 0) ? req.body.serviceIds.toString() : "";
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let countSql = `SELECT COUNT(DISTINCT(bankloancommissions.bankId)) as totalCount FROM bankloancommissions INNER JOIN banks ON bankloancommissions.bankId = banks.id WHERE bankloancommissions.id`;
                let sql = `SELECT DISTINCT(bankloancommissions.bankId) as bankId,banks.name as bankName FROM bankloancommissions INNER JOIN banks ON bankloancommissions.bankId = banks.id WHERE bankloancommissions.id`;
                if (bankId != '') {
                    sql += ` AND bankloancommissions.bankId IN ('` + bankId + `')`;
                    countSql += ` AND bankloancommissions.bankId IN ('` + bankId + `')`;
                }
                // sql += ` ORDER BY bankloancommissions.id DESC `
                if (startIndex >= 0 && fetchRecords > 0) {
                    sql += ` limit ` + fetchRecords + ` OFFSET ` + startIndex;
                }
                let result = yield query(sql);
                let countResult = yield query(countSql);
                if (result && result.length > 0) {
                    for (let i = 0; i < result.length; i++) {
                        let sql = `SELECT bankloancommissions.*,services.name as serviceName FROM bankloancommissions INNER JOIN services ON bankloancommissions.serviceId = services.id WHERE bankloancommissions.bankId = ? `;
                        if (serviceId != '') {
                            sql += ` AND bankloancommissions.serviceId IN ('` + serviceId + `')`;
                            countSql += ` AND bankloancommissions.serviceId IN ('` + serviceId + `')`;
                        }
                        let serviceCommissionResult = yield query(sql, result[i].bankId);
                        if (serviceCommissionResult) {
                            result[i].bankCommissions = serviceCommissionResult;
                        }
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Bank Loan Commission', result, countResult[0].totalCount);
                    return res.status(200).send(successResult);
                }
                if (result) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, "Bank Loan Commission Not Available", [], 0);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Bank Loan Commission", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bankLoanCommission.getBankLoanCommission() Exception', error, '');
        next(errorResult);
    }
});
const insertUpdateBankLoanCommission = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Bank Loan Commission');
        let requiredFields = ["bankId", "bankCommissions"];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let isError = false;
                if (req.body.bankId) {
                    if (req.body.bankCommissions && req.body.bankCommissions.length > 0) {
                        for (let index = 0; index < req.body.bankCommissions.length; index++) {
                            if (req.body.bankCommissions[index].id) {
                                let updateSql = yield query(`UPDATE bankloancommissions SET bankId = ` + req.body.bankId + ` ,serviceId = ` + req.body.bankCommissions[index].serviceId + `,commissionTypeId = 3 ,commission = ` + req.body.bankCommissions[index].commission + `, modifiedDate =CURRENT_TIMESTAMP,modifiedBy = ` + userId + ` WHERE id  = ?`, req.body.bankCommissions[index].id);
                                if (updateSql && updateSql.affectedRows >= 0) {
                                    //
                                }
                                else {
                                    isError = true;
                                    return;
                                }
                            }
                            else {
                                let insertSql = yield query(`INSERT INTO bankloancommissions (bankId,serviceId,commissionTypeId,commission,createdBy,modifiedBy) VALUES (` + req.body.bankId + `,` + req.body.bankCommissions[index].serviceId + `,3,` + req.body.bankCommissions[index].commission + `,` + userId + `,` + userId + `)`);
                                if (insertSql && insertSql.affectedRows >= 0) {
                                    //
                                }
                                else {
                                    isError = true;
                                    return;
                                }
                            }
                        }
                    }
                    if (!isError) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Bank Loan Commission', "Success", 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "bankLoanCommission.insertUpdateBankLoanCommission() Error", new Error("Bank Loan Commission Not Inserted."), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bankLoanCommission.insertUpdateBankLoanCommission() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getBankLoanCommission, insertUpdateBankLoanCommission };
