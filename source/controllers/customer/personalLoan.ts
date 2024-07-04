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
import { PersonalLoanResponse } from '../../classes/output/loan/personloanResponse';
import { loanCompleteHistoryResponse } from '../../classes/output/loan/loanCompleteHistoryReponse';
import { LoanStatusResponse } from '../../classes/output/loan/loanStatusResponse';
import { PersonalLoanDocumentResponse } from '../../classes/output/loan/personalloanDocumentsResponse';
import { PersonalLoanReferenceResponse } from '../../classes/output/loan/personalloanReferenceResponse';
import { PersonalloanCurrentAddressDetailResponse } from '../../classes/output/loan/personalloanCurrentAddressDetailResponse';

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

const insertUpdateEmploymentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['employmentTypeId', 'monthlyIncome', 'companyName', 'officePincode', 'customerId', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerId = req.body.customerId ? req.body.customerId : null;
                let serviceId = req.body.serviceId ? req.body.serviceId : null;
                let employmentTypeId = req.body.employmentTypeId ? req.body.employmentTypeId : null;
                let monthlyIncome = req.body.monthlyIncome ? req.body.monthlyIncome : null;
                let companyName = req.body.companyName ? req.body.companyName : "";
                let officePincode = req.body.officePincode ? req.body.officePincode : "";
                let customerLoanId = req.body.customerLoanId ? req.body.customerLoanId : null;
                let customerLoanEmploymentId = req.body.customerLoanEmploymentId ? req.body.customerLoanEmploymentId : null;
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

                let sql = `CALL customerInsertUpdatePersonalLoanEmploymentDetail(` + customerLoanId + `,` + customerLoanEmploymentId + `,` + employmentTypeId + `,` + monthlyIncome + `
                , '`+ companyName + `','` + officePincode + `',` + serviceId + `,` + customerId + `,` + userId + `,` + partnerId + `,'` + loanType + `')`;
                let result = await query(sql);
                if (result) {
                    console.log(result);
                    if (result.length && result[0].length > 0) {

                        let successResult = new ResultSuccess(200, true, 'Employment Detail Saved', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Employment Detail Saved', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Employment Detail Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.insertUpdateEmploymentDetail()', error, '');
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
                let tenureId = req.body.tenureId ? req.body.tenureId : null;
                let sql = `CALL customerUpdatePersonalLoanAmount(` + customerLoanId + `,` + loanAmount + `,` + tenureId + `,` + userId + `)`;
                let result = await query(sql);
                if (result) {
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Loan Amount Updated', result, 1);
                    console.log(successResult);
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

const insertUpdateMoreBasicDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerId', 'customerLoanId', 'alternativeContactNo', 'gender', 'maritalStatusId', 'motherName'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerId = req.body.customerId;
                let customerLoanId = req.body.customerLoanId;
                let alternativeContactNo = req.body.alternativeContactNo;
                let gender = req.body.gender;
                let maritalStatusId = req.body.maritalStatusId;
                let motherName = req.body.motherName;
                let fatherContactNo = req.body.fatherContactNo ? req.body.fatherContactNo : '';
                let fatherName = req.body.fatherName ? req.body.fatherName : null;
                let customerLoanSpouseId = req.body.customerLoanSpouseId ? req.body.customerLoanSpouseId : null;
                let spouseName = req.body.spouseName ? req.body.spouseName : "";
                let spouseContactNo = req.body.spouseContactNo ? req.body.spouseContactNo : "";
                let label = req.body.label ? req.body.label : '';
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let cityId = req.body.cityId ? req.body.cityId : null;
                let city = req.body.city ? req.body.city : '';
                let state = req.body.state ? req.body.state : '';
                let district = req.body.district ? req.body.district : '';
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : null;
                let addressTypeId = 5; //current address
                let pincode = req.body.pincode ? req.body.pincode : null;
                let loanAmountTakenExisting = req.body.loanAmountTakenExisting ? req.body.loanAmountTakenExisting : null;
                let approxDate = req.body.approxDate ? new Date(req.body.approxDate) : null;
                let approxDate2 = '';
                let topupAmount = req.body.topupAmount ? req.body.topupAmount : null;
                let approxCurrentEMI = req.body.approxCurrentEMI ? req.body.approxCurrentEMI : null;
                let bankId = req.body.bankId ? req.body.bankId : null;
                if (approxDate)
                    approxDate2 = new Date(approxDate).getFullYear().toString() + '-' + ("0" + (new Date(approxDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(approxDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(approxDate).getHours())).slice(-2) + ':' + ("0" + (new Date(approxDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(approxDate).getSeconds())).slice(-2);
                let sql1 = `SELECT id FROM  customeraddresses WHERE customerId = ` + customerId + ` AND addressTypeId = ` + addressTypeId;
                let result1 = await query(sql1);
                if (result1 && result1.length > 0) {
                    customerAddressId = result1[0].id;
                }

                let sql = `CALL customerUpdatePersonalLoanBasicDetail(` + customerId + `, '` + alternativeContactNo + `', '` + gender + `'
                ,` + maritalStatusId + `,` + customerLoanId + `, '` + motherName + `','` + fatherContactNo + `',` + userId + `,` + customerLoanSpouseId + `
                ,'`+ spouseName + `','` + spouseContactNo + `','` + fatherName + `',` + customerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `','` + city + `',` + cityId + `,'` + state + `','` + district + `',` + loanAmountTakenExisting + `,'` + approxDate2 + `',` + topupAmount + `,` + approxCurrentEMI + `,` + bankId + `,'` + req.body.loanTypeName + `')`;
                let result = await query(sql);
                if (result) {

                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Personal Loan Basic Detail Updated', [result[0][0], result[1][0]], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Personal Loan Basic Detail Not Updated", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.insertUpdateMoreBasicDetail()', error, '');
        next(errorResult);
    }
};

const updateMoreEmploymentDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['emailId', 'customerLoanId', 'customerLoanEmploymentId', 'label', 'addressLine1', 'pincode', 'cityId', 'city'
            , 'district', 'state', 'designation', 'currentCompanyExperience'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let emailId = req.body.emailId;
                let customerLoanId = req.body.customerLoanId;
                let customerLoanEmploymentId = req.body.customerLoanEmploymentId;
                let companyTypeId = req.body.companyTypeId ? req.body.companyTypeId : null;
                let companyAddressId = req.body.companyAddressId ? req.body.companyAddressId : null;
                let addressTypeId = 2;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1;
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let pincode = req.body.pincode;
                let cityId = req.body.cityId;
                let city = req.body.city;
                let district = req.body.district;
                let state = req.body.state;
                let designation = req.body.designation;
                let currentCompanyExperience = req.body.currentCompanyExperience;

                let sql = `CALL customerUpdatePersonalLoanMoreEmploymentDetail(` + customerLoanId + `,` + customerLoanEmploymentId + `,` + companyTypeId + `,` + companyAddressId + `
                    , `+ addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + city + `','` + district + `','` + state + `'
                    , '`+ designation + `',` + currentCompanyExperience + `,` + userId + `,'` + emailId + `')`;
                console.log(sql);
                let result = await query(sql);
                if (result) {
                    let successResult = new ResultSuccess(200, true, 'Personal Loan Employment Detail Updated', result[0], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Personal Loan Employment Detail Not Updated", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.updateMoreEmploymentDetail()', error, '');
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
                                if (ids && ids.length > 0) {
                                    for (let i = 0; i < ids.length; i++) {
                                        let deleteSql = `DELETE FROM customerloandocuments WHERE id = ?`;
                                        let deleteResult = await query(deleteSql, ids[i]);
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






                                    if (!sendRes && cnt == req.body.loanDocuments.length) {
                                        let successResult = new ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                        console.log(successResult);
                                        sendRes = true;
                                        return res.status(200).send(successResult);
                                    }
                                }
                                else {
                                    let successResult = new ResultSuccess(200, true, 'Document Uploaded', response, 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                }
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
                                                if (result && result.affectedRows >= 0) {
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
                                                if (result && result.affectedRows >= 0) {
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
                                            if (ids && ids.length > 0) {
                                                for (let i = 0; i < ids.length; i++) {
                                                    let deleteSql = `DELETE FROM customerloandocuments WHERE id = ?`;
                                                    let deleteResult = await query(deleteSql, ids[i]);
                                                }
                                            }
                                            let successResult = new ResultSuccess(200, true, 'Document Uploaded', [objResult], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        }
                                    }
                                    else {
                                        if (ids && ids.length > 0) {
                                            for (let i = 0; i < ids.length; i++) {
                                                let deleteSql = `DELETE FROM customerloandocuments WHERE id = ?`;
                                                let deleteResult = await query(deleteSql, ids[i]);
                                            }
                                        }

                                        let successResult = new ResultSuccess(200, true, 'Document Uploaded', response, 1);
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
                                console.log(chageStatusResult);
                            }
                            else
                                console.log("dsfsdfsdfsd");

                        }
                        let successResult = new ResultSuccess(200, true, 'Document Uploaded', response, 1);
                        console.log(successResult);
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

const getIncompletePersonalLoanDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Incomplete Personal Loan Detail');
        var requiredFields = ['customerId', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let customerId = req.body.customerId;

                let sql = `CALL customerGetIncompletePersonalLoanRequest(` + customerId + `,` + serviceId + `)`;
                let result = await query(sql);
                if (result && result.length > 0 && result[0].length > 0) {
                    if (result[0][0].message && result[0][0].message == "Data Not Available") {
                        let successResult = new ResultSuccess(200, true, 'Personl Loan Incomplete data is not available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let obj = result[0];
                        obj[0].customerLoan = result[1][0];
                        obj[0].customerLoanEmploymentDetail = result[2][0];
                        obj[0].customerLoanSpouses = result[3][0];
                        obj[0].customerLoanDocuments = result[4];
                        obj[0].customerLoanReferences = result[5];
                        obj[0].customerLoanCompleteHistory = result[6][0];
                        obj[0].customerLoanStatusHistory = result[7][result[7].length - 1];
                        obj[0].customerLoanOffers = result[8] ? result[8] : null;
                        obj[0].currentAddressDetail = result[9] ? result[9][0] : null;
                        obj[0].transferLoanDetail = result[10] ? result[10] : null;
                        let loanStatus = null;
                        let loanAmountTakenExisting = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].loanAmountTakenExisting : null;
                        let approxDate = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxDate : null;
                        let approxCurrentEMI = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].approxCurrentEMI : null;
                        let bankId = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].bankId : null;
                        let topupAmount = obj[0].transferLoanDetail && obj[0].transferLoanDetail.length > 0 ? obj[0].transferLoanDetail[0].topupAmount : null;
                        let basicDetail: CustomerResponse = new CustomerResponse(obj[0].fullName, obj[0].birthdate, obj[0].panCardNo, obj[0].customerLoan.employmentTypeId
                            , obj[0].customerLoanEmploymentDetail.monthlyIncome, obj[0].customerLoanEmploymentDetail.companyName, obj[0].customerLoanEmploymentDetail.officePincode
                            , obj[0].customerLoan.loanAmount, obj[0].customerLoan.tenureId, obj[0].customerLoan.id, obj[0].customerLoanEmploymentDetail.id, obj[0].contactNo);
                        let moreBasicDetail: PersonalLoanMoreBasicDetailResponse = new PersonalLoanMoreBasicDetailResponse(obj[0].alternativeContactNo, obj[0].gender
                            , obj[0].maritalStatusId, obj[0].customerLoanSpouses?.name, obj[0].customerLoanSpouses?.contactNo, obj[0].customerLoan.motherName
                            , obj[0].customerLoan.fatherContactNo, obj[0].customerLoanSpouses?.id, obj[0].customerLoan.fatherName, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, obj[0].customerLoan.loanType);
                        let moreEmploymentDetail: PersonalLoanMoreEmploymentDetailResponse = new PersonalLoanMoreEmploymentDetailResponse(obj[0].email, obj[0].customerLoanEmploymentDetail.designation
                            , obj[0].customerLoanEmploymentDetail.companyTypeId, obj[0].customerLoanEmploymentDetail.currentCompanyExperience, obj[0].customerLoanEmploymentDetail.label
                            , obj[0].customerLoanEmploymentDetail.addressLine1, obj[0].customerLoanEmploymentDetail.addressLine2, obj[0].customerLoanEmploymentDetail.pincode
                            , obj[0].customerLoanEmploymentDetail.cityId, obj[0].customerLoanEmploymentDetail.city, obj[0].customerLoanEmploymentDetail.district
                            , obj[0].customerLoanEmploymentDetail.state, obj[0].customerLoanEmploymentDetail.companyAddressId);
                        let loanCompleteHistory: loanCompleteHistoryResponse = new loanCompleteHistoryResponse(obj[0].customerLoanCompleteHistory.isCompleted, obj[0].customerLoanCompleteHistory.completeScreen);
                        let currentAddressDetail: PersonalloanCurrentAddressDetailResponse = obj[0].currentAddressDetail ? new PersonalloanCurrentAddressDetailResponse(
                            obj[0].currentAddressDetail.label, obj[0].currentAddressDetail.addressLine1, obj[0].currentAddressDetail.addressLine2, obj[0].currentAddressDetail.pincode, obj[0].currentAddressDetail.cityId, obj[0].currentAddressDetail.addressTypeId, obj[0].currentAddressDetail.addressId, obj[0].currentAddressDetail.city, obj[0].currentAddressDetail.state, obj[0].currentAddressDetail.district
                        ) : null;
                        let loanDocuments = [];
                        let loanReference = [];
                        if (obj[0].customerLoanDocuments && obj[0].customerLoanDocuments.length > 0) {
                            for (let k = 0; k < obj[0].customerLoanDocuments.length; k++) {
                                let doc: PersonalLoanDocumentResponse = new PersonalLoanDocumentResponse(obj[0].customerLoanDocuments[k].id, obj[0].customerLoanDocuments[k].documentId
                                    , obj[0].customerLoanDocuments[k].documentUrl, obj[0].customerLoanDocuments[k].documentName, obj[0].customerLoanDocuments[k].isPdf
                                    , obj[0].customerLoanDocuments[k].serviceTypeDocumentId, obj[0].customerLoanDocuments[k].documentStatus);
                                loanDocuments.push(doc);
                            }
                        }

                        if (obj[0].customerLoanReferences && obj[0].customerLoanReferences.length > 0) {
                            for (let k = 0; k < obj[0].customerLoanReferences.length; k++) {
                                let loanreference: PersonalLoanReferenceResponse = new PersonalLoanReferenceResponse(obj[0].customerLoanReferences[k].customerLoanReferenceId, obj[0].customerLoanReferences[k].fullName, obj[0].customerLoanReferences[k].contactNo, obj[0].customerLoanReferences[k].label, obj[0].customerLoanReferences[k].addressLine1, obj[0].customerLoanReferences[k].addressLine2, obj[0].customerLoanReferences[k].pincode, obj[0].customerLoanReferences[k].city, obj[0].customerLoanReferences[k].cityId, obj[0].customerLoanReferences[k].state, obj[0].customerLoanReferences[k].district);
                                loanReference.push(loanreference);
                            }
                        }

                        if (obj[0].customerLoanStatusHistory) {
                            let len = obj[0].customerLoanStatusHistory.length - 1;
                            loanStatus = new LoanStatusResponse(obj[0].customerLoanStatusHistory.id, obj[0].customerLoanStatusHistory.transactionDate, obj[0].customerLoanStatusHistory.loanStatus,
                                obj[0].customerLoanStatusHistory.isDataEditable, result[7][0].transactionDate, obj[0].customerLoan.displayName, null);
                        }
                        let loanOffer = [];
                        if (obj[0].customerLoanOffers) {
                            loanOffer = obj[0].customerLoanOffers;
                        }

                        let response: PersonalLoanResponse = new PersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, loanOffer, currentAddressDetail);
                        let successResult = new ResultSuccess(200, true, 'Getting Personal Loan Incomplete Data', [response], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }

                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting Personal Loan Incomplete Data", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.getIncompletePersonalLoanDetail()', error, '');
        next(errorResult);
    }
};

const getCustomerPersonalById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Customer Personal Loan By Customer Loan Id');
        var requiredFields = ["customerId", "customerLoanId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.customerId;
                let customerLoanId = req.body.customerLoanId;
                let sql = `CALL getCustomerPersonalLoanByCustomerLoanId(` + customerId + `,` + customerLoanId + `)`;
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
                                        customerLoan[j].customerloanoffer = result[8] ? result[8] : null;
                                    }
                                    if (result[9].length > 0) {
                                        customerLoan[j].currentAddressDetail = result[9] ? result[9][0] : null;
                                    }
                                    if (result[9].length > 0) {
                                        customerLoan[j].currentAddressDetail = result[9] ? result[9][0] : null;
                                    }
                                    if (result[10].length > 0) {
                                        customerLoan[j].loanTransferDetail = result[10].filter(c => c.customerLoanId == customerLoan[j].id)
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
                                        , obj[i].customerLoan[j].customerLoanEmploymentDetail[0].officePincode, obj[i].customerLoan[j].loanAmount, obj[i].customerLoan[j].tenureId, obj[i].customerLoan[j].id, obj[i].customerLoan[j].customerLoanEmploymentDetail[0].id, obj[i].contactNo);
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
                                    let currentAddressDetail: PersonalloanCurrentAddressDetailResponse = obj[i].customerLoan[j].currentAddressDetail ? new PersonalloanCurrentAddressDetailResponse(obj[i].customerLoan[j].currentAddressDetail.label, obj[i].customerLoan[j].currentAddressDetail.addressLine1, obj[i].customerLoan[j].currentAddressDetail.addressLine2, obj[i].customerLoan[j].currentAddressDetail.pincode, obj[i].customerLoan[j].currentAddressDetail.cityId, obj[i].customerLoan[j].currentAddressDetail.addressTypeId, obj[i].customerLoan[j].currentAddressDetail.addressId, obj[i].customerLoan[j].currentAddressDetail.city, obj[i].customerLoan[j].currentAddressDetail.state, obj[i].customerLoan[j].currentAddressDetail.district) : null;
                                    let loanDocuments = [];
                                    let loanReference = [];
                                    let loanStatus;
                                    if (obj[i].customerLoan[j].customerLoanDocuments && obj[i].customerLoan[j].customerLoanDocuments.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerLoanDocuments.length; k++) {
                                            let doc: PersonalLoanDocumentResponse = new PersonalLoanDocumentResponse(obj[i].customerLoan[j].customerLoanDocuments[k].id, obj[i].customerLoan[j].customerLoanDocuments[k].documentId
                                                , obj[i].customerLoan[j].customerLoanDocuments[k].documentUrl, obj[i].customerLoan[j].customerLoanDocuments[k].documentName, obj[i].customerLoan[j].customerLoanDocuments[k].isPdf
                                                , obj[i].customerLoan[j].customerLoanDocuments[k].serviceTypeDocumentId, obj[i].customerLoan[j].customerLoanDocuments[k].documentStatus);
                                            loanDocuments.push(doc);
                                        }
                                    }
                                    if (obj[i].customerLoan[j].customerLoanReferences && obj[i].customerLoan[j].customerLoanReferences.length > 0) {
                                        for (let k = 0; k < obj[i].customerLoan[j].customerLoanReferences.length; k++) {
                                            let loanreference: PersonalLoanReferenceResponse = new PersonalLoanReferenceResponse(obj[i].customerLoan[j].customerLoanReferences[k].customerLoanReferenceId, obj[i].customerLoan[j].customerLoanReferences[k].fullName, obj[i].customerLoan[j].customerLoanReferences[k].contactNo, obj[i].customerLoan[j].customerLoanReferences[k].label, obj[i].customerLoan[j].customerLoanReferences[k].addressLine1, obj[i].customerLoan[j].customerLoanReferences[k].addressLine2, obj[i].customerLoan[j].customerLoanReferences[k].pincode, obj[i].customerLoan[j].customerLoanReferences[k].city, obj[i].customerLoan[j].customerLoanReferences[k].cityId, obj[i].customerLoan[j].customerLoanReferences[k].state, obj[i].customerLoan[j].customerLoanReferences[k].district);
                                            loanReference.push(loanreference);
                                        }
                                    }
                                    if (obj[i].customerLoan[j].customerLoanStatusHistory && obj[i].customerLoan[j].customerLoanStatusHistory.length > 0) {
                                        let len = obj[i].customerLoan[j].customerLoanStatusHistory.length - 1;
                                        loanStatus = new LoanStatusResponse(obj[i].customerLoan[j].customerLoanStatusHistory[len].id, obj[i].customerLoan[j].customerLoanStatusHistory[len].transactionDate, obj[i].customerLoan[j].customerLoanStatusHistory[len].loanStatus,
                                            obj[i].customerLoan[j].customerLoanStatusHistory[len].isDataEditable, obj[i].customerLoan[j].customerLoanStatusHistory[0].transactionDate, obj[i].customerLoan[j].displayName, obj[i].customerLoan[j].serviceName);
                                    }



                                    let loanOffer = [];
                                    loanOffer = obj[i].customerLoan[j].customerloanoffer;

                                    let objRes: PersonalLoanResponse = new PersonalLoanResponse(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReference, loanStatus, loanOffer, currentAddressDetail);
                                    response.push(JSON.parse(JSON.stringify(objRes)));
                                }
                            }
                        }

                        let successResult = new ResultSuccess(200, true, 'Loans Available', response, response.length);
                        console.log(successResult);
                        return res.status(200).send(successResult);

                    }
                } else {
                    let errorResult = new ResultError(400, true, "personalLoan.getCustomerLoansByStatusId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.getCustomerLoansByStatusId()', error, '');
        next(errorResult);
    }
};

const getOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'get Offer');
        var requiredFields = ['customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL customerGetGeneratedOffer(` + req.body.customerLoanId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Generated Offer', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.getOffer() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.getOffer() Exception', error, '');
        next(errorResult);
    }
};


const checkEligibility = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'get Offer');
        var requiredFields = ['serviceId'];
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
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        offer = result[0];
                        if (companyCategoryTypeIds && companyCategoryTypeIds.length > 0)
                            offer = offer.filter((c) => companyCategoryTypeIds.indexOf(c.companyCategoryTypeId) >= 0)
                        let successResult = new ResultSuccess(200, true, 'Get Generated Offer', offer, offer.length);
                        return res.status(200).send(successResult);
                    }

                    let successResult = new ResultSuccess(200, true, 'Get Generated Offer', offer, offer.length);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.checkEligibility() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoans.getOffer() Exception', error, '');
        next(errorResult);
    }
};

const customerAcceptOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Offer');
        var requiredFields = ['id', 'customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL customerAcceptOffer(` + req.body.id + `,` + req.body.customerLoanId + `,` + authorizationResult.currentUser.id + `)`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    result = {
                        "status": "OFFER SELECTED"
                    }
                    let successResult = new ResultSuccess(200, true, 'Accept Offer Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.customerAcceptOffer() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.customerAcceptOffer() Exception', error, '');
        next(errorResult);
    }
};

const getCustomerLoanRejectionReason = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'get Loan Rejection Reason');
        var requiredFields = ['customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL getCustomerLoanRejectionReason(` + req.body.customerLoanId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    result[0][0].reasons = result[1];
                    result[0][0].customerName = result[2][0].customerName;
                    result[0][0].customerContactNo = result[2][0].customerContactNo;
                    let successResult = new ResultSuccess(200, true, 'Get Loan Rejection Reason', result[0][0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.getCustomerLoanRejectionReason() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.getCustomerLoanRejectionReason() Exception', error, '');
        next(errorResult);
    }
};

const getCustomerLoanDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'get Loan Detail');
        var requiredFields = ['customerLoanId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL customerGetLoanDetail(` + req.body.customerLoanId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {

                    let successResult = new ResultSuccess(200, true, 'Get Loan Detail', result[0], result[0].length);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.getCustomerLoanDetail() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.getCustomerLoanDetail() Exception', error, '');
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
                let completeScreeen
                if (req.body.serviceId) {
                    if (req.body.serviceId == 1 || req.body.serviceId == 4 || req.body.serviceId == 7 || req.body.serviceId == 9) {
                        completeScreeen = 5;
                    }
                    else if (req.body.serviceId == 2) {
                        completeScreeen = 3;
                    }
                }
                else {
                    completeScreeen = 5;

                }
                let sql = `UPDATE loancompletescreenhistory SET isCompleted = false,completeScreen = ` + completeScreeen + ` WHERE customerLoanId = ?`;
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

const newToTransfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerLoanId', 'loanTypeName'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let completeScreeen
                if (req.body.serviceId) {
                    if (req.body.serviceId == 1 || req.body.serviceId == 4) {
                        completeScreeen = 4;
                    }
                    else if (req.body.serviceId == 2 || req.body.serviceId == 7 || req.body.serviceId == 9) {
                        completeScreeen = 0;
                    }
                }
                else {
                    completeScreeen = 5;
                }
                let sql = `UPDATE loancompletescreenhistory SET isCompleted = false,completeScreen = ` + completeScreeen + ` WHERE customerLoanId = ?`;
                let result = await query(sql, req.body.customerLoanId);
                let historysql = `DELETE FROM  customerloanstatushistory WHERE customerLoanId = ?`;
                let historyResult = await query(historysql, req.body.customerLoanId);
                let customerLoanSql = `UPDATE customerloans SET statusId = NULL,loanTransactionDate = NULL,loanType = '` + req.body.loanTypeName + `' WHERE id = ?`;
                let customerLoanResult = await query(customerLoanSql, req.body.customerLoanId);
                if (customerLoanResult && customerLoanResult.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Conver New To Transfer', customerLoanResult, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "personalLoan.newToTransfer() Error", customerLoanResult, '');
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
        let errorResult = new ResultError(500, true, 'personalLoan.newToTransfer() Exception', error, '');
        next(errorResult);
    }
}





export default {
    insertUpdateEmploymentDetail, updatePersonalLoanAmount, insertUpdateMoreBasicDetail, updateMoreEmploymentDetail
    , uploadPersonalLoanDocumentAndReference, getIncompletePersonalLoanDetail, getCustomerPersonalById, getOffer, customerAcceptOffer,
    getCustomerLoanRejectionReason, getCustomerLoanDetail, changeEmploymentType, newToTransfer, checkEligibility
};