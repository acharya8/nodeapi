import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { BusinessLoanBasicDetailResponse } from '../../classes/output/loan/business loan/businessLoanBasicDetailResponse';
import { BusinessLoanResponse } from '../../classes/output/loan/business loan/businessLoanResponse';
import { BusinessLoanMoreBasicDetailResponse } from '../../classes/output/loan/business loan/businessLoanMoreBasicDetailResponse';
import { loanCompleteHistoryResponse } from '../../classes/output/loan/loanCompleteHistoryReponse';
import { LoanStatusResponse } from '../../classes/output/loan/loanStatusResponse';
import { BusinessLoanDocumentResponse } from '../../classes/output/loan/business loan/businessLoanDocumentResponse';

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

const NAMESPACE = 'Business Loan';

const insertUpdateBusinessLoanBasicDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Business Loan Basic Detail');
        var requiredFields = ['customerId', 'fullName', 'gender', 'panCardNo', 'cityId', 'pincode', 'maritalStatusId', 'loanAmount', 'employmentTypeId', 'serviceId', 'businessAnnualSale', 'businessExperienceId', 'email', 'residentTypeId', 'loanTypeName'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerId = req.body.customerId;
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : 0;
                let customerLoanBusinessDetailId = req.body.customerLoanBusinessDetailId ? req.body.customerLoanBusinessDetailId : 0;
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : 0;
                let customerLoanCurrentResidentTypeId = req.body.customerLoanCurrentResidentTypeId ? req.body.customerLoanCurrentResidentTypeId : 0;
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
                let loanType = req.body.loanTypeName
                let loanAmountTakenExisting = req.body.loanAmountTakenExisting ? req.body.loanAmountTakenExisting : null;
                let approxDate = req.body.approxDate ? new Date(req.body.approxDate) : null;
                let approxDate2 = '';
                let topupAmount = req.body.topupAmount ? req.body.topupAmount : null;
                let approxCurrentEMI = req.body.approxCurrentEMI ? req.body.approxCurrentEMI : null;
                let bankId = req.body.bankId ? req.body.bankId : null;
                if (approxDate)
                    approxDate2 = new Date(approxDate).getFullYear().toString() + '-' + ("0" + (new Date(approxDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(approxDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(approxDate).getHours())).slice(-2) + ':' + ("0" + (new Date(approxDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(approxDate).getSeconds())).slice(-2);
                let currentUserId = req.body.userId ? req.body.userId : authorizationResult.currentUser.id;
                if (birthDate)
                    dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);

                let partnerId = 0;
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                if (dsaCode && !customerLoanId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = await query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }
                let sql = `CALL InsertUpdateBusinessLoanBasicDetail(` + customerId + `,` + userId + `,` + customerLoanId + `,` + customerLoanBusinessDetailId + `,` + customerAddressId + `,` + customerLoanCurrentResidentTypeId + `
                ,'` + fullName + `','` + dDate + `','` + gender + `','` + panCardNo + `', ` + maritalStatusId + `,` + cityId + `,'` + pincode + `',` + loanAmount + `,` + employmentTypeId + `,` + loanAgainstCollateralId + `,` + serviceId + `,` + businessAnnualSale + `
                ,` + businessExperienceId + `,'` + email + `',` + residentTypeId + `,` + partnerId + `,` + currentUserId + `,` + loanAmountTakenExisting + `,'` + approxDate2 + `',` + topupAmount + `,` + approxCurrentEMI + `,` + bankId + `,'` + req.body.loanTypeName + `')`;
                console.log(sql);
                let result = await query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Basic Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Basic Detail Saved', result, 1);
                        console.log(successResult);
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
};

const insertUpdateBusinessLoanBusinessDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Business Loan Business Detail');
        var requiredFields = ['customerLoanBusinessDetailId', 'customerLoanId', 'companyTypeId', 'industryTypeId', 'businessNatureId', 'businessAnnualProfitId', 'primaryBankId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
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
                let currentlyPayEmi = req.body.currentlyPayEmi ? req.body.currentlyPayEmi : null;

                let sql = `CALL insertUpdateBusinessLoanBusinessDetail(` + customerLoanBusinessDetailId + `,` + customerLoanId + `,` + companyTypeId + `,` + industryTypeId + `,` + businessNatureId + `,` + businessAnnualProfitId + `
                ,` + primaryBankId + `,` + currentlyPayEmi + `,` + userId + `)`;
                let result = await query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Business Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Business Detail Saved', result, 1);
                        console.log(successResult);
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
};

const InsertUpdateBusinessLoanMoreBasicDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Business Loan More Basic Detail');
        var requiredFields = ['customerAddressId', 'customerLoanBusinessDetailId', 'businessName', 'businessGstNo', 'customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerAddressId = req.body.customerAddressId;
                let customerLoanBusinessDetailId = req.body.customerLoanBusinessDetailId;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
                let label = req.body.label ? req.body.label : '';
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let businessName = req.body.businessName;
                let businessGstNo = req.body.businessGstNo;
                let customerLoanId = req.body.customerLoanId;

                let sql = `CALL InsertUpdateBusinessLoanMoreBasicDetail(` + customerAddressId + `,` + customerLoanBusinessDetailId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `'
                ,'` + addressLine2 + `','` + businessName + `','` + businessGstNo + `',` + userId + `,` + customerLoanId + `)`;
                let result = await query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Business Loan More Basic Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Business Loan More Basic Detail Saved', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Business Loan More Basic Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'businessLoan.InsertUpdateBusinessLoanMoreBasicDetail()', error, '');
        next(errorResult);
    }
};

const uploadBusinessLoanDocument = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Business Loan Documents Detail');
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
                                        let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                                        let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                                        let chageStatusResult = await query(chageStatusSql, customerLoanId);
                                        let loancompleteSql = "UPDATE loancompletescreenhistory SET isCompleted=true WHERE customerLoanId=" + customerLoanId;
                                        let loanCompleteResult = await query(loancompleteSql);
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
                                                let documentStatus = 'PENDING';
                                                url = req.body.loanDocuments[k].docUrl;
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
                                                //VALUES(`+ customerLoanId + `,` + req.body.loanDocuments[i].serviceTypeDocumentId + `,` + req.body.loanDocuments[i].documentId + `,'` + data.Location + `',` + userId + `,` + userId + `)`;
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
                                            let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                                            let chageStatusSql = "UPDATE customerloans SET statusId = " + loanStatusId + ", loanTransactionDate = '" + transactionDate + "' WHERE id = ?";
                                            let chageStatusResult = await query(chageStatusSql, customerLoanId);
                                            console.log(chageStatusResult);
                                            console.log(statusResult);
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
        let errorResult = new ResultError(500, true, 'businessLoan.uploadBusinessLoanDocument()', error, '');
        next(errorResult);
    }
};

const getIncompleteBusinessLoanDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Incomplete Business Loan Detail');
        var requiredFields = ['customerId', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let customerId = req.body.customerId;
                let sql = `CALL customerGetIncompleteBusinessLoanRequest(` + customerId + `,` + serviceId + `)`;
                let result = await query(sql);
                if (result) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let obj = result[0];
                        obj[0].customerLoan = result[1][0];
                        obj[0].customerLoanDocuments = result[2];
                        obj[0].customerloanbusinessdetails = result[3][0];
                        obj[0].customerloancurrentresidentdetails = result[4][0];
                        obj[0].customerLoanCompleteHistory = result[5][0];
                        obj[0].customerLoanStatusHistory = result[6][result[6].length - 1];
                        obj[0].customerloanoffer = result[7] ? result[7] : null;
                        obj[0].transferLoanDetail = result[8] ? result[8] : null;
                        let loanStatus = null;
                        let loanAmountTakenExisting = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].loanAmountTakenExisting : null;
                        let approxDate = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxDate : null;
                        let approxCurrentEMI = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxCurrentEMI : null;
                        let bankId = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].bankId : null;
                        let topupAmount = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].topupAmount : null;
                        let basicDetail: BusinessLoanBasicDetailResponse = new BusinessLoanBasicDetailResponse(obj[0].fullName, obj[0].birthdate, obj[0].panCardNo, obj[0].customerLoan.employmentTypeId
                            , obj[0].pincode, obj[0].customerLoan.loanAmount, obj[0].customerLoan.id
                            , obj[0].customerloanbusinessdetails.businessAnnualSale, obj[0].customerloanbusinessdetails.businessExperienceId, obj[0].email, obj[0].gender, obj[0].maritalStatusId,
                            obj[0].customerloancurrentresidentdetails.residentTypeId, obj[0].cityId, obj[0].customerloanbusinessdetails.companyTypeId, obj[0].customerloanbusinessdetails.businessNatureId,
                            obj[0].customerloanbusinessdetails.industryTypeId, obj[0].customerloanbusinessdetails.businessAnnualProfitId, obj[0].customerloanbusinessdetails.primaryBankId,
                            obj[0].addressId, obj[0].customerloanbusinessdetails.id, obj[0].customerloancurrentresidentdetails.id, obj[0].customerLoan.loanAgainstCollateralId,
                            obj[0].customerloanbusinessdetails.currentlyPayEmi, null, null, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[0].customerLoan.loanType);
                        let moreBasicDetail: BusinessLoanMoreBasicDetailResponse = new BusinessLoanMoreBasicDetailResponse(obj[0].addressLine1, obj[0].addressLine2, obj[0].customerloanbusinessdetails.businessName, obj[0].customerloanbusinessdetails.businessGstNo, obj[0].contactNo);
                        let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(obj[0].customerLoanCompleteHistory.isCompleted, obj[0].customerLoanCompleteHistory.completeScreen);
                        if (obj[0].customerLoanStatusHistory) {
                            let len = obj[0].customerLoanStatusHistory.length - 1;
                            loanStatus = new LoanStatusResponse(obj[0].customerLoanStatusHistory.id, obj[0].customerLoanStatusHistory.transactionDate, obj[0].customerLoanStatusHistory.loanStatus,
                                obj[0].customerLoanStatusHistory.isDataEditable, result[6][0].transactionDate, obj[0].customerLoan.displayName, null);
                        }
                        let loanOffer = [];
                        loanOffer = obj[0].customerloanoffer;
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerLoanDocuments.length; i++) {
                            let loanDocuments: BusinessLoanDocumentResponse = new BusinessLoanDocumentResponse(obj[0].customerLoanDocuments[i].id, obj[0].customerLoanDocuments[i].documentId, obj[0].customerLoanDocuments[i].documentUrl, obj[0].customerLoanDocuments[i].documentName, obj[0].customerLoanDocuments[i].isPdf, obj[0].customerLoanDocuments[i].serviceTypeDocumentId, obj[0].customerLoanDocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }

                        let response: BusinessLoanResponse = new BusinessLoanResponse(basicDetail, moreBasicDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer);
                        let successResult = new ResultSuccess(200, true, 'Getting Business Loan Incomplete Data', [response], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting Business Loan Incomplete Data", result, '');
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
        let errorResult = new ResultError(500, true, 'businessLoan.getIncompleteBusinessLoanDetail()', error, '');
        next(errorResult);
    }
};

const getCustomerBusinessLoanById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Incomplete Business Loan Detail');
        var requiredFields = ['customerId', 'customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.customerId;
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL customerGetBusinessLoanByCustomerLoanId(` + customerId + `,` + customerLoanId + `)`;
                let result = await query(sql);
                if (result) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Business Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {

                        let obj = result[0];
                        obj[0].customerLoan = result[1][0];
                        obj[0].customerLoanDocuments = result[2];
                        obj[0].customerloanbusinessdetails = result[3][0];
                        obj[0].customerloancurrentresidentdetails = result[4][0];
                        obj[0].customerLoanCompleteHistory = result[5][0];
                        obj[0].customerLoanStatusHistory = result[6][result[6].length - 1];
                        obj[0].customerloanoffer = result[7] ? result[7] : null;
                        obj[0].transferLoanDetail = result[8] ? result[8] : null;
                        let loanStatus = null;
                        let loanAmountTakenExisting = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].loanAmountTakenExisting : null;
                        let approxDate = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxDate : null;
                        let approxCurrentEMI = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxCurrentEMI : null;
                        let bankId = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].bankId : null;
                        let topupAmount = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].topupAmount : null;
                        let basicDetail: BusinessLoanBasicDetailResponse = new BusinessLoanBasicDetailResponse(obj[0].fullName, obj[0].birthdate, obj[0].panCardNo, obj[0].customerLoan.employmentTypeId
                            , obj[0].pincode, obj[0].customerLoan.loanAmount, obj[0].customerLoan.id
                            , obj[0].customerloanbusinessdetails.businessAnnualSale, obj[0].customerloanbusinessdetails.businessExperienceId, obj[0].email, obj[0].gender, obj[0].maritalStatusId,
                            obj[0].customerloancurrentresidentdetails.residentTypeId, obj[0].cityId, obj[0].customerloanbusinessdetails.companyTypeId, obj[0].customerloanbusinessdetails.businessNatureId,
                            obj[0].customerloanbusinessdetails.industryTypeId, obj[0].customerloanbusinessdetails.businessAnnualProfitId, obj[0].customerloanbusinessdetails.primaryBankId,
                            obj[0].addressId, obj[0].customerloanbusinessdetails.id, obj[0].customerloancurrentresidentdetails.id, obj[0].customerLoan.loanAgainstCollateralId,
                            obj[0].customerloanbusinessdetails.currentlyPayEmi, null, null, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[0].customerLoan.loanType);
                        let moreBasicDetail: BusinessLoanMoreBasicDetailResponse = new BusinessLoanMoreBasicDetailResponse(obj[0].addressLine1, obj[0].addressLine2, obj[0].customerloanbusinessdetails.businessName, obj[0].customerloanbusinessdetails.businessGstNo, obj[0].contactNo);
                        let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(obj[0].customerLoanCompleteHistory.isCompleted, obj[0].customerLoanCompleteHistory.completeScreen);
                        if (obj[0].customerLoanStatusHistory) {
                            let len = obj[0].customerLoanStatusHistory.length - 1;
                            loanStatus = new LoanStatusResponse(obj[0].customerLoanStatusHistory.id, obj[0].customerLoanStatusHistory.transactionDate, obj[0].customerLoanStatusHistory.loanStatus,
                                obj[0].customerLoanStatusHistory.isDataEditable, result[6][0].transactionDate, obj[0].customerLoan.displayName, null);
                        }
                        let loanDocuments2 = [];
                        for (let i = 0; i < obj[0].customerLoanDocuments.length; i++) {
                            let loanDocuments: BusinessLoanDocumentResponse = new BusinessLoanDocumentResponse(obj[0].customerLoanDocuments[i].id, obj[0].customerLoanDocuments[i].documentId, obj[0].customerLoanDocuments[i].documentUrl, obj[0].customerLoanDocuments[i].documentName, obj[0].customerLoanDocuments[i].isPdf, obj[0].customerLoanDocuments[i].serviceTypeDocumentId, obj[0].customerLoanDocuments[i].documentStatus);
                            loanDocuments2.push(loanDocuments);
                        }

                        let loanOffer = [];
                        loanOffer = obj[0].customerloanoffer;

                        let response: BusinessLoanResponse = new BusinessLoanResponse(basicDetail, moreBasicDetail, loanCompleteHistory, loanStatus, loanDocuments2, loanOffer);
                        let successResult = new ResultSuccess(200, true, 'Getting Business Loan Incomplete Data', [response], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "businessLoan.getCustomerBusinessLoanById() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'businessLoan.getCustomerBusinessLoanById()', error, '');
        next(errorResult);
    }
};

export default {
    insertUpdateBusinessLoanBasicDetail, insertUpdateBusinessLoanBusinessDetail, InsertUpdateBusinessLoanMoreBasicDetail, uploadBusinessLoanDocument, getIncompleteBusinessLoanDetail
    , getCustomerBusinessLoanById
}