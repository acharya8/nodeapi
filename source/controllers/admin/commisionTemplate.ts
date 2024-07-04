import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

let connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Commision Template';

const insertUpdateCommissionTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Commission Template');
        let requiredFields = ["name", "templates"];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let isError = false;
                if (req.body.name) {
                    if (req.body.templates && req.body.templates.length > 0) {
                        for (let index = 0; index < req.body.templates.length; index++) {
                            if (req.body.templates[index].id) {
                                let updateSql = await query(`UPDATE commissiontemplate SET name = '` + req.body.name + `' , bankId = ` + req.body.templates[index].bankId + ` ,serviceId = ` + req.body.templates[index].serviceId + `,commissionTypeId = ` + req.body.templates[index].commissionTypeId + ` ,commission = ` + req.body.templates[index].commission + `, modifiedDate =CURRENT_TIMESTAMP,modifiedBy = ` + userId + ` WHERE id  = ?`, req.body.templates[index].id)
                                if (updateSql && updateSql.affectedRows >= 0) {
                                    //
                                }
                                else {
                                    isError = true
                                    return
                                }
                            }
                            else {
                                let insertSql = await query(`INSERT INTO commissiontemplate (name, bankId,serviceId,commissionTypeId,commission,createdBy,modifiedBy) VALUES ('` + req.body.name + `',` + req.body.templates[index].bankId + `,` + req.body.templates[index].serviceId + `,` + req.body.templates[index].commissionTypeId + `,` + req.body.templates[index].commission + `,` + userId + `,` + userId + `)`);
                                if (insertSql && insertSql.affectedRows >= 0) {
                                    //
                                }
                                else {
                                    isError = true
                                    return
                                }
                            }
                        }
                    }
                    if (!isError) {
                        let successResult = new ResultSuccess(200, true, 'Insert Commission Template', "Success", 1);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "commissionTemplates.insertUpdateCommissionTemplate() Error", new Error("Commission Template Not Inserted."), '');
                        next(errorResult);
                    }
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
        let errorResult = new ResultError(500, true, 'commissionTemplates.insertUpdateCommissionTemplate() Exception', error, '');
        next(errorResult);
    }
};


const getCommissionTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Commission Template');
        let requiredFields = [];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;

                let namesql = `SELECT DISTINCT(name) as name FROM commissiontemplate `
                if (req.body.name)
                    namesql += ` WHERE name = ` + req.body.name;
                // namesql += ` ORDER BY id DESC `
                let nameResult = await query(namesql);
                if (nameResult && nameResult.length > 0) {
                    for (let i = 0; i < nameResult.length; i++) {

                        let templateSql = `SELECT ct.*,banks.name as bankName,services.name as serviceName,commissiontypes.name as commissiontype  FROM  commissiontemplate ct
                        INNER JOIN banks ON ct.bankId = banks.id  
                        INNER JOIN services ON ct.serviceId = services.id
                        INNER JOIN commissiontypes ON ct.commissionTypeId = commissiontypes.id
                        WHERE ct.isDelete = 0 AND ct.name= ?`
                        if (req.body.bankIds && req.body.bankIds.length > 0) {
                            templateSql += ` AND ct.bankId IN ('` + req.body.bankIds.toString() + `')`;
                        }
                        if (req.body.serviceIds && req.body.serviceIds.length > 0) {
                            templateSql += ` AND ct.serviceId IN ('` + req.body.serviceIds.toString() + `')`;
                        }
                        let templateResult = await query(templateSql, nameResult[i].name);
                        nameResult[i].templates = templateResult;
                    }
                    nameResult = nameResult.filter(c => c.templates.length > 0);
                    let successResult = new ResultSuccess(200, true, 'Get Bank Loan Policy', nameResult, nameResult.length);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new ResultSuccess(200, true, 'Get Commission Template', [], 0);
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
        let errorResult = new ResultError(500, true, 'commissionTemplates.getCommisionTemplate() Exception', error, '');
        next(errorResult);
    }
}



export default { insertUpdateCommissionTemplate, getCommissionTemplate }