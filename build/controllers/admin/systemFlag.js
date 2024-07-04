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
var crypto = require('crypto');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
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
const NAMESPACE = 'System Flags';
const updateSystemFlagByName = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Reward Coin');
        var requiredFields = ['valueList', 'nameList'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                for (var i = 0; i < req.body.nameList.length; i++) {
                    let sql = "UPDATE systemflags SET value = ? WHERE name = ?";
                    var result = yield query(sql, [req.body.valueList[i], req.body.nameList[i]]);
                }
                if (result.changedRows >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update System flag successfully', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "systemflags.updateSystemFlagByName() Error", new Error('Error While Updating Data'), '');
                    next(errorResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'systemflags.updateSystemFlagByName() Exception', error, '');
        next(errorResult);
    }
});
const getAdminSystemFlag = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting SystemFlags');
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let parentGroup = [];
                let sql = "select s.flagGroupId,fg.flagGroupName,fg.parentFlagGroupId from systemflags s left join flaggroups fg on fg.id = s.flagGroupId where s.autoRender=1 and fg.isActive = 1 group by s.flagGroupId,fg.flagGroupName order by fg.displayOrder";
                let groupResult = yield query(sql);
                if (groupResult && groupResult.length > 0) {
                    for (let k = 0; k < groupResult.length; k++) {
                        groupResult[k].systemFlags = [];
                        let subSql = "select s.*,fg.flagGroupName,vt.valueTypeName from systemflags s left join flaggroups fg on fg.id = s.flagGroupId left join valuetypes vt on vt.id = s.valueTypeId where s.autoRender=1 and s.isActive = 1 and s.flagGroupId = " + groupResult[k].flagGroupId;
                        let subResult = yield query(subSql);
                        if (subResult && subResult.length > 0) {
                            for (let j = 0; j < subResult.length; j++) {
                                groupResult[k].systemFlags.push(subResult[j]);
                            }
                        }
                    }
                    parentGroup = groupResult.filter(c => c.parentFlagGroupId == null);
                    for (let i = 0; i < parentGroup.length; i++) {
                        parentGroup[i].group = [];
                        parentGroup[i].group = groupResult.filter(c => c.parentFlagGroupId == parentGroup[i].flagGroupId);
                    }
                }
                if (groupResult && groupResult.length > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get System flag successfully', parentGroup, parentGroup.length);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "systemflags.getAdminSystemFlag() Error", new Error('Error While Updating Data'), '');
                    next(errorResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'systemflags.getAdminSystemFlag() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { updateSystemFlagByName, getAdminSystemFlag };
