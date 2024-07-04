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
const NAMESPACE = 'Orders';
const getOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Orders');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecord ? req.body.fetchRecord : 0;
            let searchString = req.body.searchString ? req.body.searchString : "";
            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' 00:00:00' : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' 00:00:00' : '';
            let statusIds = req.body.statusIds ? req.body.statusIds.toString() : "";
            let sql = `CALL adminGetOrders(` + startIndex + `,` + fetchRecords + `,'` + searchString + `','` + fromDate + `','` + toDate + `','` + statusIds + `')`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Orders Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
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
const getOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Order Status');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetOrderStatuses()`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Order Status Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "orders.getOrderStatus() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'orders.getOrderStatus() Exception', error, '');
        next(errorResult);
    }
});
const changeOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Change Order Status');
        var requiredFields = ['orderId', 'statusId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.remark = req.body.remark ? req.body.remark : '';
                let sql = `CALL adminChangeOrderStatus(` + req.body.orderId + `,` + req.body.statusId + `,` + authorizationResult.currentUser.id + `,'` + req.body.remark + `')`;
                let result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Change Orders Status Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'orders.changeOrderStatus() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getOrders, getOrderStatus, changeOrderStatus };
