import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { BusinessLoanDocumentResponse } from '../../classes/output/loan/business loan/businessLoanDocumentResponse';
import { AdminBusinessLoanBasicDetailResponse } from '../../classes/output/admin/loans/adminBusinessLoanBasicDetailResponse';
import { AdminBusinessLoanResponse } from '../../classes/output/admin/loans/adminBusinessLoanResponse';
import { AdminBusinessLoanMoreBasicDetailResponse } from '../../classes/output/admin/loans/adminBusinessLoanMoreBasicDetailResponse';
import { AdminLoanStatusResponse } from '../../classes/output/admin/loans/adminLoanStatusResponse';
import { AdminPersonalLoanDocumentResponse } from '../../classes/output/admin/loans/adminPersonalloanDocumentsResponse';
import { AdminLoanCompleteHistoryResponse } from '../../classes/output/admin/loans/adminLoanCompleteHistoryReponse';
import { AdminGroupDetailResponse } from '../../classes/output/admin/loans/adminGroupDetailResponse';
let connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Business Loan';

const getBusinessLoans = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Personal Loans');
        let requiredFields = ['serviceId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let customerId = req.body.customerId ? req.body.customerId : null
                let sqlQuery = `SELECT distinct(customerloans.id) FROM customerloans 
                LEFT JOIN employmenttypes ON  employmenttypes.id = customerloans.employmentTypeId
                LEFT JOIN services ON  services.id = customerloans.serviceId
                LEFT JOIN customerloanstatushistory ON customerloanstatushistory.customerloanId = customerloans.id
                LEFT JOIN loancompletescreenhistory ON loancompletescreenhistory.customerloanId = customerloans.id
                LEFT JOIN customers ON customers.id = customerloans.customerId
                INNER JOIN userroles ON userroles.userId = customers.userId
                WHERE customerloans.serviceId = `+ serviceId;

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
                    sqlQuery += ` AND (customers.fullName LIKE  '%` + req.body.searchString + `%' OR customers.contactNo LIKE '%` + req.body.searchString + `%')`
                }
                let resultqueryCount = await query(sqlQuery);
                let count;
                if (resultqueryCount && resultqueryCount.length > 0) {
                    count = resultqueryCount.length;
                }
                sqlQuery += ` ORDER BY customerloans.id DESC`
                if (startIndex >= 0 && fetchRecords > 0)
                    sqlQuery += " LIMIT " + fetchRecords + " OFFSET " + startIndex;
                let resultquery = await query(sqlQuery);
                if (resultquery && resultquery.length > 0) {
                    let ids = resultquery.map(c => c.id);
                    if (ids && ids.length > 0) {
                        let sql = `CALL adminGetBusinessLoans('` + ids.toString() + `')`;
                        console.log(sql);
                        let result = await query(sql);
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

                                        let basicDetail: AdminBusinessLoanBasicDetailResponse = new AdminBusinessLoanBasicDetailResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo
                                            , obj[i].customerLoan[j]?.employmentTypeId, obj[i].customerLoan[j]?.employmentType, obj[i]?.pincode, obj[i].customerLoan[j]?.loanAmount, obj[i].customerLoan[j].id
                                            , obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.businessAnnualSale, obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.businessExperienceId
                                            , obj[i].email, obj[i].customerLoan[j]?.gender, obj[i].customerLoan[j]?.maritalStatusId, obj[i].customerLoan[j]?.maritalStatus
                                            , obj[i].customerLoan[j]?.customerCurrentResidentDetail[0]?.residentTypeId, obj[i]?.customerLoan[j]?.customerCurrentResidentDetail[0]?.residentType
                                            , obj[i].customerLoan[j]?.customerCurrentResidentDetail[0]?.cityId, obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.companyTypeId
                                            , obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.businessNatureId, obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.industryTypeId
                                            , obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.businessAnnualProfitId, obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.primaryBankId
                                            , obj[i]?.addressId, obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.id, obj[i].customerLoan[j]?.customerCurrentResidentDetail[0]?.id
                                            , obj[i]?.alternativeContactNo, obj[i].customerLoan[j]?.loanAgainsrCollateralId
                                            , obj[i].customerLoan[j]?.customerLoanBusinessDetails[0]?.currentluPayEmi, obj[i].id, obj[i]?.userId
                                            , ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j]?.partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j]?.partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j]?.partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j]?.partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.contactNo : ""), obj[i]?.customerLoan[j]?.rmFullName, obj[i]?.customerLoan[j]?.status, obj[i]?.customerLoan[j]?.statusId, obj[i]?.customerLoan[j]?.createdBy, null
                                            , obj[i].customerLoan[j].isDelete, obj[i].customerLoan[j].leadId, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType, obj[i].customerLoan[j].createdDate, bank,
                                            obj[0].cibilScore);


                                        let loanCompleteHistory: AdminLoanCompleteHistoryResponse
                                        if (obj[i].customerLoan[j].customerLoanCompleteHistory && obj[i].customerLoan[j].customerLoanCompleteHistory.length > 0)
                                            loanCompleteHistory = new AdminLoanCompleteHistoryResponse(obj[i].customerLoan[j].customerLoanCompleteHistory[0]?.isCompleted, obj[i].customerLoan[j].customerLoanCompleteHistory[0]?.completeScreen);

                                        let loanDocuments = [];
                                        let loanStatus;
                                        if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                            for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                                let doc: AdminPersonalLoanDocumentResponse = new AdminPersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId
                                                    , obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf
                                                    , obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                                loanDocuments.push(doc);
                                            }
                                        }
                                        if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                            let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                            loanStatus = new AdminLoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatusId, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus,
                                                obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName);
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

                                        let groupDetail: AdminGroupDetailResponse = new AdminGroupDetailResponse(((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""),);

                                        let objRes: AdminBusinessLoanResponse = new AdminBusinessLoanResponse(basicDetail, null, null, loanDocuments, loanStatus, offers, disbursedData, rejectionReason, obj[i].customerLoan[j]?.customerLoanStatusHistory, groupDetail);
                                        response.push(JSON.parse(JSON.stringify(objRes)));
                                        response = response.sort((a, b) => b.basicDetail.customerLoanId - a.basicDetail.customerLoanId)
                                    }
                                }
                            }

                            let successResult = new ResultSuccess(200, true, 'Loans Available', response, count);
                            return res.status(200).send(successResult);
                        } else {
                            let successResult = new ResultSuccess(200, true, 'Loans Available', result, count);
                            return res.status(200).send(successResult);
                        }
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Loans Not Available', [], 0);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let successResult = new ResultSuccess(200, true, 'Loans Not Available', [], 0);
                    return res.status(200).send(successResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoans.getPersonalLoan() Exception', error, '');
        next(errorResult);
    }
};

const getBusinessLoanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Business Loan Detail');
        let requiredFields = ['customerLoanId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL adminGetBusinessLoanById(` + customerLoanId + `)`;
                let result = await query(sql);
                if (result) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Business Loan data is not available', [], 0);
                        return res.status(200).send(successResult);
                    } else {
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
                        obj[0].transferLoanDetail = result[12]
                        if (obj[0].groupDetail && obj[0].groupDetail.length > 0) {
                            if (obj[0].groupDetail[0].parentPartnerId) {
                                let parentSqlResult = await query(`SELECT p1.parentPartnerId,p1.fullName as parentPartner,p2.fullName as parentParentPartnerName  FROM partners as p1 LEFT JOIN partners as p2 ON p1.parentPartnerId = p2.id WHERE p1.id = ?`, obj[0].groupDetail[0].parentPartnerId)
                                if (parentSqlResult && parentSqlResult.length > 0) {
                                    obj[0].groupDetail[0].parentParentPartnerId = parentSqlResult[0]?.parentPartnerId
                                    obj[0].groupDetail[0].parentParentPartnerName = parentSqlResult[0]?.parentParentPartnerName
                                    obj[0].groupDetail[0].parentPartnerName = parentSqlResult[0]?.parentPartner
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
                        let basicDetail: AdminBusinessLoanBasicDetailResponse = new AdminBusinessLoanBasicDetailResponse(obj[0].fullName, obj[0].birthdate, obj[0].contactNo, obj[0].panCardNo, obj[0].customerLoan?.employmentTypeId
                            , obj[0].customerLoan.employmentType, obj[0].pincode, obj[0].customerLoan?.loanAmount, obj[0].customerLoan.id, obj[0]?.customerLoanBusinessDetails[0]?.businessAnnualSale,
                            obj[0]?.customerLoanBusinessDetails[0]?.businessExperienceId, obj[0]?.email, obj[0]?.gender, obj[0]?.maritalStatusId, obj[0]?.maritalStatus,
                            obj[0]?.customerCurrentResidentDetail[0]?.residentTypeId, obj[0]?.customerCurrentResidentDetail[0]?.residentType, obj[0]?.customerCurrentResidentDetail[0]?.cityId,
                            obj[0]?.customerLoanBusinessDetails[0]?.companyTypeId, obj[0]?.customerLoanBusinessDetails[0]?.businessNatureId, obj[0]?.customerLoanBusinessDetails[0]?.industryTypeId,
                            obj[0]?.customerLoanBusinessDetails[0]?.businessAnnualProfitId, obj[0]?.customerLoanBusinessDetails[0]?.primaryBankId, obj[0].addressId,
                            obj[0]?.customerLoanBusinessDetails[0]?.id, obj[0]?.customerCurrentResidentDetail.id, obj[0]?.alternativeContactNo, obj[0].customerLoan?.loanAgainsrCollateralId,
                            obj[0]?.customerLoanBusinessDetails[0]?.currentluPayEmi, obj[0].id, obj[0].userId, ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""),
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.fullName : ""),
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.contactNo : ""), obj[0]?.customerLoan?.rmFullName, obj[0]?.customerLoan?.status, obj[0]?.customerLoan?.statusId, obj[0]?.customerLoan?.createdBy,
                            obj[0]?.customerAddressId, obj[0]?.customerLoan?.isDelete, obj[0]?.customerLoan?.leadId, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[0].customerLoan.loanType, (obj[0].customerLoan.createdDate ? obj[0].customerLoan.createdDate : ""), bank, obj[0].cibilScore);

                        let moreBasicDetail: AdminBusinessLoanMoreBasicDetailResponse = new AdminBusinessLoanMoreBasicDetailResponse(obj[0]?.label, obj[0]?.addressLine1, obj[0]?.addressLine2, obj[0].cityId, obj[0]?.city, obj[0]?.state, obj[0]?.district, obj[0].customerLoan?.loanagainstcollteralName, obj[0].customerLoan?.loanAgainstCollateralId);
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerLoanDocuments.length; i++) {
                            let loanDocuments: BusinessLoanDocumentResponse = new BusinessLoanDocumentResponse(obj[0].customerLoanDocuments[i].id, obj[0].customerLoanDocuments[i].documentId, obj[0].customerLoanDocuments[i].documentUrl, obj[0].customerLoanDocuments[i].documentName, obj[0].customerLoanDocuments[i].isPdf, obj[0].customerLoanDocuments[i].serviceTypeDocumentId, obj[0].customerLoanDocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }
                        let businessDetail = obj[0].customerLoanBusinessDetails;
                        if (obj[0].customerLoanStatusHistory && obj[0].customerLoanStatusHistory.length > 0) {
                            let len = obj[0].customerLoanStatusHistory.length - 1;
                            loanStatus = new AdminLoanStatusResponse(obj[0].customerLoanStatusHistory[len].loanStatusId, obj[0].customerLoanStatusHistory[len].transactionDate, obj[0].customerLoanStatusHistory[len].loanStatus,
                                obj[0].customerLoanStatusHistory[len].isDataEditable, obj[0].customerLoanStatusHistory[0].transactionDate, obj[0].displayName);
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
                        let groupDetail: AdminGroupDetailResponse = obj[0].partners && obj[0].partners.length > 0 ? new AdminGroupDetailResponse(
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0].permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.fullName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.contactNo : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.roleName : ""),
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.gender : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentPartnerId : ""),
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentParentPartnerId : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentParentPartnerName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentPartnerName : "")
                        ) : null;

                        let response: AdminBusinessLoanResponse = new AdminBusinessLoanResponse(basicDetail, moreBasicDetail, businessDetail[0], loanDocuments2, loanStatus, offers, disbursedData, rejectionReason, obj[0].customerLoanStatusHistory, groupDetail);
                        let successResult = new ResultSuccess(200, true, 'Getting Business Loan Data', [response], 1);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "businessLoan.getBusinessLoanById() Error", result, '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'businessLoan.getBusinessLoanById()', error, '');
        next(errorResult);
    }
};

const insertUpdateBusinessLoanBasicDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Business Loan Basic Detail');
        let requiredFields = ['customerId', 'fullName', 'gender', 'panCardNo', 'cityId', 'pincode', 'maritalStatusId', 'loanAmount', 'employmentTypeId', 'serviceId', 'businessAnnualSale', 'businessExperienceId', 'email', 'residentTypeId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
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
                let district = req.body.district
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
                    let dsaResult = await query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }

                let sql = `CALL adminInsertUpdateBusinessLoanBasicDetail(` + customerId + `,` + userId + `,` + customerLoanId + `,` + customerLoanBusinessDetailId + `,` + customerAddressId + `,` + customerLoanCurrentResidentTypeId + `
            ,'` + fullName + `','` + dDate + `','` + gender + `','` + panCardNo + `', ` + maritalStatusId + `,` + cityId + `,'` + pincode + `',` + loanAmount + `,` + employmentTypeId + `,` + loanAgainstCollateralId + `,` + serviceId + `,` + businessAnnualSale + `
            ,` + businessExperienceId + `,'` + email + `',` + residentTypeId + `,` + partnerId + `,` + currentUserId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + city + `','` + district + `','` + state + `',` + loanAmountTakenExisting + `,'` + approxDate2 + `',` + topupAmount + `,` + approxCurrentEMI + `,` + bankId + `,'` + req.body.loanType + `')`;
                console.log(sql);
                let result = await query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Basic Detail Saved', result[0], 1);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Basic Detail Saved', result, 1);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Business Loan Basic Detail Not Saved", result, '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'businessLoan.insertUpdateBusinessLoanBasicDetail()', error, '');
        next(errorResult);
    }
}

const insertUpdateBusinessLoanBusinessDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Business Loan Business Detail');
        let requiredFields = ['customerLoanBusinessDetailId', 'customerLoanId', 'companyTypeId', 'industryTypeId', 'businessNatureId', 'businessAnnualProfitId', 'primaryBankId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
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
                let gstNumber = req.body.businessGstNo
                let currentlyPayEmi = req.body.currentlyPayEmi ? req.body.currentlyPayEmi : null;
                let partnerId = 0;
                let sql = `CALL adminInsertUpdateBusinessLoanBusinessDetail(` + customerLoanBusinessDetailId + `,` + customerLoanId + `,` + companyTypeId + `,` + industryTypeId + `,` + businessNatureId + `,` + businessAnnualProfitId + `
                ,` + primaryBankId + `,` + currentlyPayEmi + `,` + userId + `,'` + businessName + `','` + gstNumber + `')`;
                let result = await query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Business Detail Saved', result[0], 1);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Business Detail Saved', result, 1);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Business Loan Business Detail Not Saved", result, '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'businessLoan.insertUpdateBusinessLoanBusinessDetail()', error, '');
        next(errorResult);
    }
}


export default { getBusinessLoans, getBusinessLoanById, insertUpdateBusinessLoanBasicDetail, insertUpdateBusinessLoanBusinessDetail };
