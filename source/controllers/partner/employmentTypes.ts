import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { employmentTypesReponse } from '../../classes/output/customer/employementTypesResponse';

var connection = mysql.createConnection({
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.pass,
    database: config.mysql.database
});

const S3 = new AWS.S3({
    accessKeyId: config.s3bucket.aws_Id,
    secretAccessKey: config.s3bucket.aws_secret
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Employment Types';

const getEmploymentTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Employment Types');
        let sql = `CALL dsaBazarGetEmploymentTypes();`;
        console.log(sql);
        var result = await query(sql);
        console.log(JSON.stringify(result));
        if (result[0] && result[0].length > 0) {
            let employmentTypes = result[0];
            let parentObj = [];
            for (let i = 0; i < employmentTypes.length; i++) {
                if (employmentTypes[i] && employmentTypes[i].parentId) {
                    let childObj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].id, employmentTypes[i].name, null);
                    if (parentObj && parentObj.length > 0) {
                        let ind = parentObj.findIndex(c => c.id == employmentTypes[i].parentId);
                        if (ind >= 0) {
                            parentObj[ind].child.push(childObj);
                        } else {
                            let obj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].parentId, employmentTypes[i].parentTypeName, [childObj]);
                            parentObj.push(obj);
                        }
                    } else {
                        let obj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].parentId, employmentTypes[i].parentTypeName, [childObj]);
                        parentObj.push(obj);
                    }
                } else {
                    let obj: employmentTypesReponse = new employmentTypesReponse(employmentTypes[i].id, employmentTypes[i].name, []);
                    parentObj.push(obj);
                }
            }
            let successResult = new ResultSuccess(200, true, 'Get Employment Types', parentObj, parentObj.length,);
            console.log(successResult);
            return res.status(200).send(successResult);


        } else {
            let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'employmentTypes.getEmploymentTypes()', error, '');
        next(errorResult);
    }
}

export default { getEmploymentTypes };