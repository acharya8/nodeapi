import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import notificationContainer from './../notifications';

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Partner Commission';

const insertUpdatePartnerCommision = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Partner Commission');
        var requiredFields = ["bankId", "serviceId", "commissionTypeId", "partnerId", "commission"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let bankId = req.body.bankId;
                let serviceId = req.body.serviceId;
                let commissionTypeId = req.body.commissionTypeId;
                let partnerId = req.body.partnerId;
                let commission = req.body.commission;
                let userId = authorizationResult.currentUser.id;
                let id = req.body.id;
                let commissionTemplateId = req.body.commissionTemplateId ? req.body.commissionTemplateId : null;

                if (id) {
                    let sql = `CALL dsaBazarInsertUpdateCommission(` + id + `,` + partnerId + `,` + commissionTypeId + `,` + bankId + `,` + serviceId + `,` + commissionTemplateId + `,` + commission + `,` + userId + `)`;
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[0][0].message == "Bank Loan Commision is Not Set") {
                            let errorResult = new ResultError(400, true, "Bank Loan Commision is Not Set", new Error('Bank Loan Commision is Not Set'), '');
                            next(errorResult);
                            return;
                        } else {

                            //#region Notification
                            let partnerFcm = "";
                            let partnerUserId = null;
                            let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + req.body.partnerId;
                            let partnerUserIdResult = await query(partnerUserIdSql);
                            if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                partnerUserId = partnerUserIdResult[0].userId;
                                let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserId + " ORDER BY id DESC LIMIT 1";
                                let partnerFcmResult = await query(partnerFcmSql);
                                if (partnerFcmResult && partnerFcmResult.length > 0) {
                                    partnerFcm = partnerFcmResult[0].fcmToken;
                                }
                            }

                            let title = "Set Commission";
                            let description = "Set Commission";
                            var dataBody = {
                                type: 11,
                                id: req.body.partnerId,
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
                                VALUES(`+ partnerUserId + `, 11, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                let notificationResult = await query(notificationSql);
                                await notificationContainer.sendMultipleNotification([partnerFcm], 11, req.body.partnerId, title, description, '', null, null, null, null, null, null);
                            }
                            //#endregion Notification

                            let successResult = new ResultSuccess(200, true, 'Update Partner Commission', result[0], 1);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        }

                    } else {
                        let errorResult = new ResultError(400, true, "partnerCommission.insertUpdatePartnerCommision() Error", new Error("Partner Commission Not Updated."), '');
                        next(errorResult);
                    }
                } else {
                    let sql = `CALL dsaBazarInsertUpdateCommission(0,` + partnerId + `,` + commissionTypeId + `,` + bankId + `,` + serviceId + `,` + commissionTemplateId + `,` + commission + `,` + userId + `)`;
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[0] && result[0].length > 0) {
                            if (result[0][0].message == "Bank Loan Commision is Not Set") {
                                let errorResult = new ResultError(400, true, "Bank Loan Commision is Not Set", new Error('Bank Loan Commision is Not Set'), '');
                                next(errorResult);
                                return;
                            } else {
                                let successResult = new ResultSuccess(200, true, 'Insert Partner Commission', result[0], 1);
                                console.log(successResult);
                                return res.status(200).send(successResult);
                            }
                        }
                    } else {
                        let errorResult = new ResultError(400, true, "partnerCommission.insertUpdatePartnerCommision() Error", new Error("Partner Commission Not Inserted."), '');
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
        let errorResult = new ResultError(500, true, 'partnerCommission.insertUpdatePartnerCommision() Exception', error, '');
        next(errorResult);
    }
};

const getPartnerCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner Commission');
        var requiredFields = ["partnerIds"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 20;
                let serviceId = req.body.loanType ? req.body.loanType : 0;
                let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getSeconds())).slice(-2) : '';
                let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getSeconds())).slice(-2) : '';
                let sql = "CALL getParnerCommission('" + req.body.partnerIds.toString() + "'," + startIndex + "," + fetchRecord + "," + serviceId + ",'" + fromDate + "','" + toDate + "')";
                var result = await query(sql);
                if (result && result.length > 0) {
                    let obj = {
                        "totalCommission": result[0][0].totalcommission,
                        "commissions": result[1]
                    }
                    let successResult = new ResultSuccess(200, true, 'Getting Partner Commission', [obj], 1);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "partnerCommission.getPartnerCommission() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partnerCommission.getPartnerCommission() Exception', error, '');
        next(errorResult);
    }
}


const getNetworkAndTeamCommissionByDsa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Earning By ');
        var requiredFields = ["partnerIds"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerIds = req.body.partnerIds;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 20;
                let serviceId = req.body.loanType ? req.body.loanType : 0;
                let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getSeconds())).slice(-2) : '';
                let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getSeconds())).slice(-2) : '';
                let usersql = "select partners.id as partnerId from partners where id IN(select networkPartnerId from partnernetworks where partnerId = " + req.body.partnerIds + ") OR id IN(select teamPartnerId from partnerteams where partnerId = " + req.body.partnerIds + ")";
                let userResult = await query(usersql);
                if (userResult && userResult.length > 0) {
                    let userIds = userResult.map(c => c.partnerId);
                    let sql = "CALL getParnerCommission('" + userIds + "'," + startIndex + "," + fetchRecord + "," + serviceId + ",'" + fromDate + "','" + toDate + "')";
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[1] && result[1].length > 0) {
                            let obj = {
                                "totalCommission": result[0][0].totalCommission,
                                "commissions": result[1]
                            }
                            let successResult = new ResultSuccess(200, true, 'Getting Partner Commissions', [obj], 1);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        } else {
                            let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        }
                    } else {
                        let errorResult = new ResultError(400, true, "leads.getNetworkAndTeamCommissionByDsa() Error", result, '');
                        next(errorResult);
                    }
                }
                else if (userResult && userResult.length == 0) {
                    let successResult = new ResultSuccess(200, true, 'Getting Partner Commissions', [], 0);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'No Data Available', [], 0);
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
        let errorResult = new ResultError(500, true, 'partnerCommission.getNetworkAndTeamCommissionByDsa()', error, '');
        next(errorResult);
    }
};

export default { insertUpdatePartnerCommision, getPartnerCommission, getNetworkAndTeamCommissionByDsa }