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
        logging.info(NAMESPACE, 'Getting Roles');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetRoles()`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Roles Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "roles.getRoles() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'roles.getRol() Exception', error, '');
        next(errorResult);
    }
};

const insertRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['title'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Inserting Roles');
            let data = new Roles(req.body.name, req.body.description, true, false, new Date(new Date().toUTCString()), new Date(new Date().toUTCString()));
            let sql = 'INSERT INTO roles SET ?';
            var result = await query(sql, data);
            if (result.code != null) {
                let errorResult = new ResultError(400, true, 'Roles.insertRoles() Error', result.message, '');
                next(errorResult);
                return;
            } else if (result.message != null && result.stack != null) {
                let errorResult = new ResultError(400, true, 'Roles.insertRoles() Error', result.message, '');
                next(errorResult);
                return;
            }
            let successResult = new ResultSuccess(200, true, 'Role is created', result, 1);
            console.log(successResult);
            return res.status(200).send(successResult);
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'Roles.insertRoles() Exception', error, '');
        next(errorResult);
    }
};

const updateRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['id', 'name'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Updating Roles');
            let data = new Roles(req.body.name, req.body.description, req.body.isActive, req.body.isDelete, null, new Date(new Date().toUTCString()));
            let sql = 'UPDATE roles SET ? WHERE id=' + req.body.id;
            var result = await query(sql, data);
            if (result.code != null) {
                let errorResult = new ResultError(400, true, 'Roles.updateRoles() Error', result.message, '');
                next(errorResult);
                return;
            } else if (result.message != null && result.stack != null) {
                let errorResult = new ResultError(400, true, 'Roles.updateRoles() Error', result.message, '');
                next(errorResult);
                return;
            }
            let successResult = new ResultSuccess(200, true, 'Role is Updated', result, 1);
            console.log(successResult);
            return res.status(200).send(successResult);
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'Roles.updateRoles() Exception', error, '');
        next(errorResult);
    }
};

const deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Delete Roles');
            let sql = 'Delete FROM roles WHERE id=' + req.body.id;
            var result = await query(sql);
            if (result.code != null) {
                let errorResult = new ResultError(400, true, 'Roles.deleteRole() Error', result.message, '');
                next(errorResult);
                return;
            } else if (result.message != null && result.stack != null) {
                let errorResult = new ResultError(400, true, 'Roles.deleteRole() Error', result.message, '');
                next(errorResult);
                return;
            }
            let successResult = new ResultSuccess(200, true, 'Role is Deleted', result, 1);
            console.log(successResult);
            return res.status(200).send(successResult);
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'Roles.deleteRole() Exception', error, '');
        next(errorResult);
    }
};

const getRolesForAdminPanel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting User');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "CALL adminGetAdminRoles()";
                let result = await query(sql);
                if (result && result.length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Loans Not Available', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
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
        let errorResult = new ResultError(500, true, 'roles.getRolesForAdminPanel() Exception', error, '');
        next(errorResult);
    }
};

export default { getAllRoles, insertRoles, updateRoles, deleteRole, getRolesForAdminPanel };
