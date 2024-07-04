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
const NAMESPACE = 'Orders';
const insertUpdateOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting/Updating Orders');
        var requiredFields = ['productId', 'quantity', 'unitCoin', 'addressTypeId', 'label', 'addressLine1', 'addressLine2', 'pincode', 'cityId', 'city', 'district', 'state'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                if (req.body.id) {
                    //Update
                    let getOrderSql = "SELECT * FROM orders WHERE id = " + req.body.id;
                    let getOrderResult = yield query(getOrderSql);
                    let amount = 0;
                    if (getOrderResult && getOrderResult.length > 0) {
                        amount = (req.body.quantity * req.body.unitCoin) - getOrderResult[0].totalCoin;
                    }
                    let sql = `CALL insertOrder(` + req.body.id + `,` + authorizationResult.currentUser.id + `,` + req.body.productId + `,` + req.body.quantity + `,` + req.body.unitCoin + `
                    ,` + req.body.addressTypeId + `,'` + req.body.label + `','` + req.body.addressLine1 + `','` + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `
                    ,'` + req.body.city + `','` + req.body.district + `','` + req.body.state + `')`;
                    let result = yield query(sql);
                    if (result && result.affectedRows >= 0) {
                        if (amount != 0) {
                            let updateUserWalletSql = "UPDATE userwallet SET  coin = coin - " + (amount) + ", modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE userId = " + authorizationResult.currentUser.id;
                            let updateUserWalletResult = yield query(updateUserWalletSql);
                            let userWalletSql = "SELECT * FROM userwallet WHERE userId = " + authorizationResult.currentUser.id;
                            let userWalletResult = yield query(userWalletSql);
                            let insertUserWalletHistorySql = `INSERT INTO userwallethistory(userWalletId, userId, coin, rewardType,isWithdrawal, createdBy, modifiedBy) VALUES(` + userWalletResult[0].id + `, ` + authorizationResult.currentUser.id + `
                                ,` + (0 - (amount)) + `, null, true, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let insertUserWalletHistoryResult = yield query(insertUserWalletHistorySql);
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Order', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "orders.insertUpdateOrders() Error", new Error('Error While Updating Data'), '');
                        next(errorResult);
                    }
                }
                else {
                    //Insert
                    let sql = `CALL insertOrder(` + 0 + `,` + authorizationResult.currentUser.id + `,` + req.body.productId + `,` + req.body.quantity + `,` + req.body.unitCoin + `
                    ,` + req.body.addressTypeId + `,'` + req.body.label + `','` + req.body.addressLine1 + `','` + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `
                    ,'` + req.body.city + `','` + req.body.district + `','` + req.body.state + `')`;
                    let result = yield query(sql);
                    if (result && result.affectedRows > 0) {
                        let updateUserWalletSql = "UPDATE userwallet SET  coin = coin - " + (req.body.quantity * req.body.unitCoin) + ", modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE userId = " + authorizationResult.currentUser.id;
                        let updateUserWalletResult = yield query(updateUserWalletSql);
                        let userWalletSql = "SELECT * FROM userwallet WHERE userId = " + authorizationResult.currentUser.id;
                        let userWalletResult = yield query(userWalletSql);
                        let insertUserWalletHistorySql = `INSERT INTO userwallethistory(userWalletId, userId, coin, rewardType,isWithdrawal, createdBy, modifiedBy) VALUES(` + userWalletResult[0].id + `, ` + authorizationResult.currentUser.id + `
                        ,` + (0 - (req.body.quantity * req.body.unitCoin)) + `, null, true, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let insertUserWalletHistoryResult = yield query(insertUserWalletHistorySql);
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Order', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "orders.insertUpdateOrders() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'orders.insertUpdateOrders() Exception', error, '');
        next(errorResult);
    }
});
const getOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Orders');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' 00:00:00' : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' 00:00:00' : '';
            let statusId = req.body.statusId ? req.body.statusId : 0;
            let sql = `CALL getOrders(` + startIndex + `,` + fetchRecords + `,` + authorizationResult.currentUser.id + `,'` + fromDate + `','` + toDate + `','` + statusId + `')`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Orders Successfully', result[1], result[1].length);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Orders Successfully', [], 0);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "orders.getOrders() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'orders.getOrders() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { insertUpdateOrders, getOrders };
