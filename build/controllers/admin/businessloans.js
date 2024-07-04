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
const businessLoanDocumentResponse_1 = require("../../classes/output/loan/business loan/businessLoanDocumentResponse");
const adminBusinessLoanBasicDetailResponse_1 = require("../../classes/output/admin/loans/adminBusinessLoanBasicDetailResponse");
const adminBusinessLoanResponse_1 = require("../../classes/output/admin/loans/adminBusinessLoanResponse");
const adminBusinessLoanMoreBasicDetailResponse_1 = require("../../classes/output/admin/loans/adminBusinessLoanMoreBasicDetailResponse");
const adminLoanStatusResponse_1 = require("../../classes/output/admin/loans/adminLoanStatusResponse");
const adminPersonalloanDocumentsResponse_1 = require("../../classes/output/admin/loans/adminPersonalloanDocumentsResponse");
const adminLoanCompleteHistoryReponse_1 = require("../../classes/output/admin/loans/adminLoanCompleteHistoryReponse");
const adminGroupDetailResponse_1 = require("../../classes/output/admin/loans/adminGroupDetailResponse");
let connection = mysql.createConnection({
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
const getBusinessLoans = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48;
    try {
        logging_1.default.info(NAMESPACE, 'Getting Personal Loans');
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
                LEFT JOIN customers ON customers.id = customerloans.customerId
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
                if (req.body.customerId) {
                    sqlQuery += ` AND customerloans.customerId=` + req.body.customerId;
                }
                if (req.body.statusId) {
                    sqlQuery += ` AND customerloans.statusId=` + req.body.statusId;
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
                        let sql = `CALL adminGetBusinessLoans('` + ids.toString() + `')`;
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
                                        if (result[2].length > 0) {
                                            customerLoan[j].customerLoanBusinessDetails = result[2].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[3].length > 0) {
                                            customerLoan[j].customerLoanDocuments = result[3].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[4].length > 0) {
                                            customerLoan[j].customerLoanCompleteHistory = result[4].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[5].length > 0) {
                                            customerLoan[j].customerLoanStatusHistory = result[5].filter(c => c.customerloanId == customerLoan[j].id);
                                        }
                                        if (result[6].length > 0) {
                                            customerLoan[j].customerCurrentResidentDetail = result[6].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[7].length > 0) {
                                            customerLoan[j].offers = result[7].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[8].length > 0) {
                                            customerLoan[j].loanDetail = result[8].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[9].length > 0) {
                                            customerLoan[j].rejectionReason = result[9].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[10].length > 0) {
                                            customerLoan[j].reasons = result[10].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[11].length > 0) {
                                            customerLoan[j].partners = result[11].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[11].length > 0) {
                                            customerLoan[j].groupDetail = result[11].filter(c => c.customerLoanId == customerLoan[j].id);
                                        }
                                        if (result[12].length > 0) {
                                            customerLoan[j].loanTransferDetail = result[12].filter(c => c.customerLoanId == customerLoan[j].id);
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
                                        let basicDetail = new adminBusinessLoanBasicDetailResponse_1.AdminBusinessLoanBasicDetailResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo, (_a = obj[i].customerLoan[j]) === null || _a === void 0 ? void 0 : _a.employmentTypeId, (_b = obj[i].customerLoan[j]) === null || _b === void 0 ? void 0 : _b.employmentType, (_c = obj[i]) === null || _c === void 0 ? void 0 : _c.pincode, (_d = obj[i].customerLoan[j]) === null || _d === void 0 ? void 0 : _d.loanAmount, obj[i].customerLoan[j].id, (_f = (_e = obj[i].customerLoan[j]) === null || _e === void 0 ? void 0 : _e.customerLoanBusinessDetails[0]) === null || _f === void 0 ? void 0 : _f.businessAnnualSale, (_h = (_g = obj[i].customerLoan[j]) === null || _g === void 0 ? void 0 : _g.customerLoanBusinessDetails[0]) === null || _h === void 0 ? void 0 : _h.businessExperienceId, obj[i].email, (_j = obj[i].customerLoan[j]) === null || _j === void 0 ? void 0 : _j.gender, (_k = obj[i].customerLoan[j]) === null || _k === void 0 ? void 0 : _k.maritalStatusId, (_l = obj[i].customerLoan[j]) === null || _l === void 0 ? void 0 : _l.maritalStatus, (_o = (_m = obj[i].customerLoan[j]) === null || _m === void 0 ? void 0 : _m.customerCurrentResidentDetail[0]) === null || _o === void 0 ? void 0 : _o.residentTypeId, (_r = (_q = (_p = obj[i]) === null || _p === void 0 ? void 0 : _p.customerLoan[j]) === null || _q === void 0 ? void 0 : _q.customerCurrentResidentDetail[0]) === null || _r === void 0 ? void 0 : _r.residentType, (_t = (_s = obj[i].customerLoan[j]) === null || _s === void 0 ? void 0 : _s.customerCurrentResidentDetail[0]) === null || _t === void 0 ? void 0 : _t.cityId, (_v = (_u = obj[i].customerLoan[j]) === null || _u === void 0 ? void 0 : _u.customerLoanBusinessDetails[0]) === null || _v === void 0 ? void 0 : _v.companyTypeId, (_x = (_w = obj[i].customerLoan[j]) === null || _w === void 0 ? void 0 : _w.customerLoanBusinessDetails[0]) === null || _x === void 0 ? void 0 : _x.businessNatureId, (_z = (_y = obj[i].customerLoan[j]) === null || _y === void 0 ? void 0 : _y.customerLoanBusinessDetails[0]) === null || _z === void 0 ? void 0 : _z.industryTypeId, (_1 = (_0 = obj[i].customerLoan[j]) === null || _0 === void 0 ? void 0 : _0.customerLoanBusinessDetails[0]) === null || _1 === void 0 ? void 0 : _1.businessAnnualProfitId, (_3 = (_2 = obj[i].customerLoan[j]) === null || _2 === void 0 ? void 0 : _2.customerLoanBusinessDetails[0]) === null || _3 === void 0 ? void 0 : _3.primaryBankId, (_4 = obj[i]) === null || _4 === void 0 ? void 0 : _4.addressId, (_6 = (_5 = obj[i].customerLoan[j]) === null || _5 === void 0 ? void 0 : _5.customerLoanBusinessDetails[0]) === null || _6 === void 0 ? void 0 : _6.id, (_8 = (_7 = obj[i].customerLoan[j]) === null || _7 === void 0 ? void 0 : _7.customerCurrentResidentDetail[0]) === null || _8 === void 0 ? void 0 : _8.id, (_9 = obj[i]) === null || _9 === void 0 ? void 0 : _9.alternativeContactNo, (_10 = obj[i].customerLoan[j]) === null || _10 === void 0 ? void 0 : _10.loanAgainsrCollateralId, (_12 = (_11 = obj[i].customerLoan[j]) === null || _11 === void 0 ? void 0 : _11.customerLoanBusinessDetails[0]) === null || _12 === void 0 ? void 0 : _12.currentluPayEmi, obj[i].id, (_13 = obj[i]) === null || _13 === void 0 ? void 0 : _13.userId, ((obj[i].customerLoan[j].partners && ((_14 = obj[i].customerLoan[j]) === null || _14 === void 0 ? void 0 : _14.partners.length) > 0) ? (_16 = (_15 = obj[i].customerLoan[j]) === null || _15 === void 0 ? void 0 : _15.partners[0]) === null || _16 === void 0 ? void 0 : _16.id : ""), ((obj[i].customerLoan[j].partners && ((_17 = obj[i].customerLoan[j]) === null || _17 === void 0 ? void 0 : _17.partners.length) > 0) ? (_19 = (_18 = obj[i].customerLoan[j]) === null || _18 === void 0 ? void 0 : _18.partners[0]) === null || _19 === void 0 ? void 0 : _19.permanentCode : ""), ((obj[i].customerLoan[j].partners && ((_20 = obj[i].customerLoan[j]) === null || _20 === void 0 ? void 0 : _20.partners.length) > 0) ? (_22 = (_21 = obj[i].customerLoan[j]) === null || _21 === void 0 ? void 0 : _21.partners[0]) === null || _22 === void 0 ? void 0 : _22.fullName : ""), ((obj[i].customerLoan[j].partners && ((_23 = obj[i].customerLoan[j]) === null || _23 === void 0 ? void 0 : _23.partners.length) > 0) ? (_25 = (_24 = obj[i].customerLoan[j]) === null || _24 === void 0 ? void 0 : _24.partners[0]) === null || _25 === void 0 ? void 0 : _25.contactNo : ""), (_27 = (_26 = obj[i]) === null || _26 === void 0 ? void 0 : _26.customerLoan[j]) === null || _27 === void 0 ? void 0 : _27.rmFullName, (_29 = (_28 = obj[i]) === null || _28 === void 0 ? void 0 : _28.customerLoan[j]) === null || _29 === void 0 ? void 0 : _29.status, (_31 = (_30 = obj[i]) === null || _30 === void 0 ? void 0 : _30.customerLoan[j]) === null || _31 === void 0 ? void 0 : _31.statusId, (_33 = (_32 = obj[i]) === null || _32 === void 0 ? void 0 : _32.customerLoan[j]) === null || _33 === void 0 ? void 0 : _33.createdBy, null, obj[i].customerLoan[j].isDelete, obj[i].customerLoan[j].leadId, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType, obj[i].customerLoan[j].createdDate, bank, obj[0].cibilScore);
                                        let loanCompleteHistory;
                                        if (obj[i].customerLoan[j].customerLoanCompleteHistory && obj[i].customerLoan[j].customerLoanCompleteHistory.length > 0)
                                            loanCompleteHistory = new adminLoanCompleteHistoryReponse_1.AdminLoanCompleteHistoryResponse((_34 = obj[i].customerLoan[j].customerLoanCompleteHistory[0]) === null || _34 === void 0 ? void 0 : _34.isCompleted, (_35 = obj[i].customerLoan[j].customerLoanCompleteHistory[0]) === null || _35 === void 0 ? void 0 : _35.completeScreen);
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
                                        let offers = [];
                                        if (obj[i].customerLoan[j].offers && obj[i].customerLoan[j].offers.length > 0) {
                                            offers = obj[i].customerLoan[j].offers;
                                        }
                                        let disbursedData;
                                        if (obj[i].customerLoan[j].disbursedData && obj[i].customerLoan[j].disbursedData.length > 0) {
                                            disbursedData = obj[i].customerLoan[j].disbursedData;
                                        }
                                        let rejectionReason = [];
                                        if (obj[i].customerLoan[j].rejectionReason && obj[i].customerLoan[j].rejectionReason.length > 0) {
                                            rejectionReason = obj[i].customerLoan[j].rejectionReason;
                                            rejectionReason[0].reasons = obj[i].customerLoan[j].reasons;
                                        }
                                        let groupDetail = new adminGroupDetailResponse_1.AdminGroupDetailResponse(((obj[0].partners && obj[0].partners.length > 0) ? (_37 = (_36 = obj[0]) === null || _36 === void 0 ? void 0 : _36.partners[0]) === null || _37 === void 0 ? void 0 : _37.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_39 = (_38 = obj[0]) === null || _38 === void 0 ? void 0 : _38.partners[0]) === null || _39 === void 0 ? void 0 : _39.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_41 = (_40 = obj[0]) === null || _40 === void 0 ? void 0 : _40.partners[0]) === null || _41 === void 0 ? void 0 : _41.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_43 = (_42 = obj[0]) === null || _42 === void 0 ? void 0 : _42.partners[0]) === null || _43 === void 0 ? void 0 : _43.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_45 = (_44 = obj[0]) === null || _44 === void 0 ? void 0 : _44.partners[0]) === null || _45 === void 0 ? void 0 : _45.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_47 = (_46 = obj[0]) === null || _46 === void 0 ? void 0 : _46.partners[0]) === null || _47 === void 0 ? void 0 : _47.id : ""));
                                        let objRes = new adminBusinessLoanResponse_1.AdminBusinessLoanResponse(basicDetail, null, null, loanDocuments, loanStatus, offers, disbursedData, rejectionReason, (_48 = obj[i].customerLoan[j]) === null || _48 === void 0 ? void 0 : _48.customerLoanStatusHistory, groupDetail);
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
const getBusinessLoanById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62, _63, _64, _65, _66, _67, _68, _69, _70, _71, _72, _73, _74, _75, _76, _77, _78, _79, _80, _81, _82, _83, _84, _85, _86, _87, _88, _89, _90, _91, _92, _93, _94, _95, _96, _97, _98, _99, _100, _101, _102, _103, _104, _105, _106, _107, _108, _109, _110, _111, _112, _113, _114, _115, _116, _117, _118, _119, _120, _121, _122;
    try {
        logging_1.default.info(NAMESPACE, 'Get Business Loan Detail');
        let requiredFields = ['customerLoanId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL adminGetBusinessLoanById(` + customerLoanId + `)`;
                let result = yield query(sql);
                if (result) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Business Loan data is not available', [], 0);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let obj = result[0];
                        obj[0].customerLoan = result[1][0];
                        obj[0].customerLoanDocuments = result[2];
                        obj[0].customerLoanBusinessDetails = result[3];
                        obj[0].customerCurrentResidentDetail = result[4];
                        obj[0].customerLoanCompleteHistory = result[5];
                        obj[0].customerLoanStatusHistory = result[6][result[6].length - 1];
                        obj[0].offers = result[7];
                        obj[0].disbursedData = result[8];
                        obj[0].rejectionReason = result[9];
                        obj[0].reasons = result[10];
                        obj[0].partners = result[11];
                        obj[0].groupDetail = result[11];
                        obj[0].transferLoanDetail = result[12];
                        if (obj[0].groupDetail && obj[0].groupDetail.length > 0) {
                            if (obj[0].groupDetail[0].parentPartnerId) {
                                let parentSqlResult = yield query(`SELECT p1.parentPartnerId,p1.fullName as parentPartner,p2.fullName as parentParentPartnerName  FROM partners as p1 LEFT JOIN partners as p2 ON p1.parentPartnerId = p2.id WHERE p1.id = ?`, obj[0].groupDetail[0].parentPartnerId);
                                if (parentSqlResult && parentSqlResult.length > 0) {
                                    obj[0].groupDetail[0].parentParentPartnerId = (_49 = parentSqlResult[0]) === null || _49 === void 0 ? void 0 : _49.parentPartnerId;
                                    obj[0].groupDetail[0].parentParentPartnerName = (_50 = parentSqlResult[0]) === null || _50 === void 0 ? void 0 : _50.parentParentPartnerName;
                                    obj[0].groupDetail[0].parentPartnerName = (_51 = parentSqlResult[0]) === null || _51 === void 0 ? void 0 : _51.parentPartner;
                                }
                            }
                        }
                        let loanStatus = null;
                        let loanAmountTakenExisting = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].loanAmountTakenExisting : null;
                        let approxDate = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxDate : null;
                        let approxCurrentEMI = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxCurrentEMI : null;
                        let bankId = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].bankId : null;
                        let bank = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].bankName : null;
                        let topupAmount = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].topupAmount : null;
                        let basicDetail = new adminBusinessLoanBasicDetailResponse_1.AdminBusinessLoanBasicDetailResponse(obj[0].fullName, obj[0].birthdate, obj[0].contactNo, obj[0].panCardNo, (_52 = obj[0].customerLoan) === null || _52 === void 0 ? void 0 : _52.employmentTypeId, obj[0].customerLoan.employmentType, obj[0].pincode, (_53 = obj[0].customerLoan) === null || _53 === void 0 ? void 0 : _53.loanAmount, obj[0].customerLoan.id, (_55 = (_54 = obj[0]) === null || _54 === void 0 ? void 0 : _54.customerLoanBusinessDetails[0]) === null || _55 === void 0 ? void 0 : _55.businessAnnualSale, (_57 = (_56 = obj[0]) === null || _56 === void 0 ? void 0 : _56.customerLoanBusinessDetails[0]) === null || _57 === void 0 ? void 0 : _57.businessExperienceId, (_58 = obj[0]) === null || _58 === void 0 ? void 0 : _58.email, (_59 = obj[0]) === null || _59 === void 0 ? void 0 : _59.gender, (_60 = obj[0]) === null || _60 === void 0 ? void 0 : _60.maritalStatusId, (_61 = obj[0]) === null || _61 === void 0 ? void 0 : _61.maritalStatus, (_63 = (_62 = obj[0]) === null || _62 === void 0 ? void 0 : _62.customerCurrentResidentDetail[0]) === null || _63 === void 0 ? void 0 : _63.residentTypeId, (_65 = (_64 = obj[0]) === null || _64 === void 0 ? void 0 : _64.customerCurrentResidentDetail[0]) === null || _65 === void 0 ? void 0 : _65.residentType, (_67 = (_66 = obj[0]) === null || _66 === void 0 ? void 0 : _66.customerCurrentResidentDetail[0]) === null || _67 === void 0 ? void 0 : _67.cityId, (_69 = (_68 = obj[0]) === null || _68 === void 0 ? void 0 : _68.customerLoanBusinessDetails[0]) === null || _69 === void 0 ? void 0 : _69.companyTypeId, (_71 = (_70 = obj[0]) === null || _70 === void 0 ? void 0 : _70.customerLoanBusinessDetails[0]) === null || _71 === void 0 ? void 0 : _71.businessNatureId, (_73 = (_72 = obj[0]) === null || _72 === void 0 ? void 0 : _72.customerLoanBusinessDetails[0]) === null || _73 === void 0 ? void 0 : _73.industryTypeId, (_75 = (_74 = obj[0]) === null || _74 === void 0 ? void 0 : _74.customerLoanBusinessDetails[0]) === null || _75 === void 0 ? void 0 : _75.businessAnnualProfitId, (_77 = (_76 = obj[0]) === null || _76 === void 0 ? void 0 : _76.customerLoanBusinessDetails[0]) === null || _77 === void 0 ? void 0 : _77.primaryBankId, obj[0].addressId, (_79 = (_78 = obj[0]) === null || _78 === void 0 ? void 0 : _78.customerLoanBusinessDetails[0]) === null || _79 === void 0 ? void 0 : _79.id, (_80 = obj[0]) === null || _80 === void 0 ? void 0 : _80.customerCurrentResidentDetail.id, (_81 = obj[0]) === null || _81 === void 0 ? void 0 : _81.alternativeContactNo, (_82 = obj[0].customerLoan) === null || _82 === void 0 ? void 0 : _82.loanAgainsrCollateralId, (_84 = (_83 = obj[0]) === null || _83 === void 0 ? void 0 : _83.customerLoanBusinessDetails[0]) === null || _84 === void 0 ? void 0 : _84.currentluPayEmi, obj[0].id, obj[0].userId, ((obj[0].partners && obj[0].partners.length > 0) ? (_86 = (_85 = obj[0]) === null || _85 === void 0 ? void 0 : _85.partners[0]) === null || _86 === void 0 ? void 0 : _86.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_88 = (_87 = obj[0]) === null || _87 === void 0 ? void 0 : _87.partners[0]) === null || _88 === void 0 ? void 0 : _88.permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_90 = (_89 = obj[0]) === null || _89 === void 0 ? void 0 : _89.partners[0]) === null || _90 === void 0 ? void 0 : _90.fullName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_92 = (_91 = obj[0]) === null || _91 === void 0 ? void 0 : _91.partners[0]) === null || _92 === void 0 ? void 0 : _92.contactNo : ""), (_94 = (_93 = obj[0]) === null || _93 === void 0 ? void 0 : _93.customerLoan) === null || _94 === void 0 ? void 0 : _94.rmFullName, (_96 = (_95 = obj[0]) === null || _95 === void 0 ? void 0 : _95.customerLoan) === null || _96 === void 0 ? void 0 : _96.status, (_98 = (_97 = obj[0]) === null || _97 === void 0 ? void 0 : _97.customerLoan) === null || _98 === void 0 ? void 0 : _98.statusId, (_100 = (_99 = obj[0]) === null || _99 === void 0 ? void 0 : _99.customerLoan) === null || _100 === void 0 ? void 0 : _100.createdBy, (_101 = obj[0]) === null || _101 === void 0 ? void 0 : _101.customerAddressId, (_103 = (_102 = obj[0]) === null || _102 === void 0 ? void 0 : _102.customerLoan) === null || _103 === void 0 ? void 0 : _103.isDelete, (_105 = (_104 = obj[0]) === null || _104 === void 0 ? void 0 : _104.customerLoan) === null || _105 === void 0 ? void 0 : _105.leadId, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[0].customerLoan.loanType, (obj[0].customerLoan.createdDate ? obj[0].customerLoan.createdDate : ""), bank, obj[0].cibilScore);
                        let moreBasicDetail = new adminBusinessLoanMoreBasicDetailResponse_1.AdminBusinessLoanMoreBasicDetailResponse((_106 = obj[0]) === null || _106 === void 0 ? void 0 : _106.label, (_107 = obj[0]) === null || _107 === void 0 ? void 0 : _107.addressLine1, (_108 = obj[0]) === null || _108 === void 0 ? void 0 : _108.addressLine2, obj[0].cityId, (_109 = obj[0]) === null || _109 === void 0 ? void 0 : _109.city, (_110 = obj[0]) === null || _110 === void 0 ? void 0 : _110.state, (_111 = obj[0]) === null || _111 === void 0 ? void 0 : _111.district, (_112 = obj[0].customerLoan) === null || _112 === void 0 ? void 0 : _112.loanagainstcollteralName, (_113 = obj[0].customerLoan) === null || _113 === void 0 ? void 0 : _113.loanAgainstCollateralId);
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerLoanDocuments.length; i++) {
                            let loanDocuments = new businessLoanDocumentResponse_1.BusinessLoanDocumentResponse(obj[0].customerLoanDocuments[i].id, obj[0].customerLoanDocuments[i].documentId, obj[0].customerLoanDocuments[i].documentUrl, obj[0].customerLoanDocuments[i].documentName, obj[0].customerLoanDocuments[i].isPdf, obj[0].customerLoanDocuments[i].serviceTypeDocumentId, obj[0].customerLoanDocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }
                        let businessDetail = obj[0].customerLoanBusinessDetails;
                        if (obj[0].customerLoanStatusHistory && obj[0].customerLoanStatusHistory.length > 0) {
                            let len = obj[0].customerLoanStatusHistory.length - 1;
                            loanStatus = new adminLoanStatusResponse_1.AdminLoanStatusResponse(obj[0].customerLoanStatusHistory[len].loanStatusId, obj[0].customerLoanStatusHistory[len].transactionDate, obj[0].customerLoanStatusHistory[len].loanStatus, obj[0].customerLoanStatusHistory[len].isDataEditable, obj[0].customerLoanStatusHistory[0].transactionDate, obj[0].displayName);
                        }
                        let offers = [];
                        if (obj[0].offers && obj[0].offers.length > 0) {
                            offers = obj[0].offers;
                        }
                        let disbursedData = [];
                        if (obj[0].disbursedData && obj[0].disbursedData.length > 0) {
                            disbursedData = obj[0].disbursedData;
                        }
                        let rejectionReason = [];
                        if (obj[0].rejectionReason && obj[0].rejectionReason.length > 0) {
                            rejectionReason = obj[0].rejectionReason;
                            rejectionReason[0].reasons = obj[0].reasons;
                        }
                        let groupDetail = obj[0].partners && obj[0].partners.length > 0 ? new adminGroupDetailResponse_1.AdminGroupDetailResponse(((obj[0].partners && obj[0].partners.length > 0) ? (_114 = obj[0].partners[0]) === null || _114 === void 0 ? void 0 : _114.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0].permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_115 = obj[0].partners[0]) === null || _115 === void 0 ? void 0 : _115.fullName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_116 = obj[0].partners[0]) === null || _116 === void 0 ? void 0 : _116.contactNo : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_117 = obj[0].partners[0]) === null || _117 === void 0 ? void 0 : _117.roleName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_118 = obj[0].partners[0]) === null || _118 === void 0 ? void 0 : _118.gender : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_119 = obj[0].partners[0]) === null || _119 === void 0 ? void 0 : _119.parentPartnerId : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_120 = obj[0].partners[0]) === null || _120 === void 0 ? void 0 : _120.parentParentPartnerId : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_121 = obj[0].partners[0]) === null || _121 === void 0 ? void 0 : _121.parentParentPartnerName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? (_122 = obj[0].partners[0]) === null || _122 === void 0 ? void 0 : _122.parentPartnerName : "")) : null;
                        let response = new adminBusinessLoanResponse_1.AdminBusinessLoanResponse(basicDetail, moreBasicDetail, businessDetail[0], loanDocuments2, loanStatus, offers, disbursedData, rejectionReason, obj[0].customerLoanStatusHistory, groupDetail);
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Getting Business Loan Data', [response], 1);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "businessLoan.getBusinessLoanById() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'businessLoan.getBusinessLoanById()', error, '');
        next(errorResult);
    }
});
const insertUpdateBusinessLoanBasicDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Business Loan Basic Detail');
        let requiredFields = ['customerId', 'fullName', 'gender', 'panCardNo', 'cityId', 'pincode', 'maritalStatusId', 'loanAmount', 'employmentTypeId', 'serviceId', 'businessAnnualSale', 'businessExperienceId', 'email', 'residentTypeId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerId = req.body.customerId;
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : null;
                let customerLoanBusinessDetailId = req.body.customerLoanBusinessDetailId ? req.body.customerLoanBusinessDetailId : null;
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : null;
                let customerLoanCurrentResidentTypeId = req.body.customerLoanCurrentResidentTypeId ? req.body.customerLoanCurrentResidentTypeId : null;
                let fullName = req.body.fullName;
                let birthDate = req.body.birthdate ? new Date(req.body.birthdate) : null;
                let gender = req.body.gender;
                let panCardNo = req.body.panCardNo;
                let cityId = req.body.cityId;
                let pincode = req.body.pincode;
                let loanAmount = req.body.loanAmount;
                let employmentTypeId = req.body.employmentTypeId;
                let loanAgainstCollateralId = req.body.loanAgainstCollateralId ? req.body.loanAgainstCollateralId : null;
                let serviceId = req.body.serviceId;
                let businessAnnualSale = req.body.businessAnnualSale;
                let businessExperienceId = req.body.businessExperienceId;
                let email = req.body.email;
                let residentTypeId = req.body.residentTypeId;
                let maritalStatusId = req.body.maritalStatusId;
                let dDate = null;
                let currentUserId = req.body.userId;
                let label = req.body.label ? req.body.label : null;
                let addressLine1 = req.body.addressLine1;
                let addressLine2 = req.body.addressLine2;
                let city = req.body.city;
                let state = req.body.state;
                let district = req.body.district;
                if (birthDate)
                    dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                let partnerId = 0;
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                let loanAmountTakenExisting = req.body.loanAmountTakenExisting ? req.body.loanAmountTakenExisting : null;
                let approxDate = req.body.approxDate ? new Date(req.body.approxDate) : null;
                let approxDate2 = '';
                let topupAmount = req.body.topupAmount ? req.body.topupAmount : null;
                let approxCurrentEMI = req.body.approxCurrentEMI ? req.body.approxCurrentEMI : null;
                let bankId = req.body.bankId ? req.body.bankId : null;
                if (approxDate)
                    approxDate2 = new Date(approxDate).getFullYear().toString() + '-' + ("0" + (new Date(approxDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(approxDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(approxDate).getHours())).slice(-2) + ':' + ("0" + (new Date(approxDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(approxDate).getSeconds())).slice(-2);
                if (dsaCode && !customerLoanId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = yield query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }
                let sql = `CALL adminInsertUpdateBusinessLoanBasicDetail(` + customerId + `,` + userId + `,` + customerLoanId + `,` + customerLoanBusinessDetailId + `,` + customerAddressId + `,` + customerLoanCurrentResidentTypeId + `
            ,'` + fullName + `','` + dDate + `','` + gender + `','` + panCardNo + `', ` + maritalStatusId + `,` + cityId + `,'` + pincode + `',` + loanAmount + `,` + employmentTypeId + `,` + loanAgainstCollateralId + `,` + serviceId + `,` + businessAnnualSale + `
            ,` + businessExperienceId + `,'` + email + `',` + residentTypeId + `,` + partnerId + `,` + currentUserId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + city + `','` + district + `','` + state + `',` + loanAmountTakenExisting + `,'` + approxDate2 + `',` + topupAmount + `,` + approxCurrentEMI + `,` + bankId + `,'` + req.body.loanType + `')`;
                console.log(sql);
                let result = yield query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Business Loan Basic Detail Saved', result[0], 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Business Loan Basic Detail Saved', result, 1);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Business Loan Basic Detail Not Saved", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'businessLoan.insertUpdateBusinessLoanBasicDetail()', error, '');
        next(errorResult);
    }
});
const insertUpdateBusinessLoanBusinessDetail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert/Update Business Loan Business Detail');
        let requiredFields = ['customerLoanBusinessDetailId', 'customerLoanId', 'companyTypeId', 'industryTypeId', 'businessNatureId', 'businessAnnualProfitId', 'primaryBankId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanBusinessDetailId = req.body.customerLoanBusinessDetailId;
                let companyTypeId = req.body.companyTypeId;
                let industryTypeId = req.body.industryTypeId;
                let businessNatureId = req.body.businessNatureId;
                let businessAnnualProfitId = req.body.businessAnnualProfitId;
                let primaryBankId = req.body.primaryBankId;
                let customerLoanId = req.body.customerLoanId;
                let businessName = req.body.businessName;
                let gstNumber = req.body.businessGstNo;
                let currentlyPayEmi = req.body.currentlyPayEmi ? req.body.currentlyPayEmi : null;
                let partnerId = 0;
                let sql = `CALL adminInsertUpdateBusinessLoanBusinessDetail(` + customerLoanBusinessDetailId + `,` + customerLoanId + `,` + companyTypeId + `,` + industryTypeId + `,` + businessNatureId + `,` + businessAnnualProfitId + `
                ,` + primaryBankId + `,` + currentlyPayEmi + `,` + userId + `,'` + businessName + `','` + gstNumber + `')`;
                let result = yield query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Business Loan Business Detail Saved', result[0], 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Business Loan Business Detail Saved', result, 1);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Business Loan Business Detail Not Saved", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'businessLoan.insertUpdateBusinessLoanBusinessDetail()', error, '');
        next(errorResult);
    }
});
exports.default = { getBusinessLoans, getBusinessLoanById, insertUpdateBusinessLoanBasicDetail, insertUpdateBusinessLoanBusinessDetail };
