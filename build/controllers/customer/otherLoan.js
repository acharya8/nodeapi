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
const S3 = new AWS.S3({
    accessKeyId: config_1.default.s3bucket.aws_Id,
    secretAccessKey: config_1.default.s3bucket.aws_secret
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'OtherLoan';
const insertCustomerOtherLoanDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Other Loan Detail');
        var requiredFields = ['serviceId', 'serviceTypeId', 'fullName', 'birthdate', 'panCardNo', 'aadhaarCardNo', 'contactNo', 'email', 'employmentTypeId', 'monthlyincome', 'pincode'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let serviceId = req.body.serviceId;
                let serviceTypeId = req.body.serviceTypeId;
                let fullName = req.body.fullName;
                let birthdate = req.body.birthdate;
                let panCardNo = req.body.panCardNo;
                let aadhaarCardNo = req.body.aadhaarCardNo;
                let contactNo = req.body.contactNo;
                let email = req.body.email;
                let employmentTypeId = req.body.employmentTypeId;
                let monthlyincome = req.body.monthlyincome ? req.body.monthlyincome : '';
                let label = req.body.label ? req.body.label : '';
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let pincode = req.body.pincode ? req.body.pincode : '';
                let cityId = req.body.cityId ? req.body.cityId : '';
                let city = req.body.city ? req.body.city : '';
                let district = req.body.district ? req.body.district : '';
                let state = req.body.state ? req.body.state : '';
                let sql = `CALL InsertCustomerOtherLoanDetail(` + userId + `,` + serviceId + `,` + serviceTypeId + `,'` + fullName + `','` + birthdate + `','` + panCardNo + `','` + aadhaarCardNo + `','` + contactNo + `','` + email + `','` + employmentTypeId + `','` + monthlyincome + `','` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `','` + cityId + `','` + city + `','` + district + `','` + state + `')`;
                let result = yield query(sql);
                if (result) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Other Loan Detail', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "otherLoan.insertCustomerOtherLoanDetail() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'otherLoan.insertCustomerOtherLoanDetail() Exception', error, '');
        next(errorResult);
    }
});
const getOtherLoanDetailByUserId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['userId', 'serviceTypeId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Get Other Loan Customers');
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let serviceTypeId = req.body.serviceTypeId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `CALL GetOtherLoansByuserId(` + userId + `,` + serviceTypeId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Other Loan Customers', result[0], result[0].length);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "partners.getOtherLoanDetailByUserId() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'partners.getOtherLoanDetailByUserId()', error, '');
        next(errorResult);
    }
});
exports.default = { insertCustomerOtherLoanDetail, getOtherLoanDetailByUserId };
