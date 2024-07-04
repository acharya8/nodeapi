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

const NAMESPACE = 'Itr';

const getItr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Itr');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let countSql = "SELECT COUNT(*) as totalCount  FROM itryear";
            let sql = "SELECT * FROM itryear";
            if (startIndex >= 0 && fetchRecord > 0) {
                sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + " ";
            }
            let countResult = await query(countSql);
            let result = await query(sql);
            if (result && result.length > 0) {
                let successResult = new ResultSuccess(200, true, 'Get Itr Successfully', result, countResult[0].totalCount);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            if (result) {
                let successResult = new ResultSuccess(200, true, "Get Itr Successfully", [], 0);
                return res.status(200).send(successResult);
            } else {
                let errorResult = new ResultError(400, true, "itr.getItr() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'itr.getItr() Exception', error, '');
        next(errorResult);
    }
};

const insertItr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Itr');
        let requiredFields = ['name'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let name = req.body.name;
                let id = req.body.id;
                let userId = currentUser.id;
                let checkSql = `SELECT * FROM itryear WHERE name = '` + name + `'`;
                let checkResult = await query(checkSql);
                if (checkResult && checkResult.length > 0) {
                    let errorResult = new ResultError(400, true, "", new Error("Status Already Exist"), '');
                    next(errorResult);
                } else {
                    let sql = `INSERT INTO itryear(name, createdBy, modifiedBy) VALUES('` + name + `',` + userId + `,` + userId + `);`
                    if (req.body.id > 0) {
                        let updateSql = "UPDATE itryear SET name = '" + name + "' WHERE id = " + id;
                        let updateResult = await query(updateSql);
                        if (updateResult && updateResult.affectedRows >= 0) {
                            let successResult = new ResultSuccess(200, true, 'Update Itr', result, 1);
                            return res.status(200).send(successResult);
                        }
                    }
                    console.log(sql);
                    var result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[0][0].nameExist == 1) {
                            let errorResult = new ResultError(400, true, "", new Error("Status Already Exist"), '');
                            next(errorResult);
                        }
                    }
                    else if (result && result.affectedRows > 0) {
                        let successResult = new ResultSuccess(200, true, 'Insert Itr ', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, "itr.insertItr() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'Itr.insertItr() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveItr = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Itr');
        let requiredFields = ['id'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;
                let isActive = req.body.isActive ? req.body.isActive : '!isActive'
                if (req.body.id > 0) {
                    let sql = "UPDATE itryear SET isActive = " + isActive + " WHERE id = " + id;
                    let result = await query(sql);
                    if (result && result.affectedRows >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Update Itr', result, 1);
                        return res.status(200).send(successResult);
                    }
                }
                console.log(result);
                var result = await query(result);
                let successResult = new ResultSuccess(200, true, 'Update Itr', result, 1);
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
        let errorResult = new ResultError(500, true, 'itr.activeInactiveItr() Exception', error, '');
        next(errorResult);
    }
};

export default { getItr, insertItr, activeInactiveItr };