import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
var crypto = require('crypto');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
})

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'System Flags';

const updateSystemFlagByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Reward Coin');
        var requiredFields = ['valueList', 'nameList'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                for (var i = 0; i < req.body.nameList.length; i++) {
                    let sql = "UPDATE systemflags SET value = ? WHERE name = ?";
                    var result = await query(sql, [req.body.valueList[i], req.body.nameList[i]]);
                }
                if (result.changedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Update System flag successfully', result, 1);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "systemflags.updateSystemFlagByName() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'systemflags.updateSystemFlagByName() Exception', error, '');
        next(errorResult);
    }
};

const getAdminSystemFlag = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting SystemFlags');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let parentGroup = [];
                let sql = "select s.flagGroupId,fg.flagGroupName,fg.parentFlagGroupId from systemflags s left join flaggroups fg on fg.id = s.flagGroupId where s.autoRender=1 and fg.isActive = 1 group by s.flagGroupId,fg.flagGroupName order by fg.displayOrder";
                let groupResult = await query(sql)
                if (groupResult && groupResult.length > 0) {
                    for (let k = 0; k< groupResult.length; k++) {
                        groupResult[k].systemFlags = [];
                        let subSql = "select s.*,fg.flagGroupName,vt.valueTypeName from systemflags s left join flaggroups fg on fg.id = s.flagGroupId left join valuetypes vt on vt.id = s.valueTypeId where s.autoRender=1 and s.isActive = 1 and s.flagGroupId = " + groupResult[k].flagGroupId;
                        let subResult = await query(subSql);
                        if (subResult && subResult.length > 0) {
                            for (let j = 0; j < subResult.length; j++) {
                                groupResult[k].systemFlags.push(subResult[j]);
                            }
                        }
                    }
                    parentGroup = groupResult.filter(c=>c.parentFlagGroupId == null)
                    for (let i = 0; i < parentGroup.length; i++) {
                        parentGroup[i].group = [];
                        parentGroup[i].group = groupResult.filter(c=>c.parentFlagGroupId == parentGroup[i].flagGroupId);
                    }
                  
                }
                if (groupResult && groupResult.length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get System flag successfully', parentGroup, parentGroup.length);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "systemflags.getAdminSystemFlag() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'systemflags.getAdminSystemFlag() Exception', error, '');
        next(errorResult);
    }
};

export default { updateSystemFlagByName, getAdminSystemFlag };