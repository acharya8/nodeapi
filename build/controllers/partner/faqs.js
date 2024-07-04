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
const NAMESPACE = 'Faqs';
const getFaqs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `SELECT * FROM faqs WHERE faqType = 2  LIMIT ` + fetchRecords + ` OFFSET ` + startIndex;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Faqs', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Faqs', [], 1);
                    console.log(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'loans.getFaqs()', error, '');
        next(errorResult);
    }
});
const getFaqCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Faqs Category');
        let sql = `CALL getFaqCategories();`;
        console.log(sql);
        var result = yield query(sql);
        console.log(JSON.stringify(result));
        if (result && result.length > 0) {
            if (result[0].length >= 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Faqs Category', result[0], result[0].length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'faqs.getFaqsCategory()', error, '');
        next(errorResult);
    }
});
const getFaqsByCategories = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['faqCategoryId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let faqCategoryId = req.body.faqCategoryId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `SELECT * FROM faqs WHERE faqType = 2 AND faqCategoryId = ` + req.body.faqCategoryId + `  LIMIT ` + fetchRecords + ` OFFSET ` + startIndex;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Faqs By Categories', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Faqs By Categories', [], 1);
                    console.log(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'faqs.getFaqsByCategories()', error, '');
        next(errorResult);
    }
});
exports.default = { getFaqs, getFaqCategories, getFaqsByCategories };
