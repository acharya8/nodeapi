import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
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

const NAMESPACE = 'Cities';

const getCities = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Cities');
        let sql = `CALL websiteGetCity();`;
        console.log(sql);
        var result = await query(sql);
        //console.log(JSON.stringify(result));
        if (result && result.length > 0) {
            if (result[0].length >= 0) {
                let successResult = new ResultSuccess(200, true, 'Get City', result[0], result[0].length);
                //console.log(successResult);
                return res.status(200).send(successResult);
            }
        } else {
            let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'cities.getCities()', error, '');
        next(errorResult);
    }
};

export default { getCities };
