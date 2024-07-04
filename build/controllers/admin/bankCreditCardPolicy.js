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
const NAMESPACE = 'Bank Credit Card Policy';
const insertUpdateBankCreditCardPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting/Updating Bank Credit Card Policy');
        let requiredFields = ['bankCreditCardId', 'employmentTypeId', 'minimumCibilScore', 'minAge', 'maxAge', "minIncome", "companyCategoryTypeId"];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let bankCreditCardId = req.body.bankCreditCardId;
                let employmentTypeId = req.body.employmentTypeId;
                let minimumCibilScore = req.body.minimumCibilScore;
                let minAge = req.body.minAge;
                let maxAge = req.body.maxAge;
                let minIncome = req.body.minIncome;
                let companyCategoryTypeId = req.body.companyCategoryTypeId;
                let id = req.body.id ? req.body.id : null;
                let sql = "CALL adminInsertUpdateBankCreditCardPolicy(" + id + "," + bankCreditCardId + "," + employmentTypeId + "," + minimumCibilScore + "," + minAge + "," + maxAge + "," + minIncome + "," + companyCategoryTypeId + "," + currentUser.id + ")";
                let result = yield query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Inserting/Updating Bank Credit Card Policy', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting/Updating Bank Credit Card Policy", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bankCreditCard.insertUpdateBankCreditCardPolicy() Exception', error, '');
        next(errorResult);
    }
});
const getBankCreditCardPolicy = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Bank Credit Card Policy');
        let requiredFields = [];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let bankId = req.body.selectedBank ? req.body.selectedBank : 0;
                let companyCategoryTypeId = req.body.selectedCompanCategoryType ? req.body.selectedCompanCategoryType : 0;
                let minAge = req.body.minAge ? req.body.minAge : 0;
                let maxAge = req.body.maxAge ? req.body.maxAge : 0;
                let minCibilScore = req.body.minCibilScore ? req.body.minCibilScore : 0;
                let employmentTypeId = req.body.selectedEmploymentType ? req.body.selectedEmploymentType : 0;
                let sql = `CALL adminGetBankCreditCardPolicy(` + startIndex + `,` + fetchRecords + `,` + bankId + `,` + companyCategoryTypeId + `,` + minAge + `,` + maxAge + `,` + minCibilScore + `,` + employmentTypeId + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Bank Credit Card', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "bankCreditCard.getBankCreditCardPolicy() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bankCreditCard.getBankCreditCardPolicy() Exception', error, '');
        next(errorResult);
    }
});
const getCompanyCategoryType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Bank Credit Card Policy');
        let requiredFields = [];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let sql = `CALL adminGetCompanyCategoryType(` + startIndex + `,` + fetchRecords + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Company Category', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "bankCreditCard.getCompanyCategoryType() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bankCreditCard.getCompanyCategoryType() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { insertUpdateBankCreditCardPolicy, getBankCreditCardPolicy, getCompanyCategoryType };
