import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { CommissionTypesReponse } from '../../classes/output/partner/commissionTypeResponse';

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

const NAMESPACE = 'Commission Type';

const getCommissionType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Commission Type');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "CALL dsaBazarGetCommissionType()";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let commissionType = result[0];
                        let parentObj = [];
                        for (let i = 0; i < commissionType.length; i++) {
                            if (commissionType[i] && commissionType[i].parentId) {
                                let childObj: CommissionTypesReponse = new CommissionTypesReponse(commissionType[i].id, commissionType[i].name, null);
                                if (parentObj && parentObj.length > 0) {
                                    let ind = parentObj.findIndex(c => c.id == commissionType[i].parentId);
                                    if (ind >= 0) {
                                        parentObj[ind].child.push(childObj);
                                    } else {
                                        let obj: CommissionTypesReponse = new CommissionTypesReponse(commissionType[i].parentId, commissionType[i].parentTypeName, [childObj]);
                                        parentObj.push(obj);
                                    }
                                } else {
                                    let obj: CommissionTypesReponse = new CommissionTypesReponse(commissionType[i].parentId, commissionType[i].parentTypeName, [childObj]);
                                    parentObj.push(obj);
                                }
                            } else {
                                let obj: CommissionTypesReponse = new CommissionTypesReponse(commissionType[i].id, commissionType[i].name, []);
                                parentObj.push(obj);
                            }
                        }
                        let successResult = new ResultSuccess(200, true, 'Get Commission Types', parentObj, parentObj.length);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "commissionTypes.getCommissionType() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'commissionTypes.getCommissionType() Exception', error, '');
        next(errorResult);
    }
};



const getCommissionTemplate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Commission Template');
        var requiredFields = [""];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
                let sql = `CALL adminGetCommissionTemplates(` + startIndex + `,` + fetchRecord + `,'` + '' + `','` + '' + `')`;
                var result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0][0].totalCount > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Commission Template Successfully', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    } else if (result[1]) {
                        let successResult = new ResultSuccess(200, true, 'Getting Commission Template Successfully', [], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "commissionTemplates.getCommisionTemplate() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'commissionTemplates.getCommisionTemplate() Exception', error, '');
        next(errorResult);
    }
}





const getCommisionTemplateByBankAndServiceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Commission By Ids');
        var requiredFields = ['bankId', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId;
                let bankId = req.body.bankId;
                let sql = `CALL getCommissionTemplateByBankAndServiceId('` + bankId + `','` + serviceId + `')`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get CommissionTemplate By Ids', result[0], result[0].length);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting Templates", result, '');
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
        let errorResult = new ResultError(500, true, 'commissionTemplates.getCommisionTemplateByBankAndServiceId()', error, '');
        next(errorResult);
    }
};


export default { getCommissionType, getCommissionTemplate, getCommisionTemplateByBankAndServiceId };