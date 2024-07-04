import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { CustomerResponse } from '../../classes/output/loan/customerResponse';
import { PersonalLoanMoreBasicDetailResponse } from '../../classes/output/loan/personalloanMoreBasicDetailResponse';
import { PersonalLoanMoreEmploymentDetailResponse } from '../../classes/output/loan/personalloanMoreEmploymentDetailResponse';
import { loanCompleteHistoryResponse } from '../../classes/output/loan/loanCompleteHistoryReponse';
import { PersonalLoanDocumentResponse } from '../../classes/output/loan/personalloanDocumentsResponse';
import { PersonalLoanReferenceResponse } from '../../classes/output/loan/personalloanReferenceResponse';
import { LoanStatusResponse } from '../../classes/output/loan/loanStatusResponse';
import { PersonalLoanResponse } from '../../classes/output/loan/personloanResponse';

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

const NAMESPACE = 'Loans';


const getCustomerLoansByStatusId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Customer Loan By Status Id');
        var requiredFields = ["partnerId", "statusId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let statusId = req.body.statusId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let sql = `CALL partnerGetCustomerLoansByStatusId(` + partnerId + `,` + statusId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                console.log(result);
                if (result && result.length > 0) {
                    if (result[0].length > 0 && result[0][0].message == "No Loans Available") {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
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
                                        customerLoan[j].customerloanoffer = result[8] ? result[8].filter(c => c.customerLoanId == customerLoan[j].id)[0] : null;
                                    }
                                    if (result[9].length > 0) {
                                        customerLoan[j].loanTransferDetail = result[9] ? result[9].filter(c => c.customerLoanId == customerLoan[j].id)[0] : null;
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
                                    let basicDetail: CustomerResponse = new CustomerResponse(obj[i].fullName, obj[i].birthdate, obj[i].panCardNo, obj[i].customerLoan[j].employmentTypeId
                                        , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].monthlyIncome, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyName
                                        , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].officePincode, obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].tenureId, obj[i].customerLoan[j].id, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].id, obj[i].contactNo, obj[i].id, obj[i].userId);
                                    let moreBasicDetail: PersonalLoanMoreBasicDetailResponse = new PersonalLoanMoreBasicDetailResponse(obj[i].alternativeContactNo, obj[i].gender
                                        , obj[i].maritalStatusId, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].name : ""),
                                        ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].contactNo : ""), obj[i].customerLoan[j].motherName
                                        , obj[i].customerLoan[j].fatherContactNo, ((obj[i].customerLoan[j].customerLoanSpouses && obj[i].customerLoan[j].customerLoanSpouses.length > 0) ? obj[i].customerLoan[j].customerLoanSpouses[0].id : 0), obj[i].customerLoan[j].fatherName, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[i].customerLoan[j].loanType);
                                    let moreEmploymentDetail: PersonalLoanMoreEmploymentDetailResponse = new PersonalLoanMoreEmploymentDetailResponse(obj[i].email, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].designation
                                        , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyTypeId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].currentCompanyExperience
                                        , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].label, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine1, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].addressLine2
                                        , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].pincode, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].cityId, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].city
                                        , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].district, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].state, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].companyAddressId);
                                    let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(obj[i].customerLoan[j].customerLoanCompleteHistory[0].isCompleted, obj[i].customerLoan[j].customerLoanCompleteHistory[0].completeScreen);
                                    let loanDocuments = [];
                                    let loanReference = [];
                                    let loanStatus;
                                    if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                            let doc: PersonalLoanDocumentResponse = new PersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId
                                                , obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf
                                                , obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId);
                                            loanDocuments.push(doc);
                                        }
                                    }
                                    if (obj[i].customerLoan[j].customerLoanReferences && obj[i].customerLoan[j].customerLoanReferences.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerLoanReferences.length; k++) {
                                            let loanreference: PersonalLoanReferenceResponse = new PersonalLoanReferenceResponse(obj[i].customerLoan[j].customerLoanReferences[k].id, obj[i].customerLoan[j].customerLoanReferences[k].fullName, obj[i].customerLoan[j].customerLoanReferences[k].contactNo, obj[i].customerLoan[j].customerLoanReferences[k].label, obj[i].customerLoan[j].customerLoanReferences[k].addressLine1, obj[i].customerLoan[j].customerLoanReferences[k].addressLine2, obj[i].customerLoan[j].customerLoanReferences[k].pincode, obj[i].customerLoan[j].customerLoanReferences[k].city, obj[i].customerLoan[j].customerLoanReferences[k].cityId, obj[i].customerLoan[j].customerLoanReferences[k].state, obj[i].customerLoan[j].customerLoanReferences[k].district);
                                            loanReference.push(loanreference);
                                        }
                                    }
                                    if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                        let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                        loanStatus = new LoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].id, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus,
                                            obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName, obj[i].customerLoan[j].displayName);
                                    }
                                    let loanOffer;
                                    loanOffer = obj[i].customerLoan[j].customerloanoffer
                                    let objRes: PersonalLoanResponse = new PersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, loanOffer, null);
                                    response.push(JSON.parse(JSON.stringify(objRes)));
                                }
                            }
                        }

                        let successResult = new ResultSuccess(200, true, 'Loans Available', response, response.length);
                        console.log(successResult);
                        return res.status(200).send(successResult);

                    }
                } else {
                    let errorResult = new ResultError(400, true, "loans.getCustomerLoansByStatusId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'loans.getCustomerLoansByStatusId()', error, '');
        next(errorResult);
    }
};

const getCustomerLoansByStatusIdV2 = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Customer Loan By Status Id');
        var requiredFields = ["partnerId", "statusId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let statusId = req.body.statusId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let loanTypeIds = (req.body.loanTypeIds != null && req.body.loanTypeIds != '') ? req.body.loanTypeIds : '';
                let fromDate = req.body.fromDate != null ? req.body.fromDate : '';
                let fDate = "", tDate = "";
                if (fromDate)
                    fDate = new Date(fromDate).getFullYear().toString() + '-' + ("0" + (new Date(fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(fromDate).getSeconds())).slice(-2);
                let toDate = req.body.toDate != null ? req.body.toDate : '';
                if (toDate)
                    tDate = new Date(toDate).getFullYear().toString() + '-' + ("0" + (new Date(toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(toDate).getSeconds())).slice(-2);
                let sql = `CALL getPartnerLoanListByStatusId(` + partnerId + `,` + statusId + `,` + startIndex + `,` + fetchRecords + `,'` + loanTypeIds.toString() + `','` + fDate + `','` + tDate + `')`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Customer Loans', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "loans.getCustomerLoansByStatusIdV2() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'loans.getCustomerLoansByStatusId()', error, '');
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
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "loans.deleteLoanById() Error", new Error("Error During Deleting Loan Request"), '');
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
        let errorResult = new ResultError(500, true, 'loans.deleteLoanById()', error, '');
        next(errorResult);
    }
};

export default { getCustomerLoansByStatusId, getCustomerLoansByStatusIdV2, deleteLoanById }