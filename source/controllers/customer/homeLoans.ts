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

const insertUpdateCustomerLoanPropertyDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Property Detail');
        var requiredFields = ["customerId", "serviceId", "loanAmount", "propertyTypeId", "propertyPurchaseValue", "propertyCityId", "propertyCity", "propertyDistrict", "propertyState", 'pincode'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : null;
                let serviceId = req.body.serviceId;
                let loanAmount = req.body.loanAmount;
                let customerId = req.body.customerId;
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
                let loanType = req.body.loanTypeName ? req.body.loanTypeName : null;

                let partnerId = 0;
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                if (dsaCode && !customerLoanId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = await query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }

                let sql = `CALL insertUpdateCustomerLoanPropertyDetail(` + customerLoanId + `,` + serviceId + `,` + loanAmount + `,` + customerId + `,` + customerLoanPropertyDetailId + `,` + propertyTypeId + `
                ,` + propertyPurchaseValue + `,` + propertyCityId + `,'` + propertyCity + `','` + propertyDistrict + `','` + propertyState + `','` + pincode + `','` + addressLine1 + `','` + addresssLine2 + `',` + userId + `, ` + partnerId + `,'` + loanType + `')`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Property Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Property Detail Saved', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Home Loan Property Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateCustomerLoanPropertyDetail()', error, '');
        next(errorResult);
    }
};

const insertUpdateCustomerLoanTransferPropertyDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Property Detail');
        var requiredFields = ["customerId", "serviceId", "loanAmount", "propertyTypeId", "propertyPurchaseValue", "propertyCityId", "propertyCity", "propertyDistrict", "propertyState", 'pincode'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : null;
                let serviceId = req.body.serviceId;
                let loanAmount = req.body.loanAmount;
                let customerId = req.body.customerId;
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
                let loanAmountTakenExisting = req.body.loanAmountTakenExisting ? req.body.loanAmountTakenExisting : null;
                let approxDate = req.body.approxDate ? new Date(req.body.approxDate) : null;
                let approxDate2 = null;
                let topupAmount = req.body.topupAmount ? req.body.topupAmount : null;
                let approxCurrentEMI = req.body.approxCurrentEMI ? req.body.approxCurrentEMI : null;
                let loanType = req.body.loanTypeName ? req.body.loanTypeName : null;
                let bankId = req.body.bankId ? req.body.bankId : null;
                let customerLoanTransferPropertyDetailId = req.body.customerLoanTransferPropertyDetailId ? req.body.customerLoanTransferPropertyDetailId : null;
                if (approxDate)
                    approxDate2 = new Date(approxDate).getFullYear().toString() + '-' + ("0" + (new Date(approxDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(approxDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(approxDate).getHours())).slice(-2) + ':' + ("0" + (new Date(approxDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(approxDate).getSeconds())).slice(-2);


                let partnerId = 0;
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                if (dsaCode && !customerLoanId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = await query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }

                let sql = `CALL insertUpdateTransferCustomerLoanPropertyDetail(` + customerLoanId + `,` + serviceId + `,` + loanAmount + `,` + customerId + `,` + customerLoanPropertyDetailId + `,` + propertyTypeId + `
                ,` + propertyPurchaseValue + `,` + propertyCityId + `,'` + propertyCity + `','` + propertyDistrict + `','` + propertyState + `','` + pincode + `','` + addressLine1 + `','` + addresssLine2 + `',` + userId + `, ` + partnerId + `,` + loanAmountTakenExisting + `,'` + approxDate2 + `',` + topupAmount + `,` + approxCurrentEMI + `,` + bankId + `,` + customerLoanTransferPropertyDetailId + `,'` + loanType + `')`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Transfer Property Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Transfer Property Detail Saved', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Home Loan Transfer Property Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateCustomerLoanTransferPropertyDetail()', error, '');
        next(errorResult);
    }
};

const insertUpdateHomeLoanCustomerDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Customer Detail');
        var requiredFields = ["customerId", "customerLoanId", "fullName", "birthdate", "maritalStatusId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = req.body.userId ? req.body.userId : authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let customerId = req.body.customerId;
                let fullName = req.body.fullName;
                let motherName = req.body.motherName;
                let fatherContactNo = req.body.fatherContactNo ? req.body.fatherContactNo : '';
                let birthDate = req.body.birthdate ? new Date(req.body.birthdate) : null;
                let dDate = null;
                if (birthDate)
                    dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                let maritalStatusId = req.body.maritalStatusId;
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";

                let finalResult = [];

                let sql = `CALL insertUpdateHomeLoanCustomerDetail(` + customerLoanId + `,'` + motherName + `','` + fatherContactNo + `',` + userId + `,` + customerId + `,'` + fullName + `','` + dDate + `',` + maritalStatusId + `,'` + panCardNo + `')`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    if (req.body.coApplicants && req.body.coApplicants.length > 0) {

                        for (let i = 0; i < req.body.coApplicants.length; i++) {
                            let customerLoanCoApplicantId = req.body.coApplicants[i].customerLoanCoApplicantId ? req.body.coApplicants[i].customerLoanCoApplicantId : null;
                            let fullName = req.body.coApplicants[i].fullName ? req.body.coApplicants[i].fullName : "";
                            let birthDate = req.body.coApplicants[i].birthDate ? new Date(req.body.coApplicants[i].birthDate) : null;
                            let dDate = null;
                            if (birthDate)
                                dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                            let maritalStatusId = req.body.coApplicants[i].maritalStatusId;
                            let coApplicantRelationId = req.body.coApplicants[i].coApplicantRelationId;
                            let coApplicantSql = `CALL insertUpdateHomeLoanCoApplicant(` + customerLoanCoApplicantId + `,` + customerLoanId + `,'` + fullName + `','` + dDate + `',` + maritalStatusId + `
                            ,` + coApplicantRelationId + `,` + userId + `)`;
                            let coApplicantResult = await query(coApplicantSql);
                            if (coApplicantResult[0] && coApplicantResult[0].length > 0) {
                                finalResult.push(coApplicantResult[0][0]);
                            }
                        }
                        let deleteCoapplicantIds = (req.body.deleteCoapplicantIds && req.body.deleteCoapplicantIds.length > 0) ? req.body.deleteCoapplicantIds.toString() : "";
                        if (deleteCoapplicantIds) {
                            let coApplicantSql = `CALL removeHomeLoanCoapplicant('` + deleteCoapplicantIds + `')`;
                            let coApplicantResult = await query(coApplicantSql);
                        }
                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Address And Co Applicant Saved', finalResult, finalResult.length);
                        console.log(successResult);
                        return res.status(200).send(successResult);

                    } else {
                        let deleteCoapplicantIds = (req.body.deleteCoapplicantIds && req.body.deleteCoapplicantIds.length > 0) ? req.body.deleteCoapplicantIds.toString() : "";
                        if (deleteCoapplicantIds) {
                            let coApplicantSql = `CALL removeHomeLoanCoapplicant('` + deleteCoapplicantIds + `')`;
                            let coApplicantResult = await query(coApplicantSql);
                        }



                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Detail Saved', [], 0);
                        console.log(successResult);
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateHomeLoanCustomerDetail()', error, '');
        next(errorResult);
    }
};

const insertUpdateCustomerAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Customer Address');
        var requiredFields = ["customerAddresses"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {

            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let finalResult = [];
                let addressLength = req.body.customerAddresses.length;
                for (let i = 0; i < req.body.customerAddresses.length; i++) {
                    let customerAddressId = req.body.customerAddresses[i].customerAddressId ? req.body.customerAddresses[i].customerAddressId : null;
                    let customerId = req.body.customerAddresses[i].customerId ? req.body.customerAddresses[i].customerId : null;
                    let addressTypeId = req.body.customerAddresses[i].addressTypeId ? req.body.customerAddresses[i].addressTypeId : null;
                    let label = req.body.customerAddresses[i].label ? req.body.customerAddresses[i].label : "";
                    let addressLine1 = req.body.customerAddresses[i].addressLine1 ? req.body.customerAddresses[i].addressLine1 : "";
                    let addressLine2 = req.body.customerAddresses[i].addressLine2 ? req.body.customerAddresses[i].addressLine2 : "";
                    let pincode = req.body.customerAddresses[i].pincode ? req.body.customerAddresses[i].pincode : "";
                    let cityId = req.body.customerAddresses[i].cityId ? req.body.customerAddresses[i].cityId : null;
                    let city = req.body.customerAddresses[i].city ? req.body.customerAddresses[i].city : "";
                    let district = req.body.customerAddresses[i].district ? req.body.customerAddresses[i].district : "";
                    let state = req.body.customerAddresses[i].state ? req.body.customerAddresses[i].state : "";
                    let customerLoanId = req.body.customerAddresses[i].customerLoanId;

                    let sql1 = `SELECT id FROM  customeraddresses WHERE customerId = ` + customerId + ` AND addressTypeId = ` + addressTypeId;
                    let result1 = await query(sql1);
                    if (result1 && result1.length > 0) {
                        customerAddressId = result1[0].id;
                    }
                    let sql = `CALL insertUpdateCustomerAddress(` + customerAddressId + `,` + customerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                    ,` + cityId + `,'` + city + `','` + district + `','` + state + `',` + customerLoanId + `,` + userId + `)`;
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[0] && result[0].length > 0) {

                            finalResult.push(result[0][0]);
                            if (addressLength == (i + 1)) {
                                let successResult = new ResultSuccess(200, true, 'Home Loan Customer Address Saved', finalResult, finalResult.length);
                                console.log(successResult);
                                return res.status(200).send(successResult);
                            }
                        } else {
                            let errorResult = new ResultError(400, true, "Home Loan Customer Address Not Saved", new Error('Home Loan Customer Address Not Saved'), '');
                            next(errorResult);
                        }
                    } else {
                        let errorResult = new ResultError(400, true, "Home Loan Customer Address Not Saved", new Error('Home Loan Customer Address Not Saved'), '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateCustomerAddress()', error, '');
        next(errorResult);
    }
};

const insertUpdateHomeLoanCustomerEmploymentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Customer Employment Detail');
        var requiredFields = ["customerLoanId", "label", "addressLine1", "pincode", "cityId"
            , "employmentTypeId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
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

                let sql = `CALL insertUpdateHomeLoanCustomerEmploymentDetail(` + customerloanemploymentdetailId + `,` + customerLoanId + `,` + monthlyIncome + `,null,null,'',` + companyAddressId + `,` + addressTypeId + `
                ,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + officePincode + `',null,'',` + employmentNatureId + `,` + employmentServiceTypeId + `,null,null
                ,`+ employmentTypeId + `,` + industryTypeId + `,` + userId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', result, 1);
                        console.log(successResult);
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

const insertUpdateHomeLoanCoApplicantEmploymentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan CoApplicant Employment Detail');

        var requiredFields = ["customerLoanCoApplicantEmploymentDetails"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                var finalResult = [];
                for (let i = 0; i < req.body.customerLoanCoApplicantEmploymentDetails.length; i++) {
                    let customerloancoapplicantemploymentdetailId = req.body.customerLoanCoApplicantEmploymentDetails[i].customerloancoapplicantemploymentdetailId ? req.body.customerLoanCoApplicantEmploymentDetails[i].customerloancoapplicantemploymentdetailId : null;
                    let customerLoanCoApplicantId = req.body.customerLoanCoApplicantEmploymentDetails[i].customerLoanCoApplicantId;
                    let userId = authorizationResult.currentUser.id;
                    let customerLoanId = req.body.customerLoanCoApplicantEmploymentDetails[i].customerLoanId;
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


                    let sql = `CALL insertUpdateCoApplicantEmploymentDetail(` + customerloancoapplicantemploymentdetailId + `,` + customerLoanCoApplicantId + `,` + customerLoanId + `,` + monthlyIncome + `,null,null,''
                    ,` + companyAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + officePincode + `',null,'',` + employmentNatureId + `
                    ,` + employmentServiceTypeId + `,null,null,` + employmentTypeId + `,` + industryTypeId + `,` + userId + `)`;
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[0] && result[0].length > 0) {
                            finalResult.push(result[0][0])
                            if (i == req.body.customerLoanCoApplicantEmploymentDetails.length - 1) {
                                let successResult = new ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', finalResult, finalResult.length);
                                console.log(successResult);
                                return res.status(200).send(successResult);
                            }
                        } else {
                            let successResult = new ResultSuccess(200, true, 'Home Loan Customer Employment Detail Saved', result, 1);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        }
                    } else {
                        let errorResult = new ResultError(400, true, "Home Loan Customer Employment Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateHomeLoanCoApplicantEmploymentDetail()', error, '');
        next(errorResult);
    }
};

const insertUpdateHomeLoanCurrentResidentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Current Resident Detail');
        var requiredFields = ["customerLoanId", "residentTypeId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerloancurrentresidentdetailId = req.body.customerloancurrentresidentdetailId ? req.body.customerloancurrentresidentdetailId : null;
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let residentTypeId = req.body.residentTypeId;
                let rentAmount = req.body.rentAmount != null ? req.body.rentAmount : null;
                let valueOfProperty = req.body.valueOfProperty != null ? req.body.valueOfProperty : null;
                let monthlyHouseHold = req.body.monthlyHouseHold != null ? req.body.monthlyHouseHold : null;

                let sql = `CALL insertUpdateHomeLoanCurrentResidentDetail(` + customerloancurrentresidentdetailId + `,` + customerLoanId + `,` + residentTypeId + `,` + rentAmount + `,` + valueOfProperty + `
                ,` + monthlyHouseHold + `,` + userId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Current Resident Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Current Resident Detail Saved', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Home Loan Current Resident Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.insertUpdateHomeLoanCurrentResidentDetail()', error, '');
        next(errorResult);
    }
};

const uploadHomeLoanDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Home Loan Documents Detail');
        var requiredFields = ['customerLoanId', 'loanDocuments'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerLoanId = req.body.customerLoanId;
                let response = [];
                if (req.body.loanDocuments && req.body.loanDocuments.length > 0) {
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
                        if (req.body.loanDocuments[i].documentData.includes("https:")) {
                            cnt++;
                            console.log(req.body.loanDocuments[i]);
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
                            if (cnt == req.body.loanDocuments.length) {
                                if (ids && ids.length > 0) {
                                    for (let i = 0; i < ids.length; i++) {
                                        let deleteSql = `DELETE FROM customerloandocuments WHERE id = ?`;
                                        let deleteResult = await query(deleteSql, ids[i]);
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
                                        console.log(statusResult);
                                        let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                                        let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                                        let chageStatusResult = await query(chageStatusSql, customerLoanId);
                                        console.log(chageStatusResult);
                                        let loancompleteSql = "UPDATE loancompletescreenhistory SET isCompleted=true WHERE customerLoanId=" + customerLoanId;
                                        let loanCompleteResult = await query(loancompleteSql);
                                        console.log(loanCompleteResult);
                                        objResult = { "loanStatusName": "PENDING" };
                                    }
                                }
                                let successResult = new ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                console.log(successResult);
                                return res.status(200).send(successResult);

                            }
                        } else {
                            ids = ids.filter(c => c != req.body.loanDocuments[i].loanDocumentId);
                            let buf = Buffer.from(req.body.loanDocuments[i].documentData, 'base64');
                            let contentType;
                            if (req.body.loanDocuments[i].isPdf)
                                contentType = 'application/pdf';
                            else
                                contentType = 'image/jpeg'
                            let isErr = false;
                            let keyname = req.body.loanDocuments[i].documentName + "_" + req.body.customerLoanId + "_" + new Date().getTime();
                            req.body.loanDocuments[i].keyName = keyname;
                            console.log("KeyName" + req.body.loanDocuments[i].keyName);
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
                                console.log(data);
                                let key;
                                if (data.Key)
                                    key = data.Key;
                                else
                                    key = data.key;
                                let ind = req.body.loanDocuments.findIndex(c => c.keyName == key);
                                console.log("##### index=>" + ind + " DataKey:" + key);
                                req.body.loanDocuments[ind].docUrl = "";
                                req.body.loanDocuments[ind].docUrl = data.Location;


                                cnt++;
                                if (cnt == req.body.loanDocuments.length) {
                                    for (let k = 0; k < req.body.loanDocuments.length; k++) {
                                        if (req.body.loanDocuments[k].loanDocumentId) {
                                            let url = "";
                                            if (req.body.loanDocuments[k].docUrl) {
                                                url = req.body.loanDocuments[k].docUrl;
                                                let documentStatus = 'PENDING';

                                                let sql = `Update customerloandocuments SET customerLoanId=` + customerLoanId + `,serviceTypeDocumentId=` + req.body.loanDocuments[k].serviceTypeDocumentId + `
                                                ,documentId=`+ req.body.loanDocuments[k].documentId + `,documentUrl='` + url + `',documentStatus='` + documentStatus + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                                                WHERE id = `+ req.body.loanDocuments[k].loanDocumentId;
                                                let result = await query(sql);
                                                if (result && result.affectedRows > 0) {
                                                    response.push(result);
                                                } else {
                                                    //
                                                }


                                            } else if (req.body.loanDocuments[k].documentData) {
                                                url = req.body.loanDocuments[k].documentData;
                                                let sql = `Update customerloandocuments SET customerLoanId=` + customerLoanId + `,serviceTypeDocumentId=` + req.body.loanDocuments[k].serviceTypeDocumentId + `
                                                ,documentId=`+ req.body.loanDocuments[k].documentId + `,documentUrl='` + url + `',modifiedBy=` + userId + `,modifiedDate=CURRENT_TIMESTAMP() 
                                                WHERE id = `+ req.body.loanDocuments[k].loanDocumentId;
                                                let result = await query(sql);
                                                if (result && result.affectedRows > 0) {
                                                    response.push(result);
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
                                    if (ids && ids.length > 0) {
                                        for (let i = 0; i < ids.length; i++) {
                                            let deleteSql = `DELETE FROM customerloandocuments WHERE id = ?`;
                                            let deleteResult = await query(deleteSql, ids[i]);
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
                                            console.log(statusResult);
                                            let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                                            let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                                            let chageStatusResult = await query(chageStatusSql, customerLoanId);
                                            console.log(chageStatusResult);
                                            let loancompleteSql = "UPDATE loancompletescreenhistory SET isCompleted=true WHERE customerLoanId=" + customerLoanId;
                                            let loanCompleteResult = await query(loancompleteSql);
                                            console.log(loanCompleteResult);
                                            objResult = { "loanStatusName": "PENDING" };
                                        }
                                    }

                                    if (!sendRes) {
                                        sendRes = true;
                                        let successResult = new ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    }


                                }
                            });
                            if (isErr) {
                                break;
                            }
                        }
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Incomplete Data", "Incomplete Data", '');
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
        let errorResult = new ResultError(500, true, 'homeLoan.uploadHomeLoanDocument()', error, '');
        next(errorResult);
    }
};

const getIncompleteHomeLoanDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Home Loan Incomplete Detail');
        var requiredFields = ['customerId', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let customerId = req.body.customerId;
                let sql = `CALL customerGetIncompleteHomeLoanRequest(` + customerId + `,` + serviceId + `)`;
                let result = await query(sql);
                if (result) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let obj = result[0];

                        obj[0].customerDetail = result[1][0];
                        obj[0].customerLoan = result[2][0];
                        obj[0].customerloanemploymentdetails = result[3][0];
                        obj[0].customerloancoapplicants = result[4];
                        obj[0].customerloancoapplicantemploymentdetails = result[5];
                        obj[0].customerloancurrentresidentdetails = result[6][0];
                        obj[0].correspondenseAddress = result[7][0];
                        obj[0].customerloandocuments = result[8];
                        obj[0].customerLoanCompleteHistory = result[9][0];
                        obj[0].customerLoanStatusHistory = result[10][result[10].length - 1];
                        obj[0].customerLoanOffers = result[11] ? result[11] : null;
                        obj[0].customerTransferPropertyDetail = result[12] ? result[12][0] : null;



                        let coapplicants = [];
                        let loanStatus = null;

                        for (let i = 0; i < obj[0].customerloancoapplicants.length; i++) {
                            let ind = obj[0].customerloancoapplicantemploymentdetails.findIndex(c => c.customerLoanCoApplicantId == obj[0].customerloancoapplicants[i].id);
                            if (obj[0].customerloancoapplicantemploymentdetails[ind]) {

                                let coapplicant: HomeLoanCoapplicantResponse = new HomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId, obj[0].customerloancoapplicantemploymentdetails[ind].id, obj[0].customerloancoapplicantemploymentdetails[ind].monthlyIncome, obj[0].customerloancoapplicantemploymentdetails[ind].companyAddressId, obj[0].customerloancoapplicantemploymentdetails[ind].addressTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].label, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine1, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine2, obj[0].customerloancoapplicantemploymentdetails[ind].pincode, obj[0].customerloancoapplicantemploymentdetails[ind].cityId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentNatureId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentServiceTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].industryTypeId);
                                coapplicants.push(coapplicant);
                            }
                            else {
                                let coapplicant: HomeLoanCoapplicantResponse = new HomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId);
                                coapplicants.push(coapplicant);
                            }

                        }
                        if (obj[0].customerLoanStatusHistory) {
                            loanStatus = new LoanStatusResponse(obj[0].customerLoanStatusHistory.id, obj[0].customerLoanStatusHistory.transactionDate, obj[0].customerLoanStatusHistory.loanStatus,
                                obj[0].customerLoanStatusHistory.isDataEditable, result[10][0].transactionDate, obj[0].customerLoan.displayName, null);
                        }
                        let loanOffer;
                        if (obj[0].customerLoanOffers) {
                            loanOffer = obj[0].customerLoanOffers;
                        }
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerloandocuments.length; i++) {
                            let loanDocuments: HomeLoanDocumentResponse = new HomeLoanDocumentResponse(obj[0].customerloandocuments[i].id, obj[0].customerloandocuments[i].documentId, obj[0].customerloandocuments[i].documentUrl, obj[0].customerloandocuments[i].documentName, obj[0].customerloandocuments[i].isPdf, obj[0].customerloandocuments[i].serviceTypeDocumentId, obj[0].customerloandocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }

                        let propertyDetail: HomeLoanPropertyDetailResponse = new HomeLoanPropertyDetailResponse(obj[0].customerLoan.id, obj[0].id, obj[0].propertyTypeId, obj[0].propertyPurchaseValue, obj[0].propertyCityId, obj[0].customerLoan.loanAmount, obj[0].addressLine1, obj[0].addressLine2, obj[0].pincode, obj[0].customerLoan.loanType);
                        let transferPropertyDetail: HomeLoanTransferPropertyDetailResponse = obj[0].customerTransferPropertyDetail ? new HomeLoanTransferPropertyDetailResponse(obj[0].customerTransferPropertyDetail.customerLoanId, obj[0].customerTransferPropertyDetail.loanAmountTakenExisting, obj[0].customerTransferPropertyDetail.approxDate, obj[0].customerTransferPropertyDetail.topupAmount, obj[0].customerTransferPropertyDetail.approxCurrentEMI, obj[0].customerTransferPropertyDetail.bankId, obj[0].customerTransferPropertyDetail.id) : null;
                        let profileDetail: HomeLoanProfileDetailResponse = obj[0].customerDetail ? new HomeLoanProfileDetailResponse(obj[0].customerDetail ? obj[0].customerDetail.fullName : null, obj[0].customerDetail ? obj[0].customerDetail.birthdate : null, obj[0].customerDetail ? obj[0].customerDetail.maritalStatusId : null, obj[0].customerDetail ? obj[0].customerDetail.panCardNo : null, obj[0].customerLoan.motherName, obj[0].customerLoan.fatherContactNo, coapplicants, obj[0].customerDetail.contactNo) : null;
                        let employmentDetail: HomeLoanEmploymentDetailResponse = obj[0].customerloanemploymentdetails ? new HomeLoanEmploymentDetailResponse(obj[0].customerLoan.employmentTypeId, obj[0].customerloanemploymentdetails.monthlyIncome, obj[0].customerloanemploymentdetails.label, obj[0].customerloanemploymentdetails.addressLine1, obj[0].customerloanemploymentdetails.addressLine2, obj[0].customerloanemploymentdetails.pincode, obj[0].customerloanemploymentdetails.cityId, obj[0].customerloanemploymentdetails.companyAddressId, obj[0].customerloanemploymentdetails.addressTypeId, obj[0].customerloanemploymentdetails.id, obj[0].customerloanemploymentdetails.industryTypeId, obj[0].customerloanemploymentdetails.employmentNatureId, obj[0].customerloanemploymentdetails.employmentServiceTypeId) : null;
                        let residenseDetail: HomeLoanCurrentResidenseResponse = obj[0].customerloancurrentresidentdetails ? new HomeLoanCurrentResidenseResponse(obj[0].customerloancurrentresidentdetails.residentTypeId, obj[0].customerloancurrentresidentdetails.id, obj[0].customerloancurrentresidentdetails.rentAmount, obj[0].customerloancurrentresidentdetails.valueOfProperty) : null;
                        let permanentAddressDetail: HomeLoanPermanentAddressDetailResponse = obj[0].customerDetail ? new HomeLoanPermanentAddressDetailResponse(obj[0].customerDetail.label, obj[0].customerDetail.addressLine1, obj[0].customerDetail.addressLine2, obj[0].customerDetail.pincode, obj[0].customerDetail.cityId, obj[0].customerDetail.addressTypeId, obj[0].customerDetail.addressId) : null;
                        let correspondenceAddressDetail: HomeLoanCorrespondenceAddressDetailResponse = obj[0].correspondenseAddress ? new HomeLoanCorrespondenceAddressDetailResponse(obj[0].correspondenseAddress.label, obj[0].correspondenseAddress.addressLine1, obj[0].correspondenseAddress.addressLine2, obj[0].correspondenseAddress.pincode, obj[0].correspondenseAddress.cityId, obj[0].correspondenseAddress.addressTypeId, obj[0].correspondenseAddress.addressId) : null;

                        let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(obj[0].customerLoanCompleteHistory.isCompleted, obj[0].customerLoanCompleteHistory.completeScreen);

                        let response: HomeLoanResponse = new HomeLoanResponse(propertyDetail, profileDetail, residenseDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer ? loanOffer : null, transferPropertyDetail);

                        let successResult = new ResultSuccess(200, true, 'Getting Home Loan Incomplete Data', [response], result[0].length);
                        console.log(successResult);
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

const getCustomerHomeLoanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Home Loan Detail');
        var requiredFields = ['customerId', 'customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.customerId;
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL customerGetHomeLoanByCustomerLoanId(` + customerId + `,` + customerLoanId + `)`;
                let result = await query(sql);
                if (result) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Home Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let obj = result[0];

                        obj[0].customerDetail = result[1][0];
                        obj[0].customerLoan = result[2][0];
                        obj[0].customerloanemploymentdetails = result[3][0];
                        obj[0].customerloancoapplicants = result[4];
                        obj[0].customerloancoapplicantemploymentdetails = result[5];
                        obj[0].customerloancurrentresidentdetails = result[6][0];
                        obj[0].correspondenseAddress = result[7][0];
                        obj[0].customerloandocuments = result[8];
                        obj[0].customerLoanCompleteHistory = result[9][0];
                        obj[0].customerLoanStatusHistory = result[10][result[10].length - 1];
                        obj[0].customerLoanOffers = result[11] ? result[11] : null;
                        obj[0].customerTransferPropertyDetail = result[12] ? result[12][0] : null;

                        let coapplicants = [];
                        let loanStatus = null;
                        for (let i = 0; i < obj[0].customerloancoapplicants.length; i++) {
                            let ind = obj[0].customerloancoapplicantemploymentdetails.findIndex(c => c.customerLoanCoApplicantId == obj[0].customerloancoapplicants[i].id);
                            if (obj[0].customerloancoapplicantemploymentdetails[ind]) {

                                let coapplicant: HomeLoanCoapplicantResponse = new HomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId, obj[0].customerloancoapplicantemploymentdetails[ind].id, obj[0].customerloancoapplicantemploymentdetails[ind].monthlyIncome, obj[0].customerloancoapplicantemploymentdetails[ind].companyAddressId, obj[0].customerloancoapplicantemploymentdetails[ind].addressTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].label, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine1, obj[0].customerloancoapplicantemploymentdetails[ind].addressLine2, obj[0].customerloancoapplicantemploymentdetails[ind].pincode, obj[0].customerloancoapplicantemploymentdetails[ind].cityId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentNatureId, obj[0].customerloancoapplicantemploymentdetails[ind].employmentServiceTypeId, obj[0].customerloancoapplicantemploymentdetails[ind].industryTypeId);
                                coapplicants.push(coapplicant);
                            }
                            else {
                                let coapplicant: HomeLoanCoapplicantResponse = new HomeLoanCoapplicantResponse(obj[0].customerloancoapplicants[i].fullName, obj[0].customerloancoapplicants[i].birthdate, obj[0].customerloancoapplicants[i].maritalStatusId, obj[0].customerloancoapplicants[i].id, obj[0].customerloancoapplicants[i].coApplicantRelationId);
                                coapplicants.push(coapplicant);
                            }

                        }
                        if (obj[0].customerLoanStatusHistory) {
                            loanStatus = new LoanStatusResponse(obj[0].customerLoanStatusHistory.id, obj[0].customerLoanStatusHistory.transactionDate, obj[0].customerLoanStatusHistory.loanStatus,
                                obj[0].customerLoanStatusHistory.isDataEditable, result[10][0].transactionDate, obj[0].customerLoan.displayName, null);
                        }
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerloandocuments.length; i++) {
                            let loanDocuments: HomeLoanDocumentResponse = new HomeLoanDocumentResponse(obj[0].customerloandocuments[i].id, obj[0].customerloandocuments[i].documentId, obj[0].customerloandocuments[i].documentUrl, obj[0].customerloandocuments[i].documentName, obj[0].customerloandocuments[i].isPdf, obj[0].customerloandocuments[i].serviceTypeDocumentId, obj[0].customerloandocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }
                        let loanOffer = [];
                        if (obj[0].customerLoanOffers) {
                            loanOffer = obj[0].customerLoanOffers;
                        }

                        let propertyDetail: HomeLoanPropertyDetailResponse = new HomeLoanPropertyDetailResponse(obj[0].customerLoan.id, obj[0].id, obj[0].propertyTypeId, obj[0].propertyPurchaseValue, obj[0].propertyCityId, obj[0].customerLoan.loanAmount, obj[0].addressLine1, obj[0].addressLine2, obj[0].pincode, obj[0].customerLoan.loanType);
                        let transferPropertyDetail: HomeLoanTransferPropertyDetailResponse = obj[0].customerTransferPropertyDetail ? new HomeLoanTransferPropertyDetailResponse(obj[0].customerTransferPropertyDetail.customerLoanId, obj[0].customerTransferPropertyDetail.loanAmountTakenExisting, obj[0].customerTransferPropertyDetail.approxDate, obj[0].customerTransferPropertyDetail.topupAmount, obj[0].customerTransferPropertyDetail.approxCurrentEMI, obj[0].customerTransferPropertyDetail.bankId, obj[0].customerTransferPropertyDetail.id) : null;

                        let profileDetail: HomeLoanProfileDetailResponse = obj[0].customerDetail ? new HomeLoanProfileDetailResponse(obj[0].customerDetail ? obj[0].customerDetail.fullName : null, obj[0].customerDetail ? obj[0].customerDetail.birthdate : null, obj[0].customerDetail ? obj[0].customerDetail.maritalStatusId : null, obj[0].customerDetail ? obj[0].customerDetail.panCardNo : null, obj[0].customerLoan.motherName, obj[0].customerLoan.fatherContactNo, coapplicants, obj[0].customerDetail.contactNo) : null;
                        let employmentDetail: HomeLoanEmploymentDetailResponse = obj[0].customerloanemploymentdetails ? new HomeLoanEmploymentDetailResponse(obj[0].customerLoan.employmentTypeId, obj[0].customerloanemploymentdetails.monthlyIncome, obj[0].customerloanemploymentdetails.label, obj[0].customerloanemploymentdetails.addressLine1, obj[0].customerloanemploymentdetails.addressLine2, obj[0].customerloanemploymentdetails.pincode, obj[0].customerloanemploymentdetails.cityId, obj[0].customerloanemploymentdetails.companyAddressId, obj[0].customerloanemploymentdetails.addressTypeId, obj[0].customerloanemploymentdetails.id, obj[0].customerloanemploymentdetails.industryTypeId, obj[0].customerloanemploymentdetails.employmentNatureId, obj[0].customerloanemploymentdetails.employmentServiceTypeId) : null;
                        let residenseDetail: HomeLoanCurrentResidenseResponse = obj[0].customerloancurrentresidentdetails ? new HomeLoanCurrentResidenseResponse(obj[0].customerloancurrentresidentdetails.residentTypeId, obj[0].customerloancurrentresidentdetails.id, obj[0].customerloancurrentresidentdetails.rentAmount, obj[0].customerloancurrentresidentdetails.valueOfProperty) : null;
                        let permanentAddressDetail: HomeLoanPermanentAddressDetailResponse = obj[0].customerDetail ? new HomeLoanPermanentAddressDetailResponse(obj[0].customerDetail.label, obj[0].customerDetail.addressLine1, obj[0].customerDetail.addressLine2, obj[0].customerDetail.pincode, obj[0].customerDetail.cityId, obj[0].customerDetail.addressTypeId, obj[0].customerDetail.addressId) : null;
                        let correspondenceAddressDetail: HomeLoanCorrespondenceAddressDetailResponse = obj[0].correspondenseAddress ? new HomeLoanCorrespondenceAddressDetailResponse(obj[0].correspondenseAddress.label, obj[0].correspondenseAddress.addressLine1, obj[0].correspondenseAddress.addressLine2, obj[0].correspondenseAddress.pincode, obj[0].correspondenseAddress.cityId, obj[0].correspondenseAddress.addressTypeId, obj[0].correspondenseAddress.addressId) : null;

                        let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(obj[0].customerLoanCompleteHistory.isCompleted, obj[0].customerLoanCompleteHistory.completeScreen);

                        let response: HomeLoanResponse = new HomeLoanResponse(propertyDetail, profileDetail, residenseDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer, transferPropertyDetail);

                        let successResult = new ResultSuccess(200, true, 'Getting Home Loan Incomplete Data', [response], result[0].length);
                        console.log(successResult);
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
        let errorResult = new ResultError(500, true, 'homeLoan.getCustomerHomeLoanById()', error, '');
        next(errorResult);
    }
};

export default {
    insertUpdateCustomerLoanPropertyDetail, insertUpdateCustomerLoanTransferPropertyDetail, insertUpdateHomeLoanCustomerDetail, insertUpdateCustomerAddress, insertUpdateHomeLoanCustomerEmploymentDetail, insertUpdateHomeLoanCoApplicantEmploymentDetail
    , insertUpdateHomeLoanCurrentResidentDetail, uploadHomeLoanDocument, getIncompleteHomeLoanDetail, getCustomerHomeLoanById
}