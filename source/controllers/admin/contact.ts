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

const NAMESPACE = 'Contact Request';

const getContactRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Contact Request');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
            let status = req.body.status ? req.body.status : '';
            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getSeconds())).slice(-2) : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getSeconds())).slice(-2) : '';
            let sql = `CALL adminGetContactRequest(` + startIndex + `,` + fetchRecord + `,'` + status + `','` + fromDate + `','` + toDate + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Contact Request Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                } else if (result[1] && result[1].length == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Contact Request Successfully', [], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "contact.getContactRequest() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'contact.getContactRequest() Exception', error, '');
        next(errorResult);
    }
};

const updateContactRequestStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Contact Request');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminUpdateContactRequestStatus(` + req.body.id + `,'` + req.body.status + `',` + authorizationResult.currentUser.id + `)`;
            let result = await query(sql);
            if (result && result.affectedRows >= 0) {
                let successResult = new ResultSuccess(200, true, 'Update Contact Request Successfully', result, 1);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'contact.updateContactRequestStatus() Exception', error, '');
        next(errorResult);
    }
};



export default { getContactRequest, updateContactRequestStatus };