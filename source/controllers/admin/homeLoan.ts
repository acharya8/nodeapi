import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { AdminPersonalLoanDocumentResponse } from '../../classes/output/admin/loans/adminPersonalloanDocumentsResponse';
import { AdminCustomerResponse } from '../../classes/output/admin/loans/adminCustomerResponse';
import { AdminLoanStatusResponse } from '../../classes/output/admin/loans/adminLoanStatusResponse';
import { AdminHomeLoanResponse } from '../../classes/output/admin/loans/adminHomeLoanResponse';
import { HomeLoanDocumentResponse } from '../../classes/output/loan/home loan/homeLoanDocumentResponse';
import { HomeLoanPermanentAddressDetailResponse } from '../../classes/output/loan/home loan/homeLoanPermanentAddressDetailResponse';
import { HomeLoanCurrentResidenseResponse } from '../../classes/output/loan/home loan/homeLoanCurrentResidenceResponse';
import { loanCompleteHistoryResponse } from '../../classes/output/loan/loanCompleteHistoryReponse';
import { HomeLoanCorrespondenceAddressDetailResponse } from '../../classes/output/loan/home loan/homeLoanCorrespondenceResponse';
import { AdminHomeLoanPropertyResponse } from '../../classes/output/admin/loans/adminHomeLoanPropertyResponse';
import { AdminHomeLoanEmploymentDetailResponse } from '../../classes/output/admin/loans/adminHomeLoanEmploymentDetailResponse';
import { AdminHomeLoanCoapplicantResponse } from '../../classes/output/admin/loans/adminHomeLoanCoApplicantResponse';
import { AdminGroupDetailResponse } from '../../classes/output/admin/loans/adminGroupDetailResponse';

let connection = mysql.createConnection({
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

const NAMESPACE = 'Home Loan';

const getHomeLoan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Home Loans');
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
                LEFT JOIN customers ON customerloans.customerId = customers.id
                LEFT JOIN customeraddresses ON customeraddresses.customerId = customers.id
                INNER JOIN userroles ON userroles.userId = customers.userId
                WHERE customerloans.serviceId = `+ serviceId + ` AND customeraddresses.addressTypeId = 1`;

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
                if (req.body.startIndex >= 0 && fetchRecords > 0)
                    sqlQuery += " LIMIT " + fetchRecords + " OFFSET " + startIndex;
                let resultquery = await query(sqlQuery);
                if (resultquery && resultquery.length > 0) {
                    let ids = resultquery.map(c => c.id);
                    if (ids && ids.length > 0) {
                        let sql = `CALL adminGetHomeLoan('` + ids.toString() + `')`;
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
                                        let basicDetail: AdminCustomerResponse = new AdminCustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].contactNo, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId
                                            , obj[i].customerLoan[j].employmentType, obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.monthlyIncome, obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.companyName
                                            , obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.officePincode, obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].id, obj[i].customerLoan[j]?.customerLoanEmploymentDetail[0]?.id
                                            , ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.id : ""), ((obj[i].customerLoan[j]?.partners && obj[i].customerLoan[j]?.partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.permanentCode : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.fullName : ""), ((obj[i].customerLoan[j].partners && obj[i].customerLoan[j].partners.length > 0) ? obj[i].customerLoan[j]?.partners[0]?.contactNo : ""), obj[i]?.customerLoan[j]?.rmFullName, obj[i]?.customerLoan[j]?.status, obj[i]?.customerLoan[j]?.createdBy, obj[i].maritalStatusId, obj[i].maritalStatus, null, null, obj[i].customerLoan[j].isDelete, obj[i].email, obj[i].customerLoan[j].customerId, null, null, null, null, null, null, null, null, null, null, null, obj[i].customerLoan[j].leadId, obj[i].customerLoan[j].statusId, obj[i].customerLoan[j].createdDate);
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
                                        let groupDetail: AdminGroupDetailResponse = new AdminGroupDetailResponse(
                                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.permanentCode : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? obj[0].customerLoan[0]?.partners[0]?.fullName : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? obj[0].customerLoan[0]?.partners[0]?.contactNo : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? obj[0].customerLoan[0]?.partners[0]?.roleName : ""), ((obj[0].customerLoan[0].partners && obj[0].customerLoan[0].partners.length > 0) ? obj[0].customerLoan[0]?.partners[0]?.gender : "")
                                        );
                                        let objRes: AdminHomeLoanResponse = new AdminHomeLoanResponse(basicDetail, null, null, null, null, null, null, null, loanStatus, loanDocuments, null, null, null, null, null, groupDetail);
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

const getHomeLoanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Home Loan Detail');
        let requiredFields = ['customerLoanId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerIdSql = await query("SELECT customerId FROM customerloans WHERE id = ?", req.body.customerLoanId);
                let customerId = customerIdSql[0].customerId;
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL adminGetHomeLoanByCustomerLoanId('` + customerId + `','` + customerLoanId + `')`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Incomplete data is not available', [], 0);
                        return res.status(200).send(successResult);
                    } else {
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
                                let parentSqlResult = await query(`SELECT p1.parentPartnerId,p1.fullName as parentPartner,p2.fullName as parentParentPartnerName  FROM partners as p1 LEFT JOIN partners as p2 ON p1.parentPartnerId = p2.id WHERE p1.id = ?`, obj[0].partners[0].parentPartnerId)
                                if (parentSqlResult && parentSqlResult.length > 0) {
                                    obj[0].partners[0].parentParentPartnerId = parentSqlResult[0]?.parentPartnerId
                                    obj[0].partners[0].parentParentPartnerName = parentSqlResult[0]?.parentParentPartnerName
                                    obj[0].partners[0].parentPartnerName = parentSqlResult[0]?.parentPartner
                                }
                            }
                        }
                        let coapplicants = [];
                        let loanStatus = null;
                        let basicDetail: AdminCustomerResponse = new AdminCustomerResponse(obj[0].fullName, obj[0].birthdate, obj[0].contactNo, obj[0].panCardNo, obj[0].customerLoan[0]?.employmentTypeId
                            , obj[0].customerLoan[0]?.employmentType, obj[0]?.customerLoanEmploymentDetail[0]?.monthlyIncome, obj[0]?.customerLoanEmploymentDetail[0]?.companyName
                            , obj[0]?.customerLoanEmploymentDetail[0]?.officePincode, obj[0]?.customerLoan[0].loanAmount, obj[0]?.customerLoan[0].id, obj[0].customerLoanEmploymentDetail[0]?.id
                            , ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.fullName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0]?.partners[0]?.contactNo : ""), obj[0]?.customerLoan[0]?.rmFullName, obj[0]?.customerLoan[0]?.status, obj[0]?.customerLoan[0]?.createdBy, obj[0]?.maritalStatusId, obj[0]?.maritalStatus, obj[0]?.customerLoan[0].motherName, obj[0]?.customerLoan[0]?.fatherContactNo, obj[0].customerLoan[0]?.isDelete, obj[0]?.email, obj[0].customerLoan[0].customerId, null, null, null, null, null, null, null, null, null, null, null, obj[0].customerLoan[0].leadId, obj[0].customerLoan[0].statusId, obj[0].customerLoan[0].createdDate, obj[0].customerLoan[0].serviceId, obj[0].cibilScore, obj[0].gender, obj[0].customerLoan[0].loanType);
                        for (let i = 0; i < obj[0].customerloancoapplicants.length; i++) {
                            let ind = obj[0].customerloancoapplicantemploymentdetails.findIndex(c => c.customerLoanCoApplicantId == obj[0].customerloancoapplicants[i].id);
                            if (obj[0].customerloancoapplicantemploymentdetails[ind]) {
                                let coapplicant: AdminHomeLoanCoapplicantResponse = new AdminHomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId, obj[0].customerloancoapplicants[i].maritalStatus, obj[0].customerloancoapplicants[i].coApplicantRelation, obj[0].customerloancoapplicantemploymentdetails[ind].id, obj[0].customerloancoapplicantemploymentdetails[ind].monthlyIncome, obj[0].customerloancoapplicantemploymentdetails[ind].companyAddressId, obj[0].customerloancoapplicantemploymentdetails[ind].addressTypeId, obj[0].customerloancoapplicantemploymentdetails[ind]?.label, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine1, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine2, obj[0].customerloancoapplicantemploymentdetails[ind].pincode, obj[0].customerloancoapplicantemploymentdetails[ind].cityId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentNatureId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentServiceTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].industryTypeId);
                                coapplicants.push(coapplicant);
                            }
                            else {
                                let coapplicant: AdminHomeLoanCoapplicantResponse = new AdminHomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId, obj[0].customerloancoapplicants[i].maritalStatus, obj[0].customerloancoapplicants[i].coApplicantRelation);
                                coapplicants.push(coapplicant);
                            }

                        }
                        // if (obj[0].customerLoanStatusHistory) {
                        //     loanStatus = new LoanStatusResponse(obj[0].customerLoanStatusHistory[].id, obj[0].customerLoanStatusHistory.transactionDate, obj[0].customerLoanStatusHistory.loanStatus,
                        //         obj[0].customerLoanStatusHistory.isDataEditable, result[10][0].transactionDate, obj[0].customerLoan.displayName, null);
                        // }
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerloandocuments.length; i++) {
                            let loanDocuments: HomeLoanDocumentResponse = new HomeLoanDocumentResponse(obj[0].customerloandocuments[i].id, obj[0].customerloandocuments[i].documentId, obj[0].customerloandocuments[i].documentUrl, obj[0].customerloandocuments[i].documentName, obj[0].customerloandocuments[i].isPdf, obj[0].customerloandocuments[i].serviceTypeDocumentId, obj[0].customerloandocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }
                        let loanOffer = [];
                        if (obj[0].customerLoanOffers) {
                            loanOffer = obj[0].customerLoanOffers;
                        }

                        let propertyDetail: AdminHomeLoanPropertyResponse = obj[0].customerPropertyDetail && obj[0].customerPropertyDetail.length > 0 ? new AdminHomeLoanPropertyResponse(obj[0].customerPropertyDetail[0]?.id, obj[0].customerPropertyDetail[0]?.propertyTypeId, obj[0].customerPropertyDetail[0]?.propertyPurchaseValue, obj[0]?.customerPropertyDetail[0]?.propertyCityId, obj[0].customerLoan.loanAmount, obj[0].customerPropertyDetail[0]?.addressLine1, obj[0].customerPropertyDetail[0]?.addressLine2, obj[0].customerPropertyDetail[0]?.pincode, obj[0].customerId, obj[0].customerPropertyDetail[0]?.propertyType, obj[0].customerPropertyDetail[0]?.propertyCity, obj[0].customerPropertyDetail[0]?.propertyDistrict, obj[0].customerPropertyDetail[0]?.propertyState, obj[0]?.customerPropertyDetail[0]?.loanType) : null;
                        let transferPropertyDetail = obj[0].customerTransferPropertyDetail ? obj[0].customerTransferPropertyDetail : null;
                        let employmentDetail: AdminHomeLoanEmploymentDetailResponse = obj[0].customerLoanEmploymentDetail && obj[0].customerLoanEmploymentDetail.length > 0 ? new AdminHomeLoanEmploymentDetailResponse(obj[0].customerLoan[0].employmentTypeId, obj[0].customerLoanEmploymentDetail[0]?.monthlyIncome, obj[0].customerLoanEmploymentDetail[0]?.label, obj[0].customerLoanEmploymentDetail[0]?.addressLine1, obj[0].customerLoanEmploymentDetail[0]?.addressLine2, obj[0].customerLoanEmploymentDetail[0]?.pincode, obj[0].customerLoanEmploymentDetail[0]?.cityId, obj[0].customerLoanEmploymentDetail[0]?.companyAddressId, obj[0].customerLoanEmploymentDetail[0]?.addressTypeId, obj[0].customerLoanEmploymentDetail[0]?.id, obj[0].customerLoanEmploymentDetail[0]?.industryTypeId, obj[0].customerLoanEmploymentDetail[0]?.employmentNatureId, obj[0].customerLoanEmploymentDetail[0]?.employmentServiceTypeId, obj[0].customerLoanEmploymentDetail[0]?.employmentServiceType, obj[0].customerLoanEmploymentDetail[0]?.employmentNature, obj[0].customerLoanEmploymentDetail[0]?.industryType) : null;
                        let residenseDetail: HomeLoanCurrentResidenseResponse = obj[0].customerloancurrentresidentdetails && obj[0].customerloancurrentresidentdetails.length > 0 ? new HomeLoanCurrentResidenseResponse(obj[0].customerloancurrentresidentdetails[0].residentTypeId, obj[0].customerloancurrentresidentdetails[0].id, obj[0].customerloancurrentresidentdetails[0].rentAmount, obj[0].customerloancurrentresidentdetails[0].valueOfProperty, obj[0].customerloancurrentresidentdetails[0].residentType) : null;
                        let permanentAddressDetail: HomeLoanPermanentAddressDetailResponse = obj[0].addressId ? new HomeLoanPermanentAddressDetailResponse(obj[0]?.label, obj[0].addressLine1, obj[0].addressLine2, obj[0].pincode, obj[0].cityId, obj[0].addressTypeId, obj[0].addressId, obj[0].city) : null;
                        let correspondenceAddressDetail: HomeLoanCorrespondenceAddressDetailResponse = obj[0].correspondenseAddress && obj[0].correspondenseAddress.length > 0 ? new HomeLoanCorrespondenceAddressDetailResponse(obj[0].correspondenseAddress[0].label, obj[0].correspondenseAddress[0].addressLine1, obj[0].correspondenseAddress[0].addressLine2, obj[0].correspondenseAddress[0].pincode, obj[0].correspondenseAddress[0].cityId, obj[0].correspondenseAddress[0].addressTypeId, obj[0].correspondenseAddress[0].addressId) : null;

                        let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(obj[0].customerLoanCompleteHistory[0]?.isCompleted, obj[0].customerLoanCompleteHistory[0]?.completeScreen);
                        let disbursedData;
                        if (obj[0]?.disbursedData && obj[0].disbursedData.length > 0) {
                            disbursedData = obj[0].disbursedData;
                        }
                        let rejectionReason = [];
                        if (obj[0].customerLoanRejectionReason && obj[0].customerLoanRejectionReason.length > 0) {
                            rejectionReason = obj[0].customerLoanRejectionReason;
                            rejectionReason[0].reasons = obj[0].reasons;
                        }
                        let groupDetail: AdminGroupDetailResponse = obj[0].partners && obj[0].partners.length > 0 ? new AdminGroupDetailResponse(
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.id : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0].permanentCode : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.fullName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.contactNo : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.roleName : ""),
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.gender : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentPartnerId : ""),
                            ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentParentPartnerId : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentParentPartnerName : ""), ((obj[0].partners && obj[0].partners.length > 0) ? obj[0].partners[0]?.parentPartnerName : "")
                        ) : null;
                        let response: AdminHomeLoanResponse = new AdminHomeLoanResponse(basicDetail, coapplicants, propertyDetail, residenseDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer, disbursedData, rejectionReason ? rejectionReason[0] : null, obj[0]?.customerLoanStatusHistory, transferPropertyDetail, groupDetail);

                        let successResult = new ResultSuccess(200, true, 'Getting Home Loan Data', [response], 1);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting Home Loan Data", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.getHomeLoanById()', error, '');
        next(errorResult);
    }
};

const insertUpdateHomeLoanBasicDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Basic Detail');
        let requiredFields = ["customerId", "fullName", "birthdate", "maritalStatusId", "loanAmount", "residentTypeId", "loanType"];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : null;
                let partnerId = 0;
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                if (dsaCode && !customerLoanId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = await query(dsaSql);
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
                let loanType = req.body.loanTypel
                let sql = `CALL adminInsertUpdateHomeLoanBasicDetail(` + customerLoanId + `,'` + motherName + `','` + fatherContactNo + `',` + userId + `,` + customerId + `,'` + fullName + `','` + dDate + `',` + maritalStatusId + `,'` + panCardNo + `',` + loanAmount + `,` + serviceId + `,` + partnerId + `,` + residentTypeId + `,` + rentAmount + `,` + valueOfProperty + `,` + customerloancurrentresidentdetailId + `,` + currentUserId + `,'` + req.body.loanType + `')`;
                let result = await query(sql);
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
                            customerLoanId = result[0][0].customerLoanId
                            let coApplicantSql = `CALL insertUpdateHomeLoanCoApplicant(` + customerLoanCoApplicantId + `,` + customerLoanId + `,'` + fullName + `','` + dDate + `',` + maritalStatusId + `
                            ,` + coApplicantRelationId + `,` + userId + `)`;
                            let coApplicantResult = await query(coApplicantSql);
                            if (coApplicantResult[0] && coApplicantResult[0].length > 0) {
                                let data = {
                                    "customerLoanCoApplicantId": coApplicantResult[0][0].customerLoanCoApplicantId,
                                    "coApplicantName": fullName
                                }
                                finalResult.push(data);
                            }
                        }
                        let deleteCoapplicantIds = (req.body.deleteCoapplicantIds && req.body.deleteCoapplicantIds.length > 0) ? req.body.deleteCoapplicantIds.toString() : "";
                        if (deleteCoapplicantIds) {
                            let coApplicantSql = `CALL removeHomeLoanCoapplicant('` + deleteCoapplicantIds + `')`;
                            let coApplicantResult = await query(coApplicantSql);
                        }
                        let finalData = {
                            "customerLoanId": customerLoanId,
                            "coApplicantIds": finalResult,
                            "customerloancurrentresidentdetailId": result[0][0].customerloancurrentresidentdetailId
                        }
                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Address And Co Applicant Saved', finalData, finalResult.length);
                        return res.status(200).send(successResult);

                    } else {
                        let deleteCoapplicantIds = (req.body.deleteCoapplicantIds && req.body.deleteCoapplicantIds.length > 0) ? req.body.deleteCoapplicantIds.toString() : "";
                        if (deleteCoapplicantIds) {
                            let coApplicantSql = `CALL removeHomeLoanCoapplicant('` + deleteCoapplicantIds + `')`;
                            let coApplicantResult = await query(coApplicantSql);
                        }


                        let finalData = {
                            "customerLoanId": result[0][0].customerLoanId
                        }
                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Detail Saved', finalData, 0);
                        return res.status(200).send(successResult);
                    }

                } else {
                    let errorResult = new ResultError(400, true, "Home Loan Customer Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateHomeLoanBasicDetail()', error, '');
        next(errorResult);
    }
};

const insertUpdateHomeLoanPropertyDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Property Detail');
        let requiredFields = ["customerLoanId", "propertyTypeId", "propertyPurchaseValue", "propertyCityId", "propertyCity", "propertyDistrict", "propertyState", 'pincode'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
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
                let result = await query(sql);
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
                                let result1 = await query(sql1);
                                if (result1 && result1.length > 0) {
                                    customerAddressId = result1[0].id;
                                }
                                let sql = `CALL adminInsertUpdateCustomerAddress(` + customerAddressId + `,` + customerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                        ,` + cityId + `,'` + city + `','` + district + `','` + state + `',` + customerLoanId + `,` + userId + `)`;
                                let result = await query(sql);
                                if (result && result.length > 0) {
                                    if (result[0] && result[0].length > 0) {
                                        customerAddressIds.push(result[0][0]);
                                        if (addressLength == (i + 1)) {
                                            finalResult = {
                                                customerLoanPropertyDetailId: customerLoanPropertyDetailId,
                                                customerAddressIds: customerAddressIds,
                                                customerLoanTransferPropertyDetailId: customerTransferPropertyDetail
                                            }
                                            let successResult = new ResultSuccess(200, true, 'Home Loan Property Detail Saved', finalResult, 1);
                                            return res.status(200).send(successResult);
                                        }
                                    }
                                }
                                else {
                                    let errorResult = new ResultError(400, true, "Home Loan Property Detail Not Saved", result, '');
                                    next(errorResult);
                                }
                            }
                        }
                    } else {
                        let errorResult = new ResultError(400, true, "Home Loan Customer Detail Not Saved", result, '');
                        next(errorResult);
                    }
                }
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateCustomerLoanPropertyDetail()', error, '');
        next(errorResult);
    }
};

const insertUpdateHomeLoanEmploymentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Customer Employment Detail');
        let requiredFields = ["customerLoanId", "label", "addressLine1", "pincode", "cityId"
            , "employmentTypeId", "customerLoanCoApplicantEmploymentDetails"];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
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
                ,`+ employmentTypeId + `,` + industryTypeId + `,` + userId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    let finalResult = [];
                    let customerloanemploymentdetailId = result[0][0].customerloanemploymentdetailId
                    let employmentCompanyAddressId = result[0][0].companyAddressId
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
                            let CoApplicantEmploymentDetailResult = await query(sql);
                            if (CoApplicantEmploymentDetailResult && result.length > 0) {
                                if (CoApplicantEmploymentDetailResult[0] && CoApplicantEmploymentDetailResult[0].length > 0) {
                                    let data = {
                                        customerLoanCoApplicantId: customerLoanCoApplicantId,
                                        customerloancoapplicantemploymentdetailId: CoApplicantEmploymentDetailResult[0][0].customerloancoapplicantemploymentdetailId,
                                    }
                                    finalResult.push(data)
                                    if (i == req.body.customerLoanCoApplicantEmploymentDetails.length - 1) {
                                        let finalData = {
                                            customerloanemploymentdetailId: customerloanemploymentdetailId,
                                            customerloancoapplicantemploymentdetailIds: finalResult,
                                            companyAddressId: employmentCompanyAddressId

                                        }
                                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', finalData, 1);
                                        return res.status(200).send(successResult);
                                    }
                                } else {
                                    let successResult = new ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', result, 1);
                                    return res.status(200).send(successResult);
                                }
                            } else {
                                let errorResult = new ResultError(400, true, "Home Loan Customer Employment Detail Not Saved", result, '');
                                next(errorResult);
                            }
                        }
                    }
                    else {
                        let finalData = {
                            customerloanemploymentdetailId: customerloanemploymentdetailId,
                            companyAddressId: employmentCompanyAddressId
                        }
                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', finalData, 1);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Home Loan Customer Employment Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateHomeLoanCustomerEmploymentDetail()', error, '');
        next(errorResult);
    }
};

export default { getHomeLoan, getHomeLoanById, insertUpdateHomeLoanBasicDetail, insertUpdateHomeLoanPropertyDetail, insertUpdateHomeLoanEmploymentDetail }