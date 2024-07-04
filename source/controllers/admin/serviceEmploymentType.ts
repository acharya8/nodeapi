import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
var crypto = require('crypto');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
})

const S3 = new AWS.S3({
    accessKeyId: config.s3bucket.aws_Id,
    secretAccessKey: config.s3bucket.aws_secret
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Service Employment Types';

const getServiceEmploymentTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Service Employment Types');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0
            req.body.serviceId = req.body.serviceId ? req.body.serviceId : 0
            let sql = `CALL adminGetServiceEmploymentTypes(` + startIndex + `,` + fetchRecords + `,` + req.body.serviceId + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get  Service Employment Type Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                if (result[0]) {
                    let successResult = new ResultSuccess(200, true, 'Get  Service Employment Type Successfully', [], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "serviceEmploymentType.getServiceEmploymentType() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'serviceEmploymentType.getServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
};

const insertServiceEmploymentType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Service Employment Type');
        var requiredFields = ['serviceId', 'employmentTypeIds'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                if (req.body.employmentTypeId && req.body.employmentTypeIds.length > 0) {
                    let employmentTypeIds;
                    for (let index = 0; index < req.body.employmentTypeIds.length; index++) {
                        if (index == 0) {
                            employmentTypeIds = req.body.employmentTypeIds[index];
                        }
                        else
                            employmentTypeIds = employmentTypeIds + "," + req.body.employmentTypeIds[index];
                    }
                    req.body.employmentTypeIds = employmentTypeIds
                }
                let sql = `CALL adminInsertServiceEmploymentType(` + req.body.serviceId + `,'` + req.body.employmentTypeIds + `',` + currentUser.id + `)`;
                console.log(sql);
                var result = await query(sql);
                console.log(result);
                let successResult = new ResultSuccess(200, true, 'Insert Service Employment Type', result[0], 1);
                console.log(successResult);
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
        let errorResult = new ResultError(500, true, 'serviceEmploymentTypes.insertServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
};

const updateServiceEmploymentType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Service Employment Type');
        var requiredFields = ['id', 'serviceId', 'employmentTypeId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                if (req.body.employmentTypeId && req.body.employmentTypeIds.length > 0) {
                    let employmentTypeIds;
                    for (let index = 0; index < req.body.employmentTypeIds.length; index++) {
                        if (index == 0) {
                            employmentTypeIds = req.body.employmentTypeIds[index];
                        }
                        else
                            employmentTypeIds = employmentTypeIds + "," + req.body.employmentTypeIds[index];
                    }
                    req.body.employmentTypeIds = employmentTypeIds
                }
                let sql = `CALL (` + req.body.serviceId + `,'` + req.body.employmentTypeIds + `',` + currentUser.id + `);`;
                console.log(sql);
                var result = await query(sql);
                console.log(result);
                let successResult = new ResultSuccess(200, true, 'Update  Service EmploymentType', result[0], 1);
                console.log(successResult);
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
        let errorResult = new ResultError(500, true, 'serviceEmploymentType.updateServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveServiceEmploymentType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Service EmploymentType');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let serviceId = req.body.serviceId ? req.body.serviceId : 0;
                let sql = `CALL adminActiveIactiveServiceEmploymentType(` + id + `,` + serviceId + `,` + currentUser.id + `)`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Change Service Employment Type Status', result, 1);
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
        let errorResult = new ResultError(500, true, 'serviceEmploymentType.activeInActiveServiceEmploymentType() Exception', error, '');
        next(errorResult);
    }
};

export default { getServiceEmploymentTypes, insertServiceEmploymentType, updateServiceEmploymentType, activeInactiveServiceEmploymentType };