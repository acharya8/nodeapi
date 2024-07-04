import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { employmentTypesReponse } from '../../classes/output/customer/employementTypesResponse';

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

const NAMESPACE = 'Service Masters';

const getMasterDataByServiceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Get Masters By Service Id');
        var requiredFields = ['serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let serviceId = req.body.serviceId ? req.body.serviceId : null;
                let sql = `CALL customerGetMasterDataByServiceId(` + serviceId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    let response = {
                        maritalStatus: null, serviceDocuments: null, employmentTypes: null, companyType: null, industryTypes: null, residenceType: null, banks: null, loanAgainsCollateral: null
                        , businessAnnualProfits: null, businessAnnualSales: null, businessExperience: null, businessNature: null, propertyTypes: null, employmentServiceTypes: null, employmentNatures: null
                        , coApplicantRelation: null, addressTypes: null, tenure: null
                    };

                    if (result[0] && result[0].length > 0) {
                        response.maritalStatus = result[0];
                    }
                    if (result[1] && result[1].length > 0) {
                        response.serviceDocuments = result[1];
                    }
                    if (result[2] && result[2].length > 0) {
                        let employmentTypes = result[2];
                        let parentObj = [];
                        for (let i = 0; i < employmentTypes.length; i++) {
                            if (employmentTypes[i] && employmentTypes[i].parentTypeId) {
                                let childObj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].id, employmentTypes[i].name, null);
                                if (parentObj && parentObj.length > 0) {
                                    let ind = parentObj.findIndex(c => c.id == employmentTypes[i].parentTypeId);
                                    if (ind >= 0) {
                                        parentObj[ind].child.push(childObj);
                                    } else {
                                        let obj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].parentTypeId, employmentTypes[i].parentTypeName, [childObj]);
                                        parentObj.push(obj);
                                    }
                                } else {
                                    let obj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].parentTypeId, employmentTypes[i].parentTypeName, [childObj]);
                                    parentObj.push(obj);
                                }
                            } else {
                                let obj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].id, employmentTypes[i].name, []);
                                parentObj.push(obj);
                            }
                        }

                        response.employmentTypes = parentObj;
                    }
                    if (result[3] && result[3].length > 0) {
                        response.companyType = result[3];
                    }
                    if (result[4] && result[4].length > 0) {
                        let industryTypes = result[4];
                        let parentObj = [];
                        for (let i = 0; i < industryTypes.length; i++) {
                            if (industryTypes[i] && industryTypes[i].parentId) {
                                let childObj: employmentTypesReponse = new employmentTypesReponse(industryTypes[i].id, industryTypes[i].name, null);
                                if (parentObj && parentObj.length > 0) {
                                    let ind = parentObj.findIndex(c => c.id == industryTypes[i].parentId);
                                    if (ind >= 0) {
                                        parentObj[ind].child.push(childObj);
                                    } else {
                                        let obj: employmentTypesReponse = new employmentTypesReponse(industryTypes[i].parentId, industryTypes[i].parentTypeName, [childObj]);
                                        parentObj.push(obj);
                                    }
                                } else {
                                    let obj: employmentTypesReponse = new employmentTypesReponse(industryTypes[i].parentId, industryTypes[i].parentTypeName, [childObj]);
                                    parentObj.push(obj);
                                }
                            } else {
                                let obj: employmentTypesReponse = new employmentTypesReponse(industryTypes[i].id, industryTypes[i].name, []);
                                parentObj.push(obj);
                            }
                        }
                        response.industryTypes = parentObj;
                    }
                    if (result[5] && result[5].length > 0) {
                        response.residenceType = result[5];
                    }
                    if (result[6] && result[6].length > 0) {
                        response.banks = result[6];
                    }
                    if (result[7] && result[7].length > 0) {
                        response.loanAgainsCollateral = result[7];
                    }
                    if (result[8] && result[8].length > 0) {
                        response.businessAnnualProfits = result[8];
                    }
                    if (result[9] && result[9].length > 0) {
                        response.businessAnnualSales = result[9];
                    }
                    if (result[10] && result[10].length > 0) {
                        response.businessExperience = result[10];
                    }
                    if (result[11] && result[11].length > 0) {
                        response.businessNature = result[11];
                    }
                    if (result[12] && result[12].length > 0) {
                        response.propertyTypes = result[12];
                    }
                    if (result[13] && result[13].length > 0) {
                        response.employmentServiceTypes = result[13];
                    }
                    if (result[14] && result[14].length > 0) {
                        response.employmentNatures = result[14];
                    }
                    if (result[15] && result[15].length > 0) {
                        response.coApplicantRelation = result[15];
                    }
                    if (result[16] && result[16].length > 0) {
                        response.addressTypes = result[16];
                    }
                    if (result[17] && result[17].length > 0) {
                        response.tenure = result[17];
                    }



                    if (response) {
                        let successResult = new ResultSuccess(200, true, 'Get Masters By ServiceId', response, 1);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "serviceMasterData.getMasterDataByServiceId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'serviceMasterData.getMasterDataByServiceId()', error, '');
        next(errorResult);
    }
};


const getCompanyCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'get Loan Detail');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let sql = `SELECT * FROM companycategory`;
            let result = await query(sql);
            if (result && result.length > 0) {
                let successResult = new ResultSuccess(200, true, 'Get Loan Detail', result, result.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new ResultError(400, true, "serviceMasterData.getCompanyCategories() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'serviceMasterData.getCompanyCategories() Exception', error, '');
        next(errorResult);
    }
};

export default { getMasterDataByServiceId, getCompanyCategories };