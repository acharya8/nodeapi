"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../../config/logging"));
const config_1 = __importDefault(require("../../config/config"));
const mysql = require('mysql');
const util = require('util');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const notifications_1 = __importDefault(require("./../notifications"));
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.pass,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'DSA';
const getDsa = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Dsa');
        let requiredFields = [];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let searchString = req.body.searchString ? req.body.searchString : '';
                let selectedStatus = req.body.status ? req.body.status : '';
                let selectedBadge = req.body.bdgeId ? req.body.bdgeId : 0;
                let isDelete = (req.body.isDelete == true || req.body.isDelete == false) ? (req.body.isDelete == true ? true : false) : null;
                let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getSeconds())).slice(-2) : '';
                let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getSeconds())).slice(-2) : '';
                let sql = `CALL adminGetDsa(` + startIndex + `,` + fetchRecords + `,'` + req.body.roles + `','` + searchString + `','` + selectedStatus + `',` + selectedBadge + `,` + isDelete + `,'` + fromDate + `','` + toDate + `')`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[1].length > 0) {
                        for (let i = 0; i < result[1].length; i++) {
                            let partnerDetailResponse = yield query(`CALL adminGetDsaDetail(` + result[1][i].id + `)`);
                            if (partnerDetailResponse && partnerDetailResponse[0].length > 0) {
                                result[1][i].thisMonthAmount = partnerDetailResponse[0][0].thisMonthAmount;
                            }
                            if (partnerDetailResponse && partnerDetailResponse[1].length > 0) {
                                result[1][i].totalApplicationReceived = partnerDetailResponse[1][0].totalApplication;
                                result[1][i].totalAmount = partnerDetailResponse[1][0].totalAmount;
                            }
                            if (partnerDetailResponse && partnerDetailResponse[2].length > 0) {
                                result[1][i].totalPending = partnerDetailResponse[2][0].totalPendingLoan;
                            }
                        }
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Dsa', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Dsa", result, '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dsa.getDsa()', error, '');
        next(errorResult);
    }
});
const verifiedDsa = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Verified Dsa');
        let requiredFields = ['id', 'userId'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let permanentCode = '';
                if (!req.body.permanentCode) {
                    permanentCode = req.body.temporaryCode.replace("TEMP", "P");
                }
                let sql = `CALL adminDisabledPartner(` + req.body.id + `,` + req.body.userId + `,'` + permanentCode + `')`;
                let result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    let referPartnerSql = "SELECT * FROM referpartner WHERE referPartnerId = " + req.body.id + " AND isRewarded = 0";
                    let referPartnerResult = yield query(referPartnerSql);
                    if (referPartnerResult && referPartnerResult.length > 0) {
                        let partnerSql = "SELECT * FROM partners WHERE id = " + referPartnerResult[0].partnerId;
                        let partnerResult = yield query(partnerSql);
                        if (partnerResult && partnerResult.length > 0) {
                            let referCoin = 0;
                            let referCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 1 ";
                            let referCoinResult = yield query(referCoinSql);
                            if (referCoinResult && referCoinResult.length > 0) {
                                referCoin = referCoinResult[0].rewardCoin;
                                if (referCoinResult[0].isScratchCard) {
                                    let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + partnerResult[0].userId + `, ` + referCoin + `, 2, ` + partnerResult[0].userId + `, ` + partnerResult[0].userId + `);`;
                                    let rewardResult = yield query(rewardSql);
                                }
                                else {
                                    let userWalletId;
                                    let userWalletIdResult = yield query(`SELECT id,coin FROM userwallet WHERE userId = ?`, partnerResult[0].userId);
                                    if (userWalletIdResult && userWalletIdResult.length > 0) {
                                        userWalletId = userWalletIdResult[0].id;
                                        let updateWalletAmountSql = yield query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + authorizationResult.currentUser.id + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + referCoin);
                                    }
                                    else {
                                        let insertWalletAmount = yield query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + partnerResult[0].userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`);
                                        if (insertWalletAmount && insertWalletAmount.insertId) {
                                            userWalletId = insertWalletAmount.insertId;
                                        }
                                    }
                                    let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + partnerResult[0].userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `,` + 2 + `)`;
                                    let walletResult = yield query(walletSql);
                                }
                            }
                        }
                    }
                    //#region Notification
                    let partnerFcm = "";
                    let partnerUserId = req.body.userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + req.body.userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = yield query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }
                    let title = "Your Account Verified";
                    let description = "Your Account Verified";
                    let dataBody = {
                        type: 9,
                        id: req.body.userId,
                        title: title,
                        message: description,
                        json: null,
                        dateTime: null,
                        customerLoanId: null,
                        loanType: null,
                        creditCardId: null,
                        creditCardStatus: null
                    };
                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                VALUES(` + partnerUserId + `, 9, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let notificationResult = yield query(notificationSql);
                        yield notifications_1.default.sendMultipleNotification([partnerFcm], 9, req.body.userId, title, description, '', null, null, null, null, null, null);
                    }
                    //#endregion Notification
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Verified/UnVerified DSA', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Verified/UnVerified Dsa", result, '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dsa.verifeid()', error, '');
        next(errorResult);
    }
});
const getDsaById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Get Dsa');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminGetDsaById(` + req.body.id + `)`;
                let result = yield query(sql);
                if (result && result.length > 0 && result[1].length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Dsa', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Dsa", result, '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dsa.getDsa()', error, '');
        next(errorResult);
    }
});
const removeDsa = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Delete Training');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let sql = `CALL adminRemoveTraining(` + id + `)`;
                console.log(sql);
                let result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Remove Training', result, 1);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'training.removeTraining() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getDsa, verifiedDsa, getDsaById, removeDsa };
