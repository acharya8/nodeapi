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

const NAMESPACE = 'Loan Status';

const getLoanStatuses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Loan Status');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let sql = `CALL adminGetLoanStatuses(` + startIndex + `,` + fetchRecord + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0][0].totalCount > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Loan Status Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else if (result[1] && result[1].length == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Loan Status Successfully', [], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "loanStatus.getLoanStatuses() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'loanStatus.getLoanStatuses() Exception', error, '');
        next(errorResult);
    }
};

const insertLoanStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Loan Status');
        let requiredFields = ['status'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let status = req.body.status;
                let userId = currentUser.id;
                req.body.isDataEditable = req.body.isDataEditable ? req.body.isDataEditable : false;
                let sql = `CALL adminInsertLoanStatus('` + status + `',` + req.body.isDataEditable + `,` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Insert Loan Status', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "loanStatus.insertLoanStatus() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'loanStatus.insertLoanStatus() Exception', error, '');
        next(errorResult);
    }
};

const updateLoanStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Loan Status');
        let requiredFields = ['id', 'status'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                req.body.isDataEditable = req.body.isDataEditable ? req.body.isDataEditable : false;
                let sql = `CALL adminUpdateLoanStatus(` + id + `,'` + req.body.status + `',` + req.body.isDataEditable + `,` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Update Loan Status', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "loanStatus.updateLoanStatus() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'loanStatus.updateLoanStatus() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveLoanStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Loan Status');
        let requiredFields = ['id'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveLoanStatuses(` + id + `,` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Loan Status', result, 1);
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
        let errorResult = new ResultError(500, true, 'loanStatuses.activeInactiveLoanStatus() Exception', error, '');
        next(errorResult);
    }
};

const changeLoanStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Change Loan Status');
        let requiredFields = ['customerLoanId', 'loanStatusId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;


                let sql = `CALL adminChangeLoanStatus(` + req.body.customerLoanId + `,` + req.body.loanStatusId + `,` + userId + `);`;
                console.log(sql);
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
                let statusSql = "SELECT * FROM loanstatuses WHERE id = " + req.body.loanStatusId;
                let statusResult = await query(statusSql);
                if (req.body.loanStatusId == 23) {
                    let dataBody = {
                        type: 16,
                        id: req.body.customerLoanId,
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
                    VALUES(`+ customerUserId + `, 16, 'Document Pendency', 'Generate Document Pendency','` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([customerFcm], 16, req.body.customerLoanId, "Document Pendency", "Generate Document Pendency", '', null, null, req.body.customerLoanId, null, null, null);
                    }
                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                    VALUES(`+ partnerUserId + `, 16, 'Document Pendency', 'Generate Document Pendency', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([partnerFcm], 1, req.body.customerLoanId, "Document Pendency", "Generate Document Pendency", '', null, null, req.body.customerLoanId, null, null, null);
                    }
                }
                else {
                    let title = "Loan Status Change";
                    let description = (statusResult && statusResult.length > 0) ? "Status Change to " + statusResult[0].status : "Loan Status Change";
                    let dataBody = {
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
                }
                //#endregion Notification


                let successResult = new ResultSuccess(200, true, 'Update Loan Status', result[0], 1);
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
        let errorResult = new ResultError(500, true, 'loanStatuses.changeLoanStatus() Exception', error, '');
        next(errorResult);
    }
};

export default { getLoanStatuses, insertLoanStatus, updateLoanStatus, activeInactiveLoanStatus, changeLoanStatus };