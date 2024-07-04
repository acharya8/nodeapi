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
const adminCustomerResponse_1 = require("../../classes/output/admin/loans/adminCustomerResponse");
const adminPersonalloanMoreBasicDetailResponse_1 = require("../../classes/output/admin/loans/adminPersonalloanMoreBasicDetailResponse");
const adminPersonalloanMoreEmploymentDetailResponse_1 = require("../../classes/output/admin/loans/adminPersonalloanMoreEmploymentDetailResponse");
const adminLoanCompleteHistoryReponse_1 = require("../../classes/output/admin/loans/adminLoanCompleteHistoryReponse");
const adminPersonalloanDocumentsResponse_1 = require("../../classes/output/admin/loans/adminPersonalloanDocumentsResponse");
const adminPersonalloanReferenceResponse_1 = require("../../classes/output/admin/loans/adminPersonalloanReferenceResponse");
const adminLoanStatusResponse_1 = require("../../classes/output/admin/loans/adminLoanStatusResponse");
const adminPersonalLoanResponse_1 = require("../../classes/output/admin/loans/adminPersonalLoanResponse");
const notifications_1 = __importDefault(require("./../notifications"));
const adminGroupDetailResponse_1 = require("../../classes/output/admin/loans/adminGroupDetailResponse");
var convertRupeesIntoWords = require('convert-rupees-into-words');
const fs = require('fs');
const pdf = require('html-pdf-node');
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
const NAMESPACE = 'Personal Loan';
const getPersonalLoan = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42;
    try {
        logging_1.default.info(NAMESPACE, 'Getting Personal Loans');
        var requiredFields = ['serviceId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
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
                INNER JOIN userroles ON userroles.userId = customers.userId
                WHERE customerloans.serviceId = ` + serviceId;
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
                if (startIndex >= 0 && fetchRecords > 0)
                    sqlQuery += " LIMIT " + fetchRecords + " OFFSET " + startIndex;
                let resultquery = yield query(sqlQuery);
                if (resultquery && resultquery.length > 0) {
                    let ids = resultquery.map(c => c.id);
                    if (ids && ids.length > 0) {
                        let sql = `CALL adminGetPersonalLoansByFilter('` + ids.toString() + `')`;
                        let result = yield query(sql);
                        if (result && result.length > 0) {
                            let obj = result[0];
                            for (let i = 0; i < obj.length; i++) {
                                let customerLoan;
                                let customerLoanEmploymentDetail;
                                let customerLoanSpouses;
                                let customerLoanDocuments;
                                let customerLoanReferences;
                                let customerLoanCompleteHistory;
                                let customerLoanStatusHistory;
                                let currentAddress;
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
                                        if (result[5].length > 0) {
                                            customerLoan[j].customerLoanReferences = result[5].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[6].length > 0) {
                                            customerLoan[j].customerLoanCompleteHistory = result[6].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[7].length > 0) {
                                            customerLoan[j].customerLoanStatusHistory = result[7].filter(c => c.customerloanId == customerLoan[j].id);
                                        }
                                        if (result[8].length > 0) {
                                            customerLoan[j].partners = result[8].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[9].length > 0) {
                                            customerLoan[j].currentAddress = result[9].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[15].length > 0) {
                                            customerLoan[j].loanTransferDetail = result[15].filter(c => c.customerLoanId == customerLoan[j].id);
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
                                        let bank = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].bankName : null;
                                        let topupAmount = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].topupAmount : null;
                                        let basicDetail = new adminCustomerResponse_1.AdminCustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId, obj[i].customerLoan[j].employmentType, (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_b = (_a = obj[i].customerLoan[j]) === null || _a === void 0 ? void 0 : _a.customerLoanEmploymentDetail[0]) === null || _b === void 0 ? void 0 : _b.monthlyIncome : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_d = (_c = obj[i].customerLoan[j]) === null || _c === void 0 ? void 0 : _c.customerLoanEmploymentDetail[0]) === null || _d === void 0 ? void 0 : _d.companyName : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_f = (_e = obj[i].customerLoan[j]) === null || _e === void 0 ? void 0 : _e.customerLoanEmploymentDetail[0]) === null || _f === void 0 ? void 0 : _f.officePincode : "", obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].id, (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_h = (_g = obj[i].customerLoan[j]) === null || _g === void 0 ? void 0 : _g.customerLoanEmploymentDetail[0]) === null || _h === void 0 ? void 0 : _h.id : "", ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_k = (_j = obj[i].customerLoan[j]) === null || _j === void 0 ? void 0 : _j.partners[0]) === null || _k === void 0 ? void 0 : _k.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_m = (_l = obj[i].customerLoan[j]) === null || _l === void 0 ? void 0 : _l.partners[0]) === null || _m === void 0 ? void 0 : _m.permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_p = (_o = obj[i].customerLoan[j]) === null || _o === void 0 ? void 0 : _o.partners[0]) === null || _p === void 0 ? void 0 : _p.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_r = (_q = obj[i].customerLoan[j]) === null || _q === void 0 ? void 0 : _q.partners[0]) === null || _r === void 0 ? void 0 : _r.contactNo : ""), (_t = (_s = obj[i]) === null || _s === void 0 ? void 0 : _s.customerLoan[j]) === null || _t === void 0 ? void 0 : _t.rmFullName, (_v = (_u = obj[i]) === null || _u === void 0 ? void 0 : _u.customerLoan[j]) === null || _v === void 0 ? void 0 : _v.status, (_x = (_w = obj[i]) === null || _w === void 0 ? void 0 : _w.customerLoan[j]) === null || _x === void 0 ? void 0 : _x.createdBy, (_y = obj[i]) === null || _y === void 0 ? void 0 : _y.customerLoan[j].maritalStatusId, null, null, null, obj[i].customerLoan[j].isDelete, obj[i].email, obj[i].customerLoan[j].customerId, obj[i].customerLoan[j].tenureId, null, null, null, null, null, null, null, null, null, null, obj[i].customerLoan[j].leadId, (_0 = (_z = obj[i]) === null || _z === void 0 ? void 0 : _z.customerLoan[j]) === null || _0 === void 0 ? void 0 : _0.statusId, (_2 = (_1 = obj[i]) === null || _1 === void 0 ? void 0 : _1.customerLoan[j]) === null || _2 === void 0 ? void 0 : _2.createdDate, (_4 = (_3 = obj[i]) === null || _3 === void 0 ? void 0 : _3.customerLoan[j]) === null || _4 === void 0 ? void 0 : _4.serviceId, obj[i].cibilScore);
                                        let moreBasicDetail = new adminPersonalloanMoreBasicDetailResponse_1.AdminPersonalLoanMoreBasicDetailResponse(obj[i].alternativeContactNo, obj[i].gender, obj[i].maritalStatusId, obj[i].maritalStatus, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].name : ""), ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].contactNo : ""), obj[i].customerLoan[j].motherName, obj[i].customerLoan[j].fatherName, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].id : 0), loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType, bank);
                                        let moreEmploymentDetail = new adminPersonalloanMoreEmploymentDetailResponse_1.AdminPersonalLoanMoreEmploymentDetailResponse(obj[i].email, (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_6 = (_5 = obj[i].customerLoan[j]) === null || _5 === void 0 ? void 0 : _5.customerLoanEmploymentDetail[0]) === null || _6 === void 0 ? void 0 : _6.designation : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_8 = (_7 = obj[i].customerLoan[j]) === null || _7 === void 0 ? void 0 : _7.customerLoanEmploymentDetail[0]) === null || _8 === void 0 ? void 0 : _8.companyTypeId : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_10 = (_9 = obj[i].customerLoan[j]) === null || _9 === void 0 ? void 0 : _9.customerLoanEmploymentDetail[0]) === null || _10 === void 0 ? void 0 : _10.companyTypeName : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_12 = (_11 = obj[i].customerLoan[j]) === null || _11 === void 0 ? void 0 : _11.customerLoanEmploymentDetail[0]) === null || _12 === void 0 ? void 0 : _12.currentCompanyExperience : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_14 = (_13 = obj[i].customerLoan[j]) === null || _13 === void 0 ? void 0 : _13.customerLoanEmploymentDetail[0]) === null || _14 === void 0 ? void 0 : _14.label : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_16 = (_15 = obj[i].customerLoan[j]) === null || _15 === void 0 ? void 0 : _15.customerLoanEmploymentDetail[0]) === null || _16 === void 0 ? void 0 : _16.addressLine1 : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_18 = (_17 = obj[i].customerLoan[j]) === null || _17 === void 0 ? void 0 : _17.customerLoanEmploymentDetail[0]) === null || _18 === void 0 ? void 0 : _18.addressLine2 : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_20 = (_19 = obj[i].customerLoan[j]) === null || _19 === void 0 ? void 0 : _19.customerLoanEmploymentDetail[0]) === null || _20 === void 0 ? void 0 : _20.pincode : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_22 = (_21 = obj[i].customerLoan[j]) === null || _21 === void 0 ? void 0 : _21.customerLoanEmploymentDetail[0]) === null || _22 === void 0 ? void 0 : _22.cityId : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_24 = (_23 = obj[i].customerLoan[j]) === null || _23 === void 0 ? void 0 : _23.customerLoanEmploymentDetail[0]) === null || _24 === void 0 ? void 0 : _24.city : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_26 = (_25 = obj[i].customerLoan[j]) === null || _25 === void 0 ? void 0 : _25.customerLoanEmploymentDetail[0]) === null || _26 === void 0 ? void 0 : _26.district : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_28 = (_27 = obj[i].customerLoan[j]) === null || _27 === void 0 ? void 0 : _27.customerLoanEmploymentDetail[0]) === null || _28 === void 0 ? void 0 : _28.state : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? (_30 = (_29 = obj[i].customerLoan[j]) === null || _29 === void 0 ? void 0 : _29.customerLoanEmploymentDetail[0]) === null || _30 === void 0 ? void 0 : _30.companyAddressId : "");
                                        let loanCompleteHistory;
                                        if (obj[i].customerLoan[j].customerLoanCompleteHistory && obj[i].customerLoan[j].customerLoanCompleteHistory.length > 0)
                                            loanCompleteHistory = new adminLoanCompleteHistoryReponse_1.AdminLoanCompleteHistoryResponse((_31 = obj[i].customerLoan[j].customerLoanCompleteHistory[0]) === null || _31 === void 0 ? void 0 : _31.isCompleted, (_32 = obj[i].customerLoan[j].customerLoanCompleteHistory[0]) === null || _32 === void 0 ? void 0 : _32.completeScreen);
                                        let loanDocuments = [];
                                        let loanReference = [];
                                        let loanStatus;
                                        if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                            for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                                let doc = new adminPersonalloanDocumentsResponse_1.AdminPersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf, obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                                loanDocuments.push(doc);
                                            }
                                        }
                                        if (obj[i].customerLoan[j].customerLoanReferences && obj[i].customerLoan[j].customerLoanReferences.length > 0) {
                                            for (let k = 0; k < obj[i].customerLoan[j].customerLoanReferences.length; k++) {
                                                let loanreference = new adminPersonalloanReferenceResponse_1.AdminPersonalLoanReferenceResponse(obj[i].customerLoan[j].customerLoanReferences[k].id, obj[i].customerLoan[j].customerLoanReferences[k].fullName, obj[i].customerLoan[j].customerLoanReferences[k].contactNo, obj[i].customerLoan[j].customerLoanReferences[k].label, obj[i].customerLoan[j].customerLoanReferences[k].addressLine1, obj[i].customerLoan[j].customerLoanReferences[k].addressLine2, obj[i].customerLoan[j].customerLoanReferences[k].pincode, obj[i].customerLoan[j].customerLoanReferences[k].city, obj[i].customerLoan[j].customerLoanReferences[k].cityId, obj[i].customerLoan[j].customerLoanReferences[k].district, obj[i].customerLoan[j].customerLoanReferences[k].state);
                                                loanReference.push(loanreference);
                                            }
                                        }
                                        if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                            let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                            loanStatus = new adminLoanStatusResponse_1.AdminLoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatusId, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus, obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName);
                                        }
                                        let groupDetail = new adminGroupDetailResponse_1.AdminGroupDetailResponse(((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_34 = (_33 = obj[i].customerLoan[j]) === null || _33 === void 0 ? void 0 : _33.partners[0]) === null || _34 === void 0 ? void 0 : _34.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j].partners[0].permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_36 = (_35 = obj[i].customerLoan[j]) === null || _35 === void 0 ? void 0 : _35.partners[0]) === null || _36 === void 0 ? void 0 : _36.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_38 = (_37 = obj[i].customerLoan[j]) === null || _37 === void 0 ? void 0 : _37.partners[0]) === null || _38 === void 0 ? void 0 : _38.contactNo : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_40 = (_39 = obj[i].customerLoan[j]) === null || _39 === void 0 ? void 0 : _39.partners[0]) === null || _40 === void 0 ? void 0 : _40.roleName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_42 = (_41 = obj[i].customerLoan[j]) === null || _41 === void 0 ? void 0 : _41.partners[0]) === null || _42 === void 0 ? void 0 : _42.gender : ""));
                                        let objRes = new adminPersonalLoanResponse_1.AdminPersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, null, null, null, null, groupDetail);
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
const getPersonalLoanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96;
    try {
        logging_1.default.info(NAMESPACE, 'Getting Personal Loans By Id');
        var requiredFields = ['customerLoanId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL adminGetPersonalLoansByFilter('` + customerLoanId + `')`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let obj = result[0];
                    for (let i = 0; i < obj.length; i++) {
                        let customerLoan;
                        let customerLoanEmploymentDetail;
                        let customerLoanSpouses;
                        let customerLoanDocuments;
                        let customerLoanReferences;
                        let customerLoanCompleteHistory;
                        let customerLoanStatusHistory;
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
                                if (result[5].length > 0) {
                                    customerLoan[j].customerLoanReferences = result[5].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[6].length > 0) {
                                    customerLoan[j].customerLoanCompleteHistory = result[6].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[7].length > 0) {
                                    customerLoan[j].customerLoanStatusHistory = result[7].filter(c => c.customerloanId == customerLoan[j].id);
                                }
                                if (result[8].length > 0) {
                                    customerLoan[j].partners = result[8].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[9] && result[9].length > 0) {
                                    customerLoan[j].offers = result[9].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[10].length > 0) {
                                    customerLoan[j].disbursedData = result[10].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[11].length > 0) {
                                    customerLoan[j].rejectionReason = result[11].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[12].length > 0) {
                                    customerLoan[j].reasons = result[12].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[13].length > 0) {
                                    customerLoan[j].currentAddress = result[13].filter(c => c.customerId == customerLoan[j].customerId);
                                }
                                if (result[8].length > 0) {
                                    customerLoan[j].groupDetail = result[8].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (result[14].length > 0) {
                                    customerLoan[j].loanTransferDetail = result[14].filter(c => c.customerLoanId == customerLoan[j].id);
                                }
                                if (customerLoan[j].groupDetail && customerLoan[j].groupDetail.length > 0) {
                                    if (customerLoan[j].groupDetail[0].parentPartnerId) {
                                        let parentSqlResult = yield query(`SELECT p1.parentPartnerId,p1.fullName as parentPartner,p2.fullName as parentParentPartnerName  FROM partners as p1 LEFT JOIN partners as p2 ON p1.parentPartnerId = p2.id WHERE p1.id = ?`, customerLoan[j].groupDetail[0].parentPartnerId);
                                        if (parentSqlResult && parentSqlResult.length > 0) {
                                            customerLoan[j].groupDetail[0].parentParentPartnerId = (_43 = parentSqlResult[0]) === null || _43 === void 0 ? void 0 : _43.parentPartnerId;
                                            customerLoan[j].groupDetail[0].parentParentPartnerName = (_44 = parentSqlResult[0]) === null || _44 === void 0 ? void 0 : _44.parentParentPartnerName;
                                            customerLoan[j].groupDetail[0].parentPartnerName = (_45 = parentSqlResult[0]) === null || _45 === void 0 ? void 0 : _45.parentPartner;
                                        }
                                    }
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
                                let bank = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].bankName : null;
                                let topupAmount = obj[i].customerLoan[j].loanTransferDetail && obj[i].customerLoan[j].loanTransferDetail.length > 0 ? obj[i].customerLoan[j].loanTransferDetail[0].topupAmount : null;
                                let officePincode = (((_46 = obj[i].customerLoan[j]) === null || _46 === void 0 ? void 0 : _46.customerLoanEmploymentDetail) && ((_47 = obj[i].customerLoan[j]) === null || _47 === void 0 ? void 0 : _47.customerLoanEmploymentDetail.length) > 0) ? (_48 = obj[i].customerLoan[j]) === null || _48 === void 0 ? void 0 : _48.customerLoanEmploymentDetail[0].officePincode : "";
                                let companyName = (((_49 = obj[i].customerLoan[j]) === null || _49 === void 0 ? void 0 : _49.customerLoanEmploymentDetail) && ((_50 = obj[i].customerLoan[j]) === null || _50 === void 0 ? void 0 : _50.customerLoanEmploymentDetail.length) > 0) ? (_51 = obj[i].customerLoan[j]) === null || _51 === void 0 ? void 0 : _51.customerLoanEmploymentDetail[0].companyName : "";
                                let monthlyIncome = (((_52 = obj[i].customerLoan[j]) === null || _52 === void 0 ? void 0 : _52.customerLoanEmploymentDetail) && ((_53 = obj[i].customerLoan[j]) === null || _53 === void 0 ? void 0 : _53.customerLoanEmploymentDetail.length) > 0) ? (_54 = obj[i].customerLoan[j]) === null || _54 === void 0 ? void 0 : _54.customerLoanEmploymentDetail[0].monthlyIncome : "";
                                let id = (((_55 = obj[i].customerLoan[j]) === null || _55 === void 0 ? void 0 : _55.customerLoanEmploymentDetail) && ((_56 = obj[i].customerLoan[j]) === null || _56 === void 0 ? void 0 : _56.customerLoanEmploymentDetail.length) > 0) ? (_57 = obj[i].customerLoan[j]) === null || _57 === void 0 ? void 0 : _57.customerLoanEmploymentDetail[0].id : "";
                                let basicDetail = new adminCustomerResponse_1.AdminCustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId, obj[i].customerLoan[j].employmentType, monthlyIncome, companyName, officePincode, (_58 = obj[i].customerLoan[j]) === null || _58 === void 0 ? void 0 : _58.loanAmount, obj[i].customerLoan[j].id, id, ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_60 = (_59 = obj[i].customerLoan[j]) === null || _59 === void 0 ? void 0 : _59.partners[0]) === null || _60 === void 0 ? void 0 : _60.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j].partners[0].permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_62 = (_61 = obj[i].customerLoan[j]) === null || _61 === void 0 ? void 0 : _61.partners[0]) === null || _62 === void 0 ? void 0 : _62.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_64 = (_63 = obj[i].customerLoan[j]) === null || _63 === void 0 ? void 0 : _63.partners[0]) === null || _64 === void 0 ? void 0 : _64.contactNo : ""), obj[i].customerLoan[j].rmFullName, obj[i].customerLoan[j].status, obj[i].customerLoan[j].createdBy, obj[i].customerLoan[j].maritalStatusId, null, null, null, obj[i].customerLoan[j].isDelete, obj[i].email, obj[0].customerLoan[j].customerId, obj[i].customerLoan[j].tenureId, obj[i].customerLoan[j].tenure, (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_65 = obj[i].customerLoan[j].currentAddress[0]) === null || _65 === void 0 ? void 0 : _65.label : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_66 = obj[i].customerLoan[j].currentAddress[0]) === null || _66 === void 0 ? void 0 : _66.addressLine1 : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_67 = obj[i].customerLoan[j].currentAddress[0]) === null || _67 === void 0 ? void 0 : _67.addressLine2 : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_68 = obj[i].customerLoan[j].currentAddress[0]) === null || _68 === void 0 ? void 0 : _68.pincode : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_69 = obj[i].customerLoan[j].currentAddress[0]) === null || _69 === void 0 ? void 0 : _69.cityId : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_70 = obj[i].customerLoan[j].currentAddress[0]) === null || _70 === void 0 ? void 0 : _70.city : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_71 = obj[i].customerLoan[j].currentAddress[0]) === null || _71 === void 0 ? void 0 : _71.district : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_72 = obj[i].customerLoan[j].currentAddress[0]) === null || _72 === void 0 ? void 0 : _72.state : ""), (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? (_73 = obj[i].customerLoan[j].currentAddress[0]) === null || _73 === void 0 ? void 0 : _73.id : ""), (obj[i].customerLoan[j].leadId ? obj[i].customerLoan[j].leadId : ""), (obj[i].customerLoan[j].statusId ? obj[i].customerLoan[j].statusId : ""), (obj[i].customerLoan[j].createdDate ? obj[i].customerLoan[j].createdDate : ""), (obj[i].customerLoan[j].serviceId ? obj[i].customerLoan[j].serviceId : ""), obj[i].cibilScore);
                                let moreBasicDetail = new adminPersonalloanMoreBasicDetailResponse_1.AdminPersonalLoanMoreBasicDetailResponse(obj[i].alternativeContactNo, obj[i].gender, obj[i].maritalStatusId, obj[i].maritalStatus, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].name : ""), ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].contactNo : ""), obj[i].customerLoan[j].motherName, obj[i].customerLoan[j].fatherName, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].id : 0), loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType, bank);
                                let moreEmploymentDetail = obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0 ? new adminPersonalloanMoreEmploymentDetailResponse_1.AdminPersonalLoanMoreEmploymentDetailResponse(obj[i].email, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].designation, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyTypeId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyTypeName, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].currentCompanyExperience, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].label, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine1, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine2, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].pincode, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].cityId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].city, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].district, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].state, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyAddressId) : null;
                                let loanCompleteHistory;
                                if (obj[i].customerLoan[j].customerLoanCompleteHistory) {
                                    loanCompleteHistory = new adminLoanCompleteHistoryReponse_1.AdminLoanCompleteHistoryResponse((_75 = (_74 = obj[i].customerLoan[j]) === null || _74 === void 0 ? void 0 : _74.customerLoanCompleteHistory[0]) === null || _75 === void 0 ? void 0 : _75.isCompleted, (_77 = (_76 = obj[i].customerLoan[j]) === null || _76 === void 0 ? void 0 : _76.customerLoanCompleteHistory[0]) === null || _77 === void 0 ? void 0 : _77.completeScreen);
                                }
                                let loanDocuments = [];
                                let loanReference = [];
                                let loanStatus;
                                if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                    for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                        let doc = new adminPersonalloanDocumentsResponse_1.AdminPersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf, obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                        loanDocuments.push(doc);
                                    }
                                }
                                if (obj[i].customerLoan[j].customerLoanReferences && obj[i].customerLoan[j].customerLoanReferences.length > 0) {
                                    for (let k = 0; k < obj[i].customerLoan[j].customerLoanReferences.length; k++) {
                                        let loanreference = new adminPersonalloanReferenceResponse_1.AdminPersonalLoanReferenceResponse(obj[i].customerLoan[j].customerLoanReferences[k].id, obj[i].customerLoan[j].customerLoanReferences[k].fullName, obj[i].customerLoan[j].customerLoanReferences[k].contactNo, obj[i].customerLoan[j].customerLoanReferences[k].label, obj[i].customerLoan[j].customerLoanReferences[k].addressLine1, obj[i].customerLoan[j].customerLoanReferences[k].addressLine2, obj[i].customerLoan[j].customerLoanReferences[k].pincode, obj[i].customerLoan[j].customerLoanReferences[k].city, obj[i].customerLoan[j].customerLoanReferences[k].cityId, obj[i].customerLoan[j].customerLoanReferences[k].district, obj[i].customerLoan[j].customerLoanReferences[k].state);
                                        loanReference.push(loanreference);
                                    }
                                }
                                if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                    let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                    loanStatus = new adminLoanStatusResponse_1.AdminLoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].id, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus, obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName);
                                }
                                let offers = [];
                                if (obj[i].customerLoan[j].offers && obj[i].customerLoan[j].offers.length > 0) {
                                    offers = obj[i].customerLoan[j].offers;
                                }
                                let disbursedData = [];
                                if (obj[i].customerLoan[j].disbursedData && obj[i].customerLoan[j].disbursedData.length > 0) {
                                    disbursedData = obj[i].customerLoan[j].disbursedData;
                                }
                                let rejectionReason = [];
                                if (obj[i].customerLoan[j].rejectionReason && obj[i].customerLoan[j].rejectionReason.length > 0) {
                                    rejectionReason = obj[i].customerLoan[j].rejectionReason;
                                    rejectionReason[0].reasons = obj[i].customerLoan[j].reasons;
                                }
                                let groupDetail = obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0 ? new adminGroupDetailResponse_1.AdminGroupDetailResponse(((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_79 = (_78 = obj[i].customerLoan[j]) === null || _78 === void 0 ? void 0 : _78.partners[0]) === null || _79 === void 0 ? void 0 : _79.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j].partners[0].permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_81 = (_80 = obj[i].customerLoan[j]) === null || _80 === void 0 ? void 0 : _80.partners[0]) === null || _81 === void 0 ? void 0 : _81.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_83 = (_82 = obj[i].customerLoan[j]) === null || _82 === void 0 ? void 0 : _82.partners[0]) === null || _83 === void 0 ? void 0 : _83.contactNo : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_85 = (_84 = obj[i].customerLoan[j]) === null || _84 === void 0 ? void 0 : _84.partners[0]) === null || _85 === void 0 ? void 0 : _85.roleName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_87 = (_86 = obj[i].customerLoan[j]) === null || _86 === void 0 ? void 0 : _86.partners[0]) === null || _87 === void 0 ? void 0 : _87.gender : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_89 = (_88 = obj[i].customerLoan[j]) === null || _88 === void 0 ? void 0 : _88.partners[0]) === null || _89 === void 0 ? void 0 : _89.parentPartnerId : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_91 = (_90 = obj[i].customerLoan[j]) === null || _90 === void 0 ? void 0 : _90.partners[0]) === null || _91 === void 0 ? void 0 : _91.parentParentPartnerId : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_93 = (_92 = obj[i].customerLoan[j]) === null || _92 === void 0 ? void 0 : _92.partners[0]) === null || _93 === void 0 ? void 0 : _93.parentParentPartnerName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? (_95 = (_94 = obj[i].customerLoan[j]) === null || _94 === void 0 ? void 0 : _94.partners[0]) === null || _95 === void 0 ? void 0 : _95.parentPartnerName : "")) : null;
                                let objRes = new adminPersonalLoanResponse_1.AdminPersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, offers, disbursedData, rejectionReason[0], (_96 = obj[i].customerLoan[j]) === null || _96 === void 0 ? void 0 : _96.customerLoanStatusHistory, groupDetail);
                                response.push(JSON.parse(JSON.stringify(objRes)));
                            }
                        }
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loans Available', response, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loans Available', result, 1);
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
const assignToRM = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Personal Loan Assign To RM');
        var requiredFields = ['customerLoanId', 'userId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminAssignToRM(` + req.body.userId + `,` + req.body.customerLoanId + `)`;
                let result = yield query(sql);
                //#region Notification
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                let customerUserIdResult = yield query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = yield query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                let partnerUserIdResult = yield query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = yield query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let service = yield query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id = ?`, req.body.customerLoanId);
                let title = "RM Assign";
                let description = "Relation Manager Assign";
                var dataBody = {
                    type: 3,
                    id: req.body.customerLoanId,
                    title: title,
                    message: description,
                    json: null,
                    dateTime: null,
                    customerLoanId: req.body.customerLoanId,
                    loanType: service[0].name,
                    creditCardId: null,
                    creditCardStatus: null
                };
                if (customerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                    let notificationResult = yield query(notificationSql);
                    yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                }
                if (partnerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                    let notificationResult = yield query(notificationSql);
                    yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                }
                //#endregion Notification
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loan Assign To RM', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.assignToRM() Exception', error, '');
        next(errorResult);
    }
});
const changeDocumentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'chagneDocumentStatus');
        var requiredFields = [''];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let loanDocumentId = "";
                let statuses = "";
                let allApproved = true;
                if (req.body.loanDocuments && req.body.loanDocuments.length > 0) {
                    for (let index = 0; index < req.body.loanDocuments.length; index++) {
                        loanDocumentId = (index == 0) ? req.body.loanDocuments[index].loanDocumentId : loanDocumentId + "," + req.body.loanDocuments[index].loanDocumentId;
                        statuses = (index == 0) ? req.body.loanDocuments[index].documentStatus.toString() : statuses + "," + req.body.loanDocuments[index].documentStatus.toString();
                    }
                    for (let index = 0; index < req.body.length; index++) {
                        if (req.body.loanDocuments[index].documentStatus == "REVIEW" || req.body.loanDocuments[index].documentStatus == "REJECTED") {
                            allApproved = false;
                            break;
                        }
                    }
                }
                let sql = `CALL adminChangeCustomerLoanDocumentStatus('` + loanDocumentId + `','` + statuses + `',` + authorizationResult.currentUser.id + `,` + allApproved + `,` + req.body.loanDocuments[0].customerLoanId + `)`;
                let result = yield query(sql);
                if (req.body.pendency) {
                    let sql = `CALL adminChangeLoanStatus(` + req.body.loanDocuments[0].customerLoanId + `,` + 23 + `,` + authorizationResult.currentUser.id + `);`;
                    result = yield query(sql);
                }
                else {
                    let sql = `CALL adminChangeLoanStatus(` + req.body.loanDocuments[0].customerLoanId + `,` + 11 + `,` + authorizationResult.currentUser.id + `);`;
                    result = yield query(sql);
                }
                //#region Notification
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.loanDocuments[0].customerLoanId + ")";
                let customerUserIdResult = yield query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = yield query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.loanDocuments[0].customerLoanId + ")";
                let partnerUserIdResult = yield query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = yield query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let serviceNameSql = yield query('SELECT name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id = ?', req.body.loanDocuments[0].customerLoanId);
                let serviceName = serviceNameSql[0].name;
                if (!req.body.pendency)
                    if (allApproved) {
                        var dataBody = {
                            type: 1,
                            id: req.body.loanDocuments[0].customerLoanId,
                            title: "Loan Document Approved",
                            message: "Loan Document Verified",
                            json: null,
                            dateTime: null,
                            customerLoanId: null,
                            loanType: null,
                            creditCardId: null,
                            creditCardStatus: null
                        };
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 1, 'Loan Document Approved', 'Loan Document Verified','` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([customerFcm], 1, req.body.loanDocuments[0].customerLoanId, "Loan Document Approved", "Loan Document Verified", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 1, 'Loan Document Approved', 'Loan Document Verified', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([partnerFcm], 1, req.body.loanDocuments[0].customerLoanId, "Loan Document Approved", "Loan Document Verified", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                        }
                    }
                    else {
                        var dataBody = {
                            type: 2,
                            id: req.body.loanDocuments[0].customerLoanId,
                            title: "Loan Document Rejected",
                            message: "Loan Document Rejected",
                            json: null,
                            dateTime: null,
                            customerLoanId: null,
                            loanType: null,
                            creditCardId: null,
                            creditCardStatus: null
                        };
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 2, 'Loan Document Rejected', 'Loan Document Rejected', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([customerFcm], 2, req.body.loanDocuments[0].customerLoanId, "Loan Document Rejected", "Loan Document Rejected", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 2, 'Loan Document Rejected', 'Loan Document Rejected', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([partnerFcm], 2, req.body.loanDocuments[0].customerLoanId, "Loan Document Rejected", "Loan Document Rejected", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                        }
                    }
                else {
                    var dataBody = {
                        type: 16,
                        id: req.body.loanDocuments[0].customerLoanId,
                        title: "Document Pendency",
                        message: "Generate Document Pendency",
                        json: null,
                        dateTime: null,
                        customerLoanId: null,
                        loanType: null,
                        creditCardId: null,
                        creditCardStatus: null
                    };
                    if (customerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                    VALUES(` + customerUserId + `, 1, 'Document Pendency', 'Generate Document Pendency','` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let notificationResult = yield query(notificationSql);
                        yield notifications_1.default.sendMultipleNotification([customerFcm], 16, req.body.loanDocuments[0].customerLoanId, "Document Pendency", "Generate Document Pendency", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                    }
                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                    VALUES(` + partnerUserId + `, 16, 'Document Pendency', 'Generate Document Pendency', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let notificationResult = yield query(notificationSql);
                        yield notifications_1.default.sendMultipleNotification([partnerFcm], 1, req.body.loanDocuments[0].customerLoanId, "Document Pendency", "Generate Document Pendency", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                    }
                }
                //#endregion Notification
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Change Document Status', (result && result.length > 0 ? result[0] : result), 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.changeDocumentStatus() Exception', error, '');
        next(errorResult);
    }
});
const getOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'get Offer');
        var requiredFields = ['serviceId', 'customerLoanId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let age = req.body.age ? req.body.age : 0;
                let loanAmount = req.body.loanAmount ? req.body.loanAmount : 0;
                let cibilScore = req.body.cibilScore ? req.body.cibilScore : 0;
                let turnOver = req.body.businessAnnualSale ? req.body.businessAnnualSale : 0;
                let vintage = req.body.vintage ? req.body.vintage : 0;
                let minIncome = req.body.minIncome ? req.body.minIncome : 0;
                let employmentTypeId = req.body.employmentTypeId ? req.body.employmentTypeId : 0;
                let companyCategoryTypeIds = [];
                if (req.body.companyName) {
                    let companyCategoryTypeSql = yield query(`SELECT bankcompanycategory.companyCategoryTypeId as companyCategoryTypeId FROM bankcompanycategory INNER JOIN companycategory ON bankcompanycategory.companyCategoryId = companycategory.id WHERE companycategory.companyName = ?`, req.body.companyName);
                    console.log(companyCategoryTypeSql);
                    companyCategoryTypeSql.forEach(ele => {
                        companyCategoryTypeIds.push(ele.companyCategoryTypeId);
                    });
                }
                let sql = `CALL adminGenerateOfferForCustomerLoan(` + employmentTypeId + `,` + req.body.serviceId + `,` + authorizationResult.currentUser.id + `,` + age + `,` + loanAmount + `,'` + companyCategoryTypeIds.toString() + `',` + cibilScore + `,` + turnOver + `,` + minIncome + `,` + vintage + `)`;
                console.log(sql);
                let result = yield query(sql);
                console.log(result);
                let offer = [];
                if (result[0] && result[0].length > 0) {
                    offer = result[0];
                    if (companyCategoryTypeIds && companyCategoryTypeIds.length > 0)
                        offer = offer.filter((c) => companyCategoryTypeIds.indexOf(c.companyCategoryTypeId) >= 0);
                    if (cibilScore > 0) {
                        for (let i = 0; i < offer.length; i++) {
                            if (offer[i].cibilScore && offer[i].cibilScore.includes('-')) {
                                let cibil = offer[i].cibilScore.split('-');
                                let minCibil = cibil[0];
                                let maxCibil = cibil[1];
                                offer[i].minCibil = minCibil;
                                offer[i].maxCibil = maxCibil;
                            }
                            else if (offer[i].cibilScore) {
                                offer[i].minCibil = offer[i].cibilScore;
                            }
                        }
                        let cibilOffer = [];
                        for (let j = 0; j < offer.length; j++) {
                            if (offer[j].minCibil && offer[j].maxCibil) {
                                if (offer[j].minCibil <= cibilScore && offer[j].maxCibil >= cibilScore) {
                                    cibilOffer.push(offer[j]);
                                }
                            }
                            else if (offer[j].minCibil && !offer[j].maxCibil) {
                                if (offer[j].minCibil <= cibilScore) {
                                    cibilOffer.push(offer[j]);
                                }
                            }
                        }
                        offer = cibilOffer;
                    }
                    let bankIdSql = yield query(`SELECT bankId FROM customerloanoffers WHERE customerLoanId = ?`, req.body.customerLoanId);
                    if (bankIdSql && bankIdSql.length > 0) {
                        if (offer && offer.length > 0) {
                            for (let i = 0; i < offer.length; i++) {
                                try {
                                    let index = bankIdSql.findIndex(c => c.bankId == offer[i].bankId);
                                    if (index >= 0) {
                                        //
                                    }
                                    else {
                                        let sql = `INSERT INTO customerloanoffers (customerLoanId,bankId,employmentTypeId,cibilScore,minAge,maxAge,minIncome,vintage,minTurnOver,maxTurnOver,tenure,ROI,minLoanAmount,maxLoanAmount,companyCategoryTypeId,createdBy,modifiedBy) 
                        VALUES (` + req.body.customerLoanId + `,` + offer[i].bankId + `,` + offer[i].employmentTypeId + `,` + offer[i].cibilScore + `,` + offer[i].minAge + `,` + offer[i].maxAge + `,` + offer[i].minIncome + `,` + offer[i].vintage + `,`
                                            + offer[i].minTurnOver + `,` + offer[i].maxTurnOver + `,'` + offer[i].tenure + `',` + offer[i].ROI + `,` + offer[i].minLoanAmount + `,` + offer[i].maxLoanAmount + `,` + offer[i].companyCategoryTypeId + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`;
                                        console.log(sql);
                                        let result = yield query(sql);
                                    }
                                }
                                catch (error) {
                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Offer", result[0], '');
                                    next(errorResult);
                                }
                            }
                        }
                        // result = await query(`SELECT customerloanoffers.*,banks.name as bankName,companyCategoryType.name as companyCategoryType FROM customerloanoffers INNER JOIN banks ON banks.id = customerloanoffers.bankId LEFT JOIN companycategorytype ON companycategorytype.id = customerloanoffers.companyCategoryTypeId WHERE customerLoanId = ?`, req.body.customerLoanId)
                    }
                    else {
                        if (offer && offer.length > 0) {
                            for (let i = 0; i < offer.length; i++) {
                                let sql = `INSERT INTO customerloanoffers (customerLoanId,bankId,employmentTypeId,cibilScore,minAge,maxAge,minIncome,vintage,minTurnOver,maxTurnOver,tenure,ROI,minLoanAmount,maxLoanAmount,companyCategoryTypeId,createdBy,modifiedBy) 
                        VALUES (` + req.body.customerLoanId + `,` + offer[i].bankId + `,` + offer[i].employmentTypeId + `,` + offer[i].cibilScore + `,` + offer[i].minAge + `,` + offer[i].maxAge + `,` + offer[i].minIncome + `,` + offer[i].vintage + `,`
                                    + offer[i].minTurnOver + `,` + offer[i].maxTurnOver + `,'` + offer[i].tenure + `',` + offer[i].ROI + `,` + offer[i].minLoanAmount + `,` + offer[i].maxLoanAmount + `,` + offer[i].companyCategoryTypeId + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`;
                                console.log(sql);
                                let result = yield query(sql);
                            }
                        }
                    }
                    result = yield query(`SELECT customerloanoffers.*,banks.name as bankName,companycategorytype.name as companyCategoryType,cd.status as offerStatus,cd.customerloanoffersId FROM customerloanoffers
                    INNER JOIN banks ON banks.id = customerloanoffers.bankId 
                    LEFT JOIN companycategorytype ON companycategorytype.id = customerloanoffers.companyCategoryTypeId
                    left join customerloandetail cd on cd.customerloanoffersId = customerloanoffers.id
                    WHERE customerloanoffers.customerLoanId  = ?`, req.body.customerLoanId);
                    console.log(result);
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Generated Offer', result, result.length);
                    return res.status(200).send(successResult);
                }
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Generated Offer', result[0], result[0].length);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.getOffer() Exception', error, '');
        next(errorResult);
    }
});
const insertSelectedOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Offer');
        var requiredFields = ['customerLoanId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            let result;
            if (authorizationResult.statusCode == 200) {
                let selectedOffer = [];
                if (req.body && req.body.selectedOffer.length > 0) {
                    for (let index = 0; index < req.body.selectedOffer.length; index++) {
                        let fileStatus = req.body.selectedOffer[index].fileStatus ? req.body.selectedOffer[index].fileStatus : '';
                        try {
                            let updateQuery = `UPDATE customerloanoffers SET status = '` + req.body.selectedOffer[index].status + `', fileStatus = '` + fileStatus + `' WHERE customerLoanId = ` + req.body.customerLoanId + ` AND id = ?`;
                            console.log(updateQuery);
                            result = yield query(updateQuery, req.body.selectedOffer[index].id);
                            console.log(result);
                        }
                        catch (error) {
                            let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Offer", result, '');
                            next(errorResult);
                        }
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Selected Offer', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.insertSelectedOffer() Exception', error, '');
        next(errorResult);
    }
});
const printPdf = (req) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let sql = "SELECT partners.fullName,partners.permanentCode,partners.panCardNo,partners.gstNo,partneraddress.label,partneraddress.addressLine1,partneraddress.addressLine2,partneraddress.cityId,partneraddress.pincode,cities.name as cityName,districts.name as districtName,states.name as stateName,users.email FROM partners ";
        sql += " LEFT JOIN partneraddress ON partneraddress.partnerId = partners.id ";
        sql += " LEFT JOIN cities ON cities.id = partneraddress.cityId";
        sql += " LEFT JOIN districts ON districts.id = cities.districtId";
        sql += " LEFT JOIN states ON states.id = districts.stateId";
        sql += " LEFT JOIN users ON partners.userId = users.id";
        sql += " WHERE partners.id = ?";
        let partnerResult = yield query(sql, req.partnerId);
        console.log(partnerResult);
        let adminSql = "SELECT systemflags.name,systemflags.value FROM systemflags WHERE flagGroupId = 2 OR 3";
        let adminResult = yield query(adminSql);
        let lastInvoice = new Date().getFullYear() + ("0" + (new Date().getMonth() + 1)).slice(-2) + ("0" + new Date().getDate()).slice(-2) + req.count;
        let invoiceDate = ("0" + new Date().getDate()).slice(-2) + "/" + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear();
        const today = new Date();
        let month = today.toLocaleString('default', { month: 'short' }) + "/" + new Date().getFullYear();
        let IGST = adminResult.find(c => c.name == 'IGST').value ? (req.commission * adminResult.find(c => c.name == 'IGST').value) / 100 : 0;
        let CGST = adminResult.find(c => c.name == 'CGST').value ? (req.commission * adminResult.find(c => c.name == 'CGST').value) / 100 : 0;
        let SGST = adminResult.find(c => c.name == 'SGST').value ? (req.commission * adminResult.find(c => c.name == 'SGST').value) / 100 : 0;
        let gstNo = partnerResult[0].gstNo ? partnerResult[0].gstNo : '';
        let email = partnerResult[0].email ? partnerResult[0].email : '';
        let addressLine2 = partnerResult[0].addressLine2 ? partnerResult[0].addressLine2 : '';
        let adminGstno = adminResult.find(c => c.name == 'gst').value ? adminResult.find(c => c.name == 'gst').value : '';
        let HsnNo = adminResult.find(c => c.name == 'HSNNo').value ? adminResult.find(c => c.name == 'HSNNo').value : '';
        let adminIGST = adminResult.find(c => c.name == 'IGST').value ? adminResult.find(c => c.name == 'IGST').value : 0;
        let adminCGST = adminResult.find(c => c.name == 'CGST').value ? adminResult.find(c => c.name == 'CGST').value : 0;
        let adminSGST = adminResult.find(c => c.name == 'SGST').value ? adminResult.find(c => c.name == 'SGST').value : 0;
        let total = (req.commission + IGST + CGST + SGST).toFixed(2);
        var words = convertRupeesIntoWords(parseInt(total));
        console.log(words);
        let result;
        var htmlContent = '';
        htmlContent += '<!DOCTYPE html>';
        htmlContent += '<html>';
        htmlContent += '<head>';
        htmlContent += '<style>';
        htmlContent += ' table, th, td {border: 1px solid black;border-collapse: collapse;padding:5px;}';
        htmlContent += 'td:first-child {text-align:center}';
        htmlContent += '    </style>';
        htmlContent += '</head>';
        htmlContent += '<body style="margin:30px;margin-top:0px;">';
        htmlContent += '<p style="text-align:center;font-size: 10px;font-family:arial">Tax Invoice</p>';
        htmlContent += '<div class="row">';
        htmlContent += '<table style="width:100%">';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">Vendor code</td><td style="font-size: 10px;font-family:arial">' + partnerResult[0].permanentCode + '</td><td style="text-align:center;font-size: 10px;font-family:arial">InvoiceNumber</td><td  style="font-size: 10px;font-family:arial">' + lastInvoice + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">Product</td><td style="font-size: 10px;font-family:arial">' + req.serviceName + '</td><td style="text-align:center;font-size: 10px;font-family:arial">InvoiceDate</td><td  style="font-size: 10px;font-family:arial">' + invoiceDate + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">SupplierNo</td><td style="font-size: 10px;font-family:arial">3691 </td><td style="text-align:center;font-size: 10px;font-family:arial">Month of Business</td><td style="font-size: 10px;font-family:arial">' + month + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR NAME </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + partnerResult[0].fullName + ' </td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR ADDRESS </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + partnerResult[0].label + "," + partnerResult[0].addressLine1 + "," + addressLine2 + "," + partnerResult[0].cityName + "," + partnerResult[0].districtName + "," + partnerResult[0].stateName + "," + partnerResult[0].pincode + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR Email </td><td colspan="3" style="font-size: 10px;font-family:arial">' + email + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">GST IN </td><td style="font-size: 10px;font-family:arial">' + gstNo + '</td> <td style="font-size: 10px;font-family:arial">PAN OF THE SUPPLIER </td> <td style="font-size: 10px;font-family:arial">' + partnerResult[0].panCardNo + ' </td></tr>';
        htmlContent += '<tr ><td style="font-size: 10px;font-family:arial">STATE NAME  </td><td style="font-size: 10px;font-family:arial">' + partnerResult[0].stateName + '</td> <td style="font-size: 10px;font-family:arial">STATE CODE </td>  <td style="font-size: 10px;font-family:arial">08 </td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">BRANCH NAME </td><td colspan ="3" style="text-align:center;font-size: 10px;font-family:arial">Jaipur  </td></tr>';
        htmlContent += '</table></div>';
        htmlContent += '<div class="row" style="margin-top:10px;width:100%">';
        console.log(adminResult.find(c => c.name == 'name'));
        htmlContent += '<table style="width:100%"><tr ><td style="font-size: 10px;font-family:arial">BUYER </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'name').value + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">ADDRESS</td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'address').value + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">GSTIN </td><td style="font-size: 10px;font-family:arial">' + adminGstno + '  </td><td style="text-align:center;font-size: 10px;font-family:arial">PAN</td><td style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'panCardNo').value + '</td></tr>';
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">PLACE OF SUPPLY</td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">Jaipur </td></tr>';
        console.log("GSTSUCCESS");
        htmlContent += '</table></div>';
        htmlContent += '<div class="row" style="margin-top:10px;">';
        htmlContent += '<table style="width:100%"><thead> <tr> <td style="font-size: 10px;font-family:arial">Sl.No</td> <td colspan="3" style="font-size: 10px;font-family:arial">Description of service</td> <td style="font-size: 10px;font-family:arial">HSN/NAC</td><td style="font-size: 10px;font-family:arial">GST</td> <td style="font-size: 10px;font-family:arial">Rate</td> <td style="font-size: 10px;font-family:arial">Per</td> <td style="font-size: 10px;font-family:arial">Amount</td> </thead>';
        htmlContent += '<tbody><tr><td style="font-size: 10px;font-family:arial">1</td><td colspan="3" style="font-size: 10px;font-family:arial">DSA Sales Commission</td><td style="font-size: 10px;font-family:arial">' + HsnNo + '</td> <td></td> <td></td> <td></td> <td style="font-size: 10px;font-family:arial">' + req.commission + '</td>  </tr>';
        htmlContent += '<tr><td></td><td colspan="3"></td><td></td><td style="font-size: 10px;font-family:arial">IGST</td> <td style="font-size: 10px;font-family:arial">' + adminIGST + '</td> <td></td> <td style="font-size: 10px;font-family:arial">' + IGST + '</td> </tr>';
        htmlContent += '<tr><td></td><td colspan="3"></td> <td></td> <td style="font-size: 10px;font-family:arial">CGST</td>  <td style="font-size: 10px;font-family:arial">' + adminCGST + '</td>  <td></td>  <td style="font-size: 10px;font-family:arial">' + CGST + '</td>  </tr>';
        htmlContent += '<tr><td></td><td colspan="3"></td> <td></td> <td style="font-size: 10px;font-family:arial">SGST</td> <td style="font-size: 10px;font-family:arial">' + adminSGST + '</td> <td></td> <td style="font-size: 10px;font-family:arial">' + SGST + '</td></tr>';
        // htmlContent += '<tr><td></td><td colspan="3"></td><td></td><td>UGST</td><td>0%</td><td></td><td>0</td></tr>'
        htmlContent += '<tr><td colspan="8" style="text-align:right;font-size: 10px;font-family:arial">Total</td><td style="font-size: 10px;font-family:arial">' + total + '</td></tr>';
        htmlContent += '<tr><td colspan="4" style="font-size: 10px;font-family:arial">Amount Chargeable in words</td><td colspan="5" style="font-size: 10px;font-family:arial">' + words + '</td></tr>';
        htmlContent += '<tr><td colspan="9" style="text-align:right;font-size: 10px;font-family:arial">E & OE</td></tr>';
        htmlContent += '<tr><td colspan="9" style="text-align:center;font-size: 10px;font-family:arial">Company Bank Detail</td></tr>';
        htmlContent += '<tr><td colspan="6" style="text-align:center;font-size: 10px;font-family:arial">Bank Name</td><td colspan="3" style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'bankName').value + ' </td></tr>';
        htmlContent += '<tr><td colspan="6" style="text-align:center;font-size: 10px;font-family:arial">Bank Account Number</td><td style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'bankAccountNumber').value + '</td><td style="font-size: 10px;font-family:arial">Branch & IFSC Code</td><td style="font-size: 10px;font-family:arial"> ' + adminResult.find(c => c.name == 'ifscCode').value + '</td></tr>';
        htmlContent += '<tr><td colspan="6" style="text-align:left;font-size: 10px;font-family:arial"><u>Declaration</u><br><p>We declare that this invoice shows the actual price of the goods & service described and that all particulars are true and correct</p></td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial"><span style="margin-top:10px">Authorized Signatory</span></td></tr>';
        htmlContent += '</tbody></table></div>';
        htmlContent += '</body>';
        htmlContent += '</html>';
        console.log("SUCCESS");
        // var pdfOptions = {
        // };
        // var createPDF = util.promisify(pdf.create).bind(pdf);
        // var pdfFile = await createPDF(htmlContent, pdfOptions);
        // var pdfString = fs.readFileSync(pdfFile.filename, { encoding: 'base64' });
        // result = pdfString;
        // let data = {
        //     "pdfString": result,
        //     "invoiceNumber": lastInvoice,
        //     "partnerId": req.partnerId
        // }
        // return data;
        let options = { format: 'A4' };
        let file = { content: htmlContent };
        let buffer;
        yield pdf.generatePdf(file, options).then(pdfBuffer => {
            buffer = pdfBuffer;
        });
        let data = {
            "pdfString": buffer,
            "invoiceNumber": lastInvoice,
            "partnerId": req.partnerId
        };
        return data;
    }
    catch (error) {
        return error;
    }
});
const insertUpdateCustomerLoanRejectionReason = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'CustomerLoan Rejection');
        var requiredFields = ['customerLoanId', 'reason'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.id = req.body.id ? req.body.id : 0;
                let sql = `CALL adminInsertUpdateCustomerLoanRejectionReson(` + req.body.id + `, ` + req.body.customerLoanId + `, '` + req.body.reason + `', ` + authorizationResult.currentUser.id + `)`;
                let result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    if (req.body.reasons && req.body.reasons.length > 0) {
                        let deleteQuery = yield query("DELETE FROM reasons WHERE customerLoanId = ?", req.body.customerLoanId);
                    }
                    for (let index = 0; index < req.body.reasons.length; index++) {
                        let insertQuery = `INSERT INTO reasons(customerLoanId, reason, description, createdBy, modifiedBy) VALUES(` + req.body.customerLoanId + `, '` + req.body.reasons[index].reason + `', '` + req.body.reasons[index].description + `', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let reasonResult = yield query(insertQuery);
                    }
                    //#region Notification
                    let customerFcm = "";
                    let customerUserId = null;
                    let partnerFcm = "";
                    let partnerUserId = null;
                    let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                    let customerUserIdResult = yield query(customerUserIdSql);
                    if (customerUserIdResult && customerUserIdResult.length > 0) {
                        customerUserId = customerUserIdResult[0].userId;
                        let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                        let customerFcmResult = yield query(customerFcmSql);
                        if (customerFcmResult && customerFcmResult.length > 0) {
                            customerFcm = customerFcmResult[0].fcmToken;
                        }
                    }
                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                    let partnerUserIdResult = yield query(partnerUserIdSql);
                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                        partnerUserId = partnerUserIdResult[0].userId;
                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                        let partnerFcmResult = yield query(partnerFcmSql);
                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                            partnerFcm = partnerFcmResult[0].fcmToken;
                        }
                    }
                    let service = yield query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id =? `, req.body.customerLoanId);
                    let title = "Loan Reject";
                    let description = "Loan Reject";
                    var dataBody = {
                        type: 5,
                        id: req.body.customerLoanId,
                        title: title,
                        message: description,
                        json: null,
                        dateTime: null,
                        customerLoanId: req.body.customerLoanId,
                        loanType: service[0].name,
                        creditCardId: null,
                        creditCardStatus: null
                    };
                    if (customerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(` + customerUserId + `, 5, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let notificationResult = yield query(notificationSql);
                        yield notifications_1.default.sendMultipleNotification([customerFcm], 5, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                    }
                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(` + partnerUserId + `, 5, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let notificationResult = yield query(notificationSql);
                        yield notifications_1.default.sendMultipleNotification([partnerFcm], 5, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                    }
                    //#endregion Notification
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loan RejectionReason Inserted Successfully', result, 1);
                    return res.status(200).send(successResult);
                    // } else {
                    //    let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                    //    next(errorResult);
                    //}
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Rejection Reason", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.insertUpdateCustomerLoanRejectionReason() Exception', error, '');
        next(errorResult);
    }
});
const insertUpdatePersonalLoanBasicDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'CustomerLoan Basic Detail');
        var requiredFields = ['customerId', 'alternativeContactNo', 'gender', 'maritalStatusId', 'motherName', 'fatherName', 'serviceId', 'tenureId', 'label', 'addressLine1', 'pincode', 'cityId', 'city', 'district', 'state'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : 0;
                req.body.customerLoanSpouseId = req.body.customerLoanSpouseId ? req.body.customerLoanSpouseId : null;
                req.body.spouseName = req.body.spouseName ? req.body.spouseName : "";
                req.body.spouseContactNo = req.body.spouseContactNo ? req.body.spouseContactNo : "";
                req.body.currentAddressId = req.body.currentAddressId ? req.body.currentAddressId : null;
                req.body.addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                req.body.addressTypeId = 5;
                let birthDate = req.body.birthdate;
                let loanAmountTakenExisting = req.body.loanAmountTakenExisting ? req.body.loanAmountTakenExisting : null;
                let approxDate = req.body.approxDate ? new Date(req.body.approxDate) : null;
                let approxDate2 = '';
                let topupAmount = req.body.topupAmount ? req.body.topupAmount : null;
                let approxCurrentEMI = req.body.approxCurrentEMI ? req.body.approxCurrentEMI : null;
                let bankId = req.body.bankId ? req.body.bankId : null;
                if (approxDate)
                    approxDate2 = new Date(approxDate).getFullYear().toString() + '-' + ("0" + (new Date(approxDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(approxDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(approxDate).getHours())).slice(-2) + ':' + ("0" + (new Date(approxDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(approxDate).getSeconds())).slice(-2);
                let dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                let sql = `CALL adminInsertUpdateLoanBasicDetail('` + req.body.fullName + `', '` + dDate + `', '` + req.body.panCardNo + `', ` + req.body.customerId + `, '` + req.body.alternativeContactNo + `', '` + req.body.gender + `', ` +
                    req.body.maritalStatusId + `, '` + req.body.motherName + `', '` + req.body.fatherName + `', ` + authorizationResult.currentUser.id + `, `
                    + req.body.customerLoanSpouseId + `, '` + req.body.spouseName + `', '` + req.body.spouseContactNo + `', ` + req.body.customerLoanId + `, `
                    + req.body.serviceId + `, ` + req.body.loanAmount + `, ` + req.body.tenureId + `, ` + req.body.currentAddressId + `, ` + req.body.addressTypeId + `, '`
                    + req.body.label + `','` + req.body.addressLine1 + `','` + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `,'`
                    + req.body.city + `','` + req.body.district + `','` + req.body.state + `',` + loanAmountTakenExisting + `,'` + approxDate2 + `',` + topupAmount + `,` + approxCurrentEMI + `,` + bankId + `,'` + req.body.loanType + `' )`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result && result[1].affectedRows >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'PersonalLoanBasicDetail Inserted Successfully', result[0], 1);
                        return res.status(200).send(successResult);
                        // } else {
                        //    let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                        //    next(errorResult);
                        //}
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Personal Loan", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.insertUpdatePersonalLoanBasicDetail() Exception', error, '');
        next(errorResult);
    }
});
const insertUpdatePersonalLoanEmploymentDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'CustomerLoan Employment Detail');
        var requiredFields = ['employmentTypeId', 'monthlyIncome', 'companyName', 'customerId', 'serviceId', 'customerLoanId', 'label', 'addressLine1', 'pincode', 'cityId', 'city', 'district', 'state', 'designation', 'currentCompanyExperience'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.companyAddressId = req.body.companyAddressId ? req.body.companyAddressId : null;
                req.body.customerLoanEmploymentId = req.body.customerLoanEmploymentId ? req.body.customerLoanEmploymentId : null;
                req.body.companyTypeId = req.body.companyTypeId ? req.body.companyTypeId : null;
                req.body.addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                req.body.addressTypeId = 2;
                let emailId = req.body.officeEmailId ? req.body.officeEmailId : null;
                let sql = `CALL adminInsertUpdateLoanEmploymentDetail(` + req.body.customerLoanId + `,` + req.body.customerLoanEmploymentId + `,` + req.body.employmentTypeId + `,` + req.body.monthlyIncome + `,'` + req.body.companyName + `',` + req.body.companyTypeId + `,'` + req.body.pincode + `',` + req.body.serviceId + `,` + req.body.customerId + `,` + authorizationResult.currentUser.id + `,` + req.body.companyAddressId + `,` + req.body.addressTypeId + `,'` + req.body.label + `','` + req.body.addressLine1 + `','` + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.district + `','`
                    + req.body.state + `','` + req.body.designation + `',` + req.body.currentCompanyExperience + `,'` + emailId + `')`;
                let result = yield query(sql);
                if (result && result[1].affectedRows >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'PersonalLoan Employment Detail Inserted Successfully', result[0], 1);
                    return res.status(200).send(successResult);
                    // } else {
                    //    let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                    //    next(errorResult);
                    //}
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Personal Loan", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.insertUpdatePersonalLoanEmploymentDetail() Exception', error, '');
        next(errorResult);
    }
});
const updatePersonalLoanAmount = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['loanAmount', 'customerLoanId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let loanAmount = req.body.loanAmount;
                let sql = `CALL adminUpdateLoanAmount(` + customerLoanId + `,` + loanAmount + `,` + userId + `)`;
                let result = yield query(sql);
                if (result) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loan Amount Updated', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Loan Amount Not Updated", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.updatePersonalLoanAmount()', error, '');
        next(errorResult);
    }
});
const getLoanOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'get Loan Offer');
        var requiredFields = ['customerLoanId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminGetOffer(` + req.body.customerLoanId + `)`;
                let result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Generated Offer', result[0], result[0].length);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.getOffer() Exception', error, '');
        next(errorResult);
    }
});
const insertOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Offer');
        var requiredFields = ['customerLoanId', 'bankId', 'loanAmount', 'ROI', 'tenure', 'isShared'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            let result;
            if (authorizationResult.statusCode == 200) {
                let id = req.body.id ? req.body.id : 0;
                let otherDetail = req.body.otherDetail ? req.body.otherDetail : '';
                let sql = `CALL adminInsertOffer(` + id + `,` + req.body.customerLoanId + `,` + req.body.bankId + `,` + req.body.loanAmount + `,` + req.body.ROI + `,` + req.body.tenure + `,` + req.body.isShared + `,` + authorizationResult.currentUser.id + `,'` + otherDetail + `')`;
                let result = yield query(sql);
                //#region Notification
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                let customerUserIdResult = yield query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = yield query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                let partnerUserIdResult = yield query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = yield query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                let statusResult = yield query(statusSql);
                let title = "Loan Status Change";
                let description = (statusResult && statusResult.length > 0) ? "Status Change to " + statusResult[0].status : "Loan Status Change";
                var dataBody = {
                    type: 3,
                    id: req.body.customerLoanId,
                    title: title,
                    message: description,
                    json: null,
                    dateTime: null,
                    customerLoanId: null,
                    loanType: null,
                    creditCardId: null,
                    creditCardStatus: null
                };
                if (customerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                    let notificationResult = yield query(notificationSql);
                    yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                }
                if (partnerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                    let notificationResult = yield query(notificationSql);
                    yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                }
                //#endregion Notification
                if (result) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Selected Offer', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Offer", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.insertOffer() Exception', error, '');
        next(errorResult);
    }
});
const deleteLoanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Deleting Loan Request');
        var requiredFields = ["customerLoanId"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "UPDATE customerloans SET isDelete = 1,statusId = 16, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = " + req.body.customerLoanId;
                let result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    let historySql = 'INSERT INTO customerloanstatushistory (customerLoanId,loanStatusId,transactionDate,createdBy,modifiedBy) VALUES (' + req.body.customerLoanId + ',' + 16 + ',' + 'CURRENT_TIMESTAMP()' + ',' + authorizationResult.currentUser.id + ',' + authorizationResult.currentUser.id + ')';
                    let historyResult = yield query(historySql);
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Delete Customer Loan Successfully', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "personalLoans.deleteLoanById() Error", new Error("Error During Deleting Loan Request"), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.deleteLoanById()', error, '');
        next(errorResult);
    }
});
const rewardCoin = (customerLoanId, authorizationResult, roleId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let sql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId =" + customerLoanId + ")";
        let result = yield query(sql);
        if (result && result.length > 0) {
            let userId = result[0].userId;
            var today = new Date();
            let endDate = (new Date(today).getFullYear() - 1).toString() + '-' + "04-01";
            let startDate = new Date(today).getFullYear().toString() + '-' + "03-31";
            let sql1 = "SELECT cl.* FROM customerloans cl WHERE cl.statusId = (SELECT id FROM loanstatuses WHERE status = 'DISBURSED') AND cl.createdBy = " + userId + "";
            let result1 = yield query(sql1);
            if (result1 && result1.length > 0) {
                let totalCount = result.length;
                let sql2 = "SELECT * FROM rewardcoin WHERE rewardTypeId = 4 AND minLoanFile <= " + totalCount + " AND maxLoanFile >= " + totalCount + " AND FIND_IN_SET(" + roleId + ",roleIds)";
                let result2 = yield query(sql2);
                if (result2 && result2.length > 0) {
                    let referCoin = result2[0].rewardCoin;
                    if (result2[0].isScratchCard) {
                        let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + userId + `, ` + referCoin + `, 4, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `);`;
                        let rewardResult = yield query(rewardSql);
                    }
                    else {
                        let userWalletId;
                        let userWalletIdResult = yield query(`SELECT id,coin FROM userwallet WHERE userId = ?`, userId);
                        if (userWalletIdResult && userWalletIdResult.length > 0) {
                            userWalletId = userWalletIdResult[0].id;
                            let updateWalletAmountSql = yield query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + authorizationResult.currentUser.id + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + referCoin);
                        }
                        else {
                            let insertWalletAmount = yield query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`);
                            if (insertWalletAmount && insertWalletAmount.insertId) {
                                userWalletId = insertWalletAmount.insertedId;
                            }
                        }
                        let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + userId + `,` + result2[0].rewardCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `,` + 4 + `)`;
                        let walletResult = yield query(walletSql);
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
        return true;
    }
    catch (error) {
        return error;
    }
});
const getTenure = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Tenure');
        var requiredFields = [''];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let sql = `CALL adminGetTenure();`;
                var result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Tenure Successfully', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "personalLoans.getTenure() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.getTenure() Exception', error, '');
        next(errorResult);
    }
});
const uploadPersonalLoanDocumentAndReference = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['customerLoanId', 'loanDocuments', 'loanReferences'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let response = [];
                if (req.body.loanDocuments) {
                    let cnt = 0;
                    let sendRes = false;
                    let documentIdSql = `SELECT id FROM customerloandocuments WHERE customerLoanId = ?`;
                    let documentResult = yield query(documentIdSql, req.body.customerLoanId);
                    let ids = [];
                    if (documentResult && documentResult.length > 0) {
                        for (let index = 0; index < documentResult.length; index++) {
                            ids.push(documentResult[index].id);
                        }
                    }
                    for (let i = 0; i < req.body.loanDocuments.length; i++) {
                        if (req.body.loanDocuments[i].documentData && req.body.loanDocuments[i].documentData.includes("https:")) {
                            cnt++;
                            if (req.body.loanDocuments[i].loanDocumentId) {
                                let sql = `Update customerloandocuments SET customerLoanId=` + customerLoanId + `,serviceTypeDocumentId=` + req.body.loanDocuments[i].serviceTypeDocumentId + `
                            ,documentId=` + req.body.loanDocuments[i].documentId + `,documentUrl='` + req.body.loanDocuments[i].documentData + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                            WHERE id = ` + req.body.loanDocuments[i].loanDocumentId;
                                //VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[i].serviceTypeDocumentId + `,` + req.body.loanDocuments[i].documentId + `,'` + data.Location + `',` + userId + `,` + userId + `)`;
                                let result = yield query(sql);
                                if (result && result.affectedRows > 0) {
                                    response.push(result);
                                    ids = ids.filter(c => c != req.body.loanDocuments[i].loanDocumentId);
                                }
                                else {
                                    //
                                }
                            }
                            if (i == req.body.loanDocuments.length - 1) {
                                if (req.body.loanReferences && req.body.loanReferences.length > 0) {
                                    for (let j = 0; j < req.body.loanReferences.length; j++) {
                                        if (req.body.loanReferences[j] && req.body.loanReferences[j].loanReferenceId) {
                                            let refSql = `UPDATE customerloanreferences SET customerLoanId=` + customerLoanId + `,fullName='` + req.body.loanReferences[j].name + `',
                                        contactNo='` + req.body.loanReferences[j].contactNo + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE id = ` + req.body.loanReferences[j].loanReferenceId;
                                            //VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                            let refResult = yield query(refSql);
                                            let refAddressSql = `UPDATE  customerreferenceaddresses SET label ='` + req.body.loanReferences[j].label + `',addressLine1='` + req.body.loanReferences[j].addressLine1 + `',addressLine2='` + req.body.loanReferences[j].addressLine2 + `',pincode='` + req.body.loanReferences[j].pincode + `',cityId=` + req.body.loanReferences[j].cityId + `,city='` + req.body.loanReferences[j].city + `',district='` + req.body.loanReferences[j].district + `',state='` + req.body.loanReferences[j].state + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE customerLoanReferenceId = ` + req.body.loanReferences[j].loanReferenceId;
                                            let refAddressResult = yield query(refAddressSql);
                                            if (refResult && refResult.affectedRows > 0) {
                                                response.push(refResult);
                                            }
                                            else {
                                                //
                                            }
                                        }
                                        else {
                                            let refSql = `INSERT INTO customerloanreferences(customerLoanId,fullName,contactNo,createdBy,modifiedBy)
                                        VALUES(` + customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                            let refResult = yield query(refSql);
                                            let insertedId = refResult.insertId;
                                            let refAddressSql = `INSERT INTO customerreferenceaddresses(customerLoanReferenceId,addressTypeId,label,addressLine1,addressLine2,pincode,cityId,city,district,state,createdBy,modifiedBy) VALUES(` + insertedId + `,` + 1 + `,'` + req.body.loanReferences[j].label + `','` + req.body.loanReferences[j].addressLine1 + `','` + req.body.loanReferences[j].addressLine2 + `','` + req.body.loanReferences[j].pincode + `',` + req.body.loanReferences[j].cityId + `,'` + req.body.loanReferences[j].city + `','` + req.body.loanReferences[j].district + `','` + req.body.loanReferences[j].state + `',` + userId + `,` + userId + `)`;
                                            let refAddressResult = yield query(refAddressSql);
                                            if (refResult && refResult.affectedRows > 0) {
                                                response.push(refResult);
                                            }
                                            else {
                                                //
                                            }
                                        }
                                    }
                                    let statusSql = `SELECT loanstatuses.status FROM customerloanstatushistory INNER JOIN loanstatuses ON loanstatuses.id = customerloanstatushistory.loanStatusId WHERE customerloanId=` + customerLoanId + ` ORDER BY customerloanstatushistory.id DESC LIMIT 1`;
                                    let statusResult = yield query(statusSql);
                                    let objResult = { "loanStatusName": statusResult[0].status };
                                    if (!sendRes && cnt == req.body.loanDocuments.length) {
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                        sendRes = true;
                                        return res.status(200).send(successResult);
                                    }
                                }
                                else {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Document Uploaded', response, 1);
                                    return res.status(200).send(successResult);
                                }
                            }
                        }
                        else {
                            let buf = Buffer.from(req.body.loanDocuments[i].documentData, 'base64');
                            let contentType;
                            if (req.body.loanDocuments[i].isPdf)
                                contentType = 'application/pdf';
                            else
                                contentType = 'image/jpeg';
                            let isErr = false;
                            let keyname = req.body.loanDocuments[i].documentName + "_" + req.body.customerLoanId + "_" + new Date().getTime();
                            req.body.loanDocuments[i].keyName = keyname;
                            let params = {
                                Bucket: 'customerloandocuments',
                                Key: keyname,
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
                                let key;
                                if (data.Key)
                                    key = data.Key;
                                else
                                    key = data.key;
                                let ind = req.body.loanDocuments.findIndex(c => c.keyName == key);
                                req.body.loanDocuments[ind].docUrl = "";
                                req.body.loanDocuments[ind].docUrl = data.Location;
                                cnt++;
                                if (cnt == req.body.loanDocuments.length) {
                                    for (let k = 0; k < req.body.loanDocuments.length; k++) {
                                        if (req.body.loanDocuments[k].loanDocumentId) {
                                            let url = "";
                                            if (req.body.loanDocuments[k].docUrl) {
                                                let documentStatus = 'PENDING';
                                                url = req.body.loanDocuments[k].docUrl;
                                                let sql = `Update customerloandocuments SET customerLoanId=` + customerLoanId + `,serviceTypeDocumentId=` + req.body.loanDocuments[k].serviceTypeDocumentId + `
                                            ,documentId=` + req.body.loanDocuments[k].documentId + `,documentUrl='` + url + `',documentStatus='` + documentStatus + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                                            WHERE id = ` + req.body.loanDocuments[k].loanDocumentId;
                                                //VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[i].serviceTypeDocumentId + `,` + req.body.loanDocuments[i].documentId + `,'` + data.Location + `',` + userId + `,` + userId + `)`;
                                                let result = yield query(sql);
                                                if (result && result.affectedRows > 0) {
                                                    response.push(result);
                                                    ids = ids.filter(c => c != req.body.loanDocuments[k].loanDocumentId);
                                                }
                                                else {
                                                    //
                                                }
                                            }
                                            else if (req.body.loanDocuments[k].documentData) {
                                                url = req.body.loanDocuments[k].documentData;
                                                let sql = `Update customerloandocuments SET customerLoanId=` + customerLoanId + `,serviceTypeDocumentId=` + req.body.loanDocuments[k].serviceTypeDocumentId + `
                                            ,documentId=` + req.body.loanDocuments[k].documentId + `,documentUrl='` + url + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                                            WHERE id = ` + req.body.loanDocuments[k].loanDocumentId;
                                                //VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[i].serviceTypeDocumentId + `,` + req.body.loanDocuments[i].documentId + `,'` + data.Location + `',` + userId + `,` + userId + `)`;
                                                let result = yield query(sql);
                                                if (result && result.affectedRows > 0) {
                                                    response.push(result);
                                                    ids = ids.filter(c => c != req.body.loanDocuments[i].loanDocumentId);
                                                }
                                                else {
                                                    //
                                                }
                                            }
                                        }
                                        else {
                                            let documentStatus = 'PENDING';
                                            let sql = `INSERT INTO customerloandocuments(customerLoanId,serviceTypeDocumentId,documentId,documentUrl,documentStatus,createdBy,modifiedBy) 
                                            VALUES(` + customerLoanId + `,` + req.body.loanDocuments[k].serviceTypeDocumentId + `,` + req.body.loanDocuments[k].documentId + `,'` + req.body.loanDocuments[k].docUrl + `','` + documentStatus + `',` + userId + `,` + userId + `)`;
                                            let result = yield query(sql);
                                            if (result && result.affectedRows > 0) {
                                                response.push(result);
                                            }
                                            else {
                                                //
                                            }
                                        }
                                    }
                                    if (req.body.loanReferences && req.body.loanReferences.length > 0) {
                                        for (let j = 0; j < req.body.loanReferences.length; j++) {
                                            if (req.body.loanReferences[j] && req.body.loanReferences[j].loanReferenceId) {
                                                let refSql = `UPDATE customerloanreferences SET customerLoanId=` + customerLoanId + `,fullName='` + req.body.loanReferences[j].name + `',
                                            contactNo='` + req.body.loanReferences[j].contactNo + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE id = ` + req.body.loanReferences[j].loanReferenceId;
                                                //VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                                let refResult = yield query(refSql);
                                                let refAddressSql = `UPDATE  customerreferenceaddresses SET label ='` + req.body.loanReferences[j].label + `',addressLine1='` + req.body.loanReferences[j].addressLine1 + `',addressLine2='` + req.body.loanReferences[j].addressLine2 + `',pincode='` + req.body.loanReferences[j].pincode + `',cityId=` + req.body.loanReferences[j].cityId + `,city='` + req.body.loanReferences[j].city + `',district='` + req.body.loanReferences[j].district + `',state='` + req.body.loanReferences[j].state + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE customerLoanReferenceId = ` + req.body.loanReferences[j].loanReferenceId;
                                                let refAddressResult = yield query(refAddressSql);
                                                if (refResult && refResult.affectedRows > 0) {
                                                    response.push(refResult);
                                                }
                                                else {
                                                    //
                                                }
                                            }
                                            else {
                                                let refSql = `INSERT INTO customerloanreferences(customerLoanId,fullName,contactNo,createdBy,modifiedBy)
                                            VALUES(` + customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                                let refResult = yield query(refSql);
                                                let insertedId = refResult.insertId;
                                                let refAddressSql = `INSERT INTO customerreferenceaddresses(customerLoanReferenceId,addressTypeId,label,addressLine1,addressLine2,pincode,cityId,city,district,state,createdBy,modifiedBy) VALUES(` + insertedId + `,` + 1 + `,'` + req.body.loanReferences[j].label + `','` + req.body.loanReferences[j].addressLine1 + `','` + req.body.loanReferences[j].addressLine2 + `','` + req.body.loanReferences[j].pincode + `',` + req.body.loanReferences[j].cityId + `,'` + req.body.loanReferences[j].city + `','` + req.body.loanReferences[j].district + `','` + req.body.loanReferences[j].state + `',` + userId + `,` + userId + `)`;
                                                let refAddressResult = yield query(refAddressSql);
                                                if (refResult && refResult.affectedRows > 0) {
                                                    response.push(refResult);
                                                }
                                                else {
                                                    //
                                                }
                                            }
                                        }
                                        let statusSql = `SELECT loanstatuses.status FROM customerloanstatushistory INNER JOIN loanstatuses ON loanstatuses.id = customerloanstatushistory.loanStatusId WHERE customerloanId=` + customerLoanId + ` ORDER BY customerloanstatushistory.id DESC LIMIT 1`;
                                        let statusResult = yield query(statusSql);
                                        let objResult;
                                        if (statusResult && statusResult.length > 0) {
                                            objResult = { "loanStatusName": statusResult[0].status };
                                        }
                                        else {
                                            let loanStatusId;
                                            let pendingSeatus = yield query("SELECT id FROM loanstatuses WHERE status = 'PENDING'");
                                            if (pendingSeatus && pendingSeatus.length > 0) {
                                                loanStatusId = pendingSeatus[0].id;
                                                let statusSql = "INSERT INTO customerloanstatushistory(customerloanId,loanStatusId,createdBy,modifiedBy) VALUES(" + customerLoanId + "," + loanStatusId + "," + userId + "," + userId + ")";
                                                let statusResult = yield query(statusSql);
                                                let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                                                let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                                                let chageStatusResult = yield query(chageStatusSql, customerLoanId);
                                                let loancompleteSql = "UPDATE loancompletescreenhistory SET isCompleted=true WHERE customerLoanId=" + customerLoanId;
                                                let loanCompleteResult = yield query(loancompleteSql);
                                                objResult = { "loanStatusName": "PENDING" };
                                            }
                                        }
                                        if (!sendRes) {
                                            sendRes = true;
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                            return res.status(200).send(successResult);
                                        }
                                    }
                                    else {
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Document Uploaded', response, 1);
                                        return res.status(200).send(successResult);
                                    }
                                }
                            }));
                            if (isErr) {
                                break;
                            }
                        }
                    }
                    if (ids && ids.length > 0) {
                        for (let i = 0; i < ids.length; i++) {
                            let deleteSql = `DELETE FROM customerloandocuments WHERE id = ?`;
                            let deleteResult = yield query(deleteSql, ids[i]);
                        }
                    }
                }
                else {
                    if (req.body.loanReferences && req.body.loanReferences.length > 0) {
                        for (let j = 0; j < req.body.loanReferences.length; j++) {
                            if (req.body.loanReferences[j] && req.body.loanReferences[j].loanReferenceId) {
                                let refSql = `UPDATE customerloanreferences SET customerLoanId=` + customerLoanId + `,fullName='` + req.body.loanReferences[j].name + `',
                                contactNo='` + req.body.loanReferences[j].contactNo + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE id = ` + req.body.loanReferences[j].loanReferenceId;
                                //VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                let refResult = yield query(refSql);
                                let refAddressSql = `UPDATE  customerreferenceaddresses SET label ='` + req.body.loanReferences[j].label + `',addressLine1='` + req.body.loanReferences[j].addressLine1 + `',addressLine2='` + req.body.loanReferences[j].addressLine2 + `',pincode='` + req.body.loanReferences[j].pincode + `',cityId=` + req.body.loanReferences[j].cityId + `,city='` + req.body.loanReferences[j].city + `',district='` + req.body.loanReferences[j].district + `',state='` + req.body.loanReferences[j].state + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE customerLoanReferenceId = ` + req.body.loanReferences[j].loanReferenceId;
                                let refAddressResult = yield query(refAddressSql);
                                if (refResult && refResult.affectedRows > 0) {
                                    response.push(refResult);
                                }
                                else {
                                    //
                                }
                            }
                            else {
                                let refSql = `INSERT INTO customerloanreferences(customerLoanId,fullName,contactNo,createdBy,modifiedBy)
                                VALUES(` + customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                let refResult = yield query(refSql);
                                let insertedId = refResult.insertId;
                                let refAddressSql = `INSERT INTO customerreferenceaddresses(customerLoanReferenceId,addressTypeId,label,addressLine1,addressLine2,pincode,cityId,city,district,state,createdBy,modifiedBy) VALUES(` + insertedId + `,` + 1 + `,'` + req.body.loanReferences[j].label + `','` + req.body.loanReferences[j].addressLine1 + `','` + req.body.loanReferences[j].addressLine2 + `','` + req.body.loanReferences[j].pincode + `',` + req.body.loanReferences[j].cityId + `,'` + req.body.loanReferences[j].city + `','` + req.body.loanReferences[j].district + `','` + req.body.loanReferences[j].state + `',` + userId + `,` + userId + `)`;
                                let refAddressResult = yield query(refAddressSql);
                                if (refResult && refResult.affectedRows > 0) {
                                    response.push(refResult);
                                }
                                else {
                                    //
                                }
                            }
                        }
                        let loanStatusId;
                        let pendingSeatus = yield query("SELECT id FROM loanstatuses WHERE status = 'PENDING'");
                        if (pendingSeatus && pendingSeatus.lengt > 0) {
                            loanStatusId = pendingSeatus[0].id;
                            let statusSql = "INSERT INTO customerloanstatushistory(customerloanId,loanStatusId,createdBy,modifiedBy) VALUES(" + customerLoanId + "," + loanStatusId + "," + userId + "," + userId + ")";
                            let statusResult = yield query(statusSql);
                            let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                            let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                            let chageStatusResult = yield query(chageStatusSql, customerLoanId);
                            if (chageStatusResult) {
                                //
                            }
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Document Uploaded', response, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.uploadPersonalLoanDocumentAndReference()', error, '');
        next(errorResult);
    }
});
const changeEmploymentType = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['customerLoanId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `UPDATE loancompletescreenhistory SET isCompleted = false,completeScreen = 5 WHERE customerLoanId = ?`;
                let result = yield query(sql, req.body.customerLoanId);
                let historysql = `DELETE FROM  customerloanstatushistory WHERE customerLoanId = ?`;
                let historyResult = yield query(historysql, req.body.customerLoanId);
                let customerLoanSql = `UPDATE customerloans SET statusId = NULL,loanTransactionDate = NULL WHERE id = ?`;
                let customerLoanResult = yield query(customerLoanSql, req.body.customerLoanId);
                if (customerLoanResult && customerLoanResult.affectedRows >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Change Employment Type', customerLoanResult, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.changeEmploymentType() Error", customerLoanResult, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.changeEmploymentType() Exception', error, '');
        next(errorResult);
    }
});
const acceptLoanOffer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['bankOfferId', 'isAccept'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            let status = req.body.status ? req.body.status : '';
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminAcceptOffer(` + req.body.bankOfferId + `,` + req.body.isAccept + `,` + authorizationResult.currentUser.id + `,'` + status + `',` + req.body.customerLoanId + `)`;
                let result = yield query(sql);
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                let customerUserIdResult = yield query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = yield query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                let partnerUserIdResult = yield query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = yield query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let service = yield query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id =? `, req.body.customerLoanId);
                let title = "Loan Status Change";
                let description = "Loan SANCTIONED";
                var dataBody = {
                    type: 3,
                    id: req.body.customerLoanId,
                    title: title,
                    message: description,
                    json: null,
                    dateTime: null,
                    customerLoanId: req.body.customerLoanId,
                    loanType: service[0].name,
                    creditCardId: null,
                    creditCardStatus: null
                };
                if (customerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                    VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                    let notificationResult = yield query(notificationSql);
                    yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                }
                if (partnerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                    VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                    let notificationResult = yield query(notificationSql);
                    yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                    console.log("notification", notificationResult);
                }
                if (result && result.affectedRows >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Accept Offer Successfully', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.acceptLoanOffer() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.acceptLoanOffer() Exception', error, '');
        next(errorResult);
    }
});
const disbursedApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['customerLoanId', 'bankId', 'amountDisbursed'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            let status = req.body.status ? req.body.status : '';
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId;
                try {
                    //#region notification
                    let customerFcm = "";
                    let customerUserId = null;
                    let partnerFcm = "";
                    let partnerUserId = null;
                    try {
                        let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + customerLoanId + ")";
                        let customerUserIdResult = yield query(customerUserIdSql);
                        if (customerUserIdResult && customerUserIdResult.length > 0) {
                            customerUserId = customerUserIdResult[0].userId;
                            let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let customerFcmResult = yield query(customerFcmSql);
                            if (customerFcmResult && customerFcmResult.length > 0) {
                                customerFcm = customerFcmResult[0].fcmToken;
                            }
                        }
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + customerLoanId + ")";
                        let partnerUserIdResult = yield query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = yield query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }
                        let service = yield query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id =? `, customerLoanId);
                        let title = "Loan Status Change";
                        let description = "Loan Disbursed";
                        var dataBody = {
                            type: 4,
                            id: customerLoanId,
                            title: title,
                            message: description,
                            json: null,
                            dateTime: null,
                            customerLoanId: customerLoanId,
                            loanType: service[0].name,
                            creditCardId: null,
                            creditCardStatus: null
                        };
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(` + customerUserId + `, 4, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([customerFcm], 4, customerLoanId, title, description, '', null, null, customerLoanId, service[0].name, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(` + partnerUserId + `, 4, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([partnerFcm], 4, customerLoanId, title, description, '', null, null, customerLoanId, service[0].name, null, null);
                        }
                    }
                    catch (error) {
                        let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.notificationError() Error", 'last Invoice Error', '');
                        next(errorResult);
                    }
                    try {
                        let getPartnerSql = "SELECT * FROM partners where userId = (select createdBy from customerloans where id = " + customerLoanId + ")";
                        let getPartnerResult = yield query(getPartnerSql);
                        console.log("getPartnerResult", getPartnerResult);
                        let getRoleSql = "select * from roles where id = (select roleId from userroles where userId = (select createdBy from customerloans where id = " + customerLoanId + "))";
                        let getRoleResult = yield query(getRoleSql);
                        if (getRoleResult && getRoleResult.length > 0) {
                            if (getRoleResult[0].name == 'ADMINISTRATOR' || getRoleResult[0].name == 'CUSTOMERS') {
                                //Admin Commission
                                try {
                                    let getAdminCommissionSql = "SELECT * FROM bankloancommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId;
                                    let getAdminCommissionResult = yield query(getAdminCommissionSql);
                                    if (getAdminCommissionResult && getAdminCommissionResult.length > 0) {
                                        let getAdminUserSql = "select * from users where id IN(select userId from userroles where roleId IN(1)) and isDisabled = 0;";
                                        let getAdminUserResult = yield query(getAdminUserSql);
                                        if (getAdminUserResult && getAdminUserResult.length > 0) {
                                            let checkadminCommissionSql = "SELECT * FROM admincommission WHERE userId = " + getAdminUserResult[0].id;
                                            let checkadminCommissionResult = yield query(checkadminCommissionSql);
                                            if (checkadminCommissionResult && checkadminCommissionResult.length > 0) {
                                                // update
                                                let commission = 0;
                                                commission = parseFloat((req.body.amountDisbursed * getAdminCommissionResult[0].commission / 100).toFixed(2));
                                                try {
                                                    let updateAdminCommissionSql = `UPDATE admincommission SET commission = commission + ` + commission + ` WHERE id = ` + checkadminCommissionResult[0].id;
                                                    let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                        try {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkadminCommissionResult[0].id + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + commission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                        }
                                                        catch (error) {
                                                            let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                            next(errorResult);
                                                        }
                                                    }
                                                }
                                                catch (error) {
                                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                    next(errorResult);
                                                }
                                            }
                                            else {
                                                //insert
                                                let commission = 0;
                                                commission = parseFloat((req.body.amountDisbursed * getAdminCommissionResult[0].commission / 100).toFixed(2));
                                                try {
                                                    let insertAdminCommissionSql = `INSERT INTO admincommission(userId, commission, createdBy, modifiedBy) VALUES(` + getAdminUserResult[0].id + `, ` + commission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                    let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                    if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                        try {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + commission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                        }
                                                        catch (error) {
                                                            let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                            next(errorResult);
                                                        }
                                                    }
                                                }
                                                catch (error) {
                                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                    next(errorResult);
                                                }
                                            }
                                        }
                                    }
                                }
                                catch (error) {
                                    let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.generationAdminCommission() Error", 'Generating adminCommission Error', '');
                                    next(errorResult);
                                }
                            }
                            //Admin and Partner Commission Chain
                            else {
                                let getAdminCommissionSql = "SELECT * FROM bankloancommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId;
                                let getAdminCommissionResult = yield query(getAdminCommissionSql);
                                if (getAdminCommissionResult && getAdminCommissionResult.length > 0) {
                                    let getAdminUserSql = "select * from users where id IN(select userId from userroles where roleId IN(1)) and isDisabled = 0;";
                                    let getAdminUserResult = yield query(getAdminUserSql);
                                    if (getAdminUserResult && getAdminUserResult.length > 0) {
                                        //                         //#region PartnerCommission
                                        let totalCommission = 0;
                                        let adminCommission = 0;
                                        let dsaCommission = 0;
                                        let subdsaCommission = 0;
                                        let employeeCommission = 0;
                                        let connectorCommission = 0;
                                        totalCommission = parseFloat((req.body.amountDisbursed * getAdminCommissionResult[0].commission / 100).toFixed(2));
                                        if (getRoleResult[0].name == 'EMPLOYEE' || getRoleResult[0].name == 'CONNECTOR') {
                                            if (getRoleResult[0].name == 'EMPLOYEE') {
                                                let checkTeamPartnerSql = "SELECT * FROM partnerteams WHERE teamPartnerId = " + getPartnerResult[0].id;
                                                let checkTeamPartnerResult = yield query(checkTeamPartnerSql);
                                                if (checkTeamPartnerResult && checkTeamPartnerResult.length > 0) {
                                                    //Employee is in network
                                                    let checkSubDsaSql = "SELECT parentPartnerId FROM partners WHERE id = " + checkTeamPartnerResult[0].partnerId;
                                                    let checkSubDsaResult = yield query(checkSubDsaSql);
                                                    if (checkSubDsaResult && checkSubDsaResult.length > 0) {
                                                        // checkTeamPartnerResult[0].partnerId is Sub DSA
                                                        try {
                                                            let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                            let dsaCommissionResult = yield query(dsaCommissionSql);
                                                            if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                                let dsaCommPer = 0;
                                                                if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                    //                                                 //Sitewide Flat Commission
                                                                    dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                                }
                                                                else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                    //LoanWise Flat Commission          
                                                                    dsaCommPer = dsaCommissionResult[0].commission;
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                                }
                                                                let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                                let checkdsaCommissionResult = yield query(checkdsaCommissionSql);
                                                                if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                    //update
                                                                    let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                    let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    }
                                                                }
                                                                else {
                                                                    //insert
                                                                    try {
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkTeamPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    catch (error) {
                                                                        let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.notificationError() Error", 'last Invoice Error', '');
                                                                        next(errorResult);
                                                                    }
                                                                }
                                                                let subdsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                let subdsaCommissionResult = yield query(subdsaCommissionSql);
                                                                if (subdsaCommissionResult && subdsaCommissionResult.length > 0) {
                                                                    let subdsaCommPer = 0;
                                                                    if (subdsaCommissionResult[0].commissionTypeId == 2) {
                                                                        //Sitewide Flat Commission
                                                                        subdsaCommPer = parseFloat((dsaCommPer * subdsaCommissionResult[0].commission / 100).toFixed(2));
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));
                                                                    }
                                                                    else if (subdsaCommissionResult[0].commissionTypeId == 3) {
                                                                        //LoanWise Flat Commission          
                                                                        subdsaCommPer = subdsaCommissionResult[0].commission;
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));
                                                                    }
                                                                    let checksubdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                    let checksubdsaCommissionResult = yield query(checksubdsaCommissionSql);
                                                                    if (checksubdsaCommissionResult && checksubdsaCommissionResult.length > 0) {
                                                                        //update
                                                                        let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + subdsaCommission + ` WHERE id = ` + checksubdsaCommissionResult[0].id;
                                                                        let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                        if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checksubdsaCommissionResult[0].id + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    else {
                                                                        //insert
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkSubDsaResult[0].parentPartnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                                    let employeeCommissionResult = yield query(employeeCommissionSql);
                                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                            //                                                         //Sitewide Flat Commission
                                                                            let commPer = parseFloat((subdsaCommPer * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                                        }
                                                                        else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                            //LoanWise Flat Commission          
                                                                            let commPer = employeeCommissionResult[0].commission;
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                                        }
                                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                                        let checkemployeeCommissionResult = yield query(checkemployeeCommissionSql);
                                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                            //update
                                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                            let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        }
                                                                        else {
                                                                            //insert
                                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        catch (error) {
                                                        }
                                                    }
                                                    else {
                                                        let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                        let employeeCommissionResult = yield query(employeeCommissionSql);
                                                        if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                            if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                //                                                     //Sitewide Flat Commission
                                                                let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                            }
                                                            else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                     //LoanWise Flat Commission          
                                                                let commPer = employeeCommissionResult[0].commission;
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                            }
                                                            let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                            let checkemployeeCommissionResult = yield query(checkemployeeCommissionSql);
                                                            console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                            if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                //                                                     //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    //                                                        
                                                                }
                                                            }
                                                            else {
                                                                //                                                     //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                }
                                                            }
                                                        }
                                                        //checkTeamPartnerResult[0].partnerId is DSA
                                                        let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                        let dsaCommissionResult = yield query(dsaCommissionSql);
                                                        if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                            let dsaCommPer = 0;
                                                            if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                //Sitewide Flat Commission
                                                                dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                            }
                                                            else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                 //LoanWise Flat Commission          
                                                                dsaCommPer = dsaCommissionResult[0].commission;
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                            }
                                                            let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                            let checkdsaCommissionResult = yield query(checkdsaCommissionSql);
                                                            console.log("checkdsaCommissionResult", checkdsaCommissionResult);
                                                            if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    //                                                   
                                                                }
                                                            }
                                                            else {
                                                                //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkTeamPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    //                                                     
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                    let employeeCommissionResult = yield query(employeeCommissionSql);
                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                            //Sitewide Flat Commission
                                                            let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }
                                                        else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                            //LoanWise Flat Commission          
                                                            let commPer = employeeCommissionResult[0].commission;
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }
                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                        let checkemployeeCommissionResult = yield query(checkemployeeCommissionSql);
                                                        console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                            //update
                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                            let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                //                                                         
                                                            }
                                                        }
                                                        else {
                                                            //insert
                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                            }
                                                        }
                                                    }
                                                }
                                                adminCommission = totalCommission - dsaCommission - subdsaCommission - employeeCommission;
                                            }
                                            if (getRoleResult[0].name == 'CONNECTOR') {
                                                let checkNetworkPartnerSql = "SELECT * FROM partnernetworks WHERE networkPartnerId = " + getPartnerResult[0].id;
                                                let checkNetworkPartnerResult = yield query(checkNetworkPartnerSql);
                                                if (checkNetworkPartnerResult && checkNetworkPartnerResult.length > 0) {
                                                    //Employee is in network
                                                    let checkSubDsaSql = "SELECT parentPartnerId FROM partners WHERE id = " + checkNetworkPartnerResult[0].partnerId;
                                                    let checkSubDsaResult = yield query(checkSubDsaSql);
                                                    if (checkSubDsaResult && checkSubDsaResult.length > 0) {
                                                        // checkTeamPartnerResult[0].partnerId is Sub DSA
                                                        try {
                                                            let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                            let dsaCommissionResult = yield query(dsaCommissionSql);
                                                            if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                                let dsaCommPer = 0;
                                                                if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                    //                                                 //Sitewide Flat Commission
                                                                    dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                                }
                                                                else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                    //LoanWise Flat Commission          
                                                                    dsaCommPer = dsaCommissionResult[0].commission;
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                                }
                                                                let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                                let checkdsaCommissionResult = yield query(checkdsaCommissionSql);
                                                                if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                    //update
                                                                    let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                    let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    }
                                                                }
                                                                else {
                                                                    //insert
                                                                    try {
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkNetworkPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    catch (error) {
                                                                        let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.insertCommission() Error", 'last Invoice Error', '');
                                                                        next(errorResult);
                                                                    }
                                                                }
                                                                let subdsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                let subdsaCommissionResult = yield query(subdsaCommissionSql);
                                                                if (subdsaCommissionResult && subdsaCommissionResult.length > 0) {
                                                                    let subdsaCommPer = 0;
                                                                    if (subdsaCommissionResult[0].commissionTypeId == 2) {
                                                                        //Sitewide Flat Commission
                                                                        subdsaCommPer = parseFloat((dsaCommPer * subdsaCommissionResult[0].commission / 100).toFixed(2));
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));
                                                                    }
                                                                    else if (subdsaCommissionResult[0].commissionTypeId == 3) {
                                                                        //LoanWise Flat Commission          
                                                                        subdsaCommPer = subdsaCommissionResult[0].commission;
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));
                                                                    }
                                                                    let checksubdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                    let checksubdsaCommissionResult = yield query(checksubdsaCommissionSql);
                                                                    if (checksubdsaCommissionResult && checksubdsaCommissionResult.length > 0) {
                                                                        //update
                                                                        let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + subdsaCommission + ` WHERE id = ` + checksubdsaCommissionResult[0].id;
                                                                        let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                        if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checksubdsaCommissionResult[0].id + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    else {
                                                                        //insert
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkSubDsaResult[0].parentPartnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                                    let employeeCommissionResult = yield query(employeeCommissionSql);
                                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                            //                                                         //Sitewide Flat Commission
                                                                            let commPer = parseFloat((subdsaCommPer * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                                        }
                                                                        else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                            //LoanWise Flat Commission          
                                                                            let commPer = employeeCommissionResult[0].commission;
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                                        }
                                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                                        let checkemployeeCommissionResult = yield query(checkemployeeCommissionSql);
                                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                            //update
                                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                            let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        }
                                                                        else {
                                                                            //insert
                                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        catch (error) {
                                                        }
                                                    }
                                                    else {
                                                        let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                        let employeeCommissionResult = yield query(employeeCommissionSql);
                                                        if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                            if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                //                                                     //Sitewide Flat Commission
                                                                let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                            }
                                                            else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                     //LoanWise Flat Commission          
                                                                let commPer = employeeCommissionResult[0].commission;
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                            }
                                                            let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                            let checkemployeeCommissionResult = yield query(checkemployeeCommissionSql);
                                                            console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                            if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                //                                                     //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    //                                                        
                                                                }
                                                            }
                                                            else {
                                                                //                                                     //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                }
                                                            }
                                                        }
                                                        //checkTeamPartnerResult[0].partnerId is DSA
                                                        let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                        let dsaCommissionResult = yield query(dsaCommissionSql);
                                                        if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                            let dsaCommPer = 0;
                                                            if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                //Sitewide Flat Commission
                                                                dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                            }
                                                            else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                 //LoanWise Flat Commission          
                                                                dsaCommPer = dsaCommissionResult[0].commission;
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                            }
                                                            let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                            let checkdsaCommissionResult = yield query(checkdsaCommissionSql);
                                                            console.log("checkdsaCommissionResult", checkdsaCommissionResult);
                                                            if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    //                                                   
                                                                }
                                                            }
                                                            else {
                                                                //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkNetworkPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                    //                                                     
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else {
                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                    let employeeCommissionResult = yield query(employeeCommissionSql);
                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                            //Sitewide Flat Commission
                                                            let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }
                                                        else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                            //LoanWise Flat Commission          
                                                            let commPer = employeeCommissionResult[0].commission;
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }
                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                        let checkemployeeCommissionResult = yield query(checkemployeeCommissionSql);
                                                        console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                            //update
                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                            let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                                //                                                         
                                                            }
                                                        }
                                                        else {
                                                            //insert
                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                            }
                                                        }
                                                    }
                                                }
                                                adminCommission = totalCommission - dsaCommission - subdsaCommission - employeeCommission;
                                            }
                                        }
                                        if (getRoleResult[0].name == 'SUBDSA') {
                                            //SubDSA
                                            let checkNetworkPartnerSql = "SELECT * FROM partnernetworks WHERE networkPartnerId = " + getPartnerResult[0].id;
                                            let checkNetworkPartnerResult = yield query(checkNetworkPartnerSql);
                                            if (checkNetworkPartnerResult && checkNetworkPartnerResult.length > 0) {
                                                let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                let dsaCommissionResult = yield query(dsaCommissionSql);
                                                console.log("dsaCommissionResult", dsaCommissionResult);
                                                if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                    let dsaCommPer = 0;
                                                    if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                        //Sitewide Flat Commission
                                                        dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                        dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                    }
                                                    else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                        //LoanWise Flat Commission          
                                                        dsaCommPer = dsaCommissionResult[0].commission;
                                                        dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                    }
                                                    let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                    let checkdsaCommissionResult = yield query(checkdsaCommissionSql);
                                                    if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                        //update
                                                        let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                        let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                        if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                        }
                                                    }
                                                    else {
                                                        //insert
                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkNetworkPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                        }
                                                    }
                                                    let subdsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                    let subdsaCommissionResult = yield query(subdsaCommissionSql);
                                                    if (subdsaCommissionResult && subdsaCommissionResult.length > 0) {
                                                        if (subdsaCommissionResult[0].commissionTypeId == 2) {
                                                            //Sitewide Flat Commission
                                                            let commPer = parseFloat((dsaCommPer * subdsaCommissionResult[0].commission / 100).toFixed(2));
                                                            subdsaCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }
                                                        else if (subdsaCommissionResult[0].commissionTypeId == 3) {
                                                            //LoanWise Flat Commission          
                                                            let commPer = subdsaCommissionResult[0].commission;
                                                            subdsaCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }
                                                        let checksubdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                        let checksubdsaCommissionResult = yield query(checksubdsaCommissionSql);
                                                        if (checksubdsaCommissionResult && checksubdsaCommissionResult.length > 0) {
                                                            //update
                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + subdsaCommission + ` WHERE id = ` + checksubdsaCommissionResult[0].id;
                                                            let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checksubdsaCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                            }
                                                        }
                                                        else {
                                                            //insert
                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            adminCommission = totalCommission - dsaCommission - subdsaCommission;
                                        }
                                        else {
                                            let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                            let dsaCommissionResult = yield query(dsaCommissionSql);
                                            if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                let dsaCommPer = 0;
                                                if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                    //Sitewide Flat Commission
                                                    dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                }
                                                else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                    //                                         //LoanWise Flat Commission          
                                                    dsaCommPer = dsaCommissionResult[0].commission;
                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                }
                                                let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                let checkdsaCommissionResult = yield query(checkdsaCommissionSql);
                                                if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                    //update
                                                    let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                    let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                                    console.log(updateAdminCommissionResult);
                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                    }
                                                }
                                                else {
                                                    //                                         //insert
                                                    let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                    let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                                    if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                                        //                                            
                                                    }
                                                }
                                            }
                                            //}
                                            adminCommission = totalCommission - dsaCommission;
                                        }
                                        //#endregion PartnerCommission
                                        let checkadminCommissionSql = "SELECT * FROM admincommission WHERE userId = " + getAdminUserResult[0].id;
                                        let checkadminCommissionResult = yield query(checkadminCommissionSql);
                                        if (checkadminCommissionResult && checkadminCommissionResult.length > 0) {
                                            // update
                                            let updateAdminCommissionSql = `UPDATE admincommission SET commission = commission + ` + adminCommission + ` WHERE id = ` + checkadminCommissionResult[0].id;
                                            let updateAdminCommissionResult = yield query(updateAdminCommissionSql);
                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows > 0) {
                                                let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkadminCommissionResult[0].id + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + adminCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                            }
                                        }
                                        else {
                                            //insert
                                            let commission = 0;
                                            commission = parseFloat((req.body.amountDisbursed * getAdminCommissionResult[0].commission / 100).toFixed(2));
                                            let insertAdminCommissionSql = `INSERT INTO admincommission(userId, commission, createdBy, modifiedBy) VALUES(` + getAdminUserResult[0].id + `, ` + commission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                            let insertAdminCommissionResult = yield query(insertAdminCommissionSql);
                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + commission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                let insertAdminCommissionHistoryResult = yield query(insertAdminCommissionHistorySql);
                                            }
                                        }
                                    }
                                }
                            }
                            let idResult = yield query(`SELECT statusId FROM customerloans WHERE id = ? `, req.body.customerLoanId);
                            if (idResult[0].statusId != 8) {
                                let insertQueryResult = yield query(`INSERT INTO customerloanstatushistory (customerLoanId,loanStatusId,transactionDate,createdBy,modifiedBy) VALUES (` + req.body.customerLoanId + `,` + `8,CURRENT_TIMESTAMP(),` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`);
                                if (insertQueryResult && insertQueryResult.affectedRows >= 0) {
                                    let updateSqlResult = yield query(`UPDATE customerloans SET statusId = 8,modifiedDate = CURRENT_TIMESTAMP(),modifiedBy = ` + authorizationResult.currentUser.id + ` WHERE id =?`, req.body.customerLoanId);
                                    if (updateSqlResult && updateSqlResult.length > 0) {
                                        try {
                                            let rewardResult = yield rewardCoin(req.body.customerLoanId, authorizationResult, getRoleResult[0].id);
                                        }
                                        catch (error) {
                                            let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.acceptLoanOffer() Error", error, '');
                                            next(errorResult);
                                        }
                                    }
                                }
                            }
                        }
                        let result;
                        try {
                            let sql = `CALL adminAcceptOffer(` + req.body.id + `,` + req.body.isAccept + `,` + authorizationResult.currentUser.id + `,'DISBURSED',` + req.body.customerLoanId + `)`;
                            result = yield query(sql);
                            if (result && result.affectedRows >= 0) {
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Accept Offer Successfully', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.acceptLoanOffer() Error", result, '');
                                next(errorResult);
                            }
                        }
                        catch (error) {
                            let errorResult = new resulterror_1.ResultError(400, true, "personalLoan.acceptLoanOffer() Error", result, '');
                            next(errorResult);
                        }
                    }
                    catch (error) {
                        let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                        next(errorResult);
                    }
                }
                catch (error) {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                    next(errorResult);
                }
            }
            //#endregion notification
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoan.acceptLoanOffer() Exception', error, '');
        next(errorResult);
    }
});
const insertLoanDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Personal Loan Detail');
        var requiredFields = ['customerLoanId', 'emi', 'tenure', 'bankId', 'ROI', 'refrenceNo', 'amountDisbursed'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId;
                let id = req.body.id ? req.body.id : 0;
                let isShared = req.body.isShared ? req.body.isShared : false;
                let result;
                if (req.body.termsCondition) {
                    if (req.body.termsCondition.includes("https:")) {
                        let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + req.body.termsCondition + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;
                        result = yield query(sql);
                        if (result && result[1].affectedRows >= 0) {
                            let customerFcm = "";
                            let customerUserId = null;
                            let partnerFcm = "";
                            let partnerUserId = null;
                            let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                            let customerUserIdResult = yield query(customerUserIdSql);
                            if (customerUserIdResult && customerUserIdResult.length > 0) {
                                customerUserId = customerUserIdResult[0].userId;
                                let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                let customerFcmResult = yield query(customerFcmSql);
                                if (customerFcmResult && customerFcmResult.length > 0) {
                                    customerFcm = customerFcmResult[0].fcmToken;
                                }
                            }
                            let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                            let partnerUserIdResult = yield query(partnerUserIdSql);
                            if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                partnerUserId = partnerUserIdResult[0].userId;
                                let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                let partnerFcmResult = yield query(partnerFcmSql);
                                if (partnerFcmResult && partnerFcmResult.length > 0) {
                                    partnerFcm = partnerFcmResult[0].fcmToken;
                                }
                            }
                            let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                            let statusResult = yield query(statusSql);
                            let title = "Loan Status Change";
                            let description = (statusResult && statusResult.length > 0) ? "Status Change to " + statusResult[0].status : "Loan Status Change";
                            var dataBody = {
                                type: 3,
                                id: req.body.customerLoanId,
                                title: title,
                                message: description,
                                json: null,
                                dateTime: null,
                                customerLoanId: null,
                                loanType: null,
                                creditCardId: null,
                                creditCardStatus: null
                            };
                            if (customerFcm) {
                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                let notificationResult = yield query(notificationSql);
                                yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                            }
                            if (partnerFcm) {
                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                let notificationResult = yield query(notificationSql);
                                yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                            }
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                            return res.status(200).send(successResult);
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", result, '');
                            next(errorResult);
                        }
                    }
                    else {
                        if (req.body.id) {
                            let checkUrlSql = `SELECT termsCondition from customerloandetail WHERE id = ` + req.body.id;
                            let checkUrlResult = yield query(checkUrlSql);
                            if (checkUrlResult && checkUrlResult.length > 0) {
                                if (checkUrlResult[0].termsCondition) {
                                    let splt = checkUrlResult[0].termsCondition.split("/");
                                    const delResp = yield S3.deleteObject({
                                        Bucket: 'loan-termscondition',
                                        Key: splt[splt.length - 1],
                                    }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                        if (err) {
                                            console.log("Error: Object delete failed.");
                                            let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                            next(errorResult);
                                        }
                                        else {
                                            let contentType;
                                            contentType = 'application/pdf';
                                            let fileExt = contentType.split("/")[1].split("+")[0];
                                            let buf = Buffer.from(req.body.termsCondition, 'base64');
                                            let keyName = ("termsCondition" + req.body.customerLoanId).replace(" ", "_");
                                            let params = {
                                                Bucket: 'loan-termscondition',
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
                                                let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + data.Location + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;
                                                result = yield query(sql);
                                                if (result && result[1].affectedRows >= 0) {
                                                    let customerFcm = "";
                                                    let customerUserId = null;
                                                    let partnerFcm = "";
                                                    let partnerUserId = null;
                                                    let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                                                    let customerUserIdResult = yield query(customerUserIdSql);
                                                    if (customerUserIdResult && customerUserIdResult.length > 0) {
                                                        customerUserId = customerUserIdResult[0].userId;
                                                        let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                        let customerFcmResult = yield query(customerFcmSql);
                                                        if (customerFcmResult && customerFcmResult.length > 0) {
                                                            customerFcm = customerFcmResult[0].fcmToken;
                                                        }
                                                    }
                                                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                                                    let partnerUserIdResult = yield query(partnerUserIdSql);
                                                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                                        partnerUserId = partnerUserIdResult[0].userId;
                                                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                        let partnerFcmResult = yield query(partnerFcmSql);
                                                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                                                            partnerFcm = partnerFcmResult[0].fcmToken;
                                                        }
                                                    }
                                                    let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                                                    let statusResult = yield query(statusSql);
                                                    let title = "Loan Status Change";
                                                    let description = (statusResult && statusResult.length > 0) ? "Status Change to " + statusResult[0].status : "Loan Status Change";
                                                    var dataBody = {
                                                        type: 3,
                                                        id: req.body.customerLoanId,
                                                        title: title,
                                                        message: description,
                                                        json: null,
                                                        dateTime: null,
                                                        customerLoanId: null,
                                                        loanType: null,
                                                        creditCardId: null,
                                                        creditCardStatus: null
                                                    };
                                                    if (customerFcm) {
                                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let notificationResult = yield query(notificationSql);
                                                        yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                                    }
                                                    if (partnerFcm) {
                                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let notificationResult = yield query(notificationSql);
                                                        yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                                    }
                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                                                    return res.status(200).send(successResult);
                                                }
                                                else {
                                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                    next(errorResult);
                                                }
                                            }));
                                        }
                                    }));
                                }
                                else {
                                    let contentType;
                                    contentType = 'application/pdf';
                                    let fileExt = contentType.split("/")[1].split("+")[0];
                                    let buf = Buffer.from(req.body.termsCondition, 'base64');
                                    let keyName = ("termsCondition" + req.body.customerLoanId).replace(" ", "_");
                                    let params = {
                                        Bucket: 'loan-termscondition',
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
                                        let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + data.Location + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;
                                        result = yield query(sql);
                                        if (result && result[1].affectedRows >= 0) {
                                            let customerFcm = "";
                                            let customerUserId = null;
                                            let partnerFcm = "";
                                            let partnerUserId = null;
                                            let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                                            let customerUserIdResult = yield query(customerUserIdSql);
                                            if (customerUserIdResult && customerUserIdResult.length > 0) {
                                                customerUserId = customerUserIdResult[0].userId;
                                                let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                let customerFcmResult = yield query(customerFcmSql);
                                                if (customerFcmResult && customerFcmResult.length > 0) {
                                                    customerFcm = customerFcmResult[0].fcmToken;
                                                }
                                            }
                                            let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                                            let partnerUserIdResult = yield query(partnerUserIdSql);
                                            if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                                partnerUserId = partnerUserIdResult[0].userId;
                                                let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                let partnerFcmResult = yield query(partnerFcmSql);
                                                if (partnerFcmResult && partnerFcmResult.length > 0) {
                                                    partnerFcm = partnerFcmResult[0].fcmToken;
                                                }
                                            }
                                            let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                                            let statusResult = yield query(statusSql);
                                            let title = "Loan Status Change";
                                            let description = (statusResult && statusResult.length > 0) ? "Status Change to " + statusResult[0].status : "Loan Status Change";
                                            var dataBody = {
                                                type: 3,
                                                id: req.body.customerLoanId,
                                                title: title,
                                                message: description,
                                                json: null,
                                                dateTime: null,
                                                customerLoanId: null,
                                                loanType: null,
                                                creditCardId: null,
                                                creditCardStatus: null
                                            };
                                            if (customerFcm) {
                                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                let notificationResult = yield query(notificationSql);
                                                yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                            }
                                            if (partnerFcm) {
                                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                let notificationResult = yield query(notificationSql);
                                                yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                            }
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                                            return res.status(200).send(successResult);
                                        }
                                        else {
                                            let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                            next(errorResult);
                                        }
                                    }));
                                }
                            }
                        }
                        else {
                            let contentType;
                            contentType = 'application/pdf';
                            let fileExt = contentType.split("/")[1].split("+")[0];
                            let buf = Buffer.from(req.body.termsCondition, 'base64');
                            let keyName = ("termsCondition" + req.body.customerLoanId).replace(" ", "_");
                            let params = {
                                Bucket: 'loan-termscondition',
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
                                let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + data.Location + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;
                                result = yield query(sql);
                                if (result && result[1].affectedRows >= 0) {
                                    let customerFcm = "";
                                    let customerUserId = null;
                                    let partnerFcm = "";
                                    let partnerUserId = null;
                                    let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                                    let customerUserIdResult = yield query(customerUserIdSql);
                                    if (customerUserIdResult && customerUserIdResult.length > 0) {
                                        customerUserId = customerUserIdResult[0].userId;
                                        let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                        let customerFcmResult = yield query(customerFcmSql);
                                        if (customerFcmResult && customerFcmResult.length > 0) {
                                            customerFcm = customerFcmResult[0].fcmToken;
                                        }
                                    }
                                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                                    let partnerUserIdResult = yield query(partnerUserIdSql);
                                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                        partnerUserId = partnerUserIdResult[0].userId;
                                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                        let partnerFcmResult = yield query(partnerFcmSql);
                                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                                            partnerFcm = partnerFcmResult[0].fcmToken;
                                        }
                                    }
                                    let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                                    let statusResult = yield query(statusSql);
                                    let title = "Loan Status Change";
                                    let description = (statusResult && statusResult.length > 0) ? "Status Change to " + statusResult[0].status : "Loan Status Change";
                                    var dataBody = {
                                        type: 3,
                                        id: req.body.customerLoanId,
                                        title: title,
                                        message: description,
                                        json: null,
                                        dateTime: null,
                                        customerLoanId: null,
                                        loanType: null,
                                        creditCardId: null,
                                        creditCardStatus: null
                                    };
                                    if (customerFcm) {
                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                        let notificationResult = yield query(notificationSql);
                                        yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                    }
                                    if (partnerFcm) {
                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                        let notificationResult = yield query(notificationSql);
                                        yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                    }
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                    next(errorResult);
                                }
                            }));
                        }
                    }
                }
                else {
                    let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + '' + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;
                    result = yield query(sql);
                    if (result && result[1].affectedRows >= 0) {
                        let customerFcm = "";
                        let customerUserId = null;
                        let partnerFcm = "";
                        let partnerUserId = null;
                        let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                        let customerUserIdResult = yield query(customerUserIdSql);
                        if (customerUserIdResult && customerUserIdResult.length > 0) {
                            customerUserId = customerUserIdResult[0].userId;
                            let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let customerFcmResult = yield query(customerFcmSql);
                            if (customerFcmResult && customerFcmResult.length > 0) {
                                customerFcm = customerFcmResult[0].fcmToken;
                            }
                        }
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                        let partnerUserIdResult = yield query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = yield query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }
                        let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                        let statusResult = yield query(statusSql);
                        let title = "Loan Status Change";
                        let description = (statusResult && statusResult.length > 0) ? "Status Change to " + statusResult[0].status : "Loan Status Change";
                        var dataBody = {
                            type: 3,
                            id: req.body.customerLoanId,
                            title: title,
                            message: description,
                            json: null,
                            dateTime: null,
                            customerLoanId: null,
                            loanType: null,
                            creditCardId: null,
                            creditCardStatus: null
                        };
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(` + partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Loan Detail", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'personalLoans.insertLoanDetail() Exception', error, '');
        next(errorResult);
    }
});
exports.default = {
    getPersonalLoan, getPersonalLoanById, assignToRM, changeDocumentStatus, getOffer, insertSelectedOffer, insertUpdateCustomerLoanRejectionReason, insertUpdatePersonalLoanBasicDetail, insertUpdatePersonalLoanEmploymentDetail, updatePersonalLoanAmount, insertOffer, getLoanOffer, deleteLoanById, getTenure, uploadPersonalLoanDocumentAndReference, changeEmploymentType, acceptLoanOffer, disbursedApplication, insertLoanDetail
};
