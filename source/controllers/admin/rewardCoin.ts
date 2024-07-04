import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
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

const NAMESPACE = 'Reward Coin';

const insertUpdateRewardCoin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Reward Coin');
        var requiredFields = ['rewardTypeId', 'rewardCoin'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id ? req.body.id : null;
                let rewardTypeId = req.body.rewardTypeId;
                let rewardCoin = req.body.rewardCoin;
                let minLoanFile = req.body.minLoanFile ? req.body.minLoanFile : null;
                let maxLoanFile = req.body.maxLoanFile ? req.body.maxLoanFile : null;
                let roleIds = req.body.roleIds.toString() ? req.body.roleIds.toString() : null;
                let isScratchCard = req.body.isScratchCard ? req.body.isScratchCard : false
                let sql = "CALL adminInsertUpdateRewardCoin(" + id + "," + rewardTypeId + "," + rewardCoin + "," + minLoanFile + "," + maxLoanFile + "," + currentUser.id + ",'" + roleIds + "'," + isScratchCard + ")";
                var result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert Reward Coin', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "rewardCoin.insertRewardCoin() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'rewardCoin.insertRewardCoin() Exception', error, '');
        next(errorResult);
    }
};

const getRewardCoin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Reward Coin');
        var requiredFields = [''];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;

                let sql = `CALL adminGetRewardCoin(` + startIndex + `,` + fetchRecord + `);`;
                var result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0][0].totalCount > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Reward Coin Successfully', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    } else if (result[1]) {
                        let successResult = new ResultSuccess(200, true, 'Getting Reward Coin Successfully', [], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "rewardCoin.insertRewardCoin() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'rewardCoin.insertRewardCoin() Exception', error, '');
        next(errorResult);
    }
};

const getRewardType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Reward Type');
        var requiredFields = [''];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;

                let sql = `CALL adminGetRewardType();`;
                var result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Reward Type Successfully', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "rewardCoin.getRewardType() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'rewardCoin.getRewardType() Exception', error, '');
        next(errorResult);
    }
};

export default { insertUpdateRewardCoin, getRewardCoin, getRewardType };
