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
const notifications_1 = __importDefault(require("./../notifications"));
let connection = mysql.createConnection({
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
const NAMESPACE = 'Customer';
const getCustomers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Customers');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let customerId = req.body.customerId ? req.body.customerId : 0;
            let roleIds = req.body.roleIds ? req.body.roleIds.toString() : '';
            let cityIds = req.body.cityIds ? req.body.cityIds.toString() : '';
            let stateIds = req.body.stateIds ? req.body.stateIds.toString() : '';
            let serviceIds = req.body.serviceIds ? req.body.serviceIds.toString() : '';
            let statusIds = req.body.statusIds ? req.body.statusIds.toString() : '';
            let searchString = req.body.searchString ? req.body.searchString : '';
            let isDelete = (req.body.isDelete == true || req.body.isDelete == false) ? (req.body.isDelete == true ? true : false) : null;
            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getSeconds())).slice(-2) : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getSeconds())).slice(-2) : '';
            let sql = `CALL adminGetCustomer(` + startIndex + `,` + fetchRecord + `,` + customerId + `,'` + searchString + `','` + roleIds + `','` + fromDate + `','` + toDate + `',` + isDelete + `,'` + cityIds + `','` + stateIds + `','` + serviceIds + `','` + statusIds + `')`;
            let result = yield query(sql);
            if (result && result[1].length >= 0) {
                if (result && result[1].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Customer Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "customers.getCustomers() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'customers.getCustomers() Exception', error, '');
        next(errorResult);
    }
});
const checkContactNoExist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let requiredFields = ['contactNo'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Customer Contact No Exist');
            let contactNo = req.body.contactNo;
            let userId = req.body.userId ? req.body.userId : null;
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminCheckContactNoExist('` + contactNo + `',` + req.body.roleId + `,` + userId + `)`;
                console.log(sql);
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Exist', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'customer.checkContactNoExist()', error, '');
        next(errorResult);
    }
});
const insertCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let requiredFields = ['fullName', 'contactNo', 'panCardNo', 'cityId', 'gender', 'birthDate', 'maritalStatusId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Customer');
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.id ? req.body.id : 0;
                let customerUserId = req.body.userId ? req.body.userId : 0;
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : null;
                let userId = authorizationResult.currentUser.id;
                let temporaryCode = "";
                let lastTempCodeSql = "CALL websiteGetLastCustomer()";
                let lastTempCodeResult = yield query(lastTempCodeSql);
                if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                    let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split("_")[1]);
                    temporaryCode = "CT_" + (no + 1).toString().padStart(10, "0");
                }
                else {
                    temporaryCode = "CT_0000000001";
                }
                let permanentCode = req.body.permanentCode ? req.body.permanentCode : '';
                let email = req.body.email ? req.body.email : '';
                let alterNativeContactNo = req.body.alterNativeContactNo ? req.body.alterNativeContactNo : '';
                let partnerId = req.body.partnerId ? req.body.partnerId : null;
                let label = req.body.label ? req.body.label : '';
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let cibilScore = req.body.cibilScore ? req.body.cibilScore : 0;
                let birthDate = req.body.birthDate ? new Date(req.body.birthDate) : '';
                let bdt = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                if (!req.body.profilePicUrl) {
                    if (req.body.userId) {
                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + req.body.userId;
                        let checkUrlResult = yield query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl != null) {
                            let deleteProfileResult = yield query("UPDATE users SET profilePicUrl = '' WHERE id = ?", req.body.userId);
                            if (checkUrlResult[0].profilePicUrl.includes("https:")) {
                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                const delResp = yield S3.deleteObject({
                                    Bucket: 'creditappadminuserprofilepic',
                                    Key: splt[splt.length - 1],
                                }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    }
                                    else {
                                        try {
                                            let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.districtName + `','` + req.body.state + `','` + '' + `','` + req.body.pincode + `',` + cibilScore + `)`;
                                            console.log(sql);
                                            let result = yield query(sql);
                                            if (result && result.affectedRows >= 0) {
                                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                                return res.status(200).send(successResult);
                                            }
                                            else {
                                                let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        }
                                        catch (error) {
                                            let errorResult = new resulterror_1.ResultError(500, true, 'Customers.adminInsertCustomer() Exception', error, '');
                                            next(errorResult);
                                        }
                                    }
                                }));
                            }
                            else {
                                try {
                                    let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.districtName + `','` + req.body.state + `','` + '' + `','` + req.body.pincode + `',` + cibilScore + `)`;
                                    console.log(sql);
                                    let result = yield query(sql);
                                    if (result && result.affectedRows >= 0) {
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                        return res.status(200).send(successResult);
                                    }
                                    else {
                                        let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                        next(errorResult);
                                    }
                                }
                                catch (error) {
                                    let errorResult = new resulterror_1.ResultError(500, true, 'Users.updateUser() Exception', error, '');
                                    next(errorResult);
                                }
                            }
                        }
                        else {
                            try {
                                let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.districtName + `','` + req.body.state + `','` + '' + `','` + req.body.pincode + `',` + cibilScore + `)`;
                                console.log(sql);
                                let result = yield query(sql);
                                if (result && result.affectedRows >= 0) {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                    next(errorResult);
                                }
                            }
                            catch (error) {
                                let errorResult = new resulterror_1.ResultError(500, true, 'Users.updateUser() Exception', error, '');
                                next(errorResult);
                            }
                        }
                    }
                    else {
                        try {
                            let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.districtName + `','` + req.body.state + `','` + '' + `','` + req.body.pincode + `',` + cibilScore + `)`;
                            console.log(sql);
                            let result = yield query(sql);
                            if (result && result.affectedRows >= 0) {
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                next(errorResult);
                            }
                        }
                        catch (error) {
                            let errorResult = new resulterror_1.ResultError(500, true, 'Users.updateUser() Exception', error, '');
                            next(errorResult);
                        }
                    }
                }
                else {
                    if (req.body.profilePicUrl.includes("https:")) {
                        try {
                            let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.district + `','` + req.body.state + `','` + req.body.profilePicUrl + `','` + req.body.pincode + `',` + cibilScore + `)`;
                            console.log(sql);
                            let result = yield query(sql);
                            if (result && result.affectedRows >= 0) {
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                next(errorResult);
                            }
                        }
                        catch (error) {
                            let errorResult = new resulterror_1.ResultError(500, true, 'Customers.insertCustomer() Exception', error, '');
                            next(errorResult);
                        }
                    }
                    else {
                        if (req.body.userId) {
                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + req.body.userId;
                            let checkUrlResult = yield query(checkUrlSql);
                            if (checkUrlResult && checkUrlResult.length > 0) {
                                if (checkUrlResult[0].profilePicUrl) {
                                    let splt = checkUrlResult[0].profilePicUrl.split("/");
                                    const delResp = yield S3.deleteObject({
                                        Bucket: 'creditappadminuserprofilepic',
                                        Key: splt[splt.length - 1],
                                    }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                        if (err) {
                                            console.log("Error: Object delete failed.");
                                            let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                            next(errorResult);
                                        }
                                        else {
                                            try {
                                                let buf = Buffer.from(req.body.profilePicUrl, 'base64');
                                                let contentType;
                                                contentType = 'image/jpeg';
                                                let isErr = false;
                                                let keyName = req.body.fullName.replace(" ", "_");
                                                let params = {
                                                    Bucket: 'creditappadminuserprofilepic',
                                                    Key: keyName + "_" + req.body.userId + "_" + new Date().getTime(),
                                                    Body: buf,
                                                    ContentEncoding: 'base64',
                                                    ContentType: contentType,
                                                    ACL: 'public-read'
                                                };
                                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (error) {
                                                        isErr = true;
                                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                        next(errorResult);
                                                        return;
                                                    }
                                                    console.log(data);
                                                    let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.district + `','` + req.body.state + `','` + data.Location + `','` + req.body.pincode + `',` + cibilScore + `)`;
                                                    console.log(sql);
                                                    let result = yield query(sql);
                                                    if (result && result.affectedRows >= 0) {
                                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                                        return res.status(200).send(successResult);
                                                    }
                                                    else {
                                                        let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                                        next(errorResult);
                                                    }
                                                }));
                                            }
                                            catch (error) {
                                                let errorResult = new resulterror_1.ResultError(500, true, 'Customers.insertCustomer() Exception', error, '');
                                                next(errorResult);
                                            }
                                        }
                                    }));
                                }
                                else {
                                    let buf = Buffer.from(req.body.profilePicUrl, 'base64');
                                    let contentType;
                                    contentType = 'image/jpeg';
                                    let isErr = false;
                                    let keyName = req.body.fullName.replace(" ", "_");
                                    let params = {
                                        Bucket: 'creditappadminuserprofilepic',
                                        Key: keyName + "_" + req.body.id + "_" + new Date().getTime(),
                                        Body: buf,
                                        ContentEncoding: 'base64',
                                        ContentType: contentType,
                                        ACL: 'public-read'
                                    };
                                    yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                        if (error) {
                                            isErr = true;
                                            let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                            next(errorResult);
                                            return;
                                        }
                                        console.log(data);
                                        try {
                                            let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.district + `','` + req.body.state + `','` + data.Location + `','` + req.body.pincode + `',` + cibilScore + `)`;
                                            console.log(sql);
                                            let result = yield query(sql);
                                            if (result && result.affectedRows >= 0) {
                                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                                return res.status(200).send(successResult);
                                            }
                                            else {
                                                let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        }
                                        catch (error) {
                                            let errorResult = new resulterror_1.ResultError(500, true, 'Customers.insertCustomer() Exception', error, '');
                                            next(errorResult);
                                        }
                                    }));
                                }
                            }
                            else {
                                let buf = Buffer.from(req.body.profilePicUrl, 'base64');
                                let contentType;
                                contentType = 'image/jpeg';
                                let isErr = false;
                                let keyName = req.body.fullName.replace(" ", "_");
                                let params = {
                                    Bucket: 'creditappadminuserprofilepic',
                                    Key: keyName + "_" + req.body.id + "_" + new Date().getTime(),
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: contentType,
                                    ACL: 'public-read'
                                };
                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (error) {
                                        isErr = true;
                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                        next(errorResult);
                                        return;
                                    }
                                    console.log(data);
                                    try {
                                        let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.district + `','` + req.body.state + `','` + data.Location + `','` + req.body.pincode + `',` + cibilScore + `)`;
                                        console.log(sql);
                                        let result = yield query(sql);
                                        if (result && result.affectedRows > 0) {
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Updated', result, 1);
                                            return res.status(200).send(successResult);
                                        }
                                        else {
                                            let errorResult = new resulterror_1.ResultError(400, true, "User Not Updated", result, '');
                                            next(errorResult);
                                        }
                                    }
                                    catch (error) {
                                        let errorResult = new resulterror_1.ResultError(500, true, 'Customers.insertCustomer() Exception', error, '');
                                        next(errorResult);
                                    }
                                }));
                            }
                        }
                        else {
                            let contentType;
                            contentType = 'image/jpeg';
                            let fileExt = contentType.split("/")[1].split("+")[0];
                            let buf = Buffer.from(req.body.profilePicUrl, 'base64');
                            let keyName = req.body.fullName.replace(" ", "_");
                            let params = {
                                Bucket: 'creditappadminuserprofilepic',
                                Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                                Body: buf,
                                ContentEncoding: 'base64',
                                ContentType: contentType,
                                ACL: 'public-read'
                            };
                            yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                if (error) {
                                    let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                    next(errorResult);
                                    return;
                                }
                                console.log(data);
                                let sql = `CALL adminInsertCustomer(` + customerId + `,` + customerUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.contactNo + `','` + email + `','` + alterNativeContactNo + `',` + partnerId + `,'` + req.body.panCardNo + `','` + req.body.aadhaarCardNo + `',` + req.body.maritalStatusId + `,` + userId + `,` + customerAddressId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.district + `','` + req.body.state + `','` + data.Location + `','` + req.body.pincode + `',` + cibilScore + `)`;
                                let result = yield query(sql);
                                if (result && result.affectedRows >= 0) {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Inserted', result, 1);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting User", result, '');
                                    next(errorResult);
                                }
                            }));
                        }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'customer.insertCustomer()', error, '');
        next(errorResult);
    }
});
const getCustomerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Customers');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let customerId = req.body.customerId ? req.body.customerId : 0;
            let sql = `CALL adminGetCustomerById(` + customerId + `)`;
            let result = yield query(sql);
            if (result && result.length >= 0) {
                if (result && result.length >= 0) {
                    let customerDetail;
                    if (result[0] && result[0].length > 0) {
                        customerDetail = result[0][0];
                    }
                    customerDetail.customerLoans = result[1] && result[1].length > 0 ? result[1] : [];
                    customerDetail.leads = result[2] && result[2].length > 0 ? result[2] : [];
                    customerDetail.walletHistory = result[3] && result[3].length > 0 ? result[3] : [];
                    customerDetail.groupDetail = result[4] && result[4].length > 0 ? result[4][0] : null;
                    customerDetail.orders = result[5] && result[5].length > 0 ? result[5] : [];
                    customerDetail.otherLoans = result[6] && result[6].length > 0 ? result[6] : [];
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Customer Successfully', customerDetail, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "customers.getCustomers() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'customers.getCustomers() Exception', error, '');
        next(errorResult);
    }
});
const deleteCustomerById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Deleting Customers');
        let requiredFields = ['customerId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "UPDATE customers SET isDelete = 1, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = " + req.body.customerId;
                let result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    let updateUserSql = "UPDATE users SET isDisabled = 1, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = (SELECT userId FROM customers WHERE id = " + req.body.customerId + ")";
                    let updateUserResult = yield query(updateUserSql);
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Delete Customer Successfully', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "customer.deleteCustomerById() Error", new Error("Error During Deleting Customer"), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'customer.deleteCustomerById()', error, '');
        next(errorResult);
    }
});
const getStates = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting State');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `SELECT * FROM states`;
            let result = yield query(sql);
            if (result && result.length >= 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get State Successfully', result, result.length);
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
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'customers.getState() Exception', error, '');
        next(errorResult);
    }
});
const getBecomePartnerRequest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting State');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let searchString = req.body.searchString ? req.body.searchString : '';
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let sql = `CALL adminGetBecomePartnerRequest('` + searchString + `',` + startIndex + `,` + fetchRecords + `)`;
            let result = yield query(sql);
            if (result && result.length >= 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Become Partner Request Successfully', result[1], result[0][0].totalCount);
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
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'customers.getState() Exception', error, '');
        next(errorResult);
    }
});
const assignRoleToCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let requiredFields = ['customerId', 'roleId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Assing Role to partner');
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.customerId ? req.body.customerId : null;
                let partnerCode = req.body.partnerCode ? req.body.partnerCode : '';
                let currentUserId = authorizationResult.currentUser.id;
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let aadharCardNo = req.body.aadharCardNo ? req.body.aadhaarCardNo : '';
                let temporaryCode = '';
                let lastTempCodeSql = 'CALL websiteGetLastPartner()';
                let lastTempCodeResult = yield query(lastTempCodeSql);
                if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                    let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split('_')[1]);
                    temporaryCode = 'TEMP_' + (no + 1).toString().padStart(10, '0');
                }
                else {
                    temporaryCode = 'TEMP_0000000001';
                }
                let permanentCode = '';
                permanentCode = temporaryCode.replace("TEMP", "P");
                let userIdSql = `SELECT userId FROM customers WHERE id = ?`;
                let userIdResult = yield query(userIdSql, customerId);
                let sql = `CALL adminAssignRoleToCustomer(` + customerId + `,` + userIdResult[0].userId + `,` + req.body.roleId + `,'` + partnerCode + `',` + currentUserId + `,'` + temporaryCode + `','` + permanentCode + `','` + req.body.fullName + `','` + req.body.gender + `','` + req.body.contactNo + `','` + aadharCardNo + `','` + req.body.panCardNo + `',` + req.body.cityId + `,` + req.body.businessCommitement + `,'` + req.body.addressLine1 + `','` + addressLine2 + `','` + req.body.pincode + `','` + req.body.jobType + `')`;
                let result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    //#region Notification
                    let partnerFcm = "";
                    let partnerUserId = userIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + userIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = yield query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                    let title = "Become A Partner Successfully";
                    let description = "You Become a Partner Successfully,Now you are login as a " + req.body.roleName + "";
                    let dataBody = {
                        type: 15,
                        id: userIdResult[0].userId,
                        title: title,
                        message: description,
                        json: null,
                        dateTime: null,
                        customerLoanId: null,
                        loanType: null,
                        creditCardId: null,
                        creditCardStatus: null
                    };
                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                VALUES(` + userIdResult[0].userId + `, 15, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let notificationResult = yield query(notificationSql);
                        yield notifications_1.default.sendMultipleNotification([partnerFcm], 15, userIdResult[0].userId, title, description, '', null, null, null, null, null, null);
                    }
                    //#endregion Notification
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Assign Role To Customer', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'customer.assignRoleToCustomer()', error, '');
        next(errorResult);
    }
});
const becomePartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let requiredFields = ['id', 'contactNo', 'roleId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Assing Role to partner');
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerCode = req.body.partnerCode ? req.body.partnerCode : '';
                let currentUserId = authorizationResult.currentUser.id;
                let checkontactNoSql = "SELECT u.*, r.name as roleName FROM users u INNER JOIN userroles ur ON ur.userId = u.id INNER JOIN roles r ON r.id = ur.roleId WHERE u.contactNo = '" + req.body.contactNo + "'";
                let checkontactNoResult = yield query(checkontactNoSql);
                if (checkontactNoResult && checkontactNoResult.length > 0) {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Contact No already Used as ' + checkontactNoResult[0].roleName, new Error('Contact No already Used as ' + checkontactNoResult[0].roleName), '');
                    next(errorResult);
                }
                else {
                    let temporaryCode = '';
                    let lastTempCodeSql = 'CALL websiteGetLastPartner()';
                    let lastTempCodeResult = yield query(lastTempCodeSql);
                    if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                        let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split('_')[1]);
                        temporaryCode = 'TEMP_' + (no + 1).toString().padStart(10, '0');
                    }
                    else {
                        temporaryCode = 'TEMP_0000000001';
                    }
                    let getreqUserSql = "SELECT * FROM becomeapartnerrequest WHERE id = " + req.body.id;
                    let getreqUserResult = yield query(getreqUserSql);
                    if (getreqUserResult && getreqUserResult.length > 0) {
                        let insertUserSql = `INSERT INTO users(fullName, gender, countryCode, contactNo, isDisabled, createdBy, modifiedBy, currentRoleId) 
                        VALUES('` + getreqUserResult[0].fullName + `', '` + getreqUserResult[0].gender + `', '+91', '` + getreqUserResult[0].contactNo + `', true,` + currentUserId + `,` + currentUserId + `,` + currentUserId + `)`;
                        let insertUserResult = yield query(insertUserSql);
                        if (insertUserResult && insertUserResult.insertId) {
                            let userRoleSql = `INSERT INTO userroles(userId, roleId) VALUES(` + insertUserResult.insertId + `, ` + req.body.roleId + `)`;
                            let userRoleResult = yield query(userRoleSql);
                            let parentPartnerId = null;
                            if (partnerCode) {
                                let parentPartnerSql = "select id,userId FROM partners WHERE permanentCode = " + partnerCode;
                                let parentPartnerResult = yield query(parentPartnerSql);
                                if (parentPartnerResult && parentPartnerResult.length > 0) {
                                    parentPartnerId = parentPartnerResult[0].id;
                                }
                            }
                            let partnerSql = `INSERT INTO
                            partners(parentPartnerId, userId, temporaryCode, fullName, gender, contactNo, aadhaarCardNo, panCardNo, cityId, businessAddress, addressLine1, addressLine2, pincode, jobType, commitment, currentBadgeId, createdBy, modifiedBy)
                            VALUES(` + parentPartnerId + `, ` + insertUserResult.insertId + `, '` + temporaryCode + `', '` + getreqUserResult[0].fullName + `', '` + getreqUserResult[0].gender + `', '` + getreqUserResult[0].contactNo + `'
                            , '` + (getreqUserResult[0].aadharCardNo ? getreqUserResult[0].aadharCardNo : '') + `', '` + (getreqUserResult[0].panCardNo ? getreqUserResult[0].panCardNo : '') + `'
                            , ` + (getreqUserResult[0].cityId ? getreqUserResult[0].cityId : '') + `, '` + (getreqUserResult[0].addressLine1 + (getreqUserResult[0].addressLine2 ? +" " + getreqUserResult[0].addressLine2 : '')) + `'
                            , '` + getreqUserResult[0].addressLine1 + `', '` + (getreqUserResult[0].addressLine2 ? getreqUserResult[0].addressLine2 : '') + `', '` + (getreqUserResult[0].pincode ? getreqUserResult[0].pincode : '') + `'
                            , '` + (getreqUserResult[0].jobType ? getreqUserResult[0].jobType : '') + `', ` + (getreqUserResult[0].commitment ? getreqUserResult[0].commitment : '') + `, 1, ` + currentUserId + `, ` + currentUserId + `)`;
                            let partnerResult = yield query(partnerSql);
                            if (partnerResult && partnerResult.insertId) {
                                let partnerBadgeSql = `INSERT INTO partnerbadges(partnerId, badgeId, createdBy, modifiedBy) VALUES(` + partnerResult.insertId + `, 1, ` + currentUserId + `, ` + currentUserId + `)`;
                                let partnerBadgeResult = yield query(partnerBadgeSql);
                                if (parseInt(req.body.roleId) == 5) {
                                    let teamSql = "INSERT INTO partnerteams (partnerId,teamPartnerId) VALUES (" + parentPartnerId + "," + partnerResult.insertId + ")";
                                    let teamResult = yield query(teamSql);
                                }
                                else if (parseInt(req.body.roleId) == 4 || parseInt(req.body.roleId) == 6) {
                                    let teamSql = "INSERT INTO partnernetworks (partnerId,teamPartnerId) VALUES (" + parentPartnerId + "," + partnerResult.insertId + ")";
                                    let teamResult = yield query(teamSql);
                                }
                                let partnerAddressSql = `INSERT INTO partneraddress (partnerId,addressTypeId,addressLine1,addressLine2,pincode,cityId,createdBy,modifiedBy) 
                                VALUES (` + partnerResult.insertId + `,1,'` + getreqUserResult[0].addressLine1 + `','` + (getreqUserResult[0].addressLine2 ? getreqUserResult[0].addressLine2 : '') + `'
                                ,'` + (getreqUserResult[0].pincode ? getreqUserResult[0].pincode : '') + `', ` + getreqUserResult[0].cityId + `,` + currentUserId + `,` + currentUserId + `)`;
                                let partnerAddressResult = yield query(partnerAddressSql);
                                let deletePartnerReqSql = "DELETE FROM becomeapartnerrequest WHERE id = " + req.body.id;
                                let deletePartnerReqResult = yield query(deletePartnerReqSql);
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Added Successfully', partnerResult, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, 'Error While Add Partner', new Error('Error While Add Partner'), '');
                                next(errorResult);
                            }
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, 'Error While Add Partner User', new Error('Error While Add Partner User'), '');
                            next(errorResult);
                        }
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Become Partner Request not available', new Error('Become Partner Request not available'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'customer.assignRoleToCustomer()', error, '');
        next(errorResult);
    }
});
const temp_InsertUpdateCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let requiredFields = ['fullName', 'contactNo', 'panCardNo', 'cityId', 'gender', 'birthDate', 'maritalStatusId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Customer Inserting');
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.id ? req.body.id : 0;
                let customerUserId = req.body.userId ? req.body.userId : 0;
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : null;
                let userId = authorizationResult.currentUser.id;
                let email = req.body.email ? req.body.email : '';
                let alterNativeContactNo = req.body.alterNativeContactNo ? req.body.alterNativeContactNo : '';
                let partnerId = req.body.partnerId ? req.body.partnerId : null;
                let label = req.body.label ? req.body.label : '';
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let birthDate = req.body.birthDate ? new Date(req.body.birthDate) : '';
                let bdt = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                if (!req.body.profilePicUrl) {
                    if (req.body.userId) {
                        //update
                    }
                    else {
                        //insert
                        let userSql = `INSERT INTO users_temp(fullName, gender, contactNo, countryCode, email, isDisabled, currentRoleId, createdBy, createdDate, modifiedBy, modifiedDate) 
                        VALUES('` + req.body.fullName + `', '` + req.body.gender + `', '` + req.body.contactNo + `', '+91', '` + email + `', false, 2, ` + userId + `,CURRENT_TIMESTAMP(),` + userId + `,CURRENT_TIMESTAMP())`;
                        let userResult = yield query(userSql);
                        if (userResult && userResult.insertId > 0) {
                            let userRoleSql = `INSERT INTO userroles_temp(userId,roleId,createdBy,modifiedBy) VALUES(` + userResult.insertId + `, 2, ` + userId + `, ` + userId + `)`;
                            let userRoleResult = yield query(userRoleSql);
                            let customerSql = `INSERT INTO customers_temp(customerId, fullName, birthDate, gender, contactNo, alterNativeContactNo, partnerId, panCardNo, aadhaarCardNo, maritalStatusId, createdBy, createdDate, modifiedBy, modifiedDate, currentRoleId) 
                            VALUES(null, '` + req.body.fullName + `', '` + req.body.gender + `', '` + bdt + `', '` + req.body.contactNo + `', '` + alterNativeContactNo + `', ` + partnerId + `, '` + req.body.panCardNo + `', '` + req.body.aadhaarCardNo + `', ` + req.body.maritalStatusId + `, ` + userId + `, CURRENT_TIMESTAMP(),` + userId + `, CURRENT_TIMESTAMP(), 2)`;
                            let customerResult = yield query(customerSql);
                            if (customerResult && customerResult.insertId > 0) {
                                let customerAddressSql = `INSERT INTO customeraddresses_temp(customers_tempId, addressTypeId, label, addressLine1, addressLine2, pincode, cityId, city, district, state, createdBy, createdDate, modifiedBy, modifiedDate) 
                                VALUES(` + customerResult.insertId + `, 1, '` + label + `', '` + addressLine1 + `', '` + addressLine2 + `', '` + req.body.pincode + `',` + req.body.cityId + `, '` + req.body.city + `', '` + req.body.districtName + `', '` + req.body.state + `', ` + userId + `, CURRENT_TIMESTAMP(),` + userId + `, CURRENT_TIMESTAMP())`;
                                let customerAddressResult = yield query(customerAddressSql);
                                let jsonData = JSON.stringify({ "fullName": req.body.fullName, "contactNo": req.body.contactNo });
                                let adminUserActionSql = `INSERT INTO adminuseractions(adminPanelActionId, referenceId, jsonValue, createdDate, modifiedDate, createdBy, modifiedBy)
                                VALUES(1, ` + customerResult.insertId + `, '` + jsonData + `', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), ` + userId + `, ` + userId + `)`;
                                let adminUserActionResult = yield query(adminUserActionSql);
                                if (adminUserActionResult && adminUserActionResult.affectedRows >= 0) {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Customer Added Successfully', customerResult, 1);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let errorResult = new resulterror_1.ResultError(400, true, "Customer Not Added", customerResult, '');
                                    next(errorResult);
                                }
                            }
                        }
                    }
                }
                else {
                    if (req.body.profilePicUrl.includes("https:")) {
                        //Update
                    }
                    else {
                        if (req.body.userId) {
                            //update
                        }
                        else {
                            //insert
                            let contentType;
                            contentType = 'image/jpeg';
                            let fileExt = contentType.split("/")[1].split("+")[0];
                            let buf = Buffer.from(req.body.profilePicUrl, 'base64');
                            let keyName = req.body.fullName.replace(" ", "_");
                            let params = {
                                Bucket: 'creditappadminuserprofilepic',
                                Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                                Body: buf,
                                ContentEncoding: 'base64',
                                ContentType: contentType,
                                ACL: 'public-read'
                            };
                            yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                if (error) {
                                    let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                    next(errorResult);
                                    return;
                                }
                                console.log(data);
                                let userSql = `INSERT INTO users_temp(fullName, gender, contactNo, countryCode, email, profilePicUrl, isDisabled, currentRoleId, createdBy, createdDate, modifiedBy, modifiedDate) 
                                VALUES('` + req.body.fullName + `', '` + req.body.gender + `', '` + req.body.contactNo + `', '+91', '` + email + `', '` + data.Location + `', false, 2, ` + userId + `,CURRENT_TIMESTAMP(),` + userId + `,CURRENT_TIMESTAMP())`;
                                let userResult = yield query(userSql);
                                if (userResult && userResult.insertId > 0) {
                                    let userRoleSql = `INSERT INTO userroles_temp(userId,roleId,createdBy,modifiedBy) VALUES(` + userResult.insertId + `, 2, ` + userId + `, ` + userId + `)`;
                                    let userRoleResult = yield query(userRoleSql);
                                    let customerSql = `INSERT INTO customers_temp(customerId, fullName, birthDate, gender, contactNo, alterNativeContactNo, partnerId, panCardNo, aadhaarCardNo, maritalStatusId, createdBy, createdDate, modifiedBy, modifiedDate, currentRoleId) 
                                    VALUES(null, '` + req.body.fullName + `', '` + req.body.gender + `', '` + bdt + `', '` + req.body.contactNo + `', '` + alterNativeContactNo + `', ` + partnerId + `, '` + req.body.panCardNo + `', '` + req.body.aadhaarCardNo + `', ` + req.body.maritalStatusId + `, ` + userId + `, CURRENT_TIMESTAMP(),` + userId + `, CURRENT_TIMESTAMP(), 2)`;
                                    let customerResult = yield query(customerSql);
                                    if (customerResult && customerResult.insertId > 0) {
                                        let customerAddressSql = `INSERT INTO customeraddresses_temp(customers_tempId, addressTypeId, label, addressLine1, addressLine2, pincode, cityId, city, district, state, createdBy, createdDate, modifiedBy, modifiedDate) 
                                        VALUES(` + customerResult.insertId + `, 1, '` + label + `', '` + addressLine1 + `', '` + addressLine2 + `', '` + req.body.pincode + `',` + req.body.cityId + `, '` + req.body.city + `', '` + req.body.districtName + `', '` + req.body.state + `', ` + userId + `, CURRENT_TIMESTAMP(),` + userId + `, CURRENT_TIMESTAMP())`;
                                        let customerAddressResult = yield query(customerAddressSql);
                                        let jsonData = JSON.stringify({ "fullName": req.body.fullName, "contactNo": req.body.contactNo });
                                        let adminUserActionSql = `INSERT INTO adminuseractions(adminPanelActionId, referenceId, jsonValue, createdDate, modifiedDate, createdBy, modifiedBy)
                                        VALUES(1, ` + customerResult.insertId + `, '` + jsonData + `', CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP(), ` + userId + `, ` + userId + `)`;
                                        let adminUserActionResult = yield query(adminUserActionSql);
                                        if (adminUserActionResult && adminUserActionResult.affectedRows >= 0) {
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Customer Added Successfully', customerResult, 1);
                                            return res.status(200).send(successResult);
                                        }
                                        else {
                                            let errorResult = new resulterror_1.ResultError(400, true, "Customer Not Added", customerResult, '');
                                            next(errorResult);
                                        }
                                    }
                                }
                            }));
                        }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'customer.temp_InsertUpdateCustomer()', error, '');
        next(errorResult);
    }
});
exports.default = { getCustomers, checkContactNoExist, insertCustomer, getCustomerById, deleteCustomerById, getStates, getBecomePartnerRequest, assignRoleToCustomer, becomePartner, temp_InsertUpdateCustomer };
