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
const NAMESPACE = 'Business Nature';
const getBusinessNature = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Business Nature');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let sql = `CALL adminGetBusinessNatures(` + startIndex + `,` + fetchRecord + `)`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Business Nature Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else if (result[0] && result[0][0].totalCount == 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Business Nature Successfully', [], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "busienssNature.getBusinessNature() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'busienssNature.getBusinessNature() Exception', error, '');
        next(errorResult);
    }
});
const insertBusinessNature = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Busienss Nature');
        let requiredFields = ['name'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let sql = `CALL adminInsertBusinessNature('` + req.body.name + `',` + userId + `);`;
                console.log(sql);
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Business Nature', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "businessNature.insertBusinessNature() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'businessNature.insertBusinessNature() Exception', error, '');
        next(errorResult);
    }
});
const updateBusinessNature = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Updating Business Nature');
        let requiredFields = ['id', 'name'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                let sql = `CALL adminUpdateBusinessNature(` + id + `,'` + req.body.name + `',` + userId + `);`;
                console.log(sql);
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Business Nature', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "businessNature.updateBusinessNature() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'businessNature.updateBusinessNature() Exception', error, '');
        next(errorResult);
    }
});
const activeInActiveBusinessNature = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive BusinessNature');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;
                let sql = `CALL adminActiveInactiveBusinessNature(` + id + `,` + userId + `);`;
                console.log(sql);
                let result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Business Nature', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'businessNature.activeInActiveBusinessNature() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getBusinessNature, insertBusinessNature, updateBusinessNature, activeInActiveBusinessNature };
