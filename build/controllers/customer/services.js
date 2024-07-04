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
var crypto = require('crypto');
const AWS = require('aws-sdk');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const homeServicesResponse_1 = require("../../classes/output/customer/homeServicesResponse");
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
const NAMESPACE = 'Services';
const getServices = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Services');
        let sql = `CALL customerGetServices()`;
        console.log(sql);
        let result = yield query(sql);
        if (result && result.length > 0) {
            if (result[0] && result[0].length > 0) {
                const groupByCategory = result[0].reduce(function (rv, x) {
                    (rv[x['serviceType']] = rv[x['serviceType']] || []).push(x);
                    return rv;
                }, {});
                console.log(groupByCategory);
                let response = [];
                if (groupByCategory && groupByCategory.Loan) {
                    for (let i = 0; i < groupByCategory.Loan.length; i++) {
                        groupByCategory.Loan[i].isServiceType = false;
                        response.push(new homeServicesResponse_1.HomeServicesResponse(groupByCategory.Loan[i].id, groupByCategory.Loan[i].name, groupByCategory.Loan[i].displayName, groupByCategory.Loan[i].description, groupByCategory.Loan[i].iconUrl, groupByCategory.Loan[i].colorCode, false));
                    }
                }
                if (groupByCategory && groupByCategory["Other Loan"])
                    response.push(new homeServicesResponse_1.HomeServicesResponse(groupByCategory["Other Loan"][0].serviceTypeId, groupByCategory["Other Loan"][0].serviceType, groupByCategory["Other Loan"][0].serviceTypeDisplayName, groupByCategory["Other Loan"][0].serviceTypeDescription, groupByCategory["Other Loan"][0].serviceTypeIconUrl, groupByCategory["Other Loan"][0].serviceTypeColorCode, true));
                if (groupByCategory && groupByCategory["Other Services"])
                    response.push(new homeServicesResponse_1.HomeServicesResponse(groupByCategory["Other Services"][0].serviceTypeId, groupByCategory["Other Services"][0].serviceType, groupByCategory["Other Services"][0].serviceTypeDisplayName, groupByCategory["Other Services"][0].serviceTypeDescription, groupByCategory["Other Services"][0].serviceTypeIconUrl, groupByCategory["Other Services"][0].serviceTypeColorCode, true));
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Services', response, response.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'services.getServices()', error, '');
        next(errorResult);
    }
});
const getServicesByServiceTypeId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Services By ServiceTypeId');
        var requiredFields = ['serviceTypeId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL customerGetServicesByServiceTypeId(` + req.body.serviceTypeId + `)`;
                console.log(sql);
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Services By ServiceTypeId', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "services.getServices() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'services.getServices()', error, '');
        next(errorResult);
    }
});
exports.default = { getServices, getServicesByServiceTypeId };
