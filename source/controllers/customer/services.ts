import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
var crypto = require('crypto');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { HomeServicesResponse } from '../../classes/output/customer/homeServicesResponse';

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

const NAMESPACE = 'Services';

const getServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Services');

        let sql = `CALL customerGetServices()`;
        console.log(sql);
        let result = await query(sql);
        if (result && result.length > 0) {
            if (result[0] && result[0].length > 0) {

                const groupByCategory = result[0].reduce(function (rv, x) {
                    (rv[x['serviceType']] = rv[x['serviceType']] || []).push(x);
                    return rv;
                }, {});

                console.log(groupByCategory);
                let response = [];
                if (groupByCategory && groupByCategory.Loan) {
                    for (let i = 0; i < groupByCategory.Loan.length; i++) {
                        groupByCategory.Loan[i].isServiceType = false;
                        response.push(new HomeServicesResponse(groupByCategory.Loan[i].id, groupByCategory.Loan[i].name, groupByCategory.Loan[i].displayName, groupByCategory.Loan[i].description, groupByCategory.Loan[i].iconUrl, groupByCategory.Loan[i].colorCode, false));
                    }
                }

                if (groupByCategory && groupByCategory["Other Loan"])
                    response.push(new HomeServicesResponse(groupByCategory["Other Loan"][0].serviceTypeId, groupByCategory["Other Loan"][0].serviceType, groupByCategory["Other Loan"][0].serviceTypeDisplayName, groupByCategory["Other Loan"][0].serviceTypeDescription, groupByCategory["Other Loan"][0].serviceTypeIconUrl, groupByCategory["Other Loan"][0].serviceTypeColorCode, true));
                if (groupByCategory && groupByCategory["Other Services"])
                    response.push(new HomeServicesResponse(groupByCategory["Other Services"][0].serviceTypeId, groupByCategory["Other Services"][0].serviceType, groupByCategory["Other Services"][0].serviceTypeDisplayName, groupByCategory["Other Services"][0].serviceTypeDescription, groupByCategory["Other Services"][0].serviceTypeIconUrl, groupByCategory["Other Services"][0].serviceTypeColorCode, true));




                let successResult = new ResultSuccess(200, true, 'Get Services', response, response.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            } else {
                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }


    } catch (error) {
        let errorResult = new ResultError(500, true, 'services.getServices()', error, '');
        next(errorResult);
    }
};

const getServicesByServiceTypeId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Services By ServiceTypeId');
        var requiredFields = ['serviceTypeId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL customerGetServicesByServiceTypeId(` + req.body.serviceTypeId + `)`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Services By ServiceTypeId', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "services.getServices() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'services.getServices()', error, '');
        next(errorResult);
    }
};

export default { getServices, getServicesByServiceTypeId };