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

const NAMESPACE = 'Orders';

const getOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Orders');

        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecord ? req.body.fetchRecord : 0;
            let searchString = req.body.searchString ? req.body.searchString : "";

            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' 00:00:00' : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' 00:00:00' : '';

            let statusIds = req.body.statusIds ? req.body.statusIds.toString() : "";

            let sql = `CALL adminGetOrders(` + startIndex + `,` + fetchRecords + `,'` + searchString + `','` + fromDate + `','` + toDate + `','` + statusIds + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Orders Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
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

const getOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Order Status');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {

            let sql = `CALL adminGetOrderStatuses()`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Order Status Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "orders.getOrderStatus() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'orders.getOrderStatus() Exception', error, '');
        next(errorResult);
    }
};


const changeOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Change Order Status');
        var requiredFields = ['orderId', 'statusId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.remark = req.body.remark ? req.body.remark : '';
                let sql = `CALL adminChangeOrderStatus(` + req.body.orderId + `,` + req.body.statusId + `,` + authorizationResult.currentUser.id + `,'` + req.body.remark + `')`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Change Orders Status Successfully', result, 1);
                    console.log(successResult);
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
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'orders.changeOrderStatus() Exception', error, '');
        next(errorResult);
    }
};

export default { getOrders, getOrderStatus, changeOrderStatus }