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
const NAMESPACE = 'Other Loan';
const getOtherLoan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Other Loan');
        var requiredFields = [''];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
                let searchString = req.body.searchString ? req.body.searchString : "";
                let serviceIds;
                let userId = req.body.userId ? req.body.userId : 0;
                if (req.body.serviceIds && req.body.serviceIds.length > 0) {
                    for (let index = 0; index < req.body.serviceIds.length; index++) {
                        if (index == 0) {
                            serviceIds = req.body.serviceIds[index];
                        }
                        else
                            serviceIds = serviceIds + "," + req.body.serviceIds[index];
                    }
                }
                serviceIds = serviceIds ? serviceIds : "";
                let serviceTypeId = req.body.serviceTypeId;
                let sql = `CALL adminGetOtherLoans(` + startIndex + `,` + fetchRecord + `,'` + searchString + `', '` + serviceIds + `',` + serviceTypeId + `,` + userId + `);`;
                var result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0][0].totalCount > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Other Loan Successfully', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else if (result[1]) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Other Loan Successfully', [], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "otherLoan.insertOtherLoan() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'otherLoan.insertOtherLoan() Exception', error, '');
        next(errorResult);
    }
});
const insertUpdateOtherLoanDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Other Loan Detail');
        var requiredFields = ['serviceId', 'serviceTypeId', 'fullName', 'birthdate', 'panCardNo', 'aadhaarCardNo', 'contactNo', 'email', 'employmentTypeId', 'monthlyincome', 'pincode'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id ? req.body.id : 0;
                let userId = req.body.userId;
                let serviceId = req.body.serviceId;
                let serviceTypeId = req.body.serviceTypeId;
                let fullName = req.body.fullName;
                let birthdate = req.body.birthdate;
                let dDate = new Date(birthdate).getFullYear().toString() + '-' + ("0" + (new Date(birthdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthdate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthdate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthdate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthdate).getSeconds())).slice(-2);
                let panCardNo = req.body.panCardNo;
                let aadhaarCardNo = req.body.aadhaarCardNo;
                let contactNo = req.body.contactNo;
                let email = req.body.email;
                let employmentTypeId = req.body.employmentTypeId;
                let monthlyincome = req.body.monthlyincome ? req.body.monthlyincome : '';
                let label = req.body.label ? req.body.label : '';
                let addressline1 = req.body.addressline1 ? req.body.addressline1 : '';
                let addressline2 = req.body.addressline2 ? req.body.addressline2 : '';
                let pincode = req.body.pincode ? req.body.pincode : '';
                let cityId = req.body.cityId ? req.body.cityId : '';
                let city = req.body.city ? req.body.city : '';
                let district = req.body.district ? req.body.district : '';
                let state = req.body.state ? req.body.state : '';
                let sql = `CALL adminInsertUpdateOtherLoanDetail(` + id + `,` + userId + `,` + serviceId + `,` + serviceTypeId + `,'` + fullName + `','` + dDate + `','` + panCardNo + `','` + aadhaarCardNo + `','` + contactNo + `','` + email + `','` + employmentTypeId + `','` + monthlyincome + `','` + label + `','` + addressline1 + `','` + addressline2 + `','` + pincode + `','` + cityId + `','` + city + `','` + district + `','` + state + `',` + currentUser.id + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Status Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'InsertUpdate Other Loan', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "otherLoan.insertUpdateOtherLoanDetail() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'otherLoan.insertUpdateOtherLoanDetail() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getOtherLoan, insertUpdateOtherLoanDetail };
