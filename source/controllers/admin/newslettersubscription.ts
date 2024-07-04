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

const NAMESPACE = 'Itr';

const getNewsLetterSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting News Letter Subscription');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let countSql = "SELECT COUNT(*) as totalCount  FROM newslettersubscription";
            let sql = "SELECT * FROM newslettersubscription";
            if (startIndex >= 0 && fetchRecord >0) {
                sql += " LIMIT " + fetchRecord + " OFFSET " + startIndex + " ";
            }
            let countResult = await query(countSql);
            let result = await query(sql);
            if (result && result.length > 0) {
                let successResult = new ResultSuccess(200, true, 'Get News Letter Subscription Successfully', result, countResult[0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
            }
            if (result) {
                let successResult = new ResultSuccess(200, true, "Get News Letter Subscription Successfully", [], 0);
                return res.status(200).send(successResult);
            } else {
                let errorResult = new ResultError(400, true, "newsLetterSubscription.getNewsLetterSubscription() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'newsLetterSubscription.getNewsLetterSubscription() Exception', error, '');
        next(errorResult);
    }
};

export default { getNewsLetterSubscription };