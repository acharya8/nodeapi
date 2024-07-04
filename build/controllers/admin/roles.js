"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../../config/logging"));
const config_1 = __importDefault(require("../../config/config"));
const mysql = require('mysql');
const util = require('util');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const roles_1 = require("../../classes/input/roles");
var connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.pass,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'Roles';
const getAllRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Roles');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetRoles()`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Roles Successfully', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "roles.getRoles() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'roles.getRol() Exception', error, '');
        next(errorResult);
    }
});
const insertRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['title'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Inserting Roles');
            let data = new roles_1.Roles(req.body.name, req.body.description, true, false, new Date(new Date().toUTCString()), new Date(new Date().toUTCString()));
            let sql = 'INSERT INTO roles SET ?';
            var result = yield query(sql, data);
            if (result.code != null) {
                let errorResult = new resulterror_1.ResultError(400, true, 'Roles.insertRoles() Error', result.message, '');
                next(errorResult);
                return;
            }
            else if (result.message != null && result.stack != null) {
                let errorResult = new resulterror_1.ResultError(400, true, 'Roles.insertRoles() Error', result.message, '');
                next(errorResult);
                return;
            }
            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Role is created', result, 1);
            console.log(successResult);
            return res.status(200).send(successResult);
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'Roles.insertRoles() Exception', error, '');
        next(errorResult);
    }
});
const updateRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['id', 'name'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Updating Roles');
            let data = new roles_1.Roles(req.body.name, req.body.description, req.body.isActive, req.body.isDelete, null, new Date(new Date().toUTCString()));
            let sql = 'UPDATE roles SET ? WHERE id=' + req.body.id;
            var result = yield query(sql, data);
            if (result.code != null) {
                let errorResult = new resulterror_1.ResultError(400, true, 'Roles.updateRoles() Error', result.message, '');
                next(errorResult);
                return;
            }
            else if (result.message != null && result.stack != null) {
                let errorResult = new resulterror_1.ResultError(400, true, 'Roles.updateRoles() Error', result.message, '');
                next(errorResult);
                return;
            }
            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Role is Updated', result, 1);
            console.log(successResult);
            return res.status(200).send(successResult);
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'Roles.updateRoles() Exception', error, '');
        next(errorResult);
    }
});
const deleteRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['id'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Delete Roles');
            let sql = 'Delete FROM roles WHERE id=' + req.body.id;
            var result = yield query(sql);
            if (result.code != null) {
                let errorResult = new resulterror_1.ResultError(400, true, 'Roles.deleteRole() Error', result.message, '');
                next(errorResult);
                return;
            }
            else if (result.message != null && result.stack != null) {
                let errorResult = new resulterror_1.ResultError(400, true, 'Roles.deleteRole() Error', result.message, '');
                next(errorResult);
                return;
            }
            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Role is Deleted', result, 1);
            console.log(successResult);
            return res.status(200).send(successResult);
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'Roles.deleteRole() Exception', error, '');
        next(errorResult);
    }
});
const getRolesForAdminPanel = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting User');
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "CALL adminGetAdminRoles()";
                let result = yield query(sql);
                if (result && result.length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Loans Not Available', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'roles.getRolesForAdminPanel() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getAllRoles, insertRoles, updateRoles, deleteRole, getRolesForAdminPanel };
