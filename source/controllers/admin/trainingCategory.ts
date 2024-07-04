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

const NAMESPACE = 'Training Category';

const getTrainingCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Training Categories');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetTrainingCategories()`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0]) {
                    let successResult = new ResultSuccess(200, true, 'Get Training Categroy Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } 
            } else {
                let errorResult = new ResultError(400, true, "trainingCategory.getTrainingCategories() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'trainingCategory.getTrainingCategories() Exception', error, '');
        next(errorResult);
    }
};

const insertTrainingCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Training Category');
        var requiredFields = ['name'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let name = req.body.name;
                let parentId = req.body.parentId ? req.body.parentId : 0;
                let sql = `CALL adminInsertTrainingCategory('` + name + `',` + parentId + `,` + currentUser.id + `)`;
                console.log(sql);
                var result = await query(sql);
                console.log(result);
                let successResult = new ResultSuccess(200, true, 'Insert Training Category', result[0], 1);
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
        let errorResult = new ResultError(500, true, 'serviceTypes.insertTrainingCategroy() Exception', error, '');
        next(errorResult);
    }
};

const updateTrainingCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Training Categroy');
        var requiredFields = ['id', 'name'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let parentId = req.body.parentId ? req.body.parentId : 0;
                let sql = `CALL adminUpdateTrainingCategory(` + id + `,'` + req.body.name + `',` + parentId + `,` + currentUser.id + `);`;
                console.log(sql);
                var result = await query(sql);
                console.log(result);
                let successResult = new ResultSuccess(200, true, 'Update Training Category', result[0], 1);
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
        let errorResult = new ResultError(500, true, 'trainingCategory.insertTrainingCategory() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveTrainingCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Training Categroy');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;

                let sql = `CALL adminActiveInactiveTrainingCategory(` + id + `,` + currentUser.id + `)`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Training Categroy', result, 1);
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
        let errorResult = new ResultError(500, true, 'trainingCategroy.activeInactiveTrainingCategroy() Exception', error, '');
        next(errorResult);
    }
};

const removeTrainingCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Delete Training Categroy');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;

                let sql = `CALL adminRemoveTrainingCategroy(` + id + `)`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Remove Training Categroy', result, 1);
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
        let errorResult = new ResultError(500, true, 'trainingCategroy.removeTrainingCategroy() Exception', error, '');
        next(errorResult);
    }
};
export default { getTrainingCategories, insertTrainingCategory, updateTrainingCategory, activeInactiveTrainingCategory,removeTrainingCategory };