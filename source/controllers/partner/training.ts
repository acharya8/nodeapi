import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultError } from '../../classes/response/resulterror';
import { ResultSuccess } from '../../classes/response/resultsuccess';
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

const NAMESPACE = 'Training';

const getAssignTrainingsByPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner Assign Trainings');
        var requiredFields = ['partnerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;

                let sql = `CALL dsaBazarGetAssignTrainingsByPartnerId(` + partnerId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Partner Assign Trainings', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultSuccess(200, true, "Data Not Available", [], 0);
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "trainings.getAssignTrainingsByPartnerId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'trainings.getAssignTrainingsByPartnerId() Exception', error, '');
        next(errorResult);
    }
};

const completePartnerTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Complete Partner Trainings');
        var requiredFields = ['assignUserTrainingId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            req.body.stayTiming = req.body.stayTiming ? req.body.stayTiming : 0;
            if (authorizationResult.statusCode == 200) {
                let trainingStatus = req.body.trainingStatus ? req.body.trainingStatus : 'Pending'
                let sql = "UPDATE assignuserstraining SET stayTiming = " + req.body.stayTiming + ",trainingStatus = '" + trainingStatus + "', modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = " + req.body.assignUserTrainingId;
                let result = await query(sql);
                if (result && result.affectedRows > 0) {
                    if (req.body.trainingStatus == 'Complete') {
                        //#region Notification
                        let getpartnerIdSql = "SELECT partnerId FROM assignuserstraining WHERE id = " + req.body.assignUserTrainingId;
                        let getPartnerIdResult = await query(getpartnerIdSql);

                        let partnerFcm = "";
                        let partnerUserId = null;
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + getPartnerIdResult[0].partnerId;
                        let partnerUserIdResult = await query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = await query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }

                        let title = "Training Completed you got reward in wallet";
                        let description = "Training Completed and you got reward in your wallet";
                        var dataBody = {
                            type: 12,
                            id: req.body.assignUserTrainingId,
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
                                VALUES(`+ partnerUserId + `, 12, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([partnerFcm], 12, req.body.assignUserTrainingId, title, description, '', null, null, null, null, null, null);
                        }
                        //#endregion Notification

                        var rewardCoin = 0;
                        let rewardCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 6";
                        let rewardCoinResult = await query(rewardCoinSql);
                        if (rewardCoinResult && rewardCoinResult.length > 0) {
                            rewardCoin = rewardCoinResult[0].rewardCoin;
                            if (rewardCoinResult[0].isScratchCard) {
                                let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) 
                                VALUES(
                                    (SELECT userId FROM partners WHERE id = (SELECT partnerId FROM assignuserstraining WHERE id = ` + req.body.assignUserTrainingId + `))
                                    , ` + rewardCoin + `, 6, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `);`;
                                let rewardResult = await query(rewardSql);
                            }
                            else {
                                let userWalletId;
                                let userWalletIdResult = await query(`SELECT id,coin FROM userwallet WHERE userId = ?`, partnerUserId);
                                if (userWalletIdResult && userWalletIdResult.length > 0) {
                                    userWalletId = userWalletIdResult[0].id
                                    let updateWalletAmountSql = await query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + authorizationResult.currentUser.id + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + rewardCoin)
                                }
                                else {
                                    let insertWalletAmount = await query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + partnerUserId + `,` + rewardCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`)
                                    if (insertWalletAmount && insertWalletAmount.insertId) {
                                        userWalletId = insertWalletAmount.insertedId
                                    }
                                }
                                let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + partnerUserId + `,` + rewardCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `,` + 6 + `)`
                                let walletResult = await query(walletSql);
                            }
                        }
                    }

                    let successResult = new ResultSuccess(200, true, 'Complete Training Successfully', result, 1);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "trainings.completePartnerTraining() Error", new Error("Error During Complete Training"), '');
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
        let errorResult = new ResultError(500, true, 'trainings.completePartnerTraining() Exception', error, '');
        next(errorResult);
    }
};

export default { getAssignTrainingsByPartnerId, completePartnerTraining }