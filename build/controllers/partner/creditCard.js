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
const getIncompleteCreditCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Credit Card Incomplete Detail');
        var requiredFields = ['partnerId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `CALL partnerGetIncompleteCreditCardRequest(` + partnerId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = yield query(sql);
                if (result && result.length > 0 && result[0].length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Credit Card Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let obj = result[0];
                        var finalResult = [];
                        for (let i = 0; i < obj.length; i++) {
                            let customerCreditCard;
                            if (result[1].length > 0) {
                                customerCreditCard = result[1].filter(c => c.customerId == obj[i].id);
                            }
                            if (customerCreditCard && customerCreditCard.length > 0) {
                                for (let j = 0; j < customerCreditCard.length; j++) {
                                    if (result[0].length > 0) {
                                        customerCreditCard[j].customerDetail = result[0].filter(c => c.id == customerCreditCard[j].customerId);
                                    }
                                    if (result[2].length > 0) {
                                        customerCreditCard[j].customerCreditCardEmploymentdetails = result[2].filter(c => c.creditCardId == customerCreditCard[j].id);
                                    }
                                    else {
                                        customerCreditCard[j].customerCreditCardEmploymentdetails = [];
                                    }
                                    if (result[3].length > 0) {
                                        customerCreditCard[j].correspondenseAddress = result[3].filter(c => c.customerId == customerCreditCard[j].customerId);
                                    }
                                    else {
                                        customerCreditCard[j].correspondenseAddress = [];
                                    }
                                    if (result[4].length > 0) {
                                        customerCreditCard[j].workAddress = result[4].filter(c => c.customerId == customerCreditCard[j].customerId);
                                    }
                                    else {
                                        customerCreditCard[j].workAddress = [];
                                    }
                                    if (result[5].length > 0) {
                                        customerCreditCard[j].customerCreditCardCompleteHistory = result[5].filter(c => c.customerCreditCardId == customerCreditCard[j].id);
                                    }
                                    if (result[6].length > 0) {
                                        customerCreditCard[j].customerCreditCardStatusHistory = result[6].filter(c => c.customerCreditCardId == customerCreditCard[j].id);
                                    }
                                    if (result[7].length > 0) {
                                        customerCreditCard[j].chooseCreditCardDetail = result[7].filter(c => c.customerCreditCardId == customerCreditCard[j].id);
                                    }
                                    else {
                                        customerCreditCard[j].chooseCreditCardDetail = [];
                                    }
                                }
                                obj[i].customerCreditCard = customerCreditCard;
                            }
                        }
                        let response = [];
                        if (obj && obj.length > 0) {
                            for (let i = 0; i < obj.length; i++) {
                                for (let j = 0; j < obj[i].customerCreditCard.length; j++) {
                                    let basicDetail = new basicDetailCCResponse_1.BasicDetailCCResponse(obj[i].fullName, obj[i].birthdate, obj[i].panCardNo, obj[i].gender, obj[i].maritalStatusId, obj[i].email, obj[i].customerCreditCard[j].id, obj[i].customerCreditCard[j].otherCreditCardBankId, obj[i].customerCreditCard[j].maxCreditLimit, obj[i].customerCreditCard[j].availableCreditLimit, obj[i].customerCreditCard[j].isAlreadyCreditCard, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].employmentTypeId : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].bankId : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].bankAccountNo : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].lastItr : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].educationTypeId : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].officeContactNo : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].id : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].companyName : null, obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails.length > 0 ? obj[i].customerCreditCard[j].customerCreditCardEmploymentdetails[0].professionName : null, obj[i].customerCreditCard[j].communicationAddressId, obj[i].id, obj[i].userId, obj[i].contactNo);
                                    let permanentAddressDetail = new creditCardAddressResponse_1.CreditCardAddressResponse(obj[i].customerCreditCard[j].customerDetail[0].label, obj[i].customerCreditCard[j].customerDetail[0].addressLine1, obj[i].customerCreditCard[j].customerDetail[0].addressLine2, obj[i].customerCreditCard[j].customerDetail[0].pincode, obj[i].customerCreditCard[j].customerDetail[0].cityId, obj[i].customerCreditCard[j].customerDetail[0].addressTypeId, obj[i].customerCreditCard[j].customerDetail[0].addressId);
                                    let correspondenceAddressDetail = obj[i].customerCreditCard[j].correspondenseAddress.length > 0 ? new creditCardAddressResponse_1.CreditCardAddressResponse(obj[i].customerCreditCard[j].correspondenseAddress[0].label, obj[i].customerCreditCard[j].correspondenseAddress[0].addressLine1, obj[i].customerCreditCard[j].correspondenseAddress[0].addressLine2, obj[i].customerCreditCard[j].correspondenseAddress[0].pincode, obj[i].customerCreditCard[j].correspondenseAddress[0].cityId, obj[i].customerCreditCard[j].correspondenseAddress[0].addressTypeId, obj[i].customerCreditCard[j].correspondenseAddress[0].addressId) : null;
                                    let workAddressDetail = obj[i].customerCreditCard[j].workAddress.length > 0 ? new creditCardAddressResponse_1.CreditCardAddressResponse(obj[i].customerCreditCard[j].workAddress[0].label, obj[i].customerCreditCard[j].workAddress[0].addressLine1, obj[i].customerCreditCard[j].workAddress[0].addressLine2, obj[i].customerCreditCard[j].workAddress[0].pincode, obj[i].customerCreditCard[j].workAddress[0].cityId, obj[i].customerCreditCard[j].workAddress[0].addressTypeId, obj[i].customerCreditCard[j].workAddress[0].addressId) : null;
                                    let chooseCreditCardDetail = obj[i].customerCreditCard[j].chooseCreditCardDetail.length > 0 ? new choosenCreditCardDetailResponse_1.ChoosenCreditCardDetailResponse(obj[i].customerCreditCard[j].chooseCreditCardDetail[0].bankId, obj[i].customerCreditCard[j].chooseCreditCardDetail[0].bankCreditCardId, obj[i].customerCreditCard[j].chooseCreditCardDetail[0].referenceNo, obj[i].customerCreditCard[j].chooseCreditCardDetail[0].id, obj[i].customerCreditCard[j].chooseCreditCardDetail[0].bankName) : null;
                                    let loanStatus = null;
                                    let loanCompleteHistory = new loanCompleteHistoryReponse_1.loanCompleteHistoryResponse(obj[i].customerCreditCard[j].customerCreditCardCompleteHistory[0].isCompleted, obj[i].customerCreditCard[j].customerCreditCardCompleteHistory[0].completeScreen);
                                    if (obj[i].customerCreditCard[j].customerCreditCardStatusHistory &&
                                        obj[i].customerCreditCard[j].customerCreditCardStatusHistory.length > 0) {
                                        let len = obj[i].customerCreditCard[j].customerCreditCardStatusHistory.length - 1;
                                        loanStatus = new loanStatusResponse_1.LoanStatusResponse(obj[i].customerCreditCard[j].customerCreditCardStatusHistory[len].id, obj[i].customerCreditCard[j].customerCreditCardStatusHistory[len].transactionDate, obj[i].customerCreditCard[j].customerCreditCardStatusHistory[len].creditCardStatus, obj[i].customerCreditCard[j].customerCreditCardStatusHistory[len].isDataEditable, obj[i].customerCreditCard[j].customerCreditCardStatusHistory[0].transactionDate, obj[i].customerCreditCard[j].displayName, obj[i].customerCreditCard[j].serviceName);
                                    }
                                    let objRes = new creditCardResponse_1.CreditCardResponse(basicDetail, permanentAddressDetail, correspondenceAddressDetail, workAddressDetail, loanCompleteHistory, loanStatus, chooseCreditCardDetail);
                                    response.push(JSON.parse(JSON.stringify(objRes)));
                                }
                            }
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Home Loan Incomplete Data', response, response.length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Home Loan Incomplete Data", result, '');
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
exports.default = {
    getIncompleteCreditCard
};
