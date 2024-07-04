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

const NAMESPACE = 'Business Experience';

const getBusinessExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Business Experience');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0
            let sql = `CALL adminGetBusinessExperience(` + startIndex + `,` + fetchRecord + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Business Experience Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                } else if (result[0] && result[0][0].totalCount == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Business Experience Successfully', [], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "businessexperience.getBusinessExperience() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'businessexperience.getBusinessExperience() Exception', error, '');
        next(errorResult);
    }
};

const insertBusinessExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Busienss Experience');
        let requiredFields = ['name'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let sql = `CALL adminInsertBusinessExperience('` + req.body.name + `',` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert Busienss Experience', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "businessexperience.insertBusinessExperience() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'businessexperience.insertBusinessExperience() Exception', error, '');
        next(errorResult);
    }
};

const updateBusinessExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Busienss Experience');
        let requiredFields = ['id', 'name'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                let sql = `CALL adminUpdateBusinessExperience(` + id + `,'` + req.body.name + `',` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Update Busienss Experience', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "businessexperience.updateBusinessExperience() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'businessexperience.updateBusinessExperience() Exception', error, '');
        next(errorResult);
    }
};

const activeInActiveBusinessExperience = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Busienss Experience');
        let requiredFields = ['id'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveBusienssExperience(` + id + `,` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Busienss Experience', result, 1);
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
        let errorResult = new ResultError(500, true, 'businessexperience.activeInActiveBusinessExperience() Exception', error, '');
        next(errorResult);
    }
};

export default { getBusinessExperience, insertBusinessExperience, updateBusinessExperience, activeInActiveBusinessExperience };