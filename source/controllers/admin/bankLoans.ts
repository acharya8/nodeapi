import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

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

const NAMESPACE = 'BankLoans';

const getBankLoans = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting BankLoans');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0
            let bankIds = req.body.bankIds ? req.body.bankIds.toString() : ""
            let serviceIds = req.body.serviceIds ? req.body.serviceIds.toString() : ""
            // let searchString = req.body.searchString ? req.body.searchString : ""
            let sql = `CALL adminGetBankLoan(` + startIndex + `,` + fetchRecord + `,'` + bankIds + `','` + serviceIds + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Get BankLoans Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "bankLoan.getBankLoans() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'bankLoan.getBankLoans() Exception', error, '');
        next(errorResult);
    }
};

const insertBankLoan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting BankLoans');
        let requiredFields = ['bankId', 'serviceId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let sql = `CALL adminInsertBankLoan(` + req.body.bankId + `,` + req.body.serviceId + `,'` + req.body.loanName + `',` + userId + `)`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert BankLoans', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "BankLoans.insertBankLoan() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'BankLoans.insertBankLoan() Exception', error, '');
        next(errorResult);
    }
};

const updateBankLoan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating BankLoans');
        let requiredFields = ['id', 'bankId', 'serviceId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                let sql = `CALL adminUpdateBankLoan(` + id + `,` + req.body.bankId + `,` + req.body.serviceId + `,'` + req.body.loanName + `',` + userId + `)`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Update BankLoans', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "BankLoans.updateBankLoan() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'BankLoans.updateBankLoan() Exception', error, '');
        next(errorResult);
    }
};

const activeInActiveBankLoan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive BankLoans');
        let requiredFields = ['id'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveBankLoans(` + id + `,` + userId + `)`;
                console.log(sql);
                let result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update BankLoans', result, 1);
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
        let errorResult = new ResultError(500, true, 'BankLoans.activeInActiveBankLoan() Exception', error, '');
        next(errorResult);
    }
};

export default { getBankLoans, insertBankLoan, updateBankLoan, activeInActiveBankLoan };