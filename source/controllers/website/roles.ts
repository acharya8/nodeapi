import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { Roles } from '../../classes/input/roles';

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

const NAMESPACE = 'Roles';

const getAllRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting all Roles.');
        var searchString = req.body.searchString;
        var startIndex = req.body.startIndex;
        var fetchRecord = req.body.fetchRecord;
        var isActive = req.body.isActive;
        var isDelete = req.body.isDelete;
        let sql = 'select * from roles as role';
        if (isActive != undefined) {
            if (!sql.includes('WHERE')) {
                sql += ' WHERE ';
            } else {
                sql += ' AND ';
            }
            sql += ' role.isActive = ' + isActive + ' ';
        }
        if (isDelete != undefined) {
            if (!sql.includes('WHERE')) {
                sql += ' WHERE ';
            } else {
                sql += ' AND ';
            }
            sql += ' role.isDelete = ' + isDelete + ' ';
        }
        if (searchString != undefined) {
            if (!sql.includes('WHERE')) {
                sql += ' WHERE ';
            } else {
                sql += ' AND ';
            }
            sql += " (role.name LIKE '%" + searchString + "%' )";
        }
        if (startIndex != undefined && fetchRecord != undefined) {
            sql += ' LIMIT ' + fetchRecord + ' OFFSET ' + startIndex + '';
        }
        console.log(sql);
        var result = await query(sql);
        if (result && result.length >= 0) {
            let successResult = new ResultSuccess(200, true, 'Get All Roles', result, result.length);
            console.log(successResult);
            return res.status(200).send(successResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'roles.getAllRoles() Exception', error, '');
        next(errorResult);
    }
};

const getPartnerRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner Roles');
        let sql = `CALL dsaBazarGetPartnerRoles();`;
        console.log(sql);
        var result = await query(sql);
        console.log(JSON.stringify(result));
        if (result && result.length > 0) {
            if (result[0].length >= 0) {
                let successResult = new ResultSuccess(200, true, 'Get Partner Roles', result[0], result[0].length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
        } else {
            let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'roles.getPartnerRoles()', error, '');
        next(errorResult);
    }
}


export default { getAllRoles, getPartnerRoles };