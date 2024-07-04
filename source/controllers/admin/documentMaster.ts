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

const NAMESPACE = 'Document Master';

const getDocumentMaster = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Document Masters');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0
            let sql = `CALL adminGetDocumentMaster(` + startIndex + `,` + fetchRecords + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0][0].totalCount > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Document Master Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                } else if (result[0] && result[0][0].totalCount == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Document Master Successfully', [], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "documentMasters.getDocumentMaster() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'documentMasters.getDocumentMaster() Exception', error, '');
        next(errorResult);
    }
};

const insertDocumentMasters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Document Master');
        let requiredFields = ['name', 'maxSize'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let name = req.body.name;
                let userId = currentUser.id;
                req.body.maxSize = req.body.maxSize ? req.body.maxSize : null;
                let sql = `CALL adminInsertDocumentMasters('` + name + `','` + req.body.maxSize + `',` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert Document Master', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "documentMasters.insertDocumentMasters() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'documentMasters.insertDocumentMasters() Exception', error, '');
        next(errorResult);
    }
};

const updateDocumentMasters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Document Masters');
        let requiredFields = ['id', 'name', 'maxSize'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let name = req.body.name;
                let userId = currentUser.id;
                req.body.maxSize = req.body.maxSize ? req.body.maxSize : null;
                let sql = `CALL adminUpdateDocumentMaster(` + id + `,'` + name + `','` + req.body.maxSize + `',` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Update Document Masters', result[0], 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "documentMasters.updateDocumentMasters() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'documentMasters.updateDocumentMasters() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveDocumentMasters = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Document Masters');
        let requiredFields = ['id', 'isActive'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let isActive = req.body.isActive;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveDocumentMaster(` + id + `,` + isActive + `,` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Document Masters Status', result, 1);
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
        let errorResult = new ResultError(500, true, 'documentMasters.activeInactiveDocumentMasters() Exception', error, '');
        next(errorResult);
    }
};

export default { getDocumentMaster, insertDocumentMasters, updateDocumentMasters, activeInactiveDocumentMasters };