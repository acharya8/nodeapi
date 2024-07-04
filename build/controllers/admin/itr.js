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
const NAMESPACE = 'Itr';
const getItr = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Itr');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let countSql = "SELECT COUNT(*) as totalCount  FROM itryear";
            let sql = "SELECT * FROM itryear";
            if (startIndex >= 0 && fetchRecord > 0) {
                sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + " ";
            }
            let countResult = yield query(countSql);
            let result = yield query(sql);
            if (result && result.length > 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Itr Successfully', result, countResult[0].totalCount);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            if (result) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, "Get Itr Successfully", [], 0);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "itr.getItr() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'itr.getItr() Exception', error, '');
        next(errorResult);
    }
});
const insertItr = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Itr');
        let requiredFields = ['name'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let name = req.body.name;
                let id = req.body.id;
                let userId = currentUser.id;
                let checkSql = `SELECT * FROM itryear WHERE name = '` + name + `'`;
                let checkResult = yield query(checkSql);
                if (checkResult && checkResult.length > 0) {
                    let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Status Already Exist"), '');
                    next(errorResult);
                }
                else {
                    let sql = `INSERT INTO itryear(name, createdBy, modifiedBy) VALUES('` + name + `',` + userId + `,` + userId + `);`;
                    if (req.body.id > 0) {
                        let updateSql = "UPDATE itryear SET name = '" + name + "' WHERE id = " + id;
                        let updateResult = yield query(updateSql);
                        if (updateResult && updateResult.affectedRows >= 0) {
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Itr', result, 1);
                            return res.status(200).send(successResult);
                        }
                    }
                    console.log(sql);
                    var result = yield query(sql);
                    if (result && result.length > 0) {
                        if (result[0][0].nameExist == 1) {
                            let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Status Already Exist"), '');
                            next(errorResult);
                        }
                    }
                    else if (result && result.affectedRows > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Itr ', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "itr.insertItr() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'Itr.insertItr() Exception', error, '');
        next(errorResult);
    }
});
const activeInactiveItr = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive Itr');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;
                let isActive = req.body.isActive ? req.body.isActive : '!isActive';
                if (req.body.id > 0) {
                    let sql = "UPDATE itryear SET isActive = " + isActive + " WHERE id = " + id;
                    let result = yield query(sql);
                    if (result && result.affectedRows >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Itr', result, 1);
                        return res.status(200).send(successResult);
                    }
                }
                console.log(result);
                var result = yield query(result);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Itr', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'itr.activeInactiveItr() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getItr, insertItr, activeInactiveItr };
