import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { HomeLoanPropertyDetailResponse } from '../../classes/output/loan/home loan/homeLoanPropertyDetailResponse';
import { HomeLoanResponse } from '../../classes/output/loan/home loan/homeLoanResponse';
import { HomeLoanProfileDetailResponse } from '../../classes/output/loan/home loan/homeLoanProfileDetailResponse';
import { HomeLoanCoapplicantResponse } from '../../classes/output/loan/home loan/homeLoanCoapplicantResponse';
import { HomeLoanCurrentResidenseResponse } from '../../classes/output/loan/home loan/homeLoanCurrentResidenceResponse';
import { HomeLoanEmploymentDetailResponse } from '../../classes/output/loan/home loan/homeLoanEmploymentDetailResponse';
import { HomeLoanPermanentAddressDetailResponse } from '../../classes/output/loan/home loan/homeLoanPermanentAddressDetailResponse';
import { loanCompleteHistoryResponse } from '../../classes/output/loan/loanCompleteHistoryReponse';
import { LoanStatusResponse } from '../../classes/output/loan/loanStatusResponse';
import { HomeLoanCorrespondenceAddressDetailResponse } from '../../classes/output/loan/home loan/homeLoanCorrespondenceResponse';
import { HomeLoanDocumentResponse } from '../../classes/output/loan/home loan/homeLoanDocumentResponse';
import { HomeLoanTransferPropertyDetailResponse } from '../../classes/output/loan/home loan/homeLoanTransferPropertyDetailResponse';

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

const NAMESPACE = 'Home Loan';

const getIncompleteHomeLoanDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Home Loan Incomplete Detail');
        var requiredFields = ['partnerId', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `CALL partnerGetIncompleteHomeLoanRequest(` + partnerId + `,` + serviceId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0 && result[0].length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Incomplete data is not available', [], 0);
                        return res.status(200).send(successResult);
                    } else {
                        let obj = result[0];
                        var finalResult = [];
                        for (let i = 0; i < obj.length; i++) {
                            let customerLoan;
                            if (result[2].length > 0) {
                                customerLoan = result[2].filter(c => c.customerId == obj[i].customerId);
                            }
                            if (customerLoan && customerLoan.length > 0) {
                                for (let j = 0; j < customerLoan.length; j++) {
                                    if (result[1].length > 0) {
                                        customerLoan[j].customerDetail = result[1].filter(c => c.id == customerLoan[j].customerId);
                                    }

                                    if (result[3].length > 0) {
                                        customerLoan[j].customerloanemploymentdetails = result[3].filter(c => c.customerloanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerloanemploymentdetails = [];
                                    }
                                    if (result[4].length > 0) {
                                        customerLoan[j].customerloancoapplicants = result[4].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerloancoapplicants = [];
                                    }

                                    if (result[5].length > 0) {
                                        customerLoan[j].customerloancoapplicantemploymentdetails = result[5].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerloancoapplicantemploymentdetails = [];
                                    }

                                    if (result[6].length > 0) {
                                        customerLoan[j].customerloancurrentresidentdetails = result[6].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }

                                    if (result[7].length > 0) {
                                        customerLoan[j].correspondenseAddress = result[7].filter(c => c.customerId == customerLoan[j].customerId);
                                    }

                                    if (result[8].length > 0) {
                                        customerLoan[j].customerloandocuments = result[8].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerloandocuments = [];
                                    }

                                    if (result[9].length > 0) {
                                        customerLoan[j].customerLoanCompleteHistory = result[9].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }

                                    if (result[10].length > 0) {
                                        customerLoan[j].customerLoanStatusHistory = result[10].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }

                                    if (result[11].length > 0) {
                                        customerLoan[j].customerLoanOffer = result[11].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    if (result[12].length > 0) {
                                        customerLoan[j].customerTransferPropertyDetail = result[12].filter(c => c.customerLoanId == customerLoan[j].id);
                                    }
                                    else {
                                        customerLoan[j].customerTransferPropertyDetail = [];
                                    }
                                }
                                obj[i].customerLoan = customerLoan;
                            }


                        }
                        let response = [];

                        if (obj && obj.length > 0) {
                            console.log(obj.length);

                            for (let i = 0; i < obj.length; i++) {
                                console.log(obj[i].customerLoan.length);

                                for (let j = 0; j < obj[i].customerLoan.length; j++) {


                                    let propertyDetail: HomeLoanPropertyDetailResponse = new HomeLoanPropertyDetailResponse(obj[i].customerLoanId,
                                        obj[i].id, obj[i].propertyTypeId, obj[i].propertyPurchaseValue, obj[i].propertyCityId,
                                        obj[i].customerLoan[j].loanAmount, obj[i].addressLine1, obj[i].addressLine2,
                                        obj[i].pincode, obj[i].loanType, obj[i].customerId, obj[i].customerLoan[j].customerDetail[j]?.userId);

                                    let coapplicants = [];

                                    for (let k = 0; k < obj[i].customerLoan[j].customerloancoapplicants.length; k++) {
                                        let ind = obj[i].customerLoan[j].customerloancoapplicantemploymentdetails.findIndex(c => c.customerLoanCoApplicantId == obj[i].customerLoan[j].customerloancoapplicants[k].id);
                                        if (ind >= 0) {
                                            if (obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind]) {

                                                let coapplicant: HomeLoanCoapplicantResponse = new HomeLoanCoapplicantResponse(obj[i].customerLoan[j].customerloancoapplicants[k].fullName, obj[i].customerLoan[j].customerloancoapplicants[k].birthdate, obj[i].customerLoan[j].customerloancoapplicants[k].maritalStatusId, obj[i].customerLoan[j].customerloancoapplicants[k].id, obj[i].customerLoan[j].customerloancoapplicants[k].coApplicantRelationId, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].id, obj[i].customerLoan[j]?.customerloancoapplicantemploymentdetails[ind] ? obj[i].customerLoan[j]?.customerloancoapplicantemploymentdetails[ind]?.monthlyIncome : null, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].companyAddressId, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].addressTypeId, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].label, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].addressLine1, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].addressLine2, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].pincode, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].cityId, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].employmentTypeId, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].employmentNatureId, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].employmentServiceTypeId, obj[i].customerLoan[j].customerloancoapplicantemploymentdetails[ind].industryTypeId);
                                                coapplicants.push(coapplicant);
                                            }
                                        }
                                        else {
                                            let coapplicant: HomeLoanCoapplicantResponse = new HomeLoanCoapplicantResponse(obj[i].customerLoan[j].customerloancoapplicants[k].fullName, obj[i].customerLoan[j].customerloancoapplicants[k].birthdate, obj[i].customerLoan[j].customerloancoapplicants[k].maritalStatusId, obj[i].customerLoan[j].customerloancoapplicants[k].id, obj[i].customerLoan[j].customerloancoapplicants[k].coApplicantRelationId);
                                            coapplicants.push(coapplicant);
                                        }
                                    }
                                    let profileDetail: HomeLoanProfileDetailResponse = obj[i].customerLoan[j].customerDetail[0].fullName != null ? new HomeLoanProfileDetailResponse(
                                        obj[i].customerLoan[j].customerDetail[0].fullName,
                                        obj[i].customerLoan[j].customerDetail[0].birthdate,
                                        obj[i].customerLoan[j].customerDetail[0].maritalStatusId,
                                        obj[i].customerLoan[j].customerDetail[0].panCardNo,
                                        obj[i].customerLoan[j].motherName,
                                        obj[i].customerLoan[j].fatherContactNo, coapplicants, obj[i].customerLoan[j].customerDetail[0].contactNo) : null;

                                    let transferPropertyDetail: HomeLoanTransferPropertyDetailResponse = obj[i].customerLoan[j].customerTransferPropertyDetail && obj[i].customerLoan[j].customerTransferPropertyDetail.length > 0 ? new HomeLoanTransferPropertyDetailResponse(obj[i].customerLoan[j].id,
                                        obj[i].customerLoan[j].customerTransferPropertyDetail[0].loanAmountTakenExisting,
                                        obj[i].customerLoan[j].customerTransferPropertyDetail[0].approxDate,
                                        obj[i].customerLoan[j].customerTransferPropertyDetail[0].topupAmount,
                                        obj[i].customerLoan[j].customerTransferPropertyDetail[0].approxCurrentEMI,
                                        obj[i].customerLoan[j].customerTransferPropertyDetail[0].bankId,
                                        obj[i].customerLoan[j].customerTransferPropertyDetail[0].id) : null;

                                    let employmentDetail: HomeLoanEmploymentDetailResponse = obj[i].customerLoan[j].customerloanemploymentdetails && obj[i].customerLoan[j].customerloanemploymentdetails.length > 0 ? new HomeLoanEmploymentDetailResponse(
                                        obj[i].customerLoan[j].employmentTypeId,
                                        obj[i].customerLoan[j].customerloanemploymentdetails && obj[i].customerLoan[j].customerloanemploymentdetails.length > 0 && obj[i].customerLoan[j].customerloanemploymentdetails[0].monthlyIncome ? obj[i].customerLoan[j].customerloanemploymentdetails[0].monthlyIncome : null,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].label,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].addressLine1,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].addressLine2,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].pincode,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].cityId,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].companyAddressId,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].addressTypeId,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].id,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].industryTypeId,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].employmentNatureId,
                                        obj[i].customerLoan[j].customerloanemploymentdetails[0].employmentServiceTypeId) : null;

                                    let residenseDetail: HomeLoanCurrentResidenseResponse = obj[i].customerLoan[j].customerloancurrentresidentdetails && obj[i].customerLoan[j].customerloancurrentresidentdetails.length > 0 ? new HomeLoanCurrentResidenseResponse(
                                        obj[i].customerLoan[j].customerloancurrentresidentdetails[0].residentTypeId,
                                        obj[i].customerLoan[j].customerloancurrentresidentdetails[0].id,
                                        obj[i].customerLoan[j].customerloancurrentresidentdetails[0].rentAmount,
                                        obj[i].customerLoan[j].customerloancurrentresidentdetails[0].valueOfProperty) : null;

                                    let permanentAddressDetail: HomeLoanPermanentAddressDetailResponse = obj[i].customerLoan[j].customerDetail ? new HomeLoanPermanentAddressDetailResponse(
                                        obj[i].customerLoan[j].customerDetail[0].label,
                                        obj[i].customerLoan[j].customerDetail[0].addressLine1,
                                        obj[i].customerLoan[j].customerDetail[0].addressLine2,
                                        obj[i].customerLoan[j].customerDetail[0].pincode,
                                        obj[i].customerLoan[j].customerDetail[0].cityId,
                                        obj[i].customerLoan[j].customerDetail[0].addressTypeId,
                                        obj[i].customerLoan[j].customerDetail[0].addressId) : null;

                                    let correspondenceAddressDetail: HomeLoanCorrespondenceAddressDetailResponse = (obj[i].customerLoan[j].correspondenseAddress && obj[i].customerLoan[j].correspondenseAddress.length > 0) ? new HomeLoanCorrespondenceAddressDetailResponse(
                                        obj[i].customerLoan[j].correspondenseAddress[0].label,
                                        obj[i].customerLoan[j].correspondenseAddress[0].addressLine1,
                                        obj[i].customerLoan[j].correspondenseAddress[0].addressLine2,
                                        obj[i].customerLoan[j].correspondenseAddress[0].pincode,
                                        obj[i].customerLoan[j].correspondenseAddress[0].cityId,
                                        obj[i].customerLoan[j].correspondenseAddress[0].addressTypeId,
                                        obj[i].customerLoan[j].correspondenseAddress[0].addressId) : null;


                                    let loanStatus = null;
                                    let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(
                                        obj[i].customerLoan[j].customerLoanCompleteHistory[0]?.isCompleted,
                                        obj[i].customerLoan[j].customerLoanCompleteHistory[0]?.completeScreen);



                                    if (obj[i].customerLoan[j].customerLoanStatusHistory &&
                                        obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                        let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                        loanStatus = new LoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].id,
                                            obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate,
                                            obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus,
                                            obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable,
                                            obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate,
                                            obj[i].customerLoan[j].displayName, obj[i].customerLoan[j].serviceName);
                                    }

                                    let loanDocuments2 = [];
                                    if (obj[i].customerLoan[j].customerloandocuments.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerloandocuments.length; k++) {
                                            let loanDocuments: HomeLoanDocumentResponse = new HomeLoanDocumentResponse(obj[i].customerLoan[j].customerloandocuments[k].id, obj[i].customerLoan[j].customerloandocuments[k].documentId, obj[i].customerLoan[j].customerloandocuments[k].documentUrl, obj[i].customerLoan[j].customerloandocuments[k].documentName, obj[i].customerLoan[j].customerloandocuments[k].isPdf, obj[i].customerLoan[j].customerloandocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerloandocuments[k].documentStatus);
                                            loanDocuments2.push(loanDocuments);
                                        }
                                    }

                                    let loanOffer = [];
                                    loanOffer = obj[i].customerLoan[j].customerLoanOffer;



                                    let objRes: HomeLoanResponse = new HomeLoanResponse(propertyDetail, profileDetail, residenseDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer, transferPropertyDetail);
                                    response.push(JSON.parse(JSON.stringify(objRes)));
                                }
                            }
                        }
                        let successResult = new ResultSuccess(200, true, 'Getting Home Loan Incomplete Data', response, response.length);
                        return res.status(200).send(successResult);

                    }

                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting Home Loan Incomplete Data", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.getIncompleteHomeLoanDetail()', error, '');
        next(errorResult);
    }
};



export default {
    getIncompleteHomeLoanDetail
}