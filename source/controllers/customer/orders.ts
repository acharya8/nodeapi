import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

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

const NAMESPACE = 'Orders';

const insertUpdateOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting/Updating Orders');
        var requiredFields = ['productId', 'quantity', 'unitCoin', 'addressTypeId', 'label', 'addressLine1', 'addressLine2', 'pincode', 'cityId', 'city', 'district', 'state'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                if (req.body.id) {
                    //Update
                    let getOrderSql = "SELECT * FROM orders WHERE id = " + req.body.id;
                    let getOrderResult = await query(getOrderSql);
                    let amount = 0;
                    if (getOrderResult && getOrderResult.length > 0) {
                        amount = (req.body.quantity * req.body.unitCoin) - getOrderResult[0].totalCoin;
                    }

                    let sql = `CALL insertOrder(` + req.body.id + `,` + authorizationResult.currentUser.id + `,` + req.body.productId + `,` + req.body.quantity + `,` + req.body.unitCoin + `
                    ,` + req.body.addressTypeId + `,'` + req.body.label + `','` + req.body.addressLine1 + `','` + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `
                    ,'`+ req.body.city + `','` + req.body.district + `','` + req.body.state + `')`;
                    let result = await query(sql);
                    if (result && result.affectedRows >= 0) {
                        if (amount != 0) {
                            let updateUserWalletSql = "UPDATE userwallet SET  coin = coin - " + (amount) + ", modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE userId = " + authorizationResult.currentUser.id;
                            let updateUserWalletResult = await query(updateUserWalletSql);
                            let userWalletSql = "SELECT * FROM userwallet WHERE userId = " + authorizationResult.currentUser.id;
                            let userWalletResult = await query(userWalletSql);
                            let insertUserWalletHistorySql = `INSERT INTO userwallethistory(userWalletId, userId, coin, rewardType,isWithdrawal, createdBy, modifiedBy) VALUES(` + userWalletResult[0].id + `, ` + authorizationResult.currentUser.id + `
                                ,`+ (0 - (amount)) + `, null, true, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                            let insertUserWalletHistoryResult = await query(insertUserWalletHistorySql);

                        }
                        let successResult = new ResultSuccess(200, true, 'Update Order', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, "orders.insertUpdateOrders() Error", new Error('Error While Updating Data'), '');
                        next(errorResult);
                    }
                } else {
                    //Insert
                    let sql = `CALL insertOrder(` + 0 + `,` + authorizationResult.currentUser.id + `,` + req.body.productId + `,` + req.body.quantity + `,` + req.body.unitCoin + `
                    ,` + req.body.addressTypeId + `,'` + req.body.label + `','` + req.body.addressLine1 + `','` + req.body.addressLine2 + `','` + req.body.pincode + `',` + req.body.cityId + `
                    ,'`+ req.body.city + `','` + req.body.district + `','` + req.body.state + `')`;
                    let result = await query(sql);
                    if (result && result.affectedRows > 0) {

                        let updateUserWalletSql = "UPDATE userwallet SET  coin = coin - " + (req.body.quantity * req.body.unitCoin) + ", modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE userId = " + authorizationResult.currentUser.id;
                        let updateUserWalletResult = await query(updateUserWalletSql);
                        let userWalletSql = "SELECT * FROM userwallet WHERE userId = " + authorizationResult.currentUser.id;
                        let userWalletResult = await query(userWalletSql);
                        let insertUserWalletHistorySql = `INSERT INTO userwallethistory(userWalletId, userId, coin, rewardType,isWithdrawal, createdBy, modifiedBy) VALUES(` + userWalletResult[0].id + `, ` + authorizationResult.currentUser.id + `
                        ,`+ (0 - (req.body.quantity * req.body.unitCoin)) + `, null, true, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`;
                        let insertUserWalletHistoryResult = await query(insertUserWalletHistorySql);

                        let successResult = new ResultSuccess(200, true, 'Insert Order', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, "orders.insertUpdateOrders() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'orders.insertUpdateOrders() Exception', error, '');
        next(errorResult);
    }
};

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Orders');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;

            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' 00:00:00' : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' 00:00:00' : '';

            let statusId = req.body.statusId ? req.body.statusId : 0;

            let sql = `CALL getOrders(` + startIndex + `,` + fetchRecords + `,` + authorizationResult.currentUser.id + `,'` + fromDate + `','` + toDate + `','` + statusId + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Orders Successfully', result[1], result[1].length);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new ResultSuccess(200, true, 'Get Orders Successfully', [], 0);
                    return res.status(200).send(successResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "orders.getOrders() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'orders.getOrders() Exception', error, '');
        next(errorResult);
    }
};

export default { insertUpdateOrders, getOrders }