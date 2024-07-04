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
const NAMESPACE = 'Reward Coin';
const insertUpdateRewardCoin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Reward Coin');
        var requiredFields = ['rewardTypeId', 'rewardCoin'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id ? req.body.id : null;
                let rewardTypeId = req.body.rewardTypeId;
                let rewardCoin = req.body.rewardCoin;
                let minLoanFile = req.body.minLoanFile ? req.body.minLoanFile : null;
                let maxLoanFile = req.body.maxLoanFile ? req.body.maxLoanFile : null;
                let roleIds = req.body.roleIds.toString() ? req.body.roleIds.toString() : null;
                let isScratchCard = req.body.isScratchCard ? req.body.isScratchCard : false;
                let sql = "CALL adminInsertUpdateRewardCoin(" + id + "," + rewardTypeId + "," + rewardCoin + "," + minLoanFile + "," + maxLoanFile + "," + currentUser.id + ",'" + roleIds + "'," + isScratchCard + ")";
                var result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Reward Coin', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "rewardCoin.insertRewardCoin() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'rewardCoin.insertRewardCoin() Exception', error, '');
        next(errorResult);
    }
});
const getRewardCoin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Reward Coin');
        var requiredFields = [''];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let sql = `CALL adminGetRewardCoin(` + startIndex + `,` + fetchRecord + `);`;
                var result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0][0].totalCount > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Reward Coin Successfully', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else if (result[1]) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Reward Coin Successfully', [], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "rewardCoin.insertRewardCoin() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'rewardCoin.insertRewardCoin() Exception', error, '');
        next(errorResult);
    }
});
const getRewardType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Reward Type');
        var requiredFields = [''];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let sql = `CALL adminGetRewardType();`;
                var result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Reward Type Successfully', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "rewardCoin.getRewardType() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'rewardCoin.getRewardType() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { insertUpdateRewardCoin, getRewardCoin, getRewardType };
