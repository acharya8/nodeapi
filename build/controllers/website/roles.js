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
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
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
        logging_1.default.info(NAMESPACE, 'Getting all Roles.');
        var searchString = req.body.searchString;
        var startIndex = req.body.startIndex;
        var fetchRecord = req.body.fetchRecord;
        var isActive = req.body.isActive;
        var isDelete = req.body.isDelete;
        let sql = 'select * from roles as role';
        if (isActive != undefined) {
            if (!sql.includes('WHERE')) {
                sql += ' WHERE ';
            }
            else {
                sql += ' AND ';
            }
            sql += ' role.isActive = ' + isActive + ' ';
        }
        if (isDelete != undefined) {
            if (!sql.includes('WHERE')) {
                sql += ' WHERE ';
            }
            else {
                sql += ' AND ';
            }
            sql += ' role.isDelete = ' + isDelete + ' ';
        }
        if (searchString != undefined) {
            if (!sql.includes('WHERE')) {
                sql += ' WHERE ';
            }
            else {
                sql += ' AND ';
            }
            sql += " (role.name LIKE '%" + searchString + "%' )";
        }
        if (startIndex != undefined && fetchRecord != undefined) {
            sql += ' LIMIT ' + fetchRecord + ' OFFSET ' + startIndex + '';
        }
        console.log(sql);
        var result = yield query(sql);
        if (result && result.length >= 0) {
            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get All Roles', result, result.length);
            console.log(successResult);
            return res.status(200).send(successResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'roles.getAllRoles() Exception', error, '');
        next(errorResult);
    }
});
const getPartnerRoles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Partner Roles');
        let sql = `CALL dsaBazarGetPartnerRoles();`;
        console.log(sql);
        var result = yield query(sql);
        console.log(JSON.stringify(result));
        if (result && result.length > 0) {
            if (result[0].length >= 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Partner Roles', result[0], result[0].length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'roles.getPartnerRoles()', error, '');
        next(errorResult);
    }
});
exports.default = { getAllRoles, getPartnerRoles };
