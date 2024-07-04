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
const businessLoanBasicDetailResponse_1 = require("../../classes/output/loan/business loan/businessLoanBasicDetailResponse");
const businessLoanDocumentResponse_1 = require("../../classes/output/loan/business loan/businessLoanDocumentResponse");
const businessLoanMoreBasicDetailResponse_1 = require("../../classes/output/loan/business loan/businessLoanMoreBasicDetailResponse");
const businessLoanResponse_1 = require("../../classes/output/loan/business loan/businessLoanResponse");
const loanCompleteHistoryReponse_1 = require("../../classes/output/loan/loanCompleteHistoryReponse");
const loanStatusResponse_1 = require("../../classes/output/loan/loanStatusResponse");
const resulterror_1 = require("../../classes/response/resulterror");
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const config_1 = __importDefault(require("../../config/config"));
const logging_1 = __importDefault(require("../../config/logging"));
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const mysql = require('mysql');
const util = require('util');
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
const NAMESPACE = 'Business Loan';
const getIncompleteBusinessLoanDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Incomplete Business Loan Detail');
        var requiredFields = ['partnerId', 'serviceId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `CALL partnerGetIncompleteBusinessLoanRequest(` + partnerId + `,` + serviceId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = yield query(sql);
                if (result) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Business Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let obj = result[0];
                        var finalResult = [];
                        for (let i = 0; i < obj.length; i++) {
                            let customerLoan;
                            if (result[1].length > 0) {
                                customerLoan = result[1].filter(c => c.customerId == obj[i].id);
                            }
                            if (customerLoan && customerLoan.length > 0) {
                                for (let j = 0; j < customerLoan.length; j++) {
                                    if (result[2].length > 0) {
                                        customerLoan[j].customerLoanDocuments = result[2].filter(c => c.customerloanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerLoanDocuments = [];
                                    }
                                    if (result[3].length > 0) {
                                        customerLoan[j].customerloanbusinessdetails = result[3].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[4].length > 0) {
                                        customerLoan[j].customerloancurrentresidentdetails = result[4].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[5].length > 0) {
                                        customerLoan[j].customerLoanCompleteHistory = result[5].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[6].length > 0) {
                                        customerLoan[j].customerLoanStatusHistory = result[6].filter(c => c.customerloanId == customerLoan[j].id);
                                    }
                                    if (result[7].length > 0) {
                                        customerLoan[j].customerLoanOffer = result[7].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[8].length > 0) {
                                        customerLoan[j].loanTransferDetail = result[8].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                }
                                obj[i].customerLoan = customerLoan;
                            }
                        }
                        let response = [];
                        if (obj && obj.length > 0) {
                            for (let i = 0; i < obj.length; i++) {
                                for (let j = 0; j < obj[i].customerLoan.length; j++) {
                                    let loanAmountTakenExisting = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].loanAmountTakenExisting : null;
                                    let approxDate = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].approxDate : null;
                                    let approxCurrentEMI = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].approxCurrentEMI : null;
                                    let bankId = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].bankId : null;
                                    let topupAmount = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].topupAmount : null;
                                    let basicDetail = new businessLoanBasicDetailResponse_1.BusinessLoanBasicDetailResponse(obj[i].fullName, obj[i].birthdate, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId, obj[i].pincode, obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].id, obj[i].customerLoan[j].customerloanbusinessdetails[0].businessAnnualSale, obj[i].customerLoan[j].customerloanbusinessdetails[0].businessExperienceId, obj[i].email, obj[i].gender, obj[i].maritalStatusId, obj[i].customerLoan[j].customerloancurrentresidentdetails[0].residentTypeId, obj[i].cityId, obj[i].customerLoan[j].customerloanbusinessdetails[0].companyTypeId, obj[i].customerLoan[j].customerloanbusinessdetails[0].businessNatureId, obj[i].customerLoan[j].customerloanbusinessdetails[0].industryTypeId, obj[i].customerLoan[j].customerloanbusinessdetails[0].businessAnnualProfitId, obj[i].customerLoan[j].customerloanbusinessdetails[0].primaryBankId, obj[i].addressId, obj[i].customerLoan[j].customerloanbusinessdetails[0].id, obj[i].customerLoan[j].customerloancurrentresidentdetails.id, obj[i].customerLoan[j].loanAgainstCollateralId, obj[i].customerLoan[j].customerloanbusinessdetails[0].currentlyPayEmi, obj[i].customerLoan[j].customerId, obj[i].userId, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType);
                                    let moreBasicDetail = new businessLoanMoreBasicDetailResponse_1.BusinessLoanMoreBasicDetailResponse(obj[i].addressLine1, obj[i].addressLine2, obj[i].customerLoan[j].customerloanbusinessdetails[0].businessName, obj[i].customerLoan[j].customerloanbusinessdetails[0].businessGstNo, obj[i].contactNo);
                                    let loanStatus;
                                    let loanCompleteHistory = new loanCompleteHistoryReponse_1.loanCompleteHistoryResponse(obj[i].customerLoan[j].customerLoanCompleteHistory[0].isCompleted, obj[i].customerLoan[j].customerLoanCompleteHistory[0].completeScreen);
                                    if (obj[i].customerLoan[j].customerLoanStatusHistory &&
                                        obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                        let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                        loanStatus = new loanStatusResponse_1.LoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].id, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus, obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName, obj[i].customerLoan[j].serviceName);
                                    }
                                    let loanOffer = [];
                                    loanOffer = obj[i].customerLoan[j].customerLoanOffer;
                                    let loanDocuments2 = [];
                                    if (obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                            let loanDocuments = new businessLoanDocumentResponse_1.BusinessLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf, obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                            loanDocuments2.push(loanDocuments);
                                        }
                                    }
                                    let objRes = new businessLoanResponse_1.BusinessLoanResponse(basicDetail, moreBasicDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer);
                                    response.push(JSON.parse(JSON.stringify(objRes)));
                                }
                            }
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Business Loan Incomplete Data', response, response.length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Business Loan Incomplete Data", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'businessLoan.getIncompleteBusinessLoanDetail()', error, '');
        next(errorResult);
    }
});
exports.default = {
    getIncompleteBusinessLoanDetail,
};
