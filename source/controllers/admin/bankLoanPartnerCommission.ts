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

const NAMESPACE = 'Partner Commission';

const getBankLoanPartnerCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Bank Partner Loan Commission');
        let requiredFields = [];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let bankId = req.body.bankId ? req.body.bankId : 0;
                let serviceId = req.body.serviceId ? req.body.serviceId : 0;
                let commissionTypeId = req.body.commissionTypeId ? req.body.commissionTypeId : 0;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let role = req.body.roles ? req.body.roles : "";
                let partnerId = req.body.partnerId ? req.body.partnerId : 0;
                let sql = `CALL adminGetBankLoanPartnerCommission('` + role + `',` + bankId + `,` + serviceId + `,` + commissionTypeId + `,` + partnerId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[1] && result[1].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Bank Loan Partner Commission', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new ResultSuccess(200, true, "Bank Loan Partner Commission Not Available", [], 0);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting Bank Loan Partner Commission", result, '');
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
        let errorResult = new ResultError(500, true, 'bankLoanPartnerCommission.getBankLoanPartnerCommission() Exception', error, '');
        next(errorResult);
    }
};


const insertUpdatePartnerCommision = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Partner Commission');
        let requiredFields = ["partnerId", "commissions"];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let result;
                if (req.body.commissions && req.body.commissions.length > 0) {

                    let userId = authorizationResult.currentUser.id;
                    let idsSqlResult = await query("SELECT id FROM bankloanpartnercommissions WHERE partnerId = ?", req.body.partnerId)
                    let ids = [];
                    if (idsSqlResult && idsSqlResult.length > 0) {
                        for (let index = 0; index < idsSqlResult.length; index++) {
                            ids.push(idsSqlResult[index].id)
                        }
                    }
                    for (let index = 0; index < req.body.commissions.length; index++) {
                        let commissionTemplateId = req.body.commissions[index].commissionTemplateId ? req.body.commissions[index].commissionTemplateId : null;
                        if (req.body.commissions[index].id) {
                            let sql = "UPDATE bankloanpartnercommissions SET partnerId = " + req.body.partnerId + ",bankLoanCommissionId =" + req.body.commissions[index].bankLoanCommissionId + ",commissionTypeId =" + req.body.commissions[index].commissionTypeId + ",bankId =" + req.body.commissions[index].bankId + ",serviceId =" + req.body.commissions[index].serviceId + ",commissionTemplateId =" + req.body.commissions[index].commissionTemplateId + ",commission= " + req.body.commissions[index].commission + ",modifiedBy=" + userId + ",modifiedDate = CURRENT_TIMESTAMP() WHERE id =" + req.body.commissions[index].id;
                            result = await query(sql);
                            if (result && result.affectedRows >= 0) {
                                ids = ids.filter(c => c != req.body.commissions[index].id);
                            }
                            else
                                break;
                        }
                        else {
                            let sql = "INSERT INTO bankloanpartnercommissions (partnerId,bankLoanCommissionId,commissionTypeId,bankId,serviceId,commissionTemplateId,commission,createdBy,modifiedBy) VALUES (" + req.body.partnerId + "," + req.body.commissions[index].bankLoanCommissionId + "," + req.body.commissions[index].commissionTypeId + "," + req.body.commissions[index].bankId + "," + req.body.commissions[index].serviceId + "," + commissionTemplateId + "," + req.body.commissions[index].commission + "," + userId + "," + userId + ")";
                            result = await query(sql);
                            if (!(result && result.affectedRows >= 0))
                                break;
                        }
                    }
                    if (ids && ids.length > 0) {
                        for (let i = 0; i < ids.length; i++) {
                            let delteSqlResult = await query("DELETE FROM bankloanpartnercommissions WHERE id = ?", ids[i]);

                        }
                    }

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
                    let dataBody = {
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

                }
                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert Partner Commission', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "bankLoanPartnerCommission.insertUpdatePartnerCommision() Error", new Error("Partner Commission Not Inserted."), '');
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
        let errorResult = new ResultError(500, true, 'bankLoanPartnerCommission.insertUpdatePartnerCommision() Exception', error, '');
        next(errorResult);
    }
};




export default { getBankLoanPartnerCommission, insertUpdatePartnerCommision }