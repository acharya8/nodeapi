import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { AdminCustomerResponse } from '../../classes/output/admin/loans/adminCustomerResponse';
import { AdminPersonalLoanMoreBasicDetailResponse } from '../../classes/output/admin/loans/adminPersonalloanMoreBasicDetailResponse';
import { AdminPersonalLoanMoreEmploymentDetailResponse } from '../../classes/output/admin/loans/adminPersonalloanMoreEmploymentDetailResponse';
import { AdminLoanCompleteHistoryResponse } from '../../classes/output/admin/loans/adminLoanCompleteHistoryReponse';
import { AdminPersonalLoanDocumentResponse } from '../../classes/output/admin/loans/adminPersonalloanDocumentsResponse';
import { AdminPersonalLoanReferenceResponse } from '../../classes/output/admin/loans/adminPersonalloanReferenceResponse';
import { AdminLoanStatusResponse } from '../../classes/output/admin/loans/adminLoanStatusResponse';
import { AdminPersonalLoanResponse } from '../../classes/output/admin/loans/adminPersonalLoanResponse';
import notificationContainer from './../notifications';
import { AdminGroupDetailResponse } from '../../classes/output/admin/loans/adminGroupDetailResponse';
var convertRupeesIntoWords = require('convert-rupees-into-words');
const fs = require('fs');
const pdf = require('html-pdf-node');

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
});
const S3 = new AWS.S3({
    accessKeyId: config.s3bucket.aws_Id,
    secretAccessKey: config.s3bucket.aws_secret
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Personal Loan';

const getPersonalLoan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Personal Loans');
        var requiredFields = ['serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
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
                LEFT JOIN customers ON customerloans.customerId = customers.id
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
                        let sql = `CALL adminGetPersonalLoansByFilter('` + ids.toString() + `')`;
                        let result = await query(sql);
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
                                let currentAddress
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
                                        let basicDetail: AdminCustomerResponse = new AdminCustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId
                                            , obj[i].customerLoan[j].employmentType, (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.monthlyIncome : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.companyName : ""
                                            , (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.officePincode : "", obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].id, (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.id : ""
                                            , ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.contactNo : ""), obj[i]?.customerLoan[j]?.rmFullName, obj[i]?.customerLoan[j]?.status, obj[i]?.customerLoan[j]?.createdBy, obj[i]?.customerLoan[j].maritalStatusId, null, null, null, obj[i].customerLoan[j].isDelete, obj[i].email, obj[i].customerLoan[j].customerId, obj[i].customerLoan[j].tenureId, null, null, null, null, null, null, null, null, null, null, obj[i].customerLoan[j].leadId, obj[i]?.customerLoan[j]?.statusId, obj[i]?.customerLoan[j]?.createdDate, obj[i]?.customerLoan[j]?.serviceId, obj[i].cibilScore);

                                        let moreBasicDetail: AdminPersonalLoanMoreBasicDetailResponse = new AdminPersonalLoanMoreBasicDetailResponse(obj[i].alternativeContactNo, obj[i].gender
                                            , obj[i].maritalStatusId, obj[i].maritalStatus, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].name : ""),
                                            ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].contactNo : ""), obj[i].customerLoan[j].motherName
                                            , obj[i].customerLoan[j].fatherName, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].id : 0),
                                            loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType, bank
                                        );
                                        let moreEmploymentDetail: AdminPersonalLoanMoreEmploymentDetailResponse = new AdminPersonalLoanMoreEmploymentDetailResponse(obj[i].email, (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.designation : ""
                                            , (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.companyTypeId : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.companyTypeName : "",
                                            (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.currentCompanyExperience : ""
                                            , (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.label : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.addressLine1 : "",
                                            (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.addressLine2 : ""
                                            , (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.pincode : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.cityId : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.city : ""
                                            , (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.district : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.state : "", (obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.companyAddressId : "");
                                        let loanCompleteHistory: AdminLoanCompleteHistoryResponse
                                        if (obj[i].customerLoan[j].customerLoanCompleteHistory && obj[i].customerLoan[j].customerLoanCompleteHistory.length > 0)
                                            loanCompleteHistory = new AdminLoanCompleteHistoryResponse(obj[i].customerLoan[j].customerLoanCompleteHistory[0]?.isCompleted, obj[i].customerLoan[j].customerLoanCompleteHistory[0]?.completeScreen);
                                        let loanDocuments = [];
                                        let loanReference = [];
                                        let loanStatus;
                                        if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                            for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                                let doc: AdminPersonalLoanDocumentResponse = new AdminPersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId
                                                    , obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf
                                                    , obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                                loanDocuments.push(doc);
                                            }
                                        }
                                        if (obj[i].customerLoan[j].customerLoanReferences && obj[i].customerLoan[j].customerLoanReferences.length > 0) {
                                            for (let k = 0; k < obj[i].customerLoan[j].customerLoanReferences.length; k++) {
                                                let loanreference: AdminPersonalLoanReferenceResponse = new AdminPersonalLoanReferenceResponse(obj[i].customerLoan[j].customerLoanReferences[k].id, obj[i].customerLoan[j].customerLoanReferences[k].fullName, obj[i].customerLoan[j].customerLoanReferences[k].contactNo, obj[i].customerLoan[j].customerLoanReferences[k].label, obj[i].customerLoan[j].customerLoanReferences[k].addressLine1, obj[i].customerLoan[j].customerLoanReferences[k].addressLine2, obj[i].customerLoan[j].customerLoanReferences[k].pincode, obj[i].customerLoan[j].customerLoanReferences[k].city, obj[i].customerLoan[j].customerLoanReferences[k].cityId, obj[i].customerLoan[j].customerLoanReferences[k].district, obj[i].customerLoan[j].customerLoanReferences[k].state);
                                                loanReference.push(loanreference);
                                            }
                                        }
                                        if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                            let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                            loanStatus = new AdminLoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatusId, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus,
                                                obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName);
                                        }
                                        let groupDetail: AdminGroupDetailResponse = new AdminGroupDetailResponse(
                                            ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j].partners[0].permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.contactNo : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.roleName : ""),
                                            ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.gender : "")
                                        );
                                        let objRes: AdminPersonalLoanResponse = new AdminPersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, null, null, null, null, groupDetail);
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

const getPersonalLoanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Personal Loans By Id');
        var requiredFields = ['customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL adminGetPersonalLoansByFilter('` + customerLoanId + `')`;
                let result = await query(sql);
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
                                        let parentSqlResult = await query(`SELECT p1.parentPartnerId,p1.fullName as parentPartner,p2.fullName as parentParentPartnerName  FROM partners as p1 LEFT JOIN partners as p2 ON p1.parentPartnerId = p2.id WHERE p1.id = ?`, customerLoan[j].groupDetail[0].parentPartnerId)
                                        if (parentSqlResult && parentSqlResult.length > 0) {
                                            customerLoan[j].groupDetail[0].parentParentPartnerId = parentSqlResult[0]?.parentPartnerId
                                            customerLoan[j].groupDetail[0].parentParentPartnerName = parentSqlResult[0]?.parentParentPartnerName
                                            customerLoan[j].groupDetail[0].parentPartnerName = parentSqlResult[0]?.parentPartner
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
                                let officePincode = (obj[i].customerLoan[j]?.customerLoanEmploymentDetail && obj[i].customerLoan[j]?.customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0].officePincode : "";
                                let companyName = (obj[i].customerLoan[j]?.customerLoanEmploymentDetail && obj[i].customerLoan[j]?.customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0].companyName : "";
                                let monthlyIncome = (obj[i].customerLoan[j]?.customerLoanEmploymentDetail && obj[i].customerLoan[j]?.customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0].monthlyIncome : "";
                                let id = (obj[i].customerLoan[j]?.customerLoanEmploymentDetail && obj[i].customerLoan[j]?.customerLoanEmploymentDetail.length > 0) ? obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0].id : "";
                                let basicDetail: AdminCustomerResponse = new AdminCustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId
                                    , obj[i].customerLoan[j].employmentType, monthlyIncome, companyName
                                    , officePincode, obj[i].customerLoan[j]?.loanAmount, obj[i].customerLoan[j].id, id
                                    , ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j].partners[0].permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.contactNo : "")
                                    , obj[i].customerLoan[j].rmFullName, obj[i].customerLoan[j].status, obj[i].customerLoan[j].createdBy, obj[i].customerLoan[j].maritalStatusId, null, null, null, obj[i].customerLoan[j].isDelete, obj[i].email
                                    , obj[0].customerLoan[j].customerId, obj[i].customerLoan[j].tenureId, obj[i].customerLoan[j].tenure
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.label : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.addressLine1 : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.addressLine2 : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.pincode : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.cityId : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.city : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.district : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.state : "")
                                    , (obj[i].customerLoan[j].currentAddress && obj[i].customerLoan[j].currentAddress.length > 0 ? obj[i].customerLoan[j].currentAddress[0]?.id : "")
                                    , (obj[i].customerLoan[j].leadId ? obj[i].customerLoan[j].leadId : "")
                                    , (obj[i].customerLoan[j].statusId ? obj[i].customerLoan[j].statusId : "")
                                    , (obj[i].customerLoan[j].createdDate ? obj[i].customerLoan[j].createdDate : ""), (obj[i].customerLoan[j].serviceId ? obj[i].customerLoan[j].serviceId : ""), obj[i].cibilScore);
                                let moreBasicDetail: AdminPersonalLoanMoreBasicDetailResponse = new AdminPersonalLoanMoreBasicDetailResponse(obj[i].alternativeContactNo, obj[i].gender
                                    , obj[i].maritalStatusId, obj[i].maritalStatus, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].name : ""),
                                    ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].contactNo : ""), obj[i].customerLoan[j].motherName
                                    , obj[i].customerLoan[j].fatherName, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].id : 0),
                                    loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType, bank);
                                let moreEmploymentDetail: AdminPersonalLoanMoreEmploymentDetailResponse = obj[i].customerLoan[j].customerLoanEmploymentDetail && obj[i].customerLoan[j].customerLoanEmploymentDetail.length > 0 ? new AdminPersonalLoanMoreEmploymentDetailResponse(obj[i].email, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].designation
                                    , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyTypeId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyTypeName, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].currentCompanyExperience
                                    , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].label, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine1, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine2
                                    , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].pincode, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].cityId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].city
                                    , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].district, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].state, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyAddressId) : null;
                                let loanCompleteHistory: AdminLoanCompleteHistoryResponse
                                if (obj[i].customerLoan[j].customerLoanCompleteHistory) {
                                    loanCompleteHistory = new AdminLoanCompleteHistoryResponse(obj[i].customerLoan[j]?.customerLoanCompleteHistory[0]?.isCompleted, obj[i].customerLoan[j]?.customerLoanCompleteHistory[0]?.completeScreen);
                                }
                                let loanDocuments = [];
                                let loanReference = [];
                                let loanStatus;
                                if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                    for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                        let doc: AdminPersonalLoanDocumentResponse = new AdminPersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId
                                            , obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf
                                            , obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                        loanDocuments.push(doc);
                                    }
                                }
                                if (obj[i].customerLoan[j].customerLoanReferences && obj[i].customerLoan[j].customerLoanReferences.length > 0) {
                                    for (let k = 0; k < obj[i].customerLoan[j].customerLoanReferences.length; k++) {
                                        let loanreference: AdminPersonalLoanReferenceResponse = new AdminPersonalLoanReferenceResponse(obj[i].customerLoan[j].customerLoanReferences[k].id, obj[i].customerLoan[j].customerLoanReferences[k].fullName, obj[i].customerLoan[j].customerLoanReferences[k].contactNo, obj[i].customerLoan[j].customerLoanReferences[k].label, obj[i].customerLoan[j].customerLoanReferences[k].addressLine1, obj[i].customerLoan[j].customerLoanReferences[k].addressLine2, obj[i].customerLoan[j].customerLoanReferences[k].pincode, obj[i].customerLoan[j].customerLoanReferences[k].city, obj[i].customerLoan[j].customerLoanReferences[k].cityId, obj[i].customerLoan[j].customerLoanReferences[k].district, obj[i].customerLoan[j].customerLoanReferences[k].state);
                                        loanReference.push(loanreference);
                                    }
                                }
                                if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                    let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                    loanStatus = new AdminLoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].id, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus,
                                        obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName);
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
                                let groupDetail: AdminGroupDetailResponse = obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0 ? new AdminGroupDetailResponse(
                                    ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.id : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j].partners[0].permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.contactNo : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.roleName : ""),
                                    ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.gender : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.parentPartnerId : ""),
                                    ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.parentParentPartnerId : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.parentParentPartnerName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.parentPartnerName : "")
                                ) : null;
                                let objRes: AdminPersonalLoanResponse = new AdminPersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, offers, disbursedData, rejectionReason[0], obj[i].customerLoan[j]?.customerLoanStatusHistory, groupDetail);
                                response.push(JSON.parse(JSON.stringify(objRes)));
                            }
                        }
                    }

                    let successResult = new ResultSuccess(200, true, 'Loans Available', response, 1);
                    return res.status(200).send(successResult);
                } else {
                    let successResult = new ResultSuccess(200, true, 'Loans Available', result, 1);
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

const assignToRM = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Personal Loan Assign To RM');
        var requiredFields = ['customerLoanId', 'userId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminAssignToRM(` + req.body.userId + `,` + req.body.customerLoanId + `)`;
                let result = await query(sql);

                //#region Notification
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                let customerUserIdResult = await query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = await query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                let partnerUserIdResult = await query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = await query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let service = await query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id = ?`, req.body.customerLoanId);

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
                }
                if (customerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                    let notificationResult = await query(notificationSql);
                    await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                }
                if (partnerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                    let notificationResult = await query(notificationSql);
                    await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                }
                //#endregion Notification


                let successResult = new ResultSuccess(200, true, 'Loan Assign To RM', result, 1);
                return res.status(200).send(successResult);

            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoans.assignToRM() Exception', error, '');
        next(errorResult);
    }
};

const changeDocumentStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'chagneDocumentStatus');
        var requiredFields = [''];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let loanDocumentId = "";
                let statuses = "";
                let allApproved = true;
                if (req.body.loanDocuments && req.body.loanDocuments.length > 0) {
                    for (let index = 0; index < req.body.loanDocuments.length; index++) {
                        loanDocumentId = (index == 0) ? req.body.loanDocuments[index].loanDocumentId : loanDocumentId + "," + req.body.loanDocuments[index].loanDocumentId
                        statuses = (index == 0) ? req.body.loanDocuments[index].documentStatus.toString() : statuses + "," + req.body.loanDocuments[index].documentStatus.toString()
                    }
                    for (let index = 0; index < req.body.length; index++) {
                        if (req.body.loanDocuments[index].documentStatus == "REVIEW" || req.body.loanDocuments[index].documentStatus == "REJECTED") {
                            allApproved = false;
                            break;
                        }
                    }
                }
                let sql = `CALL adminChangeCustomerLoanDocumentStatus('` + loanDocumentId + `','` + statuses + `',` + authorizationResult.currentUser.id + `,` + allApproved + `,` + req.body.loanDocuments[0].customerLoanId + `)`;
                let result = await query(sql);
                if (req.body.pendency) {
                    let sql = `CALL adminChangeLoanStatus(` + req.body.loanDocuments[0].customerLoanId + `,` + 23 + `,` + authorizationResult.currentUser.id + `);`;
                    result = await query(sql);
                }
                else {
                    let sql = `CALL adminChangeLoanStatus(` + req.body.loanDocuments[0].customerLoanId + `,` + 11 + `,` + authorizationResult.currentUser.id + `);`;
                    result = await query(sql);
                }

                //#region Notification
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.loanDocuments[0].customerLoanId + ")";
                let customerUserIdResult = await query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = await query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.loanDocuments[0].customerLoanId + ")";
                let partnerUserIdResult = await query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = await query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let serviceNameSql = await query('SELECT name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id = ?', req.body.loanDocuments[0].customerLoanId)
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

                        }
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 1, 'Loan Document Approved', 'Loan Document Verified','` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([customerFcm], 1, req.body.loanDocuments[0].customerLoanId, "Loan Document Approved", "Loan Document Verified", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 1, 'Loan Document Approved', 'Loan Document Verified', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([partnerFcm], 1, req.body.loanDocuments[0].customerLoanId, "Loan Document Approved", "Loan Document Verified", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                        }
                    } else {
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
                        }
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 2, 'Loan Document Rejected', 'Loan Document Rejected', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([customerFcm], 2, req.body.loanDocuments[0].customerLoanId, "Loan Document Rejected", "Loan Document Rejected", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 2, 'Loan Document Rejected', 'Loan Document Rejected', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([partnerFcm], 2, req.body.loanDocuments[0].customerLoanId, "Loan Document Rejected", "Loan Document Rejected", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
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

                    }
                    if (customerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                    VALUES(`+ customerUserId + `, 1, 'Document Pendency', 'Generate Document Pendency','` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([customerFcm], 16, req.body.loanDocuments[0].customerLoanId, "Document Pendency", "Generate Document Pendency", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                    }
                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                    VALUES(`+ partnerUserId + `, 16, 'Document Pendency', 'Generate Document Pendency', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([partnerFcm], 1, req.body.loanDocuments[0].customerLoanId, "Document Pendency", "Generate Document Pendency", '', null, null, req.body.loanDocuments[0].customerLoanId, serviceName, null, null);
                    }
                }
                //#endregion Notification

                let successResult = new ResultSuccess(200, true, 'Change Document Status', (result && result.length > 0 ? result[0] : result), 1);
                return res.status(200).send(successResult);

            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoans.changeDocumentStatus() Exception', error, '');
        next(errorResult);
    }
};

const getOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'get Offer');
        var requiredFields = ['serviceId', 'customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let age = req.body.age ? req.body.age : 0;
                let loanAmount = req.body.loanAmount ? req.body.loanAmount : 0;
                let cibilScore = req.body.cibilScore ? req.body.cibilScore : 0;
                let turnOver = req.body.businessAnnualSale ? req.body.businessAnnualSale : 0
                let vintage = req.body.vintage ? req.body.vintage : 0
                let minIncome = req.body.minIncome ? req.body.minIncome : 0;
                let employmentTypeId = req.body.employmentTypeId ? req.body.employmentTypeId : 0;
                let companyCategoryTypeIds = [];
                if (req.body.companyName) {
                    let companyCategoryTypeSql = await query(`SELECT bankcompanycategory.companyCategoryTypeId as companyCategoryTypeId FROM bankcompanycategory INNER JOIN companycategory ON bankcompanycategory.companyCategoryId = companycategory.id WHERE companycategory.companyName = ?`, req.body.companyName)
                    console.log(companyCategoryTypeSql);

                    companyCategoryTypeSql.forEach(ele => {
                        companyCategoryTypeIds.push(ele.companyCategoryTypeId)
                    })
                }
                let sql = `CALL adminGenerateOfferForCustomerLoan(` + employmentTypeId + `,` + req.body.serviceId + `,` + authorizationResult.currentUser.id + `,` + age + `,` + loanAmount + `,'` + companyCategoryTypeIds.toString() + `',` + cibilScore + `,` + turnOver + `,` + minIncome + `,` + vintage + `)`;
                console.log(sql);
                let result = await query(sql);
                console.log(result);

                let offer = [];
                if (result[0] && result[0].length > 0) {
                    offer = result[0];
                    if (companyCategoryTypeIds && companyCategoryTypeIds.length > 0)
                        offer = offer.filter((c) => companyCategoryTypeIds.indexOf(c.companyCategoryTypeId) >= 0)
                    if (cibilScore > 0) {
                        for (let i = 0; i < offer.length; i++) {
                            if (offer[i].cibilScore && offer[i].cibilScore.includes('-')) {
                                let cibil = offer[i].cibilScore.split('-')
                                let minCibil = cibil[0]
                                let maxCibil = cibil[1];
                                offer[i].minCibil = minCibil
                                offer[i].maxCibil = maxCibil
                            }
                            else if (offer[i].cibilScore) {
                                offer[i].minCibil = offer[i].cibilScore
                            }
                        }
                        let cibilOffer = [];
                        for (let j = 0; j < offer.length; j++) {
                            if (offer[j].minCibil && offer[j].maxCibil) {
                                if (offer[j].minCibil <= cibilScore && offer[j].maxCibil >= cibilScore) {
                                    cibilOffer.push(offer[j])
                                }
                            }
                            else if (offer[j].minCibil && !offer[j].maxCibil) {
                                if (offer[j].minCibil <= cibilScore) {
                                    cibilOffer.push(offer[j])
                                }
                            }

                        }
                        offer = cibilOffer
                    }
                    let bankIdSql = await query(`SELECT bankId FROM customerloanoffers WHERE customerLoanId = ?`, req.body.customerLoanId)
                    if (bankIdSql && bankIdSql.length > 0) {
                        if (offer && offer.length > 0) {
                            for (let i = 0; i < offer.length; i++) {
                                try {
                                    let index = bankIdSql.findIndex(c => c.bankId == offer[i].bankId)
                                    if (index >= 0) {
                                        //
                                    }
                                    else {
                                        let sql = `INSERT INTO customerloanoffers (customerLoanId,bankId,employmentTypeId,cibilScore,minAge,maxAge,minIncome,vintage,minTurnOver,maxTurnOver,tenure,ROI,minLoanAmount,maxLoanAmount,companyCategoryTypeId,createdBy,modifiedBy) 
                        VALUES (` + req.body.customerLoanId + `,` + offer[i].bankId + `,` + offer[i].employmentTypeId + `,` + offer[i].cibilScore + `,` + offer[i].minAge + `,` + offer[i].maxAge + `,` + offer[i].minIncome + `,` + offer[i].vintage + `,`
                                            + offer[i].minTurnOver + `,` + offer[i].maxTurnOver + `,'` + offer[i].tenure + `',` + offer[i].ROI + `,` + offer[i].minLoanAmount + `,` + offer[i].maxLoanAmount + `,` + offer[i].companyCategoryTypeId + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`
                                        console.log(sql);
                                        let result = await query(sql);
                                    }
                                } catch (error) {
                                    let errorResult = new ResultError(400, true, "Error While Inserting Offer", result[0], '');
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
                                    + offer[i].minTurnOver + `,` + offer[i].maxTurnOver + `,'` + offer[i].tenure + `',` + offer[i].ROI + `,` + offer[i].minLoanAmount + `,` + offer[i].maxLoanAmount + `,` + offer[i].companyCategoryTypeId + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`
                                console.log(sql);
                                let result = await query(sql);
                            }

                        }
                    }
                    result = await query(`SELECT customerloanoffers.*,banks.name as bankName,companycategorytype.name as companyCategoryType,cd.status as offerStatus,cd.customerloanoffersId FROM customerloanoffers
                    INNER JOIN banks ON banks.id = customerloanoffers.bankId 
                    LEFT JOIN companycategorytype ON companycategorytype.id = customerloanoffers.companyCategoryTypeId
                    left join customerloandetail cd on cd.customerloanoffersId = customerloanoffers.id
                    WHERE customerloanoffers.customerLoanId  = ?`, req.body.customerLoanId)
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Get Generated Offer', result, result.length);
                    return res.status(200).send(successResult);
                }
                let successResult = new ResultSuccess(200, true, 'Get Generated Offer', result[0], result[0].length);
                return res.status(200).send(successResult);
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoans.getOffer() Exception', error, '');
        next(errorResult);
    }
};

const insertSelectedOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Offer');
        var requiredFields = ['customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            let result;
            if (authorizationResult.statusCode == 200) {
                let selectedOffer = [];
                if (req.body && req.body.selectedOffer.length > 0) {
                    for (let index = 0; index < req.body.selectedOffer.length; index++) {
                        let fileStatus = req.body.selectedOffer[index].fileStatus ? req.body.selectedOffer[index].fileStatus : '';
                        try {
                            let updateQuery = `UPDATE customerloanoffers SET status = '` + req.body.selectedOffer[index].status + `', fileStatus = '` + fileStatus + `' WHERE customerLoanId = ` + req.body.customerLoanId + ` AND id = ?`;
                            console.log(updateQuery);

                            result = await query(updateQuery, req.body.selectedOffer[index].id);
                            console.log(result);

                        } catch (error) {
                            let errorResult = new ResultError(400, true, "Error While Inserting Offer", result, '');
                            next(errorResult);
                        }
                    }
                    let successResult = new ResultSuccess(200, true, 'Insert Selected Offer', result, 1);
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
        let errorResult = new ResultError(500, true, 'personalLoans.insertSelectedOffer() Exception', error, '');
        next(errorResult);
    }
};


const printPdf = async (req) => {
    try {
        let sql = "SELECT partners.fullName,partners.permanentCode,partners.panCardNo,partners.gstNo,partneraddress.label,partneraddress.addressLine1,partneraddress.addressLine2,partneraddress.cityId,partneraddress.pincode,cities.name as cityName,districts.name as districtName,states.name as stateName,users.email FROM partners ";
        sql += " LEFT JOIN partneraddress ON partneraddress.partnerId = partners.id ";
        sql += " LEFT JOIN cities ON cities.id = partneraddress.cityId";
        sql += " LEFT JOIN districts ON districts.id = cities.districtId";
        sql += " LEFT JOIN states ON states.id = districts.stateId";
        sql += " LEFT JOIN users ON partners.userId = users.id"
        sql += " WHERE partners.id = ?";
        let partnerResult = await query(sql, req.partnerId);
        console.log(partnerResult);

        let adminSql = "SELECT systemflags.name,systemflags.value FROM systemflags WHERE flagGroupId = 2 OR 3";
        let adminResult = await query(adminSql);

        let lastInvoice = new Date().getFullYear() + ("0" + (new Date().getMonth() + 1)).slice(-2) + ("0" + new Date().getDate()).slice(-2) + req.count;
        let invoiceDate = ("0" + new Date().getDate()).slice(-2) + "/" + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear()
        const today = new Date()
        let month = today.toLocaleString('default', { month: 'short' }) + "/" + new Date().getFullYear()
        let IGST = adminResult.find(c => c.name == 'IGST').value ? (req.commission * adminResult.find(c => c.name == 'IGST').value) / 100 : 0;
        let CGST = adminResult.find(c => c.name == 'CGST').value ? (req.commission * adminResult.find(c => c.name == 'CGST').value) / 100 : 0;
        let SGST = adminResult.find(c => c.name == 'SGST').value ? (req.commission * adminResult.find(c => c.name == 'SGST').value) / 100 : 0;
        let gstNo = partnerResult[0].gstNo ? partnerResult[0].gstNo : '';
        let email = partnerResult[0].email ? partnerResult[0].email : '';
        let addressLine2 = partnerResult[0].addressLine2 ? partnerResult[0].addressLine2 : '';
        let adminGstno = adminResult.find(c => c.name == 'gst').value ? adminResult.find(c => c.name == 'gst').value : '';
        let HsnNo = adminResult.find(c => c.name == 'HSNNo').value ? adminResult.find(c => c.name == 'HSNNo').value : ''
        let adminIGST = adminResult.find(c => c.name == 'IGST').value ? adminResult.find(c => c.name == 'IGST').value : 0
        let adminCGST = adminResult.find(c => c.name == 'CGST').value ? adminResult.find(c => c.name == 'CGST').value : 0
        let adminSGST = adminResult.find(c => c.name == 'SGST').value ? adminResult.find(c => c.name == 'SGST').value : 0

        let total = (req.commission + IGST + CGST + SGST).toFixed(2);
        var words = convertRupeesIntoWords(parseInt(total));
        console.log(words);

        let result;
        var htmlContent = '';
        htmlContent += '<!DOCTYPE html>';
        htmlContent += '<html>';
        htmlContent += '<head>';
        htmlContent += '<style>';
        htmlContent += ' table, th, td {border: 1px solid black;border-collapse: collapse;padding:5px;}'
        htmlContent += 'td:first-child {text-align:center}'
        htmlContent += '    </style>';
        htmlContent += '</head>';
        htmlContent += '<body style="margin:30px;margin-top:0px;">';
        htmlContent += '<p style="text-align:center;font-size: 10px;font-family:arial">Tax Invoice</p>'
        htmlContent += '<div class="row">'
        htmlContent += '<table style="width:100%">'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">Vendor code</td><td style="font-size: 10px;font-family:arial">' + partnerResult[0].permanentCode + '</td><td style="text-align:center;font-size: 10px;font-family:arial">InvoiceNumber</td><td  style="font-size: 10px;font-family:arial">' + lastInvoice + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">Product</td><td style="font-size: 10px;font-family:arial">' + req.serviceName + '</td><td style="text-align:center;font-size: 10px;font-family:arial">InvoiceDate</td><td  style="font-size: 10px;font-family:arial">' + invoiceDate + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">SupplierNo</td><td style="font-size: 10px;font-family:arial">3691 </td><td style="text-align:center;font-size: 10px;font-family:arial">Month of Business</td><td style="font-size: 10px;font-family:arial">' + month + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR NAME </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + partnerResult[0].fullName + ' </td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR ADDRESS </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + partnerResult[0].label + "," + partnerResult[0].addressLine1 + "," + addressLine2 + "," + partnerResult[0].cityName + "," + partnerResult[0].districtName + "," + partnerResult[0].stateName + "," + partnerResult[0].pincode + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR Email </td><td colspan="3" style="font-size: 10px;font-family:arial">' + email + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">GST IN </td><td style="font-size: 10px;font-family:arial">' + gstNo + '</td> <td style="font-size: 10px;font-family:arial">PAN OF THE SUPPLIER </td> <td style="font-size: 10px;font-family:arial">' + partnerResult[0].panCardNo + ' </td></tr>'
        htmlContent += '<tr ><td style="font-size: 10px;font-family:arial">STATE NAME  </td><td style="font-size: 10px;font-family:arial">' + partnerResult[0].stateName + '</td> <td style="font-size: 10px;font-family:arial">STATE CODE </td>  <td style="font-size: 10px;font-family:arial">08 </td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">BRANCH NAME </td><td colspan ="3" style="text-align:center;font-size: 10px;font-family:arial">Jaipur  </td></tr>'
        htmlContent += '</table></div>'
        htmlContent += '<div class="row" style="margin-top:10px;width:100%">'
        console.log(adminResult.find(c => c.name == 'name'));

        htmlContent += '<table style="width:100%"><tr ><td style="font-size: 10px;font-family:arial">BUYER </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'name').value + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">ADDRESS</td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'address').value + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">GSTIN </td><td style="font-size: 10px;font-family:arial">' + adminGstno + '  </td><td style="text-align:center;font-size: 10px;font-family:arial">PAN</td><td style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'panCardNo').value + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">PLACE OF SUPPLY</td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">Jaipur </td></tr>'
        console.log("GSTSUCCESS")
        htmlContent += '</table></div>'
        htmlContent += '<div class="row" style="margin-top:10px;">'
        htmlContent += '<table style="width:100%"><thead> <tr> <td style="font-size: 10px;font-family:arial">Sl.No</td> <td colspan="3" style="font-size: 10px;font-family:arial">Description of service</td> <td style="font-size: 10px;font-family:arial">HSN/NAC</td><td style="font-size: 10px;font-family:arial">GST</td> <td style="font-size: 10px;font-family:arial">Rate</td> <td style="font-size: 10px;font-family:arial">Per</td> <td style="font-size: 10px;font-family:arial">Amount</td> </thead>'
        htmlContent += '<tbody><tr><td style="font-size: 10px;font-family:arial">1</td><td colspan="3" style="font-size: 10px;font-family:arial">DSA Sales Commission</td><td style="font-size: 10px;font-family:arial">' + HsnNo + '</td> <td></td> <td></td> <td></td> <td style="font-size: 10px;font-family:arial">' + req.commission + '</td>  </tr>'
        htmlContent += '<tr><td></td><td colspan="3"></td><td></td><td style="font-size: 10px;font-family:arial">IGST</td> <td style="font-size: 10px;font-family:arial">' + adminIGST + '</td> <td></td> <td style="font-size: 10px;font-family:arial">' + IGST + '</td> </tr>'
        htmlContent += '<tr><td></td><td colspan="3"></td> <td></td> <td style="font-size: 10px;font-family:arial">CGST</td>  <td style="font-size: 10px;font-family:arial">' + adminCGST + '</td>  <td></td>  <td style="font-size: 10px;font-family:arial">' + CGST + '</td>  </tr>'
        htmlContent += '<tr><td></td><td colspan="3"></td> <td></td> <td style="font-size: 10px;font-family:arial">SGST</td> <td style="font-size: 10px;font-family:arial">' + adminSGST + '</td> <td></td> <td style="font-size: 10px;font-family:arial">' + SGST + '</td></tr>'
        // htmlContent += '<tr><td></td><td colspan="3"></td><td></td><td>UGST</td><td>0%</td><td></td><td>0</td></tr>'
        htmlContent += '<tr><td colspan="8" style="text-align:right;font-size: 10px;font-family:arial">Total</td><td style="font-size: 10px;font-family:arial">' + total + '</td></tr>'
        htmlContent += '<tr><td colspan="4" style="font-size: 10px;font-family:arial">Amount Chargeable in words</td><td colspan="5" style="font-size: 10px;font-family:arial">' + words + '</td></tr>'
        htmlContent += '<tr><td colspan="9" style="text-align:right;font-size: 10px;font-family:arial">E & OE</td></tr>'
        htmlContent += '<tr><td colspan="9" style="text-align:center;font-size: 10px;font-family:arial">Company Bank Detail</td></tr>'
        htmlContent += '<tr><td colspan="6" style="text-align:center;font-size: 10px;font-family:arial">Bank Name</td><td colspan="3" style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'bankName').value + ' </td></tr>'
        htmlContent += '<tr><td colspan="6" style="text-align:center;font-size: 10px;font-family:arial">Bank Account Number</td><td style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'bankAccountNumber').value + '</td><td style="font-size: 10px;font-family:arial">Branch & IFSC Code</td><td style="font-size: 10px;font-family:arial"> ' + adminResult.find(c => c.name == 'ifscCode').value + '</td></tr>'
        htmlContent += '<tr><td colspan="6" style="text-align:left;font-size: 10px;font-family:arial"><u>Declaration</u><br><p>We declare that this invoice shows the actual price of the goods & service described and that all particulars are true and correct</p></td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial"><span style="margin-top:10px">Authorized Signatory</span></td></tr>'
        htmlContent += '</tbody></table></div>'
        htmlContent += '</body>'
        htmlContent += '</html>'
        console.log("SUCCESS")
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
        await pdf.generatePdf(file, options).then(pdfBuffer => {
            buffer = pdfBuffer
        });
        let data = {
            "pdfString": buffer,
            "invoiceNumber": lastInvoice,
            "partnerId": req.partnerId
        }
        return data;

    } catch (error) {
        return error;
    }
}

const insertUpdateCustomerLoanRejectionReason = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'CustomerLoan Rejection');
        var requiredFields = ['customerLoanId', 'reason'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.id = req.body.id ? req.body.id : 0;
                let sql = `CALL adminInsertUpdateCustomerLoanRejectionReson(` + req.body.id + `, ` + req.body.customerLoanId + `, '` + req.body.reason + `', ` + authorizationResult.currentUser.id + `)`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    if (req.body.reasons && req.body.reasons.length > 0) {
                        let deleteQuery = await query("DELETE FROM reasons WHERE customerLoanId = ?", req.body.customerLoanId)
                    }
                    for (let index = 0; index < req.body.reasons.length; index++) {
                        let insertQuery = `INSERT INTO reasons(customerLoanId, reason, description, createdBy, modifiedBy) VALUES(` + req.body.customerLoanId + `, '` + req.body.reasons[index].reason + `', '` + req.body.reasons[index].description + `', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let reasonResult = await query(insertQuery);
                    }

                    //#region Notification
                    let customerFcm = "";
                    let customerUserId = null;
                    let partnerFcm = "";
                    let partnerUserId = null;
                    let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                    let customerUserIdResult = await query(customerUserIdSql);
                    if (customerUserIdResult && customerUserIdResult.length > 0) {
                        customerUserId = customerUserIdResult[0].userId;
                        let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                        let customerFcmResult = await query(customerFcmSql);
                        if (customerFcmResult && customerFcmResult.length > 0) {
                            customerFcm = customerFcmResult[0].fcmToken;
                        }
                    }
                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                    let partnerUserIdResult = await query(partnerUserIdSql);
                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                        partnerUserId = partnerUserIdResult[0].userId;
                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                        let partnerFcmResult = await query(partnerFcmSql);
                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                            partnerFcm = partnerFcmResult[0].fcmToken;
                        }
                    }
                    let service = await query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id =? `, req.body.customerLoanId)
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
                    }
                    if (customerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(`+ customerUserId + `, 5, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([customerFcm], 5, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                    }
                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(`+ partnerUserId + `, 5, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([partnerFcm], 5, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                    }
                    //#endregion Notification

                    let successResult = new ResultSuccess(200, true, 'Loan RejectionReason Inserted Successfully', result, 1);
                    return res.status(200).send(successResult);
                    // } else {
                    //    let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                    //    next(errorResult);
                    //}
                }
                else {
                    let errorResult = new ResultError(400, true, "Error While Inserting Loan Rejection Reason", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoans.insertUpdateCustomerLoanRejectionReason() Exception', error, '');
        next(errorResult);
    }
};

const insertUpdatePersonalLoanBasicDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'CustomerLoan Basic Detail');
        var requiredFields = ['customerId', 'alternativeContactNo', 'gender', 'maritalStatusId', 'motherName', 'fatherName', 'serviceId', 'tenureId', 'label', 'addressLine1', 'pincode', 'cityId', 'city', 'district', 'state'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {

                req.body.customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : 0;
                req.body.customerLoanSpouseId = req.body.customerLoanSpouseId ? req.body.customerLoanSpouseId : null;
                req.body.spouseName = req.body.spouseName ? req.body.spouseName : "";
                req.body.spouseContactNo = req.body.spouseContactNo ? req.body.spouseContactNo : "";
                req.body.currentAddressId = req.body.currentAddressId ? req.body.currentAddressId : null;
                req.body.addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                req.body.addressTypeId = 5;
                let birthDate = req.body.birthdate
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
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result && result[1].affectedRows >= 0) {
                        let successResult = new ResultSuccess(200, true, 'PersonalLoanBasicDetail Inserted Successfully', result[0], 1);
                        return res.status(200).send(successResult);
                        // } else {
                        //    let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                        //    next(errorResult);
                        //}
                    }
                }
                else {
                    let errorResult = new ResultError(400, true, "Error While Inserting Personal Loan", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoans.insertUpdatePersonalLoanBasicDetail() Exception', error, '');
        next(errorResult);
    }
};

const insertUpdatePersonalLoanEmploymentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'CustomerLoan Employment Detail');
        var requiredFields = ['employmentTypeId', 'monthlyIncome', 'companyName', 'customerId', 'serviceId', 'customerLoanId', 'label', 'addressLine1', 'pincode', 'cityId', 'city', 'district', 'state', 'designation', 'currentCompanyExperience'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.companyAddressId = req.body.companyAddressId ? req.body.companyAddressId : null;
                req.body.customerLoanEmploymentId = req.body.customerLoanEmploymentId ? req.body.customerLoanEmploymentId : null;
                req.body.companyTypeId = req.body.companyTypeId ? req.body.companyTypeId : null;
                req.body.addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                req.body.addressTypeId = 2;
                let emailId = req.body.officeEmailId ? req.body.officeEmailId : null;
                let sql = `CALL adminInsertUpdateLoanEmploymentDetail(` + req.body.customerLoanId + `,` + req.body.customerLoanEmploymentId + `,` + req.body.employmentTypeId + `,` + req.body.monthlyIncome + `,'` + req.body.companyName + `',` + req.body.companyTypeId + `,'` + req.body.pincode + `',` + req.body.serviceId + `,` + req.body.customerId + `,` + authorizationResult.currentUser.id + `,` + req.body.companyAddressId + `,` + req.body.addressTypeId + `,'` + req.body.label + `','` + req.body.addressLine1 + `','` + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `,'` + req.body.city + `','` + req.body.district + `','`
                    + req.body.state + `','` + req.body.designation + `',` + req.body.currentCompanyExperience + `,'` + emailId + `')`;
                let result = await query(sql);
                if (result && result[1].affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'PersonalLoan Employment Detail Inserted Successfully', result[0], 1);
                    return res.status(200).send(successResult);
                    // } else {
                    //    let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                    //    next(errorResult);
                    //}
                }
                else {
                    let errorResult = new ResultError(400, true, "Error While Inserting Personal Loan", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoans.insertUpdatePersonalLoanEmploymentDetail() Exception', error, '');
        next(errorResult);
    }
};

const updatePersonalLoanAmount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['loanAmount', 'customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let loanAmount = req.body.loanAmount;
                let sql = `CALL adminUpdateLoanAmount(` + customerLoanId + `,` + loanAmount + `,` + userId + `)`;
                let result = await query(sql);
                if (result) {
                    let successResult = new ResultSuccess(200, true, 'Loan Amount Updated', result, 1);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Loan Amount Not Updated", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.updatePersonalLoanAmount()', error, '');
        next(errorResult);
    }
};

const getLoanOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'get Loan Offer');
        var requiredFields = ['customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminGetOffer(` + req.body.customerLoanId + `)`;
                let result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Get Generated Offer', result[0], result[0].length);
                return res.status(200).send(successResult);

            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoans.getOffer() Exception', error, '');
        next(errorResult);
    }
};

const insertOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Offer');
        var requiredFields = ['customerLoanId', 'bankId', 'loanAmount', 'ROI', 'tenure', 'isShared'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            let result;
            if (authorizationResult.statusCode == 200) {
                let id = req.body.id ? req.body.id : 0;
                let otherDetail = req.body.otherDetail ? req.body.otherDetail : '';

                let sql = `CALL adminInsertOffer(` + id + `,` + req.body.customerLoanId + `,` + req.body.bankId + `,` + req.body.loanAmount + `,` + req.body.ROI + `,` + req.body.tenure + `,` + req.body.isShared + `,` + authorizationResult.currentUser.id + `,'` + otherDetail + `')`;
                let result = await query(sql);
                //#region Notification
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                let customerUserIdResult = await query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = await query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                let partnerUserIdResult = await query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = await query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                let statusResult = await query(statusSql);
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
                }
                if (customerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                    let notificationResult = await query(notificationSql);
                    await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                }
                if (partnerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                    let notificationResult = await query(notificationSql);
                    await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                }
                //#endregion Notification


                if (result) {
                    let successResult = new ResultSuccess(200, true, 'Insert Selected Offer', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "Error While Inserting Offer", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoans.insertOffer() Exception', error, '');
        next(errorResult);
    }
};

const deleteLoanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Deleting Loan Request');
        var requiredFields = ["customerLoanId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "UPDATE customerloans SET isDelete = 1,statusId = 16, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = " + req.body.customerLoanId;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let historySql = 'INSERT INTO customerloanstatushistory (customerLoanId,loanStatusId,transactionDate,createdBy,modifiedBy) VALUES (' + req.body.customerLoanId + ',' + 16 + ',' + 'CURRENT_TIMESTAMP()' + ',' + authorizationResult.currentUser.id + ',' + authorizationResult.currentUser.id + ')'
                    let historyResult = await query(historySql)
                    let successResult = new ResultSuccess(200, true, 'Delete Customer Loan Successfully', result, 1);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "personalLoans.deleteLoanById() Error", new Error("Error During Deleting Loan Request"), '');
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
        let errorResult = new ResultError(500, true, 'personalLoans.deleteLoanById()', error, '');
        next(errorResult);
    }
};

const rewardCoin = async (customerLoanId: number, authorizationResult: any, roleId: number) => {
    try {
        let sql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId =" + customerLoanId + ")";
        let result = await query(sql);
        if (result && result.length > 0) {
            let userId = result[0].userId;
            var today = new Date();
            let endDate = (new Date(today).getFullYear() - 1).toString() + '-' + "04-01";
            let startDate = new Date(today).getFullYear().toString() + '-' + "03-31";
            let sql1 = "SELECT cl.* FROM customerloans cl WHERE cl.statusId = (SELECT id FROM loanstatuses WHERE status = 'DISBURSED') AND cl.createdBy = " + userId + "";
            let result1 = await query(sql1);
            if (result1 && result1.length > 0) {
                let totalCount = result.length;
                let sql2 = "SELECT * FROM rewardcoin WHERE rewardTypeId = 4 AND minLoanFile <= " + totalCount + " AND maxLoanFile >= " + totalCount + " AND FIND_IN_SET(" + roleId + ",roleIds)";
                let result2 = await query(sql2);

                if (result2 && result2.length > 0) {
                    let referCoin = result2[0].rewardCoin;
                    if (result2[0].isScratchCard) {
                        let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + userId + `, ` + referCoin + `, 4, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `);`;
                        let rewardResult = await query(rewardSql);
                    }
                    else {
                        let userWalletId;
                        let userWalletIdResult = await query(`SELECT id,coin FROM userwallet WHERE userId = ?`, userId);
                        if (userWalletIdResult && userWalletIdResult.length > 0) {
                            userWalletId = userWalletIdResult[0].id
                            let updateWalletAmountSql = await query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + authorizationResult.currentUser.id + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + referCoin)
                        }
                        else {
                            let insertWalletAmount = await query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`)
                            if (insertWalletAmount && insertWalletAmount.insertId) {
                                userWalletId = insertWalletAmount.insertedId
                            }
                        }
                        let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + userId + `,` + result2[0].rewardCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `,` + 4 + `)`
                        let walletResult = await query(walletSql);
                    }

                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
        return true;
    } catch (error) {
        return error;
    }
}

const getTenure = async (req: Request, res: Response, next: NextFunction) => {

    try {
        logging.info(NAMESPACE, 'Getting Tenure');
        var requiredFields = [''];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;

                let sql = `CALL adminGetTenure();`;
                var result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Tenure Successfully', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "personalLoans.getTenure() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoans.getTenure() Exception', error, '');
        next(errorResult);
    }
};

const uploadPersonalLoanDocumentAndReference = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerLoanId', 'loanDocuments', 'loanReferences'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let response = [];
                if (req.body.loanDocuments) {
                    let cnt = 0;
                    let sendRes = false;
                    let documentIdSql = `SELECT id FROM customerloandocuments WHERE customerLoanId = ?`
                    let documentResult = await query(documentIdSql, req.body.customerLoanId)
                    let ids = [];
                    if (documentResult && documentResult.length > 0) {
                        for (let index = 0; index < documentResult.length; index++) {
                            ids.push(documentResult[index].id)
                        }
                    }
                    for (let i = 0; i < req.body.loanDocuments.length; i++) {
                        if (req.body.loanDocuments[i].documentData && req.body.loanDocuments[i].documentData.includes("https:")) {
                            cnt++;
                            if (req.body.loanDocuments[i].loanDocumentId) {
                                let sql = `Update customerloandocuments SET customerLoanId=` + customerLoanId + `,serviceTypeDocumentId=` + req.body.loanDocuments[i].serviceTypeDocumentId + `
                            ,documentId=`+ req.body.loanDocuments[i].documentId + `,documentUrl='` + req.body.loanDocuments[i].documentData + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                            WHERE id = `+ req.body.loanDocuments[i].loanDocumentId;
                                //VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[i].serviceTypeDocumentId + `,` + req.body.loanDocuments[i].documentId + `,'` + data.Location + `',` + userId + `,` + userId + `)`;
                                let result = await query(sql);
                                if (result && result.affectedRows > 0) {
                                    response.push(result);
                                    ids = ids.filter(c => c != req.body.loanDocuments[i].loanDocumentId);
                                } else {
                                    //
                                }
                            }
                            if (i == req.body.loanDocuments.length - 1) {
                                if (req.body.loanReferences && req.body.loanReferences.length > 0) {
                                    for (let j = 0; j < req.body.loanReferences.length; j++) {
                                        if (req.body.loanReferences[j] && req.body.loanReferences[j].loanReferenceId) {
                                            let refSql = `UPDATE customerloanreferences SET customerLoanId=` + customerLoanId + `,fullName='` + req.body.loanReferences[j].name + `',
                                        contactNo='`+ req.body.loanReferences[j].contactNo + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE id = ` + req.body.loanReferences[j].loanReferenceId;
                                            //VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                            let refResult = await query(refSql);
                                            let refAddressSql = `UPDATE  customerreferenceaddresses SET label ='` + req.body.loanReferences[j].label + `',addressLine1='` + req.body.loanReferences[j].addressLine1 + `',addressLine2='` + req.body.loanReferences[j].addressLine2 + `',pincode='` + req.body.loanReferences[j].pincode + `',cityId=` + req.body.loanReferences[j].cityId + `,city='` + req.body.loanReferences[j].city + `',district='` + req.body.loanReferences[j].district + `',state='` + req.body.loanReferences[j].state + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE customerLoanReferenceId = ` + req.body.loanReferences[j].loanReferenceId;
                                            let refAddressResult = await query(refAddressSql);
                                            if (refResult && refResult.affectedRows > 0) {
                                                response.push(refResult);
                                            } else {
                                                //
                                            }
                                        } else {
                                            let refSql = `INSERT INTO customerloanreferences(customerLoanId,fullName,contactNo,createdBy,modifiedBy)
                                        VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                            let refResult = await query(refSql);
                                            let insertedId = refResult.insertId;
                                            let refAddressSql = `INSERT INTO customerreferenceaddresses(customerLoanReferenceId,addressTypeId,label,addressLine1,addressLine2,pincode,cityId,city,district,state,createdBy,modifiedBy) VALUES(` + insertedId + `,` + 1 + `,'` + req.body.loanReferences[j].label + `','` + req.body.loanReferences[j].addressLine1 + `','` + req.body.loanReferences[j].addressLine2 + `','` + req.body.loanReferences[j].pincode + `',` + req.body.loanReferences[j].cityId + `,'` + req.body.loanReferences[j].city + `','` + req.body.loanReferences[j].district + `','` + req.body.loanReferences[j].state + `',` + userId + `,` + userId + `)`;
                                            let refAddressResult = await query(refAddressSql);

                                            if (refResult && refResult.affectedRows > 0) {
                                                response.push(refResult);
                                            } else {
                                                //
                                            }
                                        }
                                    }

                                    let statusSql = `SELECT loanstatuses.status FROM customerloanstatushistory INNER JOIN loanstatuses ON loanstatuses.id = customerloanstatushistory.loanStatusId WHERE customerloanId=` + customerLoanId + ` ORDER BY customerloanstatushistory.id DESC LIMIT 1`
                                    let statusResult = await query(statusSql);
                                    let objResult = { "loanStatusName": statusResult[0].status };

                                    if (!sendRes && cnt == req.body.loanDocuments.length) {
                                        let successResult = new ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                        sendRes = true;
                                        return res.status(200).send(successResult);
                                    }
                                }
                                else {
                                    let successResult = new ResultSuccess(200, true, 'Document Uploaded', response, 1);
                                    return res.status(200).send(successResult);
                                }
                            }
                        } else {
                            let buf = Buffer.from(req.body.loanDocuments[i].documentData, 'base64');
                            let contentType;
                            if (req.body.loanDocuments[i].isPdf)
                                contentType = 'application/pdf';
                            else
                                contentType = 'image/jpeg'
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

                            await S3.upload(params, async (error, data) => {
                                if (error) {
                                    isErr = true;
                                    let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
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
                                            ,documentId=`+ req.body.loanDocuments[k].documentId + `,documentUrl='` + url + `',documentStatus='` + documentStatus + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                                            WHERE id = `+ req.body.loanDocuments[k].loanDocumentId;
                                                //VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[i].serviceTypeDocumentId + `,` + req.body.loanDocuments[i].documentId + `,'` + data.Location + `',` + userId + `,` + userId + `)`;
                                                let result = await query(sql);
                                                if (result && result.affectedRows > 0) {
                                                    response.push(result);
                                                    ids = ids.filter(c => c != req.body.loanDocuments[k].loanDocumentId);
                                                } else {
                                                    //
                                                }


                                            } else if (req.body.loanDocuments[k].documentData) {
                                                url = req.body.loanDocuments[k].documentData;
                                                let sql = `Update customerloandocuments SET customerLoanId=` + customerLoanId + `,serviceTypeDocumentId=` + req.body.loanDocuments[k].serviceTypeDocumentId + `
                                            ,documentId=`+ req.body.loanDocuments[k].documentId + `,documentUrl='` + url + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                                            WHERE id = `+ req.body.loanDocuments[k].loanDocumentId;
                                                //VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[i].serviceTypeDocumentId + `,` + req.body.loanDocuments[i].documentId + `,'` + data.Location + `',` + userId + `,` + userId + `)`;
                                                let result = await query(sql);
                                                if (result && result.affectedRows > 0) {
                                                    response.push(result);
                                                    ids = ids.filter(c => c != req.body.loanDocuments[i].loanDocumentId);
                                                } else {
                                                    //
                                                }
                                            }

                                        } else {
                                            let documentStatus = 'PENDING';
                                            let sql = `INSERT INTO customerloandocuments(customerLoanId,serviceTypeDocumentId,documentId,documentUrl,documentStatus,createdBy,modifiedBy) 
                                            VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[k].serviceTypeDocumentId + `,` + req.body.loanDocuments[k].documentId + `,'` + req.body.loanDocuments[k].docUrl + `','` + documentStatus + `',` + userId + `,` + userId + `)`;
                                            let result = await query(sql);
                                            if (result && result.affectedRows > 0) {
                                                response.push(result);
                                            } else {
                                                //
                                            }
                                        }
                                    }
                                    if (req.body.loanReferences && req.body.loanReferences.length > 0) {
                                        for (let j = 0; j < req.body.loanReferences.length; j++) {
                                            if (req.body.loanReferences[j] && req.body.loanReferences[j].loanReferenceId) {
                                                let refSql = `UPDATE customerloanreferences SET customerLoanId=` + customerLoanId + `,fullName='` + req.body.loanReferences[j].name + `',
                                            contactNo='`+ req.body.loanReferences[j].contactNo + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE id = ` + req.body.loanReferences[j].loanReferenceId;
                                                //VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                                let refResult = await query(refSql);
                                                let refAddressSql = `UPDATE  customerreferenceaddresses SET label ='` + req.body.loanReferences[j].label + `',addressLine1='` + req.body.loanReferences[j].addressLine1 + `',addressLine2='` + req.body.loanReferences[j].addressLine2 + `',pincode='` + req.body.loanReferences[j].pincode + `',cityId=` + req.body.loanReferences[j].cityId + `,city='` + req.body.loanReferences[j].city + `',district='` + req.body.loanReferences[j].district + `',state='` + req.body.loanReferences[j].state + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE customerLoanReferenceId = ` + req.body.loanReferences[j].loanReferenceId;
                                                let refAddressResult = await query(refAddressSql);
                                                if (refResult && refResult.affectedRows > 0) {
                                                    response.push(refResult);
                                                } else {
                                                    //
                                                }
                                            } else {
                                                let refSql = `INSERT INTO customerloanreferences(customerLoanId,fullName,contactNo,createdBy,modifiedBy)
                                            VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                                let refResult = await query(refSql);
                                                let insertedId = refResult.insertId;
                                                let refAddressSql = `INSERT INTO customerreferenceaddresses(customerLoanReferenceId,addressTypeId,label,addressLine1,addressLine2,pincode,cityId,city,district,state,createdBy,modifiedBy) VALUES(` + insertedId + `,` + 1 + `,'` + req.body.loanReferences[j].label + `','` + req.body.loanReferences[j].addressLine1 + `','` + req.body.loanReferences[j].addressLine2 + `','` + req.body.loanReferences[j].pincode + `',` + req.body.loanReferences[j].cityId + `,'` + req.body.loanReferences[j].city + `','` + req.body.loanReferences[j].district + `','` + req.body.loanReferences[j].state + `',` + userId + `,` + userId + `)`;
                                                let refAddressResult = await query(refAddressSql);
                                                if (refResult && refResult.affectedRows > 0) {
                                                    response.push(refResult);
                                                } else {
                                                    //
                                                }
                                            }
                                        }
                                        let statusSql = `SELECT loanstatuses.status FROM customerloanstatushistory INNER JOIN loanstatuses ON loanstatuses.id = customerloanstatushistory.loanStatusId WHERE customerloanId=` + customerLoanId + ` ORDER BY customerloanstatushistory.id DESC LIMIT 1`
                                        let statusResult = await query(statusSql);
                                        let objResult;
                                        if (statusResult && statusResult.length > 0) {
                                            objResult = { "loanStatusName": statusResult[0].status };
                                        } else {
                                            let loanStatusId;
                                            let pendingSeatus = await query("SELECT id FROM loanstatuses WHERE status = 'PENDING'");
                                            if (pendingSeatus && pendingSeatus.length > 0) {
                                                loanStatusId = pendingSeatus[0].id;
                                                let statusSql = "INSERT INTO customerloanstatushistory(customerloanId,loanStatusId,createdBy,modifiedBy) VALUES(" + customerLoanId + "," + loanStatusId + "," + userId + "," + userId + ")";
                                                let statusResult = await query(statusSql);
                                                let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                                                let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                                                let chageStatusResult = await query(chageStatusSql, customerLoanId);


                                                let loancompleteSql = "UPDATE loancompletescreenhistory SET isCompleted=true WHERE customerLoanId=" + customerLoanId;
                                                let loanCompleteResult = await query(loancompleteSql);
                                                objResult = { "loanStatusName": "PENDING" };
                                            }
                                        }

                                        if (!sendRes) {
                                            sendRes = true;
                                            let successResult = new ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                            return res.status(200).send(successResult);
                                        }
                                    }
                                    else {
                                        let successResult = new ResultSuccess(200, true, 'Document Uploaded', response, 1);
                                        return res.status(200).send(successResult);
                                    }

                                }
                            });
                            if (isErr) {
                                break;
                            }
                        }
                    }
                    if (ids && ids.length > 0) {
                        for (let i = 0; i < ids.length; i++) {
                            let deleteSql = `DELETE FROM customerloandocuments WHERE id = ?`;
                            let deleteResult = await query(deleteSql, ids[i]);
                        }

                    }
                } else {
                    if (req.body.loanReferences && req.body.loanReferences.length > 0) {
                        for (let j = 0; j < req.body.loanReferences.length; j++) {
                            if (req.body.loanReferences[j] && req.body.loanReferences[j].loanReferenceId) {
                                let refSql = `UPDATE customerloanreferences SET customerLoanId=` + customerLoanId + `,fullName='` + req.body.loanReferences[j].name + `',
                                contactNo='`+ req.body.loanReferences[j].contactNo + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE id = ` + req.body.loanReferences[j].loanReferenceId;
                                //VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                let refResult = await query(refSql);
                                let refAddressSql = `UPDATE  customerreferenceaddresses SET label ='` + req.body.loanReferences[j].label + `',addressLine1='` + req.body.loanReferences[j].addressLine1 + `',addressLine2='` + req.body.loanReferences[j].addressLine2 + `',pincode='` + req.body.loanReferences[j].pincode + `',cityId=` + req.body.loanReferences[j].cityId + `,city='` + req.body.loanReferences[j].city + `',district='` + req.body.loanReferences[j].district + `',state='` + req.body.loanReferences[j].state + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() WHERE customerLoanReferenceId = ` + req.body.loanReferences[j].loanReferenceId;
                                let refAddressResult = await query(refAddressSql);
                                if (refResult && refResult.affectedRows > 0) {
                                    response.push(refResult);
                                } else {
                                    //
                                }
                            } else {
                                let refSql = `INSERT INTO customerloanreferences(customerLoanId,fullName,contactNo,createdBy,modifiedBy)
                                VALUES(`+ customerLoanId + `,'` + req.body.loanReferences[j].name + `','` + req.body.loanReferences[j].contactNo + `',` + userId + `,` + userId + `)`;
                                let refResult = await query(refSql);
                                let insertedId = refResult.insertId;
                                let refAddressSql = `INSERT INTO customerreferenceaddresses(customerLoanReferenceId,addressTypeId,label,addressLine1,addressLine2,pincode,cityId,city,district,state,createdBy,modifiedBy) VALUES(` + insertedId + `,` + 1 + `,'` + req.body.loanReferences[j].label + `','` + req.body.loanReferences[j].addressLine1 + `','` + req.body.loanReferences[j].addressLine2 + `','` + req.body.loanReferences[j].pincode + `',` + req.body.loanReferences[j].cityId + `,'` + req.body.loanReferences[j].city + `','` + req.body.loanReferences[j].district + `','` + req.body.loanReferences[j].state + `',` + userId + `,` + userId + `)`;
                                let refAddressResult = await query(refAddressSql);

                                if (refResult && refResult.affectedRows > 0) {
                                    response.push(refResult);
                                } else {
                                    //
                                }
                            }
                        }
                        let loanStatusId;
                        let pendingSeatus = await query("SELECT id FROM loanstatuses WHERE status = 'PENDING'");
                        if (pendingSeatus && pendingSeatus.lengt > 0) {
                            loanStatusId = pendingSeatus[0].id;
                            let statusSql = "INSERT INTO customerloanstatushistory(customerloanId,loanStatusId,createdBy,modifiedBy) VALUES(" + customerLoanId + "," + loanStatusId + "," + userId + "," + userId + ")";
                            let statusResult = await query(statusSql);
                            let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                            let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                            let chageStatusResult = await query(chageStatusSql, customerLoanId);
                            if (chageStatusResult) {
                                //
                            }
                        }
                        let successResult = new ResultSuccess(200, true, 'Document Uploaded', response, 1);
                        return res.status(200).send(successResult);
                    }
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
        let errorResult = new ResultError(500, true, 'personalLoan.uploadPersonalLoanDocumentAndReference()', error, '');
        next(errorResult);
    }
};

const changeEmploymentType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `UPDATE loancompletescreenhistory SET isCompleted = false,completeScreen = 5 WHERE customerLoanId = ?`;
                let result = await query(sql, req.body.customerLoanId);
                let historysql = `DELETE FROM  customerloanstatushistory WHERE customerLoanId = ?`;
                let historyResult = await query(historysql, req.body.customerLoanId);
                let customerLoanSql = `UPDATE customerloans SET statusId = NULL,loanTransactionDate = NULL WHERE id = ?`;
                let customerLoanResult = await query(customerLoanSql, req.body.customerLoanId);
                if (customerLoanResult && customerLoanResult.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Change Employment Type', customerLoanResult, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.changeEmploymentType() Error", customerLoanResult, '');
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
    }
    catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoan.changeEmploymentType() Exception', error, '');
        next(errorResult);
    }
}

const acceptLoanOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['bankOfferId', 'isAccept'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            let status = req.body.status ? req.body.status : '';
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminAcceptOffer(` + req.body.bankOfferId + `,` + req.body.isAccept + `,` + authorizationResult.currentUser.id + `,'` + status + `',` + req.body.customerLoanId + `)`;
                let result = await query(sql);
                let customerFcm = "";
                let customerUserId = null;
                let partnerFcm = "";
                let partnerUserId = null;
                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                let customerUserIdResult = await query(customerUserIdSql);
                if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = customerUserIdResult[0].userId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = await query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                }
                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                let partnerUserIdResult = await query(partnerUserIdSql);
                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                    partnerUserId = partnerUserIdResult[0].userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = await query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                }
                let service = await query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id =? `, req.body.customerLoanId)
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
                }
                if (customerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                    VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                    let notificationResult = await query(notificationSql);
                    await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                }
                if (partnerFcm) {
                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                    VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                    let notificationResult = await query(notificationSql);
                    await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, req.body.customerLoanId, service[0].name, null, null);
                    console.log("notification", notificationResult)
                }

                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Accept Offer Successfully', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.acceptLoanOffer() Error", result, '');
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
    }
    catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoan.acceptLoanOffer() Exception', error, '');
        next(errorResult);
    }
}
const disbursedApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerLoanId', 'bankId', 'amountDisbursed'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            let status = req.body.status ? req.body.status : '';

            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId
                try {
                    //#region notification
                    let customerFcm = "";
                    let customerUserId = null;
                    let partnerFcm = "";
                    let partnerUserId = null;
                    try {
                        let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + customerLoanId + ")";
                        let customerUserIdResult = await query(customerUserIdSql);
                        if (customerUserIdResult && customerUserIdResult.length > 0) {
                            customerUserId = customerUserIdResult[0].userId;
                            let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let customerFcmResult = await query(customerFcmSql);
                            if (customerFcmResult && customerFcmResult.length > 0) {
                                customerFcm = customerFcmResult[0].fcmToken;
                            }
                        }
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + customerLoanId + ")";
                        let partnerUserIdResult = await query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = await query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }
                        let service = await query(`SELECT services.name FROM services INNER JOIN customerloans ON customerloans.serviceId = services.id WHERE customerloans.id =? `, customerLoanId)
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
                        }
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(`+ customerUserId + `, 4, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([customerFcm], 4, customerLoanId, title, description, '', null, null, customerLoanId, service[0].name, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy)
                        VALUES(`+ partnerUserId + `, 4, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([partnerFcm], 4, customerLoanId, title, description, '', null, null, customerLoanId, service[0].name, null, null);
                        }


                    } catch (error) {
                        let errorResult = new ResultError(400, true, "personalLoan.notificationError() Error", 'last Invoice Error', '');
                        next(errorResult);
                    }
                    try {
                        let getPartnerSql = "SELECT * FROM partners where userId = (select createdBy from customerloans where id = " + customerLoanId + ")";
                        let getPartnerResult = await query(getPartnerSql);
                        console.log("getPartnerResult", getPartnerResult);

                        let getRoleSql = "select * from roles where id = (select roleId from userroles where userId = (select createdBy from customerloans where id = " + customerLoanId + "))";
                        let getRoleResult = await query(getRoleSql);
                        if (getRoleResult && getRoleResult.length > 0) {
                            if (getRoleResult[0].name == 'ADMINISTRATOR' || getRoleResult[0].name == 'CUSTOMERS') {
                                //Admin Commission
                                try {
                                    let getAdminCommissionSql = "SELECT * FROM bankloancommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId;
                                    let getAdminCommissionResult = await query(getAdminCommissionSql);
                                    if (getAdminCommissionResult && getAdminCommissionResult.length > 0) {
                                        let getAdminUserSql = "select * from users where id IN(select userId from userroles where roleId IN(1)) and isDisabled = 0;";
                                        let getAdminUserResult = await query(getAdminUserSql);
                                        if (getAdminUserResult && getAdminUserResult.length > 0) {
                                            let checkadminCommissionSql = "SELECT * FROM admincommission WHERE userId = " + getAdminUserResult[0].id;
                                            let checkadminCommissionResult = await query(checkadminCommissionSql);
                                            if (checkadminCommissionResult && checkadminCommissionResult.length > 0) {
                                                // update
                                                let commission = 0;
                                                commission = parseFloat((req.body.amountDisbursed * getAdminCommissionResult[0].commission / 100).toFixed(2));
                                                try {
                                                    let updateAdminCommissionSql = `UPDATE admincommission SET commission = commission + ` + commission + ` WHERE id = ` + checkadminCommissionResult[0].id;
                                                    let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                        try {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkadminCommissionResult[0].id + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + commission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                        } catch (error) {
                                                            let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                            next(errorResult);
                                                        }

                                                    }
                                                } catch (error) {
                                                    let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                    next(errorResult);
                                                }


                                            } else {
                                                //insert
                                                let commission = 0;
                                                commission = parseFloat((req.body.amountDisbursed * getAdminCommissionResult[0].commission / 100).toFixed(2));
                                                try {
                                                    let insertAdminCommissionSql = `INSERT INTO admincommission(userId, commission, createdBy, modifiedBy) VALUES(` + getAdminUserResult[0].id + `, ` + commission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                    let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                    if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                        try {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + commission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                        } catch (error) {
                                                            let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                            next(errorResult);
                                                        }

                                                    }
                                                } catch (error) {
                                                    let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                    next(errorResult);
                                                }


                                            }
                                        }

                                    }
                                } catch (error) {
                                    let errorResult = new ResultError(400, true, "personalLoan.generationAdminCommission() Error", 'Generating adminCommission Error', '');
                                    next(errorResult);
                                }
                            }
                            //Admin and Partner Commission Chain
                            else {
                                let getAdminCommissionSql = "SELECT * FROM bankloancommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId;
                                let getAdminCommissionResult = await query(getAdminCommissionSql);
                                if (getAdminCommissionResult && getAdminCommissionResult.length > 0) {
                                    let getAdminUserSql = "select * from users where id IN(select userId from userroles where roleId IN(1)) and isDisabled = 0;";
                                    let getAdminUserResult = await query(getAdminUserSql);
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
                                                let checkTeamPartnerResult = await query(checkTeamPartnerSql);
                                                if (checkTeamPartnerResult && checkTeamPartnerResult.length > 0) {
                                                    //Employee is in network
                                                    let checkSubDsaSql = "SELECT parentPartnerId FROM partners WHERE id = " + checkTeamPartnerResult[0].partnerId;
                                                    let checkSubDsaResult = await query(checkSubDsaSql);
                                                    if (checkSubDsaResult && checkSubDsaResult.length > 0) {

                                                        // checkTeamPartnerResult[0].partnerId is Sub DSA
                                                        try {
                                                            let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                            let dsaCommissionResult = await query(dsaCommissionSql);
                                                            if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                                let dsaCommPer = 0;
                                                                if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                    //                                                 //Sitewide Flat Commission
                                                                    dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));

                                                                } else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                    //LoanWise Flat Commission          
                                                                    dsaCommPer = dsaCommissionResult[0].commission;
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                                }

                                                                let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                                let checkdsaCommissionResult = await query(checkdsaCommissionSql);
                                                                if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                    //update
                                                                    let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                    let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    }
                                                                }
                                                                else {
                                                                    //insert
                                                                    try {
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkTeamPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    catch (error) {
                                                                        let errorResult = new ResultError(400, true, "personalLoan.notificationError() Error", 'last Invoice Error', '');
                                                                        next(errorResult);
                                                                    }
                                                                }
                                                                let subdsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                let subdsaCommissionResult = await query(subdsaCommissionSql);
                                                                if (subdsaCommissionResult && subdsaCommissionResult.length > 0) {
                                                                    let subdsaCommPer = 0;
                                                                    if (subdsaCommissionResult[0].commissionTypeId == 2) {
                                                                        //Sitewide Flat Commission
                                                                        subdsaCommPer = parseFloat((dsaCommPer * subdsaCommissionResult[0].commission / 100).toFixed(2));
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));

                                                                    } else if (subdsaCommissionResult[0].commissionTypeId == 3) {
                                                                        //LoanWise Flat Commission          
                                                                        subdsaCommPer = subdsaCommissionResult[0].commission;
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));
                                                                    }

                                                                    let checksubdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                    let checksubdsaCommissionResult = await query(checksubdsaCommissionSql);
                                                                    if (checksubdsaCommissionResult && checksubdsaCommissionResult.length > 0) {
                                                                        //update
                                                                        let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + subdsaCommission + ` WHERE id = ` + checksubdsaCommissionResult[0].id;
                                                                        let updateAdminCommissionResult = await query(updateAdminCommissionSql);

                                                                        if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checksubdsaCommissionResult[0].id + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    } else {
                                                                        //insert
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkSubDsaResult[0].parentPartnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

                                                                        }
                                                                    }

                                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id
                                                                    let employeeCommissionResult = await query(employeeCommissionSql);

                                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                            //                                                         //Sitewide Flat Commission
                                                                            let commPer = parseFloat((subdsaCommPer * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));

                                                                        } else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                            //LoanWise Flat Commission          
                                                                            let commPer = employeeCommissionResult[0].commission;
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                                        }

                                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                                        let checkemployeeCommissionResult = await query(checkemployeeCommissionSql);
                                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                            //update
                                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                            let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        } else {
                                                                            //insert
                                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionResult = await query(insertAdminCommissionSql);

                                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        } catch (error) {

                                                        }
                                                    }
                                                    else {
                                                        let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                        let employeeCommissionResult = await query(employeeCommissionSql);
                                                        if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                            if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                //                                                     //Sitewide Flat Commission
                                                                let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));

                                                            } else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                     //LoanWise Flat Commission          
                                                                let commPer = employeeCommissionResult[0].commission;
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                            }

                                                            let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                            let checkemployeeCommissionResult = await query(checkemployeeCommissionSql);
                                                            console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                            if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                //                                                     //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    //                                                        
                                                                }
                                                            } else {
                                                                //                                                     //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                }
                                                            }
                                                        }
                                                        //checkTeamPartnerResult[0].partnerId is DSA
                                                        let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                        let dsaCommissionResult = await query(dsaCommissionSql);

                                                        if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                            let dsaCommPer = 0;
                                                            if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                //Sitewide Flat Commission
                                                                dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));

                                                            } else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                 //LoanWise Flat Commission          
                                                                dsaCommPer = dsaCommissionResult[0].commission;
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                            }

                                                            let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkTeamPartnerResult[0].partnerId;
                                                            let checkdsaCommissionResult = await query(checkdsaCommissionSql);
                                                            console.log("checkdsaCommissionResult", checkdsaCommissionResult);
                                                            if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    //                                                   
                                                                }
                                                            } else {
                                                                //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkTeamPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkTeamPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    //                                                     
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else {

                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                    let employeeCommissionResult = await query(employeeCommissionSql);
                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                            //Sitewide Flat Commission
                                                            let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));

                                                        } else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                            //LoanWise Flat Commission          
                                                            let commPer = employeeCommissionResult[0].commission;
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }

                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                        let checkemployeeCommissionResult = await query(checkemployeeCommissionSql);
                                                        console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                            //update
                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                            let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                //                                                         

                                                            }
                                                        } else {
                                                            //insert
                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

                                                            }
                                                        }
                                                    }
                                                }
                                                adminCommission = totalCommission - dsaCommission - subdsaCommission - employeeCommission;
                                            }
                                            if (getRoleResult[0].name == 'CONNECTOR') {
                                                let checkNetworkPartnerSql = "SELECT * FROM partnernetworks WHERE networkPartnerId = " + getPartnerResult[0].id;
                                                let checkNetworkPartnerResult = await query(checkNetworkPartnerSql);
                                                if (checkNetworkPartnerResult && checkNetworkPartnerResult.length > 0) {
                                                    //Employee is in network
                                                    let checkSubDsaSql = "SELECT parentPartnerId FROM partners WHERE id = " + checkNetworkPartnerResult[0].partnerId;
                                                    let checkSubDsaResult = await query(checkSubDsaSql);
                                                    if (checkSubDsaResult && checkSubDsaResult.length > 0) {

                                                        // checkTeamPartnerResult[0].partnerId is Sub DSA
                                                        try {
                                                            let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                            let dsaCommissionResult = await query(dsaCommissionSql);
                                                            if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                                let dsaCommPer = 0;
                                                                if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                    //                                                 //Sitewide Flat Commission
                                                                    dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));

                                                                } else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                    //LoanWise Flat Commission          
                                                                    dsaCommPer = dsaCommissionResult[0].commission;
                                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                                }

                                                                let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                                let checkdsaCommissionResult = await query(checkdsaCommissionSql);
                                                                if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                    //update
                                                                    let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                    let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    }
                                                                }
                                                                else {
                                                                    //insert
                                                                    try {
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkNetworkPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    }
                                                                    catch (error) {
                                                                        let errorResult = new ResultError(400, true, "personalLoan.insertCommission() Error", 'last Invoice Error', '');
                                                                        next(errorResult);
                                                                    }
                                                                }
                                                                let subdsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                let subdsaCommissionResult = await query(subdsaCommissionSql);
                                                                if (subdsaCommissionResult && subdsaCommissionResult.length > 0) {
                                                                    let subdsaCommPer = 0;
                                                                    if (subdsaCommissionResult[0].commissionTypeId == 2) {
                                                                        //Sitewide Flat Commission
                                                                        subdsaCommPer = parseFloat((dsaCommPer * subdsaCommissionResult[0].commission / 100).toFixed(2));
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));

                                                                    } else if (subdsaCommissionResult[0].commissionTypeId == 3) {
                                                                        //LoanWise Flat Commission          
                                                                        subdsaCommPer = subdsaCommissionResult[0].commission;
                                                                        subdsaCommission = parseFloat((req.body.amountDisbursed * subdsaCommPer / 100).toFixed(2));
                                                                    }

                                                                    let checksubdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkSubDsaResult[0].parentPartnerId;
                                                                    let checksubdsaCommissionResult = await query(checksubdsaCommissionSql);
                                                                    if (checksubdsaCommissionResult && checksubdsaCommissionResult.length > 0) {
                                                                        //update
                                                                        let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + subdsaCommission + ` WHERE id = ` + checksubdsaCommissionResult[0].id;
                                                                        let updateAdminCommissionResult = await query(updateAdminCommissionSql);

                                                                        if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checksubdsaCommissionResult[0].id + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                        }
                                                                    } else {
                                                                        //insert
                                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkSubDsaResult[0].parentPartnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                        let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkSubDsaResult[0].parentPartnerId + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

                                                                        }
                                                                    }

                                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id
                                                                    let employeeCommissionResult = await query(employeeCommissionSql);

                                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                            //                                                         //Sitewide Flat Commission
                                                                            let commPer = parseFloat((subdsaCommPer * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));

                                                                        } else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                            //LoanWise Flat Commission          
                                                                            let commPer = employeeCommissionResult[0].commission;
                                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                                        }

                                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                                        let checkemployeeCommissionResult = await query(checkemployeeCommissionSql);
                                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                            //update
                                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                            let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        } else {
                                                                            //insert
                                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                            let insertAdminCommissionResult = await query(insertAdminCommissionSql);

                                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        } catch (error) {

                                                        }
                                                    }
                                                    else {
                                                        let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                        let employeeCommissionResult = await query(employeeCommissionSql);
                                                        if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                            if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                                //                                                     //Sitewide Flat Commission
                                                                let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));

                                                            } else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                     //LoanWise Flat Commission          
                                                                let commPer = employeeCommissionResult[0].commission;
                                                                employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                            }

                                                            let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                            let checkemployeeCommissionResult = await query(checkemployeeCommissionSql);
                                                            console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                            if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                                //                                                     //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                                let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    //                                                        
                                                                }
                                                            } else {
                                                                //                                                     //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                }
                                                            }
                                                        }
                                                        //checkTeamPartnerResult[0].partnerId is DSA
                                                        let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                        let dsaCommissionResult = await query(dsaCommissionSql);

                                                        if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                            let dsaCommPer = 0;
                                                            if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                                //Sitewide Flat Commission
                                                                dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));

                                                            } else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                                //                                                 //LoanWise Flat Commission          
                                                                dsaCommPer = dsaCommissionResult[0].commission;
                                                                dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                            }

                                                            let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                            let checkdsaCommissionResult = await query(checkdsaCommissionSql);
                                                            console.log("checkdsaCommissionResult", checkdsaCommissionResult);
                                                            if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                                //update
                                                                let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                                let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                                if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    //                                                   
                                                                }
                                                            } else {
                                                                //insert
                                                                let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkNetworkPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                                if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                                    let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                    let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                    //                                                     
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                                else {

                                                    let employeeCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                    let employeeCommissionResult = await query(employeeCommissionSql);
                                                    if (employeeCommissionResult && employeeCommissionResult.length > 0) {
                                                        if (employeeCommissionResult[0].commissionTypeId == 2) {
                                                            //Sitewide Flat Commission
                                                            let commPer = parseFloat((getAdminCommissionResult[0].commission * employeeCommissionResult[0].commission / 100).toFixed(2));
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));

                                                        } else if (employeeCommissionResult[0].commissionTypeId == 3) {
                                                            //LoanWise Flat Commission          
                                                            let commPer = employeeCommissionResult[0].commission;
                                                            employeeCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }

                                                        let checkemployeeCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                        let checkemployeeCommissionResult = await query(checkemployeeCommissionSql);
                                                        console.log("checkemployeeCommissionResult", checkemployeeCommissionResult);
                                                        if (checkemployeeCommissionResult && checkemployeeCommissionResult.length > 0) {
                                                            //update
                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + employeeCommission + ` WHERE id = ` + checkemployeeCommissionResult[0].id;
                                                            let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkemployeeCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                                //                                                         

                                                            }
                                                        } else {
                                                            //insert
                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + employeeCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + employeeCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

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
                                            let checkNetworkPartnerResult = await query(checkNetworkPartnerSql);
                                            if (checkNetworkPartnerResult && checkNetworkPartnerResult.length > 0) {
                                                let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                let dsaCommissionResult = await query(dsaCommissionSql);
                                                console.log("dsaCommissionResult", dsaCommissionResult);
                                                if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                    let dsaCommPer = 0;
                                                    if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                        //Sitewide Flat Commission
                                                        dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                        dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));

                                                    } else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                        //LoanWise Flat Commission          
                                                        dsaCommPer = dsaCommissionResult[0].commission;
                                                        dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                    }

                                                    let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + checkNetworkPartnerResult[0].partnerId;
                                                    let checkdsaCommissionResult = await query(checkdsaCommissionSql);

                                                    if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                        //update
                                                        let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                        let updateAdminCommissionResult = await query(updateAdminCommissionSql);

                                                        if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                        }
                                                    } else {
                                                        //insert
                                                        let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + checkNetworkPartnerResult[0].partnerId + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                        if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                            let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + checkNetworkPartnerResult[0].partnerId + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

                                                        }
                                                    }

                                                    let subdsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                                    let subdsaCommissionResult = await query(subdsaCommissionSql);
                                                    if (subdsaCommissionResult && subdsaCommissionResult.length > 0) {
                                                        if (subdsaCommissionResult[0].commissionTypeId == 2) {
                                                            //Sitewide Flat Commission
                                                            let commPer = parseFloat((dsaCommPer * subdsaCommissionResult[0].commission / 100).toFixed(2));
                                                            subdsaCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));

                                                        } else if (subdsaCommissionResult[0].commissionTypeId == 3) {
                                                            //LoanWise Flat Commission          
                                                            let commPer = subdsaCommissionResult[0].commission;
                                                            subdsaCommission = parseFloat((req.body.amountDisbursed * commPer / 100).toFixed(2));
                                                        }

                                                        let checksubdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                        let checksubdsaCommissionResult = await query(checksubdsaCommissionSql);
                                                        if (checksubdsaCommissionResult && checksubdsaCommissionResult.length > 0) {
                                                            //update
                                                            let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + subdsaCommission + ` WHERE id = ` + checksubdsaCommissionResult[0].id;
                                                            let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checksubdsaCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

                                                            }
                                                        } else {
                                                            //insert
                                                            let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                            let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                                let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + subdsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

                                                            }
                                                        }
                                                    }
                                                }
                                            }

                                            adminCommission = totalCommission - dsaCommission - subdsaCommission;

                                        } else {
                                            let dsaCommissionSql = "SELECT * FROM bankloanpartnercommissions WHERE bankId = " + req.body.bankId + " AND serviceId = " + req.body.serviceId + " AND partnerId = " + getPartnerResult[0].id;
                                            let dsaCommissionResult = await query(dsaCommissionSql);
                                            if (dsaCommissionResult && dsaCommissionResult.length > 0) {
                                                let dsaCommPer = 0;
                                                if (dsaCommissionResult[0].commissionTypeId == 2) {
                                                    //Sitewide Flat Commission
                                                    dsaCommPer = parseFloat((getAdminCommissionResult[0].commission * dsaCommissionResult[0].commission / 100).toFixed(2));
                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));

                                                } else if (dsaCommissionResult[0].commissionTypeId == 3) {
                                                    //                                         //LoanWise Flat Commission          
                                                    dsaCommPer = dsaCommissionResult[0].commission;
                                                    dsaCommission = parseFloat((req.body.amountDisbursed * dsaCommPer / 100).toFixed(2));
                                                }

                                                let checkdsaCommissionSql = "SELECT * FROM partnercommission WHERE partnerId = " + getPartnerResult[0].id;
                                                let checkdsaCommissionResult = await query(checkdsaCommissionSql);

                                                if (checkdsaCommissionResult && checkdsaCommissionResult.length > 0) {
                                                    //update
                                                    let updateAdminCommissionSql = `UPDATE partnercommission SET commission = commission + ` + dsaCommission + ` WHERE id = ` + checkdsaCommissionResult[0].id;
                                                    let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                                    console.log(updateAdminCommissionResult);

                                                    if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows >= 0) {
                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkdsaCommissionResult[0].id + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);

                                                    }
                                                } else {
                                                    //                                         //insert
                                                    let insertAdminCommissionSql = `INSERT INTO partnercommission(partnerId, commission, createdBy, modifiedBy) VALUES(` + getPartnerResult[0].id + `, ` + dsaCommission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                    let insertAdminCommissionResult = await query(insertAdminCommissionSql);
                                                    if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows >= 0) {
                                                        let insertAdminCommissionHistorySql = `INSERT INTO partnercommissionhistory(partnerCommissionId, partnerId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getPartnerResult[0].id + `, ` + req.body.id + `, ` + dsaCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                        let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                                        //                                            
                                                    }
                                                }
                                            }
                                            //}

                                            adminCommission = totalCommission - dsaCommission;
                                        }
                                        //#endregion PartnerCommission


                                        let checkadminCommissionSql = "SELECT * FROM admincommission WHERE userId = " + getAdminUserResult[0].id;
                                        let checkadminCommissionResult = await query(checkadminCommissionSql);
                                        if (checkadminCommissionResult && checkadminCommissionResult.length > 0) {
                                            // update
                                            let updateAdminCommissionSql = `UPDATE admincommission SET commission = commission + ` + adminCommission + ` WHERE id = ` + checkadminCommissionResult[0].id;
                                            let updateAdminCommissionResult = await query(updateAdminCommissionSql);
                                            if (updateAdminCommissionResult && updateAdminCommissionResult.affectedRows > 0) {
                                                let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + checkadminCommissionResult[0].id + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + adminCommission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                            }
                                        } else {
                                            //insert
                                            let commission = 0;
                                            commission = parseFloat((req.body.amountDisbursed * getAdminCommissionResult[0].commission / 100).toFixed(2));


                                            let insertAdminCommissionSql = `INSERT INTO admincommission(userId, commission, createdBy, modifiedBy) VALUES(` + getAdminUserResult[0].id + `, ` + commission + `, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                            let insertAdminCommissionResult = await query(insertAdminCommissionSql);

                                            if (insertAdminCommissionResult && insertAdminCommissionResult.affectedRows > 0) {
                                                let insertAdminCommissionHistorySql = `INSERT INTO admincommissionhistory(adminCommissionId, userId, loanDetailId, commission, type, createdBy, modifiedBy) VALUES(` + insertAdminCommissionResult.insertId + `, ` + getAdminUserResult[0].id + `, ` + req.body.id + `, ` + commission + `, 'IN', ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                                                let insertAdminCommissionHistoryResult = await query(insertAdminCommissionHistorySql);
                                            }
                                        }
                                    }
                                }
                            }
                            let idResult = await query(`SELECT statusId FROM customerloans WHERE id = ? `, req.body.customerLoanId);
                            if (idResult[0].statusId != 8) {
                                let insertQueryResult = await query(`INSERT INTO customerloanstatushistory (customerLoanId,loanStatusId,transactionDate,createdBy,modifiedBy) VALUES (` + req.body.customerLoanId + `,` + `8,CURRENT_TIMESTAMP(),` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`);
                                if (insertQueryResult && insertQueryResult.affectedRows >= 0) {
                                    let updateSqlResult = await query(`UPDATE customerloans SET statusId = 8,modifiedDate = CURRENT_TIMESTAMP(),modifiedBy = ` + authorizationResult.currentUser.id + ` WHERE id =?`, req.body.customerLoanId)
                                    if (updateSqlResult && updateSqlResult.length > 0) {
                                        try {
                                            let rewardResult = await rewardCoin(req.body.customerLoanId, authorizationResult, getRoleResult[0].id)

                                        } catch (error) {
                                            let errorResult = new ResultError(400, true, "personalLoan.acceptLoanOffer() Error", error, '');
                                            next(errorResult);
                                        }
                                    }
                                }
                            }

                        }
                        let result;
                        try {
                            let sql = `CALL adminAcceptOffer(` + req.body.id + `,` + req.body.isAccept + `,` + authorizationResult.currentUser.id + `,'DISBURSED',` + req.body.customerLoanId + `)`;
                            result = await query(sql);
                            if (result && result.affectedRows >= 0) {
                                let successResult = new ResultSuccess(200, true, 'Accept Offer Successfully', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new ResultError(400, true, "personalLoan.acceptLoanOffer() Error", result, '');
                                next(errorResult);
                            }
                        } catch (error) {
                            let errorResult = new ResultError(400, true, "personalLoan.acceptLoanOffer() Error", result, '');
                            next(errorResult);
                        }

                    }
                    catch (error) {
                        let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                        next(errorResult);
                    }
                }
                catch (error) {
                    let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                    next(errorResult);
                }

            }
            //#endregion notification
            else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new ResultError(500, true, 'personalLoan.acceptLoanOffer() Exception', error, '');
        next(errorResult);
    }
}

const insertLoanDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Personal Loan Detail');
        var requiredFields = ['customerLoanId', 'emi', 'tenure', 'bankId', 'ROI', 'refrenceNo', 'amountDisbursed'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId;
                let id = req.body.id ? req.body.id : 0
                let isShared = req.body.isShared ? req.body.isShared : false
                let result
                if (req.body.termsCondition) {
                    if (req.body.termsCondition.includes("https:")) {
                        let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + req.body.termsCondition + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;

                        result = await query(sql);
                        if (result && result[1].affectedRows >= 0) {
                            let customerFcm = "";
                            let customerUserId = null;
                            let partnerFcm = "";
                            let partnerUserId = null;
                            let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                            let customerUserIdResult = await query(customerUserIdSql);
                            if (customerUserIdResult && customerUserIdResult.length > 0) {
                                customerUserId = customerUserIdResult[0].userId;
                                let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                let customerFcmResult = await query(customerFcmSql);
                                if (customerFcmResult && customerFcmResult.length > 0) {
                                    customerFcm = customerFcmResult[0].fcmToken;
                                }
                            }
                            let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                            let partnerUserIdResult = await query(partnerUserIdSql);
                            if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                partnerUserId = partnerUserIdResult[0].userId;
                                let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                let partnerFcmResult = await query(partnerFcmSql);
                                if (partnerFcmResult && partnerFcmResult.length > 0) {
                                    partnerFcm = partnerFcmResult[0].fcmToken;
                                }
                            }
                            let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                            let statusResult = await query(statusSql);
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
                            }
                            if (customerFcm) {
                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                let notificationResult = await query(notificationSql);
                                await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                            }
                            if (partnerFcm) {
                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                let notificationResult = await query(notificationSql);
                                await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                            }
                            let successResult = new ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                            return res.status(200).send(successResult);
                        } else {
                            let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", result, '');
                            next(errorResult);
                        }
                    }
                    else {
                        if (req.body.id) {
                            let checkUrlSql = `SELECT termsCondition from customerloandetail WHERE id = ` + req.body.id;
                            let checkUrlResult = await query(checkUrlSql);
                            if (checkUrlResult && checkUrlResult.length > 0) {
                                if (checkUrlResult[0].termsCondition) {
                                    let splt = checkUrlResult[0].termsCondition.split("/");
                                    const delResp = await S3.deleteObject({
                                        Bucket: 'loan-termscondition',
                                        Key: splt[splt.length - 1],
                                    }, async (err, data) => {
                                        if (err) {
                                            console.log("Error: Object delete failed.");
                                            let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                            next(errorResult);
                                        } else {
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
                                            await S3.upload(params, async (error, data) => {
                                                if (error) {
                                                    let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                                    next(errorResult);
                                                    return;
                                                }
                                                let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + data.Location + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;

                                                result = await query(sql);
                                                if (result && result[1].affectedRows >= 0) {
                                                    let customerFcm = "";
                                                    let customerUserId = null;
                                                    let partnerFcm = "";
                                                    let partnerUserId = null;
                                                    let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                                                    let customerUserIdResult = await query(customerUserIdSql);
                                                    if (customerUserIdResult && customerUserIdResult.length > 0) {
                                                        customerUserId = customerUserIdResult[0].userId;
                                                        let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                        let customerFcmResult = await query(customerFcmSql);
                                                        if (customerFcmResult && customerFcmResult.length > 0) {
                                                            customerFcm = customerFcmResult[0].fcmToken;
                                                        }
                                                    }
                                                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                                                    let partnerUserIdResult = await query(partnerUserIdSql);
                                                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                                        partnerUserId = partnerUserIdResult[0].userId;
                                                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                        let partnerFcmResult = await query(partnerFcmSql);
                                                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                                                            partnerFcm = partnerFcmResult[0].fcmToken;
                                                        }
                                                    }
                                                    let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                                                    let statusResult = await query(statusSql);
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
                                                    }
                                                    if (customerFcm) {
                                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                                        let notificationResult = await query(notificationSql);
                                                        await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                                    }
                                                    if (partnerFcm) {
                                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                                        let notificationResult = await query(notificationSql);
                                                        await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                                    }
                                                    let successResult = new ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                                                    return res.status(200).send(successResult);
                                                } else {
                                                    let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                                    next(errorResult);
                                                }
                                            });
                                        }
                                    });
                                } else {
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
                                    await S3.upload(params, async (error, data) => {
                                        if (error) {
                                            let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                            next(errorResult);
                                            return;
                                        }
                                        let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + data.Location + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;

                                        result = await query(sql);
                                        if (result && result[1].affectedRows >= 0) {
                                            let customerFcm = "";
                                            let customerUserId = null;
                                            let partnerFcm = "";
                                            let partnerUserId = null;
                                            let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                                            let customerUserIdResult = await query(customerUserIdSql);
                                            if (customerUserIdResult && customerUserIdResult.length > 0) {
                                                customerUserId = customerUserIdResult[0].userId;
                                                let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                let customerFcmResult = await query(customerFcmSql);
                                                if (customerFcmResult && customerFcmResult.length > 0) {
                                                    customerFcm = customerFcmResult[0].fcmToken;
                                                }
                                            }
                                            let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                                            let partnerUserIdResult = await query(partnerUserIdSql);
                                            if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                                partnerUserId = partnerUserIdResult[0].userId;
                                                let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                                let partnerFcmResult = await query(partnerFcmSql);
                                                if (partnerFcmResult && partnerFcmResult.length > 0) {
                                                    partnerFcm = partnerFcmResult[0].fcmToken;
                                                }
                                            }
                                            let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                                            let statusResult = await query(statusSql);
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
                                            }
                                            if (customerFcm) {
                                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                                let notificationResult = await query(notificationSql);
                                                await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                            }
                                            if (partnerFcm) {
                                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                                let notificationResult = await query(notificationSql);
                                                await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                            }
                                            let successResult = new ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                                            return res.status(200).send(successResult);
                                        } else {
                                            let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                            next(errorResult);
                                        }
                                    });
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
                            await S3.upload(params, async (error, data) => {
                                if (error) {
                                    let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                    next(errorResult);
                                    return;
                                }
                                let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + data.Location + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;

                                result = await query(sql);
                                if (result && result[1].affectedRows >= 0) {
                                    let customerFcm = "";
                                    let customerUserId = null;
                                    let partnerFcm = "";
                                    let partnerUserId = null;
                                    let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                                    let customerUserIdResult = await query(customerUserIdSql);
                                    if (customerUserIdResult && customerUserIdResult.length > 0) {
                                        customerUserId = customerUserIdResult[0].userId;
                                        let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                        let customerFcmResult = await query(customerFcmSql);
                                        if (customerFcmResult && customerFcmResult.length > 0) {
                                            customerFcm = customerFcmResult[0].fcmToken;
                                        }
                                    }
                                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                                    let partnerUserIdResult = await query(partnerUserIdSql);
                                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                        partnerUserId = partnerUserIdResult[0].userId;
                                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                        let partnerFcmResult = await query(partnerFcmSql);
                                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                                            partnerFcm = partnerFcmResult[0].fcmToken;
                                        }
                                    }
                                    let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                                    let statusResult = await query(statusSql);
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
                                    }
                                    if (customerFcm) {
                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                        let notificationResult = await query(notificationSql);
                                        await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                    }
                                    if (partnerFcm) {
                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                        let notificationResult = await query(notificationSql);
                                        await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                                    }
                                    let successResult = new ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                                    return res.status(200).send(successResult);
                                } else {
                                    let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", error, '');
                                    next(errorResult);
                                }
                            });
                        }
                    }
                }
                else {
                    let sql = `CALL adminInsertLoanDetail(` + id + `,` + req.body.customerLoanId + `, '` + req.body.refrenceNo + `', '` + '' + `', ` + req.body.amountDisbursed + `, ` + req.body.ROI + `, ` + req.body.bankId + `, ` + req.body.emi + `, '` + '' + `', ` + req.body.tenure + `, ` + req.body.totalInterestPayable + `, ` + authorizationResult.currentUser.id + `,` + isShared + `,` + req.body.bankOfferId + `)`;
                    result = await query(sql);
                    if (result && result[1].affectedRows >= 0) {
                        let customerFcm = "";
                        let customerUserId = null;
                        let partnerFcm = "";
                        let partnerUserId = null;
                        let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                        let customerUserIdResult = await query(customerUserIdSql);
                        if (customerUserIdResult && customerUserIdResult.length > 0) {
                            customerUserId = customerUserIdResult[0].userId;
                            let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let customerFcmResult = await query(customerFcmSql);
                            if (customerFcmResult && customerFcmResult.length > 0) {
                                customerFcm = customerFcmResult[0].fcmToken;
                            }
                        }
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnerscustomerloans WHERE customerLoanId = " + req.body.customerLoanId + ")";
                        let partnerUserIdResult = await query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = await query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }
                        let statusSql = "SELECT * FROM loanstatuses WHERE id = " + 13;
                        let statusResult = await query(statusSql);
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
                        }
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([customerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 3, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([partnerFcm], 3, req.body.customerLoanId, title, description, '', null, null, null, null, null, null);
                        }
                        let successResult = new ResultSuccess(200, true, 'Insert LoanDetail', result[0][0], 1);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Error While Inserting Loan Detail", result, '');
                        next(errorResult);
                    }
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
        let errorResult = new ResultError(500, true, 'personalLoans.insertLoanDetail() Exception', error, '');
        next(errorResult);
    }
}

export default {
    getPersonalLoan, getPersonalLoanById, assignToRM, changeDocumentStatus, getOffer, insertSelectedOffer, insertUpdateCustomerLoanRejectionReason, insertUpdatePersonalLoanBasicDetail, insertUpdatePersonalLoanEmploymentDetail, updatePersonalLoanAmount, insertOffer, getLoanOffer, deleteLoanById, getTenure, uploadPersonalLoanDocumentAndReference, changeEmploymentType, acceptLoanOffer, disbursedApplication, insertLoanDetail
}