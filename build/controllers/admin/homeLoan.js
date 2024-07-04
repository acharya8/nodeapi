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
const adminPersonalloanDocumentsResponse_1 = require("../../classes/output/admin/loans/adminPersonalloanDocumentsResponse");
const adminCustomerResponse_1 = require("../../classes/output/admin/loans/adminCustomerResponse");
const adminLoanStatusResponse_1 = require("../../classes/output/admin/loans/adminLoanStatusResponse");
const adminHomeLoanResponse_1 = require("../../classes/output/admin/loans/adminHomeLoanResponse");
const homeLoanDocumentResponse_1 = require("../../classes/output/loan/home loan/homeLoanDocumentResponse");
const homeLoanPermanentAddressDetailResponse_1 = require("../../classes/output/loan/home loan/homeLoanPermanentAddressDetailResponse");
const homeLoanCurrentResidenceResponse_1 = require("../../classes/output/loan/home loan/homeLoanCurrentResidenceResponse");
const loanCompleteHistoryReponse_1 = require("../../classes/output/loan/loanCompleteHistoryReponse");
const homeLoanCorrespondenceResponse_1 = require("../../classes/output/loan/home loan/homeLoanCorrespondenceResponse");
const adminHomeLoanPropertyResponse_1 = require("../../classes/output/admin/loans/adminHomeLoanPropertyResponse");
const adminHomeLoanEmploymentDetailResponse_1 = require("../../classes/output/admin/loans/adminHomeLoanEmploymentDetailResponse");
const adminHomeLoanCoApplicantResponse_1 = require("../../classes/output/admin/loans/adminHomeLoanCoApplicantResponse");
const adminGroupDetailResponse_1 = require("../../classes/output/admin/loans/adminGroupDetailResponse");
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
const NAMESPACE = 'Home Loan';
const getHomeLoan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11;
    try {
        logging_1.default.info(NAMESPACE, 'Getting Home Loans');
        let requiredFields = ['serviceId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let customerId = req.body.customerId ? req.body.customerId : null;
                let sqlQuery = `SELECT distinct(customerloans.id) FROM customerloans 
                LEFT JOIN employmenttypes ON  employmenttypes.id = customerloans.employmentTypeId
                LEFT JOIN services ON  services.id = customerloans.serviceId
                LEFT JOIN customerloanstatushistory ON customerloanstatushistory.customerloanId = customerloans.id
                LEFT JOIN loancompletescreenhistory ON loancompletescreenhistory.customerloanId = customerloans.id
                LEFT JOIN customers ON customerloans.customerId = customers.id
                LEFT JOIN customeraddresses ON customeraddresses.customerId = customers.id
                INNER JOIN userroles ON userroles.userId = customers.userId
                WHERE customerloans.serviceId = ` + serviceId + ` AND customeraddresses.addressTypeId = 1`;
                if (req.body.startDate) {
                    let sDate = new Date(req.body.startDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.startDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.startDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.startDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.startDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.startDate).getSeconds())).slice(-2);
                    sqlQuery += ` AND DATE(customerloans.createdDate) >= DATE('` + sDate + `') `;
                }
                if (req.body.endDate) {
                    let eDate = new Date(req.body.endDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.endDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.endDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.endDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.endDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.endDate).getSeconds())).slice(-2);
                    sqlQuery += ` AND DATE(customerloans.createdDate) <= DATE('` + eDate + `') `;
                }
                if (req.body.statusId) {
                    if (req.body.statusId < 0) {
                        sqlQuery += ` AND loancompletescreenhistory.isCompleted=0 `;
                    }
                    else if (req.body.statusId > 0) {
                        sqlQuery += ` AND customerloans.statusId=` + req.body.statusId;
                    }
                }
                if (req.body.customerId) {
                    sqlQuery += ` AND customerloans.customerId=` + req.body.customerId;
                }
                if (req.body.searchString) {
                    sqlQuery += ` AND (customers.fullName LIKE  '%` + req.body.searchString + `%' OR customers.contactNo LIKE '%` + req.body.searchString + `%')`;
                }
                let resultqueryCount = yield query(sqlQuery);
                let count;
                if (resultqueryCount && resultqueryCount.length > 0) {
                    count = resultqueryCount.length;
                }
                sqlQuery += ` ORDER BY customerloans.id DESC`;
                if (req.body.startIndex >= 0 && fetchRecords > 0)
                    sqlQuery += " LIMIT " + fetchRecords + " OFFSET " + startIndex;
                let resultquery = yield query(sqlQuery);
                if (resultquery && resultquery.length > 0) {
                    let ids = resultquery.map(c => c.id);
                    if (ids && ids.length > 0) {
                        let sql = `CALL adminGetHomeLoan('` + ids.toString() + `')`;
                        console.log(sql);
                        let result = yield query(sql);
                        if (result && result.length > 0) {
                            let obj = result[0];
                            for (let i = 0; i < obj.length; i++) {
                                let customerLoan;
                                if (result[1].length > 0) {
                                    customerLoan = result[1].filter(c => c.customerId == obj[i].id);
                                }
                                if (customerLoan && customerLoan.length > 0) {
                                    for (let j = 0; j < customerLoan.length; j++) {
                                        customerLoan[j].customerLoanEmploymentDetail = result[2].length > 0 ? result[2].filter(c => c.customerloanId == customerLoan[j].id) : [];
                                        if (result[3].length > 0) {
                                            customerLoan[j].customerLoanDocuments = result[3].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[5].length > 0) {
                                            customerLoan[j].customerLoanStatusHistory = result[5].filter(c => c.customerloanId == customerLoan[j].id);
                                        }
                                        if (result[4].length > 0) {
                                            customerLoan[j].partners = result[4].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                    }
                                    obj[i].customerLoan = customerLoan;
                                }
                            }
                            let response = [];
                            if (obj && obj.length > 0) {
                                for (let i = 0; i < obj.length; i++) {
                                    for (let j = 0; j < obj[i].customerLoan.length; j++) {
                                        let basicDetail = new adminCustomerResponse_1.AdminCustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId, obj[i].customerLoan[j].employmentType, (_b = (_a = obj[i].customerLoan[j]) === null || _a === void 0 ? void 0 : _a.customerLoanEmploymentDetail[0]) === null || _b === void 0 ? void 0 : _b.monthlyIncome, (_d = (_c = obj[i].customerLoan[j]) === null || _c === void 0 ? void 0 : _c.customerLoanEmploymentDetail[0]) === null || _d === void 0 ? void 0 : _d.companyName, (_f = (_e = obj[i].customerLoan[j]) === null || _e === void 0 ? void 0 : _e.customerLoanEmploymentDetail[0]) === null || _f === void 0 ? void 0 : _f.officePincode, obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].id, (_h = (_g = obj[i].customerLoan[j]) === null || _g === void 0 ? void 0 : _g.customerLoanEmploymentDetail[0]) === null || _h === void 0 ? void 0 : _h.id, ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_k = (_j = obj[i].customerLoan[j]) === null || _j === void 0 ? void 0 : _j.partners[0]) === null || _k === void 0 ? void 0 : _k.id : ""), ((((_l = obj[i].customerLoan[j]) === null || _l === void 0 ? void 0 : _l.partners) && ((_m = obj[i].customerLoan[j]) === null || _m === void 0 ? void 0 : _m.partners.length) > 0) ? (_p = (_o = obj[i].customerLoan[j]) === null || _o === void 0 ? void 0 : _o.partners[0]) === null || _p === void 0 ? void 0 : _p.permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_r = (_q = obj[i].customerLoan[j]) === null || _q === void 0 ? void 0 : _q.partners[0]) === null || _r === void 0 ? void 0 : _r.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_t = (_s = obj[i].customerLoan[j]) === null || _s === void 0 ? void 0 : _s.partners[0]) === null || _t === void 0 ? void 0 : _t.contactNo : ""), (_v = (_u = obj[i]) === null || _u === void 0 ? void 0 : _u.customerLoan[j]) === null || _v === void 0 ? void 0 : _v.rmFullName, (_x = (_w = obj[i]) === null || _w === void 0 ? void 0 : _w.customerLoan[j]) === null || _x === void 0 ? void 0 : _x.status, (_z = (_y = obj[i]) === null || _y === void 0 ? void 0 : _y.customerLoan[j]) === null || _z === void 0 ? void 0 : _z.createdBy, obj[i].maritalStatusId, obj[i].maritalStatus, null, null, obj[i].customerLoan[j].isDelete, obj[i].email, obj[i].customerLoan[j].customerId, null, null, null, null, null, null, null, null, null, null, null, obj[i].customerLoan[j].leadId, obj[i].customerLoan[j].statusId, obj[i].customerLoan[j].createdDate);
                                        let loanDocuments = [];
                                        let loanStatus;
                                        if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                            for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                                let doc = new adminPersonalloanDocumentsResponse_1.AdminPersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf, obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                                loanDocuments.push(doc);
                                            }
                                        }
                                        if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                            let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                            loanStatus = new adminLoanStatusResponse_1.AdminLoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatusId, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus, obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName);
                                        }
                                        let groupDetail = new adminGroupDetailResponse_1.AdminGroupDetailResponse(((obj[0].partners && obj[0].partners.length > 0) ? (_1 = (_0 = obj[0]) === null || _0 === void 0 ? void 0 : _0.partners[0]) === null || _1 === void 0 ? void 0 : _1.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_3 = (_2 = obj[0]) === null || _2 === void 0 ? void 0 : _2.partners[0]) === null || _3 === void 0 ? void 0 : _3.permanentCode : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? (_5 = (_4 = obj[0].customerLoan[0]) === null || _4 === void 0 ? void 0 : _4.partners[0]) === null || _5 === void 0 ? void 0 : _5.fullName : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? (_7 = (_6 = obj[0].customerLoan[0]) === null || _6 === void 0 ? void 0 : _6.partners[0]) === null || _7 === void 0 ? void 0 : _7.contactNo : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? (_9 = (_8 = obj[0].customerLoan[0]) === null || _8 === void 0 ? void 0 : _8.partners[0]) === null || _9 === void 0 ? void 0 : _9.roleName : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? (_11 = (_10 = obj[0].customerLoan[0]) === null || _10 === void 0 ? void 0 : _10.partners[0]) === null || _11 === void 0 ? void 0 : _11.gender : ""));
                                        let objRes = new adminHomeLoanResponse_1.AdminHomeLoanResponse(basicDetail, null, null, null, null, null, null, null, loanStatus, loanDocuments, null, null, null, null, null, groupDetail);
                                        response.push(JSON.parse(JSON.stringify(objRes)));
                                        response = response.sort((a, b) => b.basicDetail.customerLoanId - a.basicDetail.customerLoanId);
                                    }
                                }
                            }
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loans Available', response, count);
                            return res.status(200).send(successResult);
                        }
                        else {
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loans Available', result, count);
                            return res.status(200).send(successResult);
                        }
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loans Not Available', [], 0);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loans Not Available', [], 0);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.getPersonalLoan() Exception', error, '');
        next(errorResult);
    }
});
const getHomeLoanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90;
    try {
        logging_1.default.info(NAMESPACE, 'Getting Home Loan Detail');
        let requiredFields = ['customerLoanId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerIdSql = yield query("SELECT customerId FROM customerloans WHERE id = ?", req.body.customerLoanId);
                let customerId = customerIdSql[0].customerId;
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL adminGetHomeLoanByCustomerLoanId('` + customerId + `','` + customerLoanId + `')`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Home Loan Incomplete data is not available', [], 0);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let obj = result[0];
                        obj[0].customerLoan = result[1];
                        obj[0].customerLoanEmploymentDetail = result[2];
                        obj[0].customerloancoapplicants = result[3];
                        obj[0].customerloancoapplicantemploymentdetails = result[4];
                        obj[0].customerloancurrentresidentdetails = result[5];
                        obj[0].correspondenseAddress = result[6];
                        obj[0].customerloandocuments = result[7];
                        obj[0].customerLoanCompleteHistory = result[8];
                        obj[0].customerLoanStatusHistory = result[9][result[9].length - 1];
                        obj[0].customerLoanOffers = result[10] ? result[10] : null;
                        obj[0].disbursedData = result[11] ? result[11] : null;
                        obj[0].customerLoanRejectionReason = result[12] ? result[12] : null;
                        obj[0].reasons = result[13] ? result[13] : null;
                        obj[0].partners = result[14] ? result[14] : null;
                        obj[0].customerPropertyDetail = result[15];
                        obj[0].customerTransferPropertyDetail = result[16] ? result[16][0] : null;
                        if (obj[0].partners && obj[0].partners.length > 0) {
                            if (obj[0].partners[0].parentPartnerId) {
                                let parentSqlResult = yield query(`SELECT p1.parentPartnerId,p1.fullName as parentPartner,p2.fullName as parentParentPartnerName  FROM partners as p1 LEFT JOIN partners as p2 ON p1.parentPartnerId = p2.id WHERE p1.id = ?`, obj[0].partners[0].parentPartnerId);
                                if (parentSqlResult && parentSqlResult.length > 0) {
                                    obj[0].partners[0].parentParentPartnerId = (_12 = parentSqlResult[0]) === null || _12 === void 0 ? void 0 : _12.parentPartnerId;
                                    obj[0].partners[0].parentParentPartnerName = (_13 = parentSqlResult[0]) === null || _13 === void 0 ? void 0 : _13.parentParentPartnerName;
                                    obj[0].partners[0].parentPartnerName = (_14 = parentSqlResult[0]) === null || _14 === void 0 ? void 0 : _14.parentPartner;
                                }
                            }
                        }
                        let coapplicants = [];
                        let loanStatus = null;
                        let basicDetail = new adminCustomerResponse_1.AdminCustomerResponse(obj[0].fullName, obj[0].birthdate, obj[0].contactNo, obj[0].panCardNo, (_15 = obj[0].customerLoan[0]) === null || _15 === void 0 ? void 0 : _15.employmentTypeId, (_16 = obj[0].customerLoan[0]) === null || _16 === void 0 ? void 0 : _16.employmentType, (_18 = (_17 = obj[0]) === null || _17 === void 0 ? void 0 : _17.customerLoanEmploymentDetail[0]) === null || _18 === void 0 ? void 0 : _18.monthlyIncome, (_20 = (_19 = obj[0]) === null || _19 === void 0 ? void 0 : _19.customerLoanEmploymentDetail[0]) === null || _20 === void 0 ? void 0 : _20.companyName, (_22 = (_21 = obj[0]) === null || _21 === void 0 ? void 0 : _21.customerLoanEmploymentDetail[0]) === null || _22 === void 0 ? void 0 : _22.officePincode, (_23 = obj[0]) === null || _23 === void 0 ? void 0 : _23.customerLoan[0].loanAmount, (_24 = obj[0]) === null || _24 === void 0 ? void 0 : _24.customerLoan[0].id, (_25 = obj[0].customerLoanEmploymentDetail[0]) === null || _25 === void 0 ? void 0 : _25.id, ((obj[0].partners && obj[0].partners.length > 0) ? (_27 = (_26 = obj[0]) === null || _26 === void 0 ? void 0 : _26.partners[0]) === null || _27 === void 0 ? void 0 : _27.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_29 = (_28 = obj[0]) === null || _28 === void 0 ? void 0 : _28.partners[0]) === null || _29 === void 0 ? void 0 : _29.permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_31 = (_30 = obj[0]) === null || _30 === void 0 ? void 0 : _30.partners[0]) === null || _31 === void 0 ? void 0 : _31.fullName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_33 = (_32 = obj[0]) === null || _32 === void 0 ? void 0 : _32.partners[0]) === null || _33 === void 0 ? void 0 : _33.contactNo : ""), (_35 = (_34 = obj[0]) === null || _34 === void 0 ? void 0 : _34.customerLoan[0]) === null || _35 === void 0 ? void 0 : _35.rmFullName, (_37 = (_36 = obj[0]) === null || _36 === void 0 ? void 0 : _36.customerLoan[0]) === null || _37 === void 0 ? void 0 : _37.status, (_39 = (_38 = obj[0]) === null || _38 === void 0 ? void 0 : _38.customerLoan[0]) === null || _39 === void 0 ? void 0 : _39.createdBy, (_40 = obj[0]) === null || _40 === void 0 ? void 0 : _40.maritalStatusId, (_41 = obj[0]) === null || _41 === void 0 ? void 0 : _41.maritalStatus, (_42 = obj[0]) === null || _42 === void 0 ? void 0 : _42.customerLoan[0].motherName, (_44 = (_43 = obj[0]) === null || _43 === void 0 ? void 0 : _43.customerLoan[0]) === null || _44 === void 0 ? void 0 : _44.fatherContactNo, (_45 = obj[0].customerLoan[0]) === null || _45 === void 0 ? void 0 : _45.isDelete, (_46 = obj[0]) === null || _46 === void 0 ? void 0 : _46.email, obj[0].customerLoan[0].customerId, null, null, null, null, null, null, null, null, null, null, null, obj[0].customerLoan[0].leadId, obj[0].customerLoan[0].statusId, obj[0].customerLoan[0].createdDate, obj[0].customerLoan[0].serviceId, obj[0].cibilScore, obj[0].gender, obj[0].customerLoan[0].loanType);
                        for (let i = 0; i < obj[0].customerloancoapplicants.length; i++) {
                            let ind = obj[0].customerloancoapplicantemploymentdetails.findIndex(c => c.customerLoanCoApplicantId == obj[0].customerloancoapplicants[i].id);
                            if (obj[0].customerloancoapplicantemploymentdetails[ind]) {
                                let coapplicant = new adminHomeLoanCoApplicantResponse_1.AdminHomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId, obj[0].customerloancoapplicants[i].maritalStatus, obj[0].customerloancoapplicants[i].coApplicantRelation, obj[0].customerloancoapplicantemploymentdetails[ind].id, obj[0].customerloancoapplicantemploymentdetails[ind].monthlyIncome, obj[0].customerloancoapplicantemploymentdetails[ind].companyAddressId, obj[0].customerloancoapplicantemploymentdetails[ind].addressTypeId, (_47 = obj[0].customerloancoapplicantemploymentdetails[ind]) === null || _47 === void 0 ? void 0 : _47.label, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine1, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine2, obj[0].customerloancoapplicantemploymentdetails[ind].pincode, obj[0].customerloancoapplicantemploymentdetails[ind].cityId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentNatureId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentServiceTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].industryTypeId);
                                coapplicants.push(coapplicant);
                            }
                            else {
                                let coapplicant = new adminHomeLoanCoApplicantResponse_1.AdminHomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId, obj[0].customerloancoapplicants[i].maritalStatus, obj[0].customerloancoapplicants[i].coApplicantRelation);
                                coapplicants.push(coapplicant);
                            }
                        }
                        // if (obj[0].customerLoanStatusHistory) {
                        //     loanStatus = new LoanStatusResponse(obj[0].customerLoanStatusHistory[].id, obj[0].customerLoanStatusHistory.transactionDate, obj[0].customerLoanStatusHistory.loanStatus,
                        //         obj[0].customerLoanStatusHistory.isDataEditable, result[10][0].transactionDate, obj[0].customerLoan.displayName, null);
                        // }
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerloandocuments.length; i++) {
                            let loanDocuments = new homeLoanDocumentResponse_1.HomeLoanDocumentResponse(obj[0].customerloandocuments[i].id, obj[0].customerloandocuments[i].documentId, obj[0].customerloandocuments[i].documentUrl, obj[0].customerloandocuments[i].documentName, obj[0].customerloandocuments[i].isPdf, obj[0].customerloandocuments[i].serviceTypeDocumentId, obj[0].customerloandocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }
                        let loanOffer = [];
                        if (obj[0].customerLoanOffers) {
                            loanOffer = obj[0].customerLoanOffers;
                        }
                        let propertyDetail = obj[0].customerPropertyDetail && obj[0].customerPropertyDetail.length > 0 ? new adminHomeLoanPropertyResponse_1.AdminHomeLoanPropertyResponse((_48 = obj[0].customerPropertyDetail[0]) === null || _48 === void 0 ? void 0 : _48.id, (_49 = obj[0].customerPropertyDetail[0]) === null || _49 === void 0 ? void 0 : _49.propertyTypeId, (_50 = obj[0].customerPropertyDetail[0]) === null || _50 === void 0 ? void 0 : _50.propertyPurchaseValue, (_52 = (_51 = obj[0]) === null || _51 === void 0 ? void 0 : _51.customerPropertyDetail[0]) === null || _52 === void 0 ? void 0 : _52.propertyCityId, obj[0].customerLoan.loanAmount, (_53 = obj[0].customerPropertyDetail[0]) === null || _53 === void 0 ? void 0 : _53.addressLine1, (_54 = obj[0].customerPropertyDetail[0]) === null || _54 === void 0 ? void 0 : _54.addressLine2, (_55 = obj[0].customerPropertyDetail[0]) === null || _55 === void 0 ? void 0 : _55.pincode, obj[0].customerId, (_56 = obj[0].customerPropertyDetail[0]) === null || _56 === void 0 ? void 0 : _56.propertyType, (_57 = obj[0].customerPropertyDetail[0]) === null || _57 === void 0 ? void 0 : _57.propertyCity, (_58 = obj[0].customerPropertyDetail[0]) === null || _58 === void 0 ? void 0 : _58.propertyDistrict, (_59 = obj[0].customerPropertyDetail[0]) === null || _59 === void 0 ? void 0 : _59.propertyState, (_61 = (_60 = obj[0]) === null || _60 === void 0 ? void 0 : _60.customerPropertyDetail[0]) === null || _61 === void 0 ? void 0 : _61.loanType) : null;
                        let transferPropertyDetail = obj[0].customerTransferPropertyDetail ? obj[0].customerTransferPropertyDetail : null;
                        let employmentDetail = obj[0].customerLoanEmploymentDetail && obj[0].customerLoanEmploymentDetail.length > 0 ? new adminHomeLoanEmploymentDetailResponse_1.AdminHomeLoanEmploymentDetailResponse(obj[0].customerLoan[0].employmentTypeId, (_62 = obj[0].customerLoanEmploymentDetail[0]) === null || _62 === void 0 ? void 0 : _62.monthlyIncome, (_63 = obj[0].customerLoanEmploymentDetail[0]) === null || _63 === void 0 ? void 0 : _63.label, (_64 = obj[0].customerLoanEmploymentDetail[0]) === null || _64 === void 0 ? void 0 : _64.addressLine1, (_65 = obj[0].customerLoanEmploymentDetail[0]) === null || _65 === void 0 ? void 0 : _65.addressLine2, (_66 = obj[0].customerLoanEmploymentDetail[0]) === null || _66 === void 0 ? void 0 : _66.pincode, (_67 = obj[0].customerLoanEmploymentDetail[0]) === null || _67 === void 0 ? void 0 : _67.cityId, (_68 = obj[0].customerLoanEmploymentDetail[0]) === null || _68 === void 0 ? void 0 : _68.companyAddressId, (_69 = obj[0].customerLoanEmploymentDetail[0]) === null || _69 === void 0 ? void 0 : _69.addressTypeId, (_70 = obj[0].customerLoanEmploymentDetail[0]) === null || _70 === void 0 ? void 0 : _70.id, (_71 = obj[0].customerLoanEmploymentDetail[0]) === null || _71 === void 0 ? void 0 : _71.industryTypeId, (_72 = obj[0].customerLoanEmploymentDetail[0]) === null || _72 === void 0 ? void 0 : _72.employmentNatureId, (_73 = obj[0].customerLoanEmploymentDetail[0]) === null || _73 === void 0 ? void 0 : _73.employmentServiceTypeId, (_74 = obj[0].customerLoanEmploymentDetail[0]) === null || _74 === void 0 ? void 0 : _74.employmentServiceType, (_75 = obj[0].customerLoanEmploymentDetail[0]) === null || _75 === void 0 ? void 0 : _75.employmentNature, (_76 = obj[0].customerLoanEmploymentDetail[0]) === null || _76 === void 0 ? void 0 : _76.industryType) : null;
                        let residenseDetail = obj[0].customerloancurrentresidentdetails && obj[0].customerloancurrentresidentdetails.length > 0 ? new homeLoanCurrentResidenceResponse_1.HomeLoanCurrentResidenseResponse(obj[0].customerloancurrentresidentdetails[0].residentTypeId, obj[0].customerloancurrentresidentdetails[0].id, obj[0].customerloancurrentresidentdetails[0].rentAmount, obj[0].customerloancurrentresidentdetails[0].valueOfProperty, obj[0].customerloancurrentresidentdetails[0].residentType) : null;
                        let permanentAddressDetail = obj[0].addressId ? new homeLoanPermanentAddressDetailResponse_1.HomeLoanPermanentAddressDetailResponse((_77 = obj[0]) === null || _77 === void 0 ? void 0 : _77.label, obj[0].addressLine1, obj[0].addressLine2, obj[0].pincode, obj[0].cityId, obj[0].addressTypeId, obj[0].addressId, obj[0].city) : null;
                        let correspondenceAddressDetail = obj[0].correspondenseAddress && obj[0].correspondenseAddress.length > 0 ? new homeLoanCorrespondenceResponse_1.HomeLoanCorrespondenceAddressDetailResponse(obj[0].correspondenseAddress[0].label, obj[0].correspondenseAddress[0].addressLine1, obj[0].correspondenseAddress[0].addressLine2, obj[0].correspondenseAddress[0].pincode, obj[0].correspondenseAddress[0].cityId, obj[0].correspondenseAddress[0].addressTypeId, obj[0].correspondenseAddress[0].addressId) : null;
                        let loanCompleteHistory = new loanCompleteHistoryReponse_1.loanCompleteHistoryResponse((_78 = obj[0].customerLoanCompleteHistory[0]) === null || _78 === void 0 ? void 0 : _78.isCompleted, (_79 = obj[0].customerLoanCompleteHistory[0]) === null || _79 === void 0 ? void 0 : _79.completeScreen);
                        let disbursedData;
                        if (((_80 = obj[0]) === null || _80 === void 0 ? void 0 : _80.disbursedData) && obj[0].disbursedData.length > 0) {
                            disbursedData = obj[0].disbursedData;
                        }
                        let rejectionReason = [];
                        if (obj[0].customerLoanRejectionReason && obj[0].customerLoanRejectionReason.length > 0) {
                            rejectionReason = obj[0].customerLoanRejectionReason;
                            rejectionReason[0].reasons = obj[0].reasons;
                        }
                        let groupDetail = obj[0].partners && obj[0].partners.length > 0 ? new adminGroupDetailResponse_1.AdminGroupDetailResponse(((obj[0].partners && obj[0].partners.length > 0) ? (_81 = obj[0].partners[0]) === null || _81 === void 0 ? void 0 : _81.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0].permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_82 = obj[0].partners[0]) === null || _82 === void 0 ? void 0 : _82.fullName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_83 = obj[0].partners[0]) === null || _83 === void 0 ? void 0 : _83.contactNo : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_84 = obj[0].partners[0]) === null || _84 === void 0 ? void 0 : _84.roleName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_85 = obj[0].partners[0]) === null || _85 === void 0 ? void 0 : _85.gender : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_86 = obj[0].partners[0]) === null || _86 === void 0 ? void 0 : _86.parentPartnerId : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_87 = obj[0].partners[0]) === null || _87 === void 0 ? void 0 : _87.parentParentPartnerId : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_88 = obj[0].partners[0]) === null || _88 === void 0 ? void 0 : _88.parentParentPartnerName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_89 = obj[0].partners[0]) === null || _89 === void 0 ? void 0 : _89.parentPartnerName : "")) : null;
                        let response = new adminHomeLoanResponse_1.AdminHomeLoanResponse(basicDetail, coapplicants, propertyDetail, residenseDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer, disbursedData, rejectionReason ? rejectionReason[0] : null, (_90 = obj[0]) === null || _90 === void 0 ? void 0 : _90.customerLoanStatusHistory, transferPropertyDetail, groupDetail);
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Home Loan Data', [response], 1);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Home Loan Data", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'homeLoan.getHomeLoanById()', error, '');
        next(errorResult);
    }
});
const insertUpdateHomeLoanBasicDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Home Loan Basic Detail');
        let requiredFields = ["customerId", "fullName", "birthdate", "maritalStatusId", "loanAmount", "residentTypeId", "loanType"];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : null;
                let partnerId = 0;
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                if (dsaCode && !customerLoanId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = yield query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }
                let userId = authorizationResult.currentUser.id;
                let customerId = req.body.customerId;
                let fullName = req.body.fullName;
                let motherName = req.body.motherName;
                let fatherContactNo = req.body.fatherContactNo;
                let birthDate = req.body.birthdate ? new Date(req.body.birthdate) : null;
                let dDate = null;
                if (birthDate)
                    dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                let maritalStatusId = req.body.maritalStatusId;
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
                let loanAmount = req.body.loanAmount;
                let finalResult = [];
                let serviceId = req.body.serviceId;
                let customerloancurrentresidentdetailId = req.body.customerloancurrentresidentdetailId ? req.body.customerloancurrentresidentdetailId : null;
                let residentTypeId = req.body.residentTypeId;
                let rentAmount = req.body.rentAmount != null ? req.body.rentAmount : null;
                let valueOfProperty = req.body.valueOfProperty != null ? req.body.valueOfProperty : null;
                let currentUserId = req.body.userId;
                let loanType = req.body.loanTypel;
                let sql = `CALL adminInsertUpdateHomeLoanBasicDetail(` + customerLoanId + `,'` + motherName + `','` + fatherContactNo + `',` + userId + `,` + customerId + `,'` + fullName + `','` + dDate + `',` + maritalStatusId + `,'` + panCardNo + `',` + loanAmount + `,` + serviceId + `,` + partnerId + `,` + residentTypeId + `,` + rentAmount + `,` + valueOfProperty + `,` + customerloancurrentresidentdetailId + `,` + currentUserId + `,'` + req.body.loanType + `')`;
                let result = yield query(sql);
                if (result && result[1].affectedRows >= 0) {
                    if (req.body.coApplicant && req.body.coApplicant.length > 0) {
                        for (let i = 0; i < req.body.coApplicant.length; i++) {
                            let customerLoanCoApplicantId = req.body.coApplicant[i].customerLoanCoApplicantId ? req.body.coApplicant[i].customerLoanCoApplicantId : null;
                            let fullName = req.body.coApplicant[i].fullName ? req.body.coApplicant[i].fullName : "";
                            let birthDate = req.body.coApplicant[i].birthDate ? new Date(req.body.coApplicant[i].birthDate) : null;
                            let dDate = null;
                            if (birthDate)
                                dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                            let maritalStatusId = req.body.coApplicant[i].maritalStatusId;
                            let coApplicantRelationId = req.body.coApplicant[i].coApplicantRelationId;
                            customerLoanId = result[0][0].customerLoanId;
                            let coApplicantSql = `CALL insertUpdateHomeLoanCoApplicant(` + customerLoanCoApplicantId + `,` + customerLoanId + `,'` + fullName + `','` + dDate + `',` + maritalStatusId + `
                            ,` + coApplicantRelationId + `,` + userId + `)`;
                            let coApplicantResult = yield query(coApplicantSql);
                            if (coApplicantResult[0] && coApplicantResult[0].length > 0) {
                                let data = {
                                    "customerLoanCoApplicantId": coApplicantResult[0][0].customerLoanCoApplicantId,
                                    "coApplicantName": fullName
                                };
                                finalResult.push(data);
                            }
                        }
                        let deleteCoapplicantIds = (req.body.deleteCoapplicantIds && req.body.deleteCoapplicantIds.length > 0) ? req.body.deleteCoapplicantIds.toString() : "";
                        if (deleteCoapplicantIds) {
                            let coApplicantSql = `CALL removeHomeLoanCoapplicant('` + deleteCoapplicantIds + `')`;
                            let coApplicantResult = yield query(coApplicantSql);
                        }
                        let finalData = {
                            "customerLoanId": customerLoanId,
                            "coApplicantIds": finalResult,
                            "customerloancurrentresidentdetailId": result[0][0].customerloancurrentresidentdetailId
                        };
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Home Loan Customer Address And Co Applicant Saved', finalData, finalResult.length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let deleteCoapplicantIds = (req.body.deleteCoapplicantIds && req.body.deleteCoapplicantIds.length > 0) ? req.body.deleteCoapplicantIds.toString() : "";
                        if (deleteCoapplicantIds) {
                            let coApplicantSql = `CALL removeHomeLoanCoapplicant('` + deleteCoapplicantIds + `')`;
                            let coApplicantResult = yield query(coApplicantSql);
                        }
                        let finalData = {
                            "customerLoanId": result[0][0].customerLoanId
                        };
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Home Loan Customer Detail Saved', finalData, 0);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Home Loan Customer Detail Not Saved", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'homeLoan.insertUpdateHomeLoanBasicDetail()', error, '');
        next(errorResult);
    }
});
const insertUpdateHomeLoanPropertyDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Home Loan Property Detail');
        let requiredFields = ["customerLoanId", "propertyTypeId", "propertyPurchaseValue", "propertyCityId", "propertyCity", "propertyDistrict", "propertyState", 'pincode'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let finalResult;
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : null;
                let customerLoanPropertyDetailId = req.body.customerLoanPropertyDetailId ? req.body.customerLoanPropertyDetailId : null;
                let propertyTypeId = req.body.propertyTypeId;
                let propertyPurchaseValue = req.body.propertyPurchaseValue;
                let propertyCityId = req.body.propertyCityId;
                let propertyCity = req.body.propertyCity;
                let propertyDistrict = req.body.propertyDistrict;
                let pincode = req.body.pincode;
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addresssLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let propertyState = req.body.propertyState;
                let approxDate = req.body.approxDate ? new Date(req.body.approxDate) : null;
                let approxDate2 = null;
                let topupAmount = req.body.topupAmount ? req.body.topupAmount : null;
                let approxCurrentEMI = req.body.approxCurrentEMI ? req.body.approxCurrentEMI : null;
                let loanType = req.body.loanTypeName ? req.body.loanTypeName : null;
                let bankId = req.body.bankId ? req.body.bankId : null;
                let loanAmountTakenExisting = req.body.loanAmountTakenExisting ? req.body.loanAmountTakenExisting : null;
                let customerLoanTransferPropertyDetailId = req.body.customerLoanTransferPropertyDetailId ? req.body.customerLoanTransferPropertyDetailId : 0;
                if (approxDate)
                    approxDate2 = new Date(approxDate).getFullYear().toString() + '-' + ("0" + (new Date(approxDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(approxDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(approxDate).getHours())).slice(-2) + ':' + ("0" + (new Date(approxDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(approxDate).getSeconds())).slice(-2);
                let sql = `CALL adminInsertUpdateCustomerLoanPropertyDetail(` + customerLoanId + `,` + customerLoanPropertyDetailId + `,` + propertyTypeId + `
                ,` + propertyPurchaseValue + `,` + propertyCityId + `,'` + propertyCity + `','` + propertyDistrict + `','` + propertyState + `','` + pincode + `','` + addressLine1 + `','` + addresssLine2 + `',` + userId + `,` + loanAmountTakenExisting + `,'` + approxDate2 + `',` + topupAmount + `,` + approxCurrentEMI + `,` + bankId + `,` + customerLoanTransferPropertyDetailId + `,'` + loanType + `')`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let customerAddressIds = [];
                        let customerLoanPropertyDetailId = result[0][0].customerLoanPropertyDetailId;
                        let customerTransferPropertyDetail = result[0][0].customerTransferPropertyDetail ? result[0][0].customerTransferPropertyDetail : null;
                        if (req.body.customerAddresses && req.body.customerAddresses.length > 0) {
                            let addressLength = req.body.customerAddresses.length;
                            for (let i = 0; i < req.body.customerAddresses.length; i++) {
                                let customerAddressId = req.body.customerAddresses[i].customerAddressId ? req.body.customerAddresses[i].customerAddressId : null;
                                let customerId = req.body.customerId ? req.body.customerId : null;
                                let addressTypeId = req.body.customerAddresses[i].addressTypeId ? req.body.customerAddresses[i].addressTypeId : null;
                                let label = req.body.customerAddresses[i].label ? req.body.customerAddresses[i].label : "";
                                let addressLine1 = req.body.customerAddresses[i].addressLine1 ? req.body.customerAddresses[i].addressLine1 : "";
                                let addressLine2 = req.body.customerAddresses[i].addressLine2 ? req.body.customerAddresses[i].addressLine2 : "";
                                let pincode = req.body.customerAddresses[i].pincode ? req.body.customerAddresses[i].pincode : "";
                                let cityId = req.body.customerAddresses[i].cityId ? req.body.customerAddresses[i].cityId : null;
                                let city = req.body.customerAddresses[i].city ? req.body.customerAddresses[i].city : "";
                                let district = req.body.customerAddresses[i].district ? req.body.customerAddresses[i].district : "";
                                let state = req.body.customerAddresses[i].state ? req.body.customerAddresses[i].state : "";
                                let customerLoanId = req.body.customerLoanId;
                                let sql1 = `SELECT id FROM  customeraddresses WHERE customerId = ` + customerId + ` AND addressTypeId = ` + addressTypeId;
                                let result1 = yield query(sql1);
                                if (result1 && result1.length > 0) {
                                    customerAddressId = result1[0].id;
                                }
                                let sql = `CALL adminInsertUpdateCustomerAddress(` + customerAddressId + `,` + customerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                        ,` + cityId + `,'` + city + `','` + district + `','` + state + `',` + customerLoanId + `,` + userId + `)`;
                                let result = yield query(sql);
                                if (result && result.length > 0) {
                                    if (result[0] && result[0].length > 0) {
                                        customerAddressIds.push(result[0][0]);
                                        if (addressLength == (i + 1)) {
                                            finalResult = {
                                                customerLoanPropertyDetailId: customerLoanPropertyDetailId,
                                                customerAddressIds: customerAddressIds,
                                                customerLoanTransferPropertyDetailId: customerTransferPropertyDetail
                                            };
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Home Loan Property Detail Saved', finalResult, 1);
                                            return res.status(200).send(successResult);
                                        }
                                    }
                                }
                                else {
                                    let errorResult = new resulterror_1.ResultError(400, true, "Home Loan Property Detail Not Saved", result, '');
                                    next(errorResult);
                                }
                            }
                        }
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "Home Loan Customer Detail Not Saved", result, '');
                        next(errorResult);
                    }
                }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'homeLoan.insertUpdateCustomerLoanPropertyDetail()', error, '');
        next(errorResult);
    }
});
const insertUpdateHomeLoanEmploymentDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Home Loan Customer Employment Detail');
        let requiredFields = ["customerLoanId", "label", "addressLine1", "pincode", "cityId",
            "employmentTypeId", "customerLoanCoApplicantEmploymentDetails"];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerloanemploymentdetailId = req.body.customerloanemploymentdetailId ? req.body.customerloanemploymentdetailId : null;
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let monthlyIncome = req.body.monthlyIncome ? req.body.monthlyIncome : null;
                let companyAddressId = req.body.companyAddressId ? req.body.companyAddressId : null;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 2;
                let label = req.body.label ? req.body.label : '';
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let pincode = req.body.pincode;
                let cityId = req.body.cityId;
                let officePincode = req.body.officePincode ? req.body.officePincode : req.body.pincode;
                let employmentNatureId = req.body.employmentNatureId != null ? req.body.employmentNatureId : null;
                let employmentServiceTypeId = req.body.employmentServiceTypeId != null ? req.body.employmentServiceTypeId : null;
                let employmentTypeId = req.body.employmentTypeId;
                let industryTypeId = req.body.industryTypeId != null ? req.body.industryTypeId : null;
                let sql = `CALL adminInsertUpdateHomeLoanEmploymentDetail(` + customerloanemploymentdetailId + `,` + customerLoanId + `,` + monthlyIncome + `,null,null,'',` + companyAddressId + `,` + addressTypeId + `
                ,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + officePincode + `',null,'',` + employmentNatureId + `,` + employmentServiceTypeId + `,null,null
                ,` + employmentTypeId + `,` + industryTypeId + `,` + userId + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let finalResult = [];
                    let customerloanemploymentdetailId = result[0][0].customerloanemploymentdetailId;
                    let employmentCompanyAddressId = result[0][0].companyAddressId;
                    if (req.body.customerLoanCoApplicantEmploymentDetails && req.body.customerLoanCoApplicantEmploymentDetails.length > 0) {
                        for (let i = 0; i < req.body.customerLoanCoApplicantEmploymentDetails.length; i++) {
                            let customerloancoapplicantemploymentdetailId = req.body.customerLoanCoApplicantEmploymentDetails[i].customerloancoapplicantemploymentdetailId ? req.body.customerLoanCoApplicantEmploymentDetails[i].customerloancoapplicantemploymentdetailId : null;
                            let customerLoanCoApplicantId = req.body.customerLoanCoApplicantEmploymentDetails[i].customerLoanCoApplicantId;
                            let userId = authorizationResult.currentUser.id;
                            let customerLoanId = req.body.customerLoanId;
                            let monthlyIncome = req.body.customerLoanCoApplicantEmploymentDetails[i].monthlyIncome;
                            let companyAddressId = req.body.customerLoanCoApplicantEmploymentDetails[i].companyAddressId ? req.body.customerLoanCoApplicantEmploymentDetails[i].companyAddressId : null;
                            let addressTypeId = req.body.customerLoanCoApplicantEmploymentDetails[i].addressTypeId ? req.body.customerLoanCoApplicantEmploymentDetails[i].addressTypeId : 2;
                            let label = req.body.customerLoanCoApplicantEmploymentDetails[i].label ? req.body.customerLoanCoApplicantEmploymentDetails[i].label : '';
                            let addressLine1 = req.body.customerLoanCoApplicantEmploymentDetails[i].addressLine1 ? req.body.customerLoanCoApplicantEmploymentDetails[i].addressLine1 : '';
                            let addressLine2 = req.body.customerLoanCoApplicantEmploymentDetails[i].addressLine2 ? req.body.customerLoanCoApplicantEmploymentDetails[i].addressLine2 : '';
                            let pincode = req.body.customerLoanCoApplicantEmploymentDetails[i].pincode;
                            let cityId = req.body.customerLoanCoApplicantEmploymentDetails[i].cityId;
                            let officePincode = req.body.customerLoanCoApplicantEmploymentDetails[i].officePincode ? req.body.customerLoanCoApplicantEmploymentDetails[i].officePincode : req.body.customerLoanCoApplicantEmploymentDetails[i].pincode;
                            let employmentNatureId = req.body.customerLoanCoApplicantEmploymentDetails[i].employmentNatureId != null ? req.body.customerLoanCoApplicantEmploymentDetails[i].employmentNatureId : null;
                            let employmentServiceTypeId = req.body.customerLoanCoApplicantEmploymentDetails[i].employmentServiceTypeId != null ? req.body.customerLoanCoApplicantEmploymentDetails[i].employmentServiceTypeId : null;
                            let employmentTypeId = req.body.customerLoanCoApplicantEmploymentDetails[i].employmentTypeId;
                            let industryTypeId = req.body.customerLoanCoApplicantEmploymentDetails[i].industryTypeId != null ? req.body.customerLoanCoApplicantEmploymentDetails[i].industryTypeId : null;
                            let sql = `CALL adminInsertUpdateCoApplicantEmploymentDetail(` + customerloancoapplicantemploymentdetailId + `,` + customerLoanCoApplicantId + `,` + customerLoanId + `,` + monthlyIncome + `,null,null,''
                        ,` + companyAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + officePincode + `',null,'',` + employmentNatureId + `
                        ,` + employmentServiceTypeId + `,null,null,` + employmentTypeId + `,` + industryTypeId + `,` + userId + `)`;
                            let CoApplicantEmploymentDetailResult = yield query(sql);
                            if (CoApplicantEmploymentDetailResult && result.length > 0) {
                                if (CoApplicantEmploymentDetailResult[0] && CoApplicantEmploymentDetailResult[0].length > 0) {
                                    let data = {
                                        customerLoanCoApplicantId: customerLoanCoApplicantId,
                                        customerloancoapplicantemploymentdetailId: CoApplicantEmploymentDetailResult[0][0].customerloancoapplicantemploymentdetailId,
                                    };
                                    finalResult.push(data);
                                    if (i == req.body.customerLoanCoApplicantEmploymentDetails.length - 1) {
                                        let finalData = {
                                            customerloanemploymentdetailId: customerloanemploymentdetailId,
                                            customerloancoapplicantemploymentdetailIds: finalResult,
                                            companyAddressId: employmentCompanyAddressId
                                        };
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', finalData, 1);
                                        return res.status(200).send(successResult);
                                    }
                                }
                                else {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', result, 1);
                                    return res.status(200).send(successResult);
                                }
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "Home Loan Customer Employment Detail Not Saved", result, '');
                                next(errorResult);
                            }
                        }
                    }
                    else {
                        let finalData = {
                            customerloanemploymentdetailId: customerloanemploymentdetailId,
                            companyAddressId: employmentCompanyAddressId
                        };
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', finalData, 1);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Home Loan Customer Employment Detail Not Saved", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'homeLoan.insertUpdateHomeLoanCustomerEmploymentDetail()', error, '');
        next(errorResult);
    }
});
exports.default = { getHomeLoan, getHomeLoanById, insertUpdateHomeLoanBasicDetail, insertUpdateHomeLoanPropertyDetail, insertUpdateHomeLoanEmploymentDetail };
