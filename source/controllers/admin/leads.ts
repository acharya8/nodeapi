import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import notificationContainer from './../notifications';

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

const NAMESPACE = 'Leads';

const getLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Leads');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let id = req.body.leadId ? req.body.leadId : null
            let startIndex = req.body.startIndex ? req.body.startIndex : 0
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0
            let serviceId = req.body.serviceIds && req.body.serviceIds.length > 0 ? req.body.serviceIds.toString() : ''
            let partnerId = req.body.partnerIds && req.body.partnerIds.length > 0 ? req.body.partnerIds.toString() : ''
            let sql = `CALL adminGetLeads(` + startIndex + `,` + fetchRecords + `,` + id + `,'` + serviceId + `','` + partnerId + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let ids = "";
                    for (let index = 0; index < result[1].length; index++) {
                        if (index == 0) {
                            ids = result[1][index].id;
                        }
                        else
                            ids = ids + "," + result[1][index].id;
                    }
                    let statusHistory = [];
                    let statusResult = await query(`CALL adminGetLeadStatusHistory('` + ids + `')`);
                    if (statusResult && statusResult[0].length > 0) {
                        for (let index = 0; index < result[1].length; index++) {
                            statusHistory = statusResult[0].filter(c => c.leadId == result[1][index].id);
                            result[1][index].statusHistory = statusHistory;
                        }
                    }

                    let successResult = new ResultSuccess(200, true, 'Get Leads Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else if (result[1] && result[1].length == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Leads Successfully', [], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "leads.getLeads() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.getLeads() Exception', error, '');
        next(errorResult);
    }
};

const getPartnerForLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Leads');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetPartnerForAssignLead()`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0]) {
                    let successResult = new ResultSuccess(200, true, 'Get Leads Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "leads.getLeads() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.getLeads() Exception', error, '');
        next(errorResult);
    }
};

const assignToPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let requiredFields = ['leadId', 'partnerId', 'assignById']
        logging.info(NAMESPACE, 'Getting Leads');
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let id = req.body.partnerId ? req.body.partnerId : null
                let sql = `CALL adminLeadAssignToPartner(` + req.body.leadId + `,` + id + `,` + authorizationResult.currentUser.id + `,` + req.body.assignById + `)`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {

                    //#region Notification
                    let partnerFcm = "";
                    let partnerUserId = null;
                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + id;
                    let partnerUserIdResult = await query(partnerUserIdSql);
                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                        partnerUserId = partnerUserIdResult[0].userId;
                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserId + " ORDER BY id DESC LIMIT 1";
                        let partnerFcmResult = await query(partnerFcmSql);
                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                            partnerFcm = partnerFcmResult[0].fcmToken;
                        }
                    }

                    let title = "Your Account Verified";
                    let description = "Your Account Verified";
                    let dataBody = {
                        type: 10,
                        id: req.body.leadId,
                        title: title,
                        message: description,
                        json: null,
                        dateTime: null,
                        customerLoanId: null,
                        loanType: null,
                        creditCardId: null,
                        creditCardStatus: null
                    }

                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                VALUES(`+ partnerUserId + `, 10, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([partnerFcm], 10, req.body.leadId, title, description, '', null, null, null, null, null, null);
                    }
                    //#endregion Notification

                    let successResult = new ResultSuccess(200, true, 'Lead Assign Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.getLeads() Exception', error, '');
        next(errorResult);
    }
};

const getLeadStatuses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Leads Statuses');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetLeadStatus()`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0]) {
                    let successResult = new ResultSuccess(200, true, 'Get Leads Status Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "leads.getLeadStatuses() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.getLeadStatuses() Exception', error, '');
        next(errorResult);
    }
};

const convertLeadIntoLoan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let requiredFields = ['id', 'serviceId', 'loanAmount']
        logging.info(NAMESPACE, 'Getting Leads');
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.customerId = req.body.customerId ? req.body.customerId : null;
                req.body.customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : null;
                req.body.customerUserId = req.body.userId ? req.body.userId : null;
                req.body.label = req.body.label ? req.body.label : '';
                req.body.addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                req.body.addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                req.body.addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                req.body.aadhaarCardNo = req.body.aadhaarCardNo ? req.body.aadhaarCardNo : '';
                req.body.district = req.body.district ? req.body.district : '';
                req.body.state = req.body.state ? req.body.state : '';
                req.body.cityId = req.body.cityId ? req.body.cityId : null;
                req.body.employmentTypeId = req.body.employmentTypeId ? req.body.employmentTypeId : null;
                let temporaryCode = "";
                if (!req.body.customerId) {
                    let lastTempCodeSql = "CALL websiteGetLastCustomer()";
                    let lastTempCodeResult = await query(lastTempCodeSql);
                    if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                        let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split("_")[1])
                        temporaryCode = "CT_" + (no + 1).toString().padStart(10, "0");
                    } else {
                        temporaryCode = "CT_0000000001";
                    }
                }

                let sql = `CALL adminConvertLeadIntoLoan(` + req.body.id + `,` + req.body.customerId + `,` + req.body.serviceId + `,` + req.body.loanAmount + `,` + req.body.employmentTypeId + `,` + authorizationResult.currentUser.id + `,` + req.body.assignToPartnerId + `,` + req.body.contactNo + `,'` + req.body.customerFullName + `','` + '+91' + `','` + temporaryCode + `',` + 1 + `,'` + req.body.label + `','` + req.body.addressLine1 + `','`
                    + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `,'` + req.body.cityName + `','` + req.body.district + `','` + req.body.state + `','` + req.body.aadhaarCardNo + `','` + req.body.panCardNo + `')`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Lead Convert Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.convertLeadIntoLoan() Exception', error, '');
        next(errorResult);
    }
};

const changeLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let requiredFields = ['leadId', 'statusId']
        logging.info(NAMESPACE, 'Change  Lead Status');
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminChangeLeadStatus(` + req.body.leadId + `,` + req.body.statusId + `,` + authorizationResult.currentUser.id + `)`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Lead Status Change Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.changeLeadStatus() Exception', error, '');
        next(errorResult);
    }
};

const convertLeadIntoCreditCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let requiredFields = ['id', 'serviceId']
        logging.info(NAMESPACE, 'Convert Lead To Credit Card Request');
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let temporaryCode = "";

                let customerId = null;
                let userSql = `SELECT users.id as userId, userroles.roleId as roleId FROM users LEFT JOIN userroles ON userroles.userId = users.id WHERE users.contactNo = ` + req.body.contactNo;
                let userResult = await query(userSql)
                if (!(userResult && userResult.length > 0)) {
                    let inserUserSql = `INSERT INTO users(fullName, countryCode, contactNo, isDisabled, createdBy, modifiedBy, currentRoleId) VALUES('` + req.body.customerFullName + `', '+91', '` + req.body.contactNo + `', 0, ` + userId + `, ` + userId + `, 2)`;
                    let inserUserResult = await query(inserUserSql);
                    if (inserUserResult && inserUserResult.insertId) {
                        let insertUserRoleSql = "INSERT INTO userroles(userId, roleId, createdBy, modifiedBy) VALUES(" + inserUserResult.insertId + ", 2, " + userId + ", " + userId + ")";
                        let insertUserRoleResult = await query(insertUserRoleSql);

                        let lastTempCodeSql = "CALL websiteGetLastCustomer()";
                        let lastTempCodeResult = await query(lastTempCodeSql);
                        if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                            let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split("_")[1])
                            temporaryCode = "CT_" + (no + 1).toString().padStart(10, "0");
                        } else {
                            temporaryCode = "CT_0000000001";
                        }

                        let customerSql = `INSERT INTO customers(userId, temporaryCode, fullName, contactNo, aadhaarCardNo, panCardNo, createdBy, modifiedBy, currentRoleId)
                        VALUES(`+ inserUserResult.insertId + `, '` + temporaryCode + `', '` + req.body.customerFullName + `', '` + req.body.contactNo + `', '` + req.body.aadhaarCardNo + `','` + req.body.panCardNo + `', ` + userId + `, ` + userId + `, 2)`;
                        let customerResult = await query(customerSql);
                        if (customerResult && customerResult.insertId > 0) {
                            customerId = customerResult.insertId;
                            let customerAddSql = `INSERT INTO customeraddresses(customerId, addressTypeId, label, addressLine1, addressLine2, pincode, cityId, city, district, state, createdBy, modifiedBy) 
                            VALUES(`+ customerResult.insertId + `, 1, '` + req.body.label + `','` + req.body.addressLine1 + `', '` + req.body.addressLine2 + `', '` + req.body.pincode + `',` + req.body.cityId + `
                            ,'` + req.body.cityName + `','` + req.body.district + `','` + req.body.state + `', ` + userId + `, ` + userId + `)`;
                            let customerAddResult = await query(customerAddSql);
                        }
                    }
                } else {
                    let customerSql = "SELECT * FROM customers WHERE userId = " + userResult[0].userId;
                    let customerResult = await query(customerSql);
                    if (customerResult && customerResult.length > 0) {
                        customerId = customerResult[0].id;
                    }
                }

                if (customerId) {
                    let sql = `INSERT INTO customercreditcards(customerId, isAlreadyCreditCard, createdBy, modifiedBy) VALUES(` + customerId + `, 0, ` + userId + `, ` + userId + `)`;
                    let result = await query(sql);
                    if (result && result.affectedRows >= 0) {
                        let sql1 = `UPDATE leads SET leadStatusId = 5,modifiedDate = CURRENT_TIMESTAMP(),modifiedBy = ` + userId + ` WHERE id = ` + req.body.id + ``;
                        let res1 = await query(sql1);
                        let sql2 = `INSERT INTO leadstatushistory(leadId,leadStatusId,transactionDate,createdBy,modifiedBy) VALUES (` + req.body.id + `,5 ,CURRENT_TIMESTAMP(),` + userId + `,` + userId + `)`;
                        let res2 = await query(sql2);
                        let successResult = new ResultSuccess(200, true, 'Lead Convert Successfully', result, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, 'Contact No already exist', new Error('Contact No already exist'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.convertLeadIntoCreditCard() Exception', error, '');
        next(errorResult);
    }
};

export default { getLeads, assignToPartner, getPartnerForLeads, getLeadStatuses, convertLeadIntoLoan, changeLeadStatus, convertLeadIntoCreditCard }