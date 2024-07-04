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
const loanCompleteHistoryReponse_1 = require("../../classes/output/loan/loanCompleteHistoryReponse");
const loanStatusResponse_1 = require("../../classes/output/loan/loanStatusResponse");
const basicDetailCCResponse_1 = require("../../classes/output/loan/credit card/basicDetailCCResponse");
const creditCardResponse_1 = require("../../classes/output/loan/credit card/creditCardResponse");
const creditCardAddressResponse_1 = require("../../classes/output/loan/credit card/creditCardAddressResponse");
const choosenCreditCardDetailResponse_1 = require("../../classes/output/loan/credit card/choosenCreditCardDetailResponse");
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
const NAMESPACE = 'Credit Card';
const insertUpdateProfileDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['customerId', 'birthdate', 'fullName', 'gender', 'maritalStatusId', 'panCardNo'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let creditCardId = req.body.creditCardId ? req.body.creditCardId : null;
                let otherCreditCardBankId = req.body.otherCreditCardBankId ? req.body.otherCreditCardBankId : null;
                let maxCreditLimit = req.body.maxCreditLimit ? req.body.maxCreditLimit : null;
                let availableCreditLimit = req.body.availableCreditLimit ? req.body.availableCreditLimit : null;
                let isAlreadyCreditCard = req.body.isAlreadyCreditCard ? req.body.isAlreadyCreditCard : false;
                let userId = req.body.userId ? req.body.userId : authorizationResult.currentUser.id;
                let customerId = req.body.customerId;
                let fullName = req.body.fullName ? req.body.fullName : "";
                req.body.birtheDate = new Date(new Date().toUTCString());
                let birthDate = req.body.birthdate ? new Date(req.body.birthdate) : null;
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
                let gender = req.body.gender ? req.body.gender : "";
                let maritalStatusId = req.body.maritalStatusId ? req.body.maritalStatusId : null;
                let email = req.body.email ? req.body.email : null;
                let partnerId = 0;
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                if (dsaCode && !creditCardId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = yield query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }
                let dDate = null;
                if (birthDate)
                    dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                let sql = `CALL insertUpdateCreditCardProfileDetail(` + customerId + `,` + userId + `,` + creditCardId + `,'` + fullName + `','` + dDate + `','` + gender + `','` + panCardNo + `',` + maritalStatusId + `,` + otherCreditCardBankId + `,` + maxCreditLimit + `,` + availableCreditLimit + `,` + isAlreadyCreditCard + `,'` + email + `',` + userId + `,` + partnerId + `)`;
                console.log(sql);
                let result = yield query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Profile Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Profile Detail Saved', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Credit Card Profile Detail Not Saved", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'loans.insertUpdateProfileDetail()', error, '');
        next(errorResult);
    }
});
const insertUpdateEmploymentDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['creditCardId', 'employmentTypeId', 'bankId', 'bankAccountNo'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let creditCardId = req.body.creditCardId ? req.body.creditCardId : null;
                let bankId = req.body.bankId ? req.body.bankId : null;
                let userId = req.body.userId;
                let customerId = req.body.customerId;
                let companyName = req.body.companyName ? req.body.companyName : '';
                let professionName = req.body.professionName ? req.body.professionName : '';
                let bankAccountNo = req.body.bankAccountNo ? req.body.bankAccountNo : '';
                let lastItr = req.body.lastItr ? req.body.lastItr : '';
                let educationTypeId = req.body.educationTypeId;
                let creditCardEmploymentDetailId = req.body.creditCardEmploymentDetailId ? req.body.creditCardEmploymentDetailId : null;
                let employmentTypeId = req.body.employmentTypeId;
                let fullName = req.body.fullName ? req.body.fullName : null;
                let officeContactNo = req.body.officeContactNo ? req.body.officeContactNo : null;
                if (req.body.lastItr.includes("https:")) {
                    let sql = `CALL customerInsertUpdateCreditCardEmploymentDetail(` + creditCardId + `,` + creditCardEmploymentDetailId + `,` + employmentTypeId + `,'` + companyName + `','` + professionName + `',` + bankId + `,'` + bankAccountNo + `','` + lastItr + `',` + educationTypeId + `,` + customerId + `,'` + officeContactNo + `',` + userId + `,` + null + `)`;
                    console.log(sql);
                    let result = yield query(sql);
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Employment Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "Credit Card Employment Detail Not Saved", result, '');
                        next(errorResult);
                    }
                }
                else {
                    let buf = Buffer.from(lastItr, 'base64');
                    let contentType;
                    contentType = 'application/pdf';
                    let isErr = false;
                    let keyName = fullName.replace(" ", "_");
                    let params = {
                        Bucket: 'creditappcreditcardlastitr',
                        Key: keyName + "_" + customerId + "_creditcard_" + new Date().getTime(),
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
                        let dDate = null;
                        let sql = `CALL customerInsertUpdateCreditCardEmploymentDetail(` + creditCardId + `,` + creditCardEmploymentDetailId + `,` + employmentTypeId + `,'` + companyName + `','` + professionName + `',` + bankId + `,'` + bankAccountNo + `','` + data.Location + `',` + educationTypeId + `,` + customerId + `,'` + officeContactNo + `',` + userId + `,` + null + `)`;
                        console.log(sql);
                        let result = yield query(sql);
                        if (result && result[0].length > 0) {
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Employment Detail Saved', result[0], 1);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, "Credit Card Employment Detail Not Saved", result, '');
                            next(errorResult);
                        }
                    }));
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
        let errorResult = new resulterror_1.ResultError(500, true, 'loans.insertUpdateProfileDetail()', error, '');
        next(errorResult);
    }
});
const insertUpdateCustomerAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Home Loan Customer Address');
        var requiredFields = ["customerAddresses"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let finalResult = [];
                let addressLength = req.body.customerAddresses.length;
                for (let i = 0; i < req.body.customerAddresses.length; i++) {
                    let customerAddressId = req.body.customerAddresses[i].customerAddressId ? req.body.customerAddresses[i].customerAddressId : null;
                    let customerId = req.body.customerAddresses[i].customerId ? req.body.customerAddresses[i].customerId : null;
                    let addressTypeId = req.body.customerAddresses[i].addressTypeId ? req.body.customerAddresses[i].addressTypeId : null;
                    let label = req.body.customerAddresses[i].label ? req.body.customerAddresses[i].label : "";
                    let addressLine1 = req.body.customerAddresses[i].addressLine1 ? req.body.customerAddresses[i].addressLine1 : "";
                    let addressLine2 = req.body.customerAddresses[i].addressLine2 ? req.body.customerAddresses[i].addressLine2 : "";
                    let pincode = req.body.customerAddresses[i].pincode ? req.body.customerAddresses[i].pincode : "";
                    let cityId = req.body.customerAddresses[i].cityId ? req.body.customerAddresses[i].cityId : null;
                    let city = req.body.customerAddresses[i].city ? req.body.customerAddresses[i].city : "";
                    let district = req.body.customerAddresses[i].district ? req.body.customerAddresses[i].district : "";
                    let state = req.body.customerAddresses[i].state ? req.body.customerAddresses[i].state : "";
                    let customerCreditCardId = req.body.customerAddresses[i].customerCreditCardId;
                    let sql1 = `SELECT id FROM  customeraddresses WHERE customerId = ` + customerId + ` AND addressTypeId = ` + addressTypeId;
                    let result1 = yield query(sql1);
                    if (result1 && result1.length > 0) {
                        customerAddressId = result1[0].id;
                    }
                    let sql = `CALL insertUpdateCustomerCreditCardAddress(` + customerAddressId + `,` + customerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                    ,` + cityId + `,'` + city + `','` + district + `','` + state + `',` + customerCreditCardId + `,` + userId + `)`;
                    let result = yield query(sql);
                    if (result && result.length > 0) {
                        if (result[0] && result[0].length > 0) {
                            finalResult.push(result[0][0]);
                            if (addressLength == (i + 1)) {
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Crdit Card Address Saved', finalResult, finalResult.length);
                                console.log(successResult);
                                return res.status(200).send(successResult);
                            }
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, "Crdit Card Address Not Saved", new Error('Home Loan Customer Address Not Saved'), '');
                            next(errorResult);
                        }
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "Crdit Card Address Not Saved", new Error('Home Loan Customer Address Not Saved'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'homeLoan.insertUpdateCustomerAddress()', error, '');
        next(errorResult);
    }
});
const insertUpdateCustomerWorkAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Home Loan Customer Employment Detail');
        var requiredFields = ["customerCreditCardId", "label", "addressLine1", "pincode", "cityId"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : null;
                let customerId = req.body.customerId ? req.body.customerId : null;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : null;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode ? req.body.pincode : "";
                let cityId = req.body.cityId ? req.body.cityId : null;
                let city = req.body.city ? req.body.city : "";
                let district = req.body.district ? req.body.district : "";
                let state = req.body.state ? req.body.state : "";
                let customerCreditCardId = req.body.customerCreditCardId;
                let sql = `CALL insertUpdateCustomerCreditCardWorkAddress(` + customerAddressId + `,` + customerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                ,` + cityId + `,'` + city + `','` + district + `','` + state + `',` + customerCreditCardId + `,` + userId + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Customer Work Detatil Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Customer Work Detatil Saved', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Credit Card Customer Work Detatil Not Saved", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'creditCard.insertUpdateCustomerWorkAddress()', error, '');
        next(errorResult);
    }
});
const chooseCommunicationAddress = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Choose Communication Address');
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let communicationAddressId = req.body.communicationAddressId ? req.body.communicationAddressId : null;
                let customerCreditCardId = req.body.customerCreditCardId ? req.body.customerCreditCardId : null;
                let modifiedDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                let communicationselectioneSql = "UPDATE customercreditcards SET communicationAddressId= " + communicationAddressId + ", modifiedDate = '" + modifiedDate + "' WHERE id=" + customerCreditCardId;
                let communicationselectioneResult = yield query(communicationselectioneSql);
                console.log(communicationselectioneResult);
                if (communicationselectioneResult && communicationselectioneResult.affectedRows >= 0) {
                    let statusSql = `SELECT creditcardstatuses.status FROM customercreditcardstatushistory INNER JOIN creditcardstatuses ON creditcardstatuses.id = customercreditcardstatushistory.creditcardStatusId WHERE customerCreditCardId=` + customerCreditCardId + ` ORDER BY customercreditcardstatushistory.id DESC LIMIT 1`;
                    let statusResult = yield query(statusSql);
                    let objResult;
                    if (statusResult && statusResult.length > 0) {
                        objResult = { "loanStatusName": statusResult[0].status };
                    }
                    else {
                        let loanStatusId;
                        let pendingSeatus = yield query("SELECT id FROM creditcardstatuses WHERE status = 'PENDING'");
                        if (pendingSeatus && pendingSeatus.length > 0) {
                            loanStatusId = pendingSeatus[0].id;
                            let statusSql = "INSERT INTO customercreditcardstatushistory(customerCreditCardId,creditcardStatusId,createdBy,modifiedBy) VALUES(" + customerCreditCardId + "," + loanStatusId + "," + userId + "," + userId + ")";
                            let statusResult = yield query(statusSql);
                            console.log(statusResult);
                            let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                            let chageStatusSql = "UPDATE customercreditcards SET statusId = " + loanStatusId + ", creditCardTransactionDate = '" + transactionDate + "' WHERE id = ?";
                            let chageStatusResult = yield query(chageStatusSql, customerCreditCardId);
                            console.log(chageStatusResult);
                            let loancompleteSql = "UPDATE creditcardcompletescreenhistory SET isCompleted=true WHERE customerCreditCardId=" + customerCreditCardId;
                            let loanCompleteResult = yield query(loancompleteSql);
                            console.log(loanCompleteResult);
                            objResult = { "loanStatusName": "PENDING" };
                        }
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card communication address changed', [objResult], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "creditCards.chooseCommunicationAddress() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'creditCard.insertUpdateCustomerWorkAddress()', error, '');
        next(errorResult);
    }
});
const getIncompleteCreditCardDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Incomplete Personal Loan Detail');
        var requiredFields = ['customerId', 'serviceId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let customerId = req.body.customerId;
                let sql = `CALL customerGetIncompleteCreditCardRequest(` + customerId + `,` + serviceId + `)`;
                let result = yield query(sql);
                //from here....
                if (result && result.length > 0 && result[0].length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Personl Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let obj = result[0];
                        obj[0].customerCreditCard = result[1][0];
                        obj[0].customerCreditCardEmploymentDetail = result[2][0];
                        obj[0].correspondenseAddress = result[3][0];
                        obj[0].workAddress = result[4][0];
                        obj[0].customerCreditCardCompleteHistory = result[5][0];
                        obj[0].customerCreditCardStatusHistory = result[6][result[6].length - 1];
                        obj[0].chooseCreditCardDetail = result[7] ? result[7][0] : null;
                        let loanStatus = null;
                        let basicDetail = new basicDetailCCResponse_1.BasicDetailCCResponse(obj[0].fullName, obj[0].birthdate, obj[0].panCardNo, obj[0].gender, obj[0].maritalStatusId, obj[0].email, obj[0].customerCreditCard.id, obj[0].customerCreditCard.otherCreditCardBankId, obj[0].customerCreditCard.maxCreditLimit, obj[0].customerCreditCard.availableCreditLimit, obj[0].customerCreditCard.isAlreadyCreditCard, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.employmentTypeId : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.bankId : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.bankAccountNo : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.lastItr : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.educationTypeId : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.officeContactNo : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.id : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.companyName : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.professionName : null, obj[0].customerCreditCard ? obj[0].customerCreditCard.communicationAddressId : null, obj[0].id, obj[0].userId, obj[0].contactNo);
                        let permanentAddressDetail = new creditCardAddressResponse_1.CreditCardAddressResponse(obj[0].label, obj[0].addressLine1, obj[0].addressLine2, obj[0].pincode, obj[0].cityId, obj[0].addressTypeId, obj[0].addressId);
                        let correspondenceAddressDetail = obj[0].correspondenseAddress ? new creditCardAddressResponse_1.CreditCardAddressResponse(obj[0].correspondenseAddress.label, obj[0].correspondenseAddress.addressLine1, obj[0].correspondenseAddress.addressLine2, obj[0].correspondenseAddress.pincode, obj[0].correspondenseAddress.cityId, obj[0].correspondenseAddress.addressTypeId, obj[0].correspondenseAddress.addressId) : null;
                        let workAddressDetail = obj[0].workAddress ? new creditCardAddressResponse_1.CreditCardAddressResponse(obj[0].workAddress.label, obj[0].workAddress.addressLine1, obj[0].workAddress.addressLine2, obj[0].workAddress.pincode, obj[0].workAddress.cityId, obj[0].workAddress.addressTypeId, obj[0].workAddress.addressId) : null;
                        let chooseCreditCardDetail = obj[0].chooseCreditCardDetail ? new choosenCreditCardDetailResponse_1.ChoosenCreditCardDetailResponse(obj[0].chooseCreditCardDetail.bankId, obj[0].chooseCreditCardDetail.bankCreditCardId, obj[0].chooseCreditCardDetail.referenceNo, obj[0].chooseCreditCardDetail.id, obj[0].chooseCreditCardDetail.bankName) : null;
                        let loanCompleteHistory = new loanCompleteHistoryReponse_1.loanCompleteHistoryResponse(obj[0].customerCreditCardCompleteHistory.isCompleted, obj[0].customerCreditCardCompleteHistory.completeScreen);
                        if (obj[0].customerCreditCardStatusHistory) {
                            loanStatus = new loanStatusResponse_1.LoanStatusResponse(obj[0].customerCreditCardStatusHistory.id, obj[0].customerCreditCardStatusHistory.transactionDate, obj[0].customerCreditCardStatusHistory.creditCardStatus, obj[0].customerCreditCardStatusHistory.isDataEditable, result[6][0].transactionDate, obj[0].customerCreditCard.displayName, null);
                        }
                        let response = new creditCardResponse_1.CreditCardResponse(basicDetail, permanentAddressDetail, correspondenceAddressDetail, workAddressDetail, loanCompleteHistory, loanStatus, chooseCreditCardDetail);
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Personal Loan Incomplete Data', [response], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Personal Loan Incomplete Data", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.getIncompletePersonalLoanDetail()', error, '');
        next(errorResult);
    }
});
const getCustomerCreditCardById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Personal Loan Detail');
        var requiredFields = ['customerId', 'customerCreditCardId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.customerId;
                let customerCreditCardId = req.body.customerCreditCardId;
                let sql = `CALL customerGetCreditCardByCustomerCreditCardId(` + customerId + `,` + customerCreditCardId + `)`;
                let result = yield query(sql);
                //from here....
                if (result && result.length > 0 && result[0].length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Personl Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let obj = result[0];
                        obj[0].customerCreditCard = result[1][0];
                        obj[0].customerCreditCardEmploymentDetail = result[2][0];
                        obj[0].correspondenseAddress = result[3][0];
                        obj[0].workAddress = result[4][0];
                        obj[0].customerCreditCardCompleteHistory = result[5][0];
                        obj[0].customerCreditCardStatusHistory = result[6][result[6].length - 1];
                        obj[0].chooseCreditCardDetail = result[7] ? result[7][0] : null;
                        let loanStatus = null;
                        let basicDetail = new basicDetailCCResponse_1.BasicDetailCCResponse(obj[0].fullName, obj[0].birthdate, obj[0].panCardNo, obj[0].gender, obj[0].maritalStatusId, obj[0].email, obj[0].customerCreditCard.id, obj[0].customerCreditCard.otherCreditCardBankId, obj[0].customerCreditCard.maxCreditLimit, obj[0].customerCreditCard.availableCreditLimit, obj[0].customerCreditCard.isAlreadyCreditCard, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.employmentTypeId : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.bankId : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.bankAccountNo : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.lastItr : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.educationTypeId : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.officeContactNo : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.id : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.companyName : null, obj[0].customerCreditCardEmploymentDetail ? obj[0].customerCreditCardEmploymentDetail.professionName : null, obj[0].customerCreditCard ? obj[0].customerCreditCard.communicationAddressId : null, obj[0].id, obj[0].userId, obj[0].contactNo);
                        let permanentAddressDetail = new creditCardAddressResponse_1.CreditCardAddressResponse(obj[0].label, obj[0].addressLine1, obj[0].addressLine2, obj[0].pincode, obj[0].cityId, obj[0].addressTypeId, obj[0].addressId);
                        let correspondenceAddressDetail = obj[0].correspondenseAddress ? new creditCardAddressResponse_1.CreditCardAddressResponse(obj[0].correspondenseAddress.label, obj[0].correspondenseAddress.addressLine1, obj[0].correspondenseAddress.addressLine2, obj[0].correspondenseAddress.pincode, obj[0].correspondenseAddress.cityId, obj[0].correspondenseAddress.addressTypeId, obj[0].correspondenseAddress.addressId) : null;
                        let workAddressDetail = obj[0].workAddress ? new creditCardAddressResponse_1.CreditCardAddressResponse(obj[0].workAddress.label, obj[0].workAddress.addressLine1, obj[0].workAddress.addressLine2, obj[0].workAddress.pincode, obj[0].workAddress.cityId, obj[0].workAddress.addressTypeId, obj[0].workAddress.addressId) : null;
                        let chooseCreditCardDetail = obj[0].chooseCreditCardDetail ? new choosenCreditCardDetailResponse_1.ChoosenCreditCardDetailResponse(obj[0].chooseCreditCardDetail.bankId, obj[0].chooseCreditCardDetail.bankCreditCardId, obj[0].chooseCreditCardDetail.referenceNo, obj[0].chooseCreditCardDetail.id, obj[0].chooseCreditCardDetail.bankName) : null;
                        let loanCompleteHistory = new loanCompleteHistoryReponse_1.loanCompleteHistoryResponse(obj[0].customerCreditCardCompleteHistory.isCompleted, obj[0].customerCreditCardCompleteHistory.completeScreen);
                        if (obj[0].customerCreditCardStatusHistory) {
                            loanStatus = new loanStatusResponse_1.LoanStatusResponse(obj[0].customerCreditCardStatusHistory.id, obj[0].customerCreditCardStatusHistory.transactionDate, obj[0].customerCreditCardStatusHistory.creditCardStatus, obj[0].customerCreditCardStatusHistory.isDataEditable, result[6][0].transactionDate, obj[0].customerCreditCard.displayName, null);
                        }
                        let response = new creditCardResponse_1.CreditCardResponse(basicDetail, permanentAddressDetail, correspondenceAddressDetail, workAddressDetail, loanCompleteHistory, loanStatus, chooseCreditCardDetail);
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Personal Loan Incomplete Data', [response], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Personal Loan Incomplete Data", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'creditCards.getIncompletePersonalLoanDetail()', error, '');
        next(errorResult);
    }
});
const creditCardEligibility = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Credit Card Eligibility');
        var requiredFields = ['customerCreditCardId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let checkSql = `SELECT cced.id, cced.employmentTypeId, cced.companyName, c.birthDate,c.cibilScore FROM customercreditcardemploymentdetail cced
                                INNER JOIN customercreditcards cc ON cced.creditCardId = cc.id
                                INNER JOIN customers c ON cc.customerId = c.id
                                WHERE cc.id = ` + req.body.customerCreditCardId;
                let checkResult = yield query(checkSql);
                if (checkResult && checkResult.length > 0) {
                    let employmentTypeId;
                    let companyCategoryId;
                    let age;
                    if (checkResult[0].employmentTypeId) {
                        employmentTypeId = checkResult[0].employmentTypeId;
                    }
                    if (checkResult[0].companyName) {
                        let companyCatSql = `SELECT * FROM companycategory WHERE companyName like'%` + checkResult[0].companyName + `%'`;
                        let companyCatResult = yield query(companyCatSql);
                        if (companyCatResult && companyCatResult.length > 0) {
                            companyCategoryId = companyCatResult[0].companyCategoryTypeId;
                        }
                    }
                    if (checkResult[0].birthDate) {
                        age = new Date().getFullYear() - new Date(checkResult[0].birthDate).getFullYear();
                    }
                    let sql = ` SELECT bcc.*, b.id as bankId, b.name as bankName FROM bankcreditcardpolicies bccp
                                INNER JOIN bankcreditcard bcc ON bccp.bankCreditCardId = bcc.id
                                INNER JOIN banks b on bcc.bankId = b.id
                                WHERE bccp.employmentTypeId = ` + employmentTypeId;
                    if (checkResult[0].cibilScore) {
                        sql += ` AND bccp.minimumCibilScore >= ` + checkResult[0].cibilScore;
                    }
                    if (age) {
                        sql += ` AND bccp.minAge <= ` + age + ` AND bccp.maxAge >= ` + age;
                    }
                    if (checkResult[0].minimumIncome) {
                        sql += ` AND bccp.minIncome <= ` + checkResult[0].minimumIncome;
                    }
                    if (companyCategoryId) {
                        sql += ` AND bccp.companyCategoryTypeId = ` + companyCategoryId;
                    }
                    sql += ` ORDER BY b.id ASC`;
                    let result = yield query(sql);
                    if (result && result.length > 0) {
                        let uniqueObjArray = [
                            ...new Map(result.map((item) => [item["bankName"], item])).values(),
                        ];
                        result.banks = [];
                        for (let i = 0; i < uniqueObjArray.length; i++) {
                            let obj = {
                                bankId: uniqueObjArray[i]["bankId"],
                                bankName: uniqueObjArray[i]["bankName"],
                                creditCards: result.filter(c => c.bankId == uniqueObjArray[i]["bankId"])
                            };
                            result.banks.push(obj);
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Dsa', result.banks, result.banks.length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Dsa', [], 0);
                        return res.status(200).send(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'creditCards.creditCardEligibility()', error, '');
        next(errorResult);
    }
});
const insertUpdateCustomerCreditCardOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Customer Credit Card Offer');
        var requiredFields = ["customerCreditCardId", "bankCreditCardId"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                let customerCreditCardId = req.body.customerCreditCardId;
                let bankCreditCardId = req.body.bankCreditCardId;
                let referenceNo = "";
                if (!req.body.referenceNo) {
                    let refSql = "SELECT * FROM customercreditcardoffer ORDER BY id DESC;";
                    let refResult = yield query(refSql);
                    if (refResult && refResult.length > 0) {
                        let no = parseInt(refResult[0].referenceNo.split("_")[1]);
                        referenceNo = "CREF_" + (no + 1).toString().padStart(10, "0");
                    }
                    else {
                        referenceNo = "CREF_0000000001";
                    }
                }
                let idSql = yield query(`SELECT id FROM customercreditcardoffer WHERE customerCreditCardId = ?`, customerCreditCardId);
                if (idSql && idSql.length > 0) {
                    id = idSql[0].id;
                }
                let sql = "CALL customerInsertUpdateCustomerCreditCardOffer(" + id + "," + customerCreditCardId + "," + bankCreditCardId + ",'" + referenceNo + "'," + userId + ")";
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Customer Offer Saved', result[0], 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Credit Card Customer Offer Not Saved", result, 0);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'creditCard.insertUpdateCustomerCreditCardOffer()', error, '');
        next(errorResult);
    }
});
const getCustomerCreditCardRejectionReason = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'get CreditCard Rejection Reason');
        var requiredFields = ['customerCreditCardId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "SELECT * FROM customercreditcardrejectionreason WHERE customerCreditCardId = " + req.body.customerCreditCardId + " AND isDelete = 0 AND isActive = 1";
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let sql1 = "SELECT * FROM reasons WHERE customerCreditCardId = " + req.body.customerCreditCardId + " AND isDelete = 0 AND isActive = 1";
                    let result1 = yield query(sql1);
                    if (result1 && result1.length > 0) {
                        result[0].reasons = result1;
                    }
                    let sql2 = "SELECT customers.fullName as customerName,customers.contactNo as customerContactNo FROM customers LEFT JOIN  customercreditcards ON customercreditcards.customerId = customers.id WHERE customercreditcards.id = " + req.body.customerCreditCardId;
                    let result2 = yield query(sql2);
                    result[0].customerName = result2[0].customerName;
                    result[0].customerContactNo = result2[0].customerContactNo;
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Credit Card Rejection Reason', result[0], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Credit Card Rejection Reason', {}, 0);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'creditCards.getCustomerCreditCardRejectionReason() Exception', error, '');
        next(errorResult);
    }
});
const getCompletedCreditCards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Credit Card Incomplete Detail');
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let customerId = req.body.customerId ? req.body.customerId : null;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `CALL customerGetCompleteIncompleteCreditCardRequest(` + customerId + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Customer Credit Cards', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Customer Credit Cards", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'homeLoan.getIncompleteCreditCard()', error, '');
        next(errorResult);
    }
});
const changeEmploymentType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['customerCreditCardId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerCreditCardId = req.body.customerCreditCardId ? req.body.customerCreditCardId : null;
                let creditCardStatusId;
                let pendingSeatus = yield query("SELECT id FROM creditcardstatuses WHERE status = 'PENDING'");
                if (pendingSeatus && pendingSeatus.length > 0) {
                    creditCardStatusId = pendingSeatus[0].id;
                    let statusSql = "INSERT INTO customercreditcardstatushistory(customerCreditCardId,creditcardStatusId,createdBy,modifiedBy) VALUES(" + customerCreditCardId + "," + creditCardStatusId + "," + userId + "," + userId + ")";
                    let statusResult = yield query(statusSql);
                    let delteSqlResult = yield query("DELETE FROM customercreditcardoffer WHERE customerCreditCardId = ?", customerCreditCardId);
                    let chageStatusSql = "UPDATE customercreditcards SET statusId = " + creditCardStatusId + " WHERE id = ?";
                    let chageStatusResult = yield query(chageStatusSql, customerCreditCardId);
                    if (chageStatusResult && chageStatusResult.affectedRows >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Change Employment Type', chageStatusResult, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "creditCard.changeEmploymentType() Error", chageStatusResult, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.changeEmploymentType() Exception', error, '');
        next(errorResult);
    }
});
exports.default = {
    insertUpdateProfileDetail, insertUpdateEmploymentDetail, insertUpdateCustomerAddress, insertUpdateCustomerWorkAddress, chooseCommunicationAddress, getIncompleteCreditCardDetail,
    getCustomerCreditCardById, creditCardEligibility, insertUpdateCustomerCreditCardOffer, getCustomerCreditCardRejectionReason, getCompletedCreditCards, changeEmploymentType
};
