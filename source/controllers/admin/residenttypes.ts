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

const NAMESPACE = 'Resident Types';

const getResidentTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Resident Types');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let sql = `CALL adminGetResidentTypes(` + startIndex + `,` + fetchRecord + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0][0].totalCount > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Resident Type Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else if (result[1]) {
                    let successResult = new ResultSuccess(200, true, 'Get Resident Type Successfully', [], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "residentTypes.getResidentTypes() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'residentTypes.getResidentTypes() Exception', error, '');
        next(errorResult);
    }
};

const insertResidentType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Resident Type');
        var requiredFields = ['name'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let name = req.body.name;
                let userId = currentUser.id;
                let sql = `CALL adminInsertResidentType('` + name + `',` + userId + `);`;
                console.log(sql);
                var result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Status Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert Resident Type ', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "residenttypes.insertResidentType() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'residentTypes.insertResidentType() Exception', error, '');
        next(errorResult);
    }
};

const updateResidentType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Resident Type');
        var requiredFields = ['id', 'name'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let name = req.body.name;
                let userId = currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                let sql = `CALL adminUpdateResidentType(` + id + `,'` + name + `',` + userId + `);`;
                console.log(sql);
                var result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Status Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Update Resident Type', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "residenttypes.updateResidentType() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'residentTypes.updateResidentType() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveResidentType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Resident Type');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveResidentType(` + id + `,` + userId + `);`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Resident Type', result, 1);
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
        let errorResult = new ResultError(500, true, 'residentType.activeInactiveResidentType() Exception', error, '');
        next(errorResult);
    }
};

export default { getResidentTypes, insertResidentType, updateResidentType, activeInactiveResidentType };