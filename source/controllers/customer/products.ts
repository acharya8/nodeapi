import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
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

const NAMESPACE = 'Product';

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Products');
        var requiredFields = ['userId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let searchString = req.body.searchString ? req.body.searchString : "";
                let minCoin = req.body.minCoin ? req.body.minCoin : 0;
                let maxCoin = req.body.maxCoin ? req.body.maxCoin : 0;

                let sql = "CALL getProduct(" + startIndex + "," + fetchRecords + ",'" + searchString + "'," + minCoin + "," + maxCoin + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[1] && result[1].length >= 0) {
                        let sql = `SELECT * FROM orders WHERE userId = ? AND isDelete = 0 ORDER BY id DESC`
                        let orderResult = await query(sql, req.body.userId);
                        let products = []
                        if (orderResult && orderResult.length > 0) {
                            for (let i = 0; i < result[1].length; i++) {
                                if (result[1][i].duration) {
                                    if (result[1][i].duration && result[1][i].duration == 'Monthly') {
                                        var months;
                                        var createdDate = null;
                                        let index = orderResult.findIndex(c => c.productId == result[1][i].id)
                                        if (index >= 0)
                                            createdDate = orderResult[index].createdDate
                                        if (createdDate) {
                                            months = (new Date().getFullYear() - createdDate.getFullYear()) * 12;
                                            months -= createdDate.getMonth();
                                            months += new Date().getMonth();
                                            months = months <= 0 ? 0 : months;
                                            if (months > 0) {
                                                products.push(result[1][i])
                                            }
                                        }
                                        else {
                                            products.push(result[1][i])
                                        }
                                    }
                                    if (result[1][i].duration && result[1][i].duration == 'Yearly') {
                                        var year;
                                        var createdDate = null;
                                        let index = orderResult.findIndex(c => c.productId == result[1][i].id)
                                        if (index >= 0)
                                            createdDate = orderResult[index].createdDate
                                        if (createdDate) {
                                            year = (new Date().getFullYear() - createdDate.getFullYear())
                                            if (year > 0) {
                                                products.push(result[1][i])
                                            }
                                        }
                                        else {
                                            products.push(result[1][i])
                                        }
                                    }
                                    if (result[1][i].duration && result[1][i].duration == 'Quarterly') {
                                        var quarter;
                                        var createdDate = null;
                                        let index = orderResult.findIndex(c => c.productId == result[1][i].id)
                                        if (index >= 0)
                                            createdDate = orderResult[index].createdDate
                                        if (createdDate) {
                                            quarter = (new Date().getFullYear() - createdDate.getFullYear()) * 12;
                                            quarter -= createdDate.getMonth();
                                            quarter += new Date().getMonth();
                                            quarter = quarter <= 0 ? 0 : quarter;
                                            if (quarter > 3) {
                                                products.push(result[1][i])
                                            }
                                        }
                                        else {
                                            products.push(result[1][i])
                                        }
                                    }
                                } else {
                                    products.push(result[1][i])
                                }

                            }
                            result[1] = products;
                        }
                        let length = result[1].length;
                        if (result[1] && result[1].length > 0) {
                            if (startIndex >= 0 && fetchRecords > 0) {
                                fetchRecords = fetchRecords + startIndex
                                result[1] = result[1].slice(startIndex, fetchRecords)
                            }
                        }
                        let successResult = new ResultSuccess(200, true, 'Get Products Successfully', result[1], length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new ResultSuccess(200, true, 'Get Products Successfully', result[1], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "products.getProducts() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'products.getProducts() Exception', error, '');
        next(errorResult);
    }
};


export default { getProducts }