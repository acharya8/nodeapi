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
const customerResponse_1 = require("../../classes/output/loan/customerResponse");
const personalloanMoreBasicDetailResponse_1 = require("../../classes/output/loan/personalloanMoreBasicDetailResponse");
const personalloanMoreEmploymentDetailResponse_1 = require("../../classes/output/loan/personalloanMoreEmploymentDetailResponse");
const loanCompleteHistoryReponse_1 = require("../../classes/output/loan/loanCompleteHistoryReponse");
const loanStatusResponse_1 = require("../../classes/output/loan/loanStatusResponse");
const personloanResponse_1 = require("../../classes/output/loan/personloanResponse");
const personalloanCurrentAddressDetailResponse_1 = require("../../classes/output/loan/personalloanCurrentAddressDetailResponse");
const personalloanDocumentsResponse_1 = require("../../classes/output/loan/personalloanDocumentsResponse");
const personalloanReferenceResponse_1 = require("../../classes/output/loan/personalloanReferenceResponse");
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
const NAMESPACE = 'Personal Loan';
const getIncompletePersonalLoanDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Incomplete Personal Loan Detail');
        let requiredFields = ['partnerId', 'serviceId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `CALL partnerGetIncompletePersonalLoanRequest(` + partnerId + `,` + serviceId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = yield query(sql);
                if (result && result.length > 0 && result[0].length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Personl Loan Incomplete data is not available', [], 0);
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
                                        customerLoan[j].customerLoanEmploymentDetail = result[2].filter(c => c.customerloanId == customerLoan[j].id);
                                    }
                                    if (result[3].length > 0) {
                                        customerLoan[j].customerLoanSpouses = result[3].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[4].length > 0) {
                                        customerLoan[j].customerLoanDocuments = result[4].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerLoanDocuments = [];
                                    }
                                    if (result[5].length > 0) {
                                        customerLoan[j].customerLoanReferences = result[5].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerLoanReferences = [];
                                    }
                                    if (result[6].length > 0) {
                                        customerLoan[j].customerLoanCompleteHistory = result[6].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[7].length > 0) {
                                        customerLoan[j].customerLoanStatusHistory = result[7].filter(c => c.customerloanId == customerLoan[j].id);
                                    }
                                    if (result[8].length > 0) {
                                        customerLoan[j].customerLoanOffer = result[8].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[9].length > 0) {
                                        customerLoan[j].currentAddressDetail = result[9].filter(c => c.customerId == customerLoan[j].customerId);
                                    }
                                    if (result[10].length > 0) {
                                        customerLoan[j].loanTransferDetail = result[10].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].loanTransferDetail = [];
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
                                    let approxDate = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].approxDate : "";
                                    let approxCurrentEMI = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].approxCurrentEMI : null;
                                    let bankId = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].bankId : null;
                                    let topupAmount = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].topupAmount : null;
                                    let basicDetail = new customerResponse_1.CustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].monthlyIncome, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyName, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].officePincode, obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].tenureId, obj[i].customerLoan[j].id, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].id, obj[i].contactNo, obj[i].id, obj[i].userId);
                                    let moreBasicDetail = new personalloanMoreBasicDetailResponse_1.PersonalLoanMoreBasicDetailResponse(obj[i].alternativeContactNo, obj[i].gender, obj[i].maritalStatusId, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].name : ""), ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].contactNo : ""), obj[i].customerLoan[j].motherName, obj[i].customerLoan[j].fatherContactNo, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].id : 0), obj[i].customerLoan[j].fatherName, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType);
                                    let moreEmploymentDetail = new personalloanMoreEmploymentDetailResponse_1.PersonalLoanMoreEmploymentDetailResponse(obj[i].email, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].designation, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyTypeId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].currentCompanyExperience, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].label, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine1, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine2, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].pincode, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].cityId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].city, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].district, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].state, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyAddressId);
                                    let loanCompleteHistory = new loanCompleteHistoryReponse_1.loanCompleteHistoryResponse(obj[i].customerLoan[j].customerLoanCompleteHistory[0].isCompleted, obj[i].customerLoan[j].customerLoanCompleteHistory[0].completeScreen);
                                    console.log(obj[i].customerLoan[j].currentAddressDetail);
                                    let currentAddressDetail = obj[i].customerLoan[j].currentAddressDetail && obj[i].customerLoan[j].currentAddressDetail.length > 0 ? new personalloanCurrentAddressDetailResponse_1.PersonalloanCurrentAddressDetailResponse(obj[i].customerLoan[j].currentAddressDetail[0].label, obj[i].customerLoan[j].currentAddressDetail[0].addressLine1, obj[i].customerLoan[j].currentAddressDetail[0].addressLine2, obj[i].customerLoan[j].currentAddressDetail[0].pincode, obj[i].customerLoan[j].currentAddressDetail[0].cityId, obj[i].customerLoan[j].currentAddressDetail[0].addressTypeId, obj[i].customerLoan[j].currentAddressDetail[0].addressId, obj[i].customerLoan[j].currentAddressDetail[0].city, obj[i].customerLoan[j].currentAddressDetail[0].state, obj[i].customerLoan[j].currentAddressDetail[0].district) : null;
                                    let loanStatus;
                                    let loanDocuments = [];
                                    let loanReference = [];
                                    if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                            let doc = new personalloanDocumentsResponse_1.PersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf, obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId);
                                            loanDocuments.push(doc);
                                        }
                                    }
                                    if (obj[i].customerLoan[j].customerLoanReferences && obj[i].customerLoan[j].customerLoanReferences.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerLoanReferences.length; k++) {
                                            let loanreference = new personalloanReferenceResponse_1.PersonalLoanReferenceResponse(obj[i].customerLoan[j].customerLoanReferences[k].customerLoanReferenceId, obj[i].customerLoan[j].customerLoanReferences[k].fullName, obj[i].customerLoan[j].customerLoanReferences[k].contactNo, obj[i].customerLoan[j].customerLoanReferences[k].label, obj[i].customerLoan[j].customerLoanReferences[k].addressLine1, obj[i].customerLoan[j].customerLoanReferences[k].addressLine2, obj[i].customerLoan[j].customerLoanReferences[k].pincode, obj[i].customerLoan[j].customerLoanReferences[k].city, obj[i].customerLoan[j].customerLoanReferences[k].cityId, obj[i].customerLoan[j].customerLoanReferences[k].state, obj[i].customerLoan[j].customerLoanReferences[k].district);
                                            loanReference.push(loanreference);
                                        }
                                    }
                                    if (obj[i].customerLoan[j].customerLoanStatusHistory &&
                                        obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                        let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                        loanStatus = new loanStatusResponse_1.LoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].id, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus, obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName, obj[i].customerLoan[j].serviceName);
                                    }
                                    let loanOffer = [];
                                    loanOffer = obj[i].customerLoan[j].customerLoanOffer;
                                    let objRes = new personloanResponse_1.PersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, loanOffer, currentAddressDetail);
                                    response.push(JSON.parse(JSON.stringify(objRes)));
                                }
                            }
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Personal Loan Incomplete Data', response, response.length);
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
const updateMoreEmploymentDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['emailId', 'customerLoanId', 'customerLoanEmploymentId', 'label', 'addressLine1', 'pincode', 'cityId', 'city',
            'district', 'state', 'designation', 'currentCompanyExperience'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = req.body.userId;
                let emailId = req.body.emailId;
                let customerLoanId = req.body.customerLoanId;
                let customerLoanEmploymentId = req.body.customerLoanEmploymentId;
                let companyTypeId = req.body.companyTypeId ? req.body.companyTypeId : null;
                let companyAddressId = req.body.companyAddressId ? req.body.companyAddressId : null;
                let addressTypeId = 2;
                let label = req.body.label;
                let addressLine1 = req.body.addressLine1;
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let pincode = req.body.pincode;
                let cityId = req.body.cityId;
                let city = req.body.city;
                let district = req.body.district;
                let state = req.body.state;
                let designation = req.body.designation;
                let currentCompanyExperience = req.body.currentCompanyExperience;
                let sql = `CALL customerUpdatePersonalLoanMoreEmploymentDetail(` + customerLoanId + `,` + customerLoanEmploymentId + `,` + companyTypeId + `,` + companyAddressId + `
                , ` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + city + `','` + district + `','` + state + `'
                , '` + designation + `',` + currentCompanyExperience + `,` + userId + `,'` + emailId + `')`;
                console.log(sql);
                let result = yield query(sql);
                if (result) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Personal Loan Employment Detail Updated', result[0], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Personal Loan Employment Detail Not Updated", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.updateMoreEmploymentDetail()', error, '');
        next(errorResult);
    }
});
exports.default = {
    getIncompletePersonalLoanDetail, updateMoreEmploymentDetail
};
