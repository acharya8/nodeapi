import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
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

const S3 = new AWS.S3({
    accessKeyId: config.s3bucket.aws_Id,
    secretAccessKey: config.s3bucket.aws_secret
});

const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);

const NAMESPACE = 'Services';

const getServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Services');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0
            let sql = `CALL adminGetServices(` + startIndex + `,` + fetchRecords + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0][0].totalCount > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Services Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else if (result[0].totalCount == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Services Successfully', [], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "services.getServices() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'services.getServices() Exception', error, '');
        next(errorResult);
    }
};

const insertServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Services');
        var requiredFields = ['serviceTypeId', 'name', 'displayName', 'iconUrl'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let serviceTypeId = req.body.serviceTypeId;
                let name = req.body.name;
                let displayName = req.body.displayName;
                let description = req.body.description ? req.body.description : "";
                let colorCode = req.body.colorCode ? req.body.colorCode : "";
                let userId = currentUser.id;

                let imgSplit = req.body.iconUrl.split(',');
                let contentType = imgSplit[0].split(";")[0].split(":")[1];
                let fileExt = contentType.split("/")[1].split("+")[0];
                let buf = Buffer.from(imgSplit[1], 'base64');

                let params = {
                    Bucket: 'bank-services',
                    Key: displayName + "_" + new Date().getTime() + "." + fileExt,
                    Body: buf,
                    ContentEncoding: 'base64',
                    ContentType: contentType,
                    ACL: 'public-read'
                };
                await S3.upload(params, async (error, data) => {
                    if (error) {
                        let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                        next(errorResult);
                        return;
                    }
                    console.log(data);
                    let sql = `CALL adminInsertService(` + serviceTypeId + `,'` + name + `','` + displayName + `','` + description + `','` + data.Location + `','` + colorCode + `',` + userId + `);`;
                    console.log(sql);
                    var result = await query(sql);
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Insert Service', result[0], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                });
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'services.insertServices() Exception', error, '');
        next(errorResult);
    }
};

const updateServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Services');
        var requiredFields = ['id', 'serviceTypeId', 'name', 'displayName', 'iconUrl'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let serviceTypeId = req.body.serviceTypeId;
                let displayName = req.body.displayName;
                let description = req.body.description ? req.body.description : "";
                let colorCode = req.body.colorCode ? req.body.colorCode : "";
                let userId = currentUser.id;

                if (req.body.iconUrl.includes("https:")) {
                    let sql = `CALL adminUpdateService(` + id + `,` + serviceTypeId + `,'` + displayName + `','` + description + `','','` + colorCode + `',` + userId + `);`;
                    console.log(sql);
                    var result = await query(sql);
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Update Service', result[0], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let checkSql = `CALL adminCheckServiceImage(` + id + `)`;
                    let checkResult = await query(checkSql);
                    if (checkResult && checkResult.length > 0 && checkResult[0].length > 0 && checkResult[0][0].iconUrl) {
                        let splt = checkResult[0][0].iconUrl.split("/");
                        const delResp = await S3.deleteObject({
                            Bucket: 'bank-services',
                            Key: splt[splt.length - 1],
                        }, async (err, data) => {
                            if (err) {
                                console.log("Error: Object delete failed.");
                                let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                next(errorResult);
                            } else {
                                let imgSplit = req.body.iconUrl.split(',');
                                let contentType = imgSplit[0].split(";")[0].split(":")[1];
                                let fileExt = contentType.split("/")[1].split("+")[0];
                                let buf = Buffer.from(imgSplit[1], 'base64');
                                let params = {
                                    Bucket: 'bank-services',
                                    Key: displayName + "_" + new Date().getTime() + "." + fileExt,
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: contentType,
                                    ACL: 'public-read'
                                };
                                await S3.upload(params, async (error, data) => {
                                    if (error) {
                                        let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                        next(errorResult);
                                        return;
                                    }
                                    console.log(data);
                                    let sql = `CALL adminUpdateService(` + id + `,` + serviceTypeId + `,'` + displayName + `','` + description + `','` + data.Location + `','` + colorCode + `',` + userId + `);`;
                                    console.log(sql);
                                    var result = await query(sql);
                                    console.log(result);
                                    let successResult = new ResultSuccess(200, true, 'Update Service', result[0], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                });
                            }
                        });
                    } else {
                        let imgSplit = req.body.iconUrl.split(',');
                        let contentType = imgSplit[0].split(";")[0].split(":")[1];
                        let fileExt = contentType.split("/")[1].split("+")[0];
                        let buf = Buffer.from(imgSplit[1], 'base64');
                        let params = {
                            Bucket: 'bank-services',
                            Key: displayName + "_" + new Date().getTime() + "." + fileExt,
                            Body: buf,
                            ContentEncoding: 'base64',
                            ContentType: contentType,
                            ACL: 'public-read'
                        };
                        await S3.upload(params, async (error, data) => {
                            if (error) {
                                let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                next(errorResult);
                                return;
                            }
                            console.log(data);
                            let sql = `CALL adminUpdateService(` + id + `,` + serviceTypeId + `,'` + displayName + `','` + description + `','` + data.Location + `','` + colorCode + `',` + userId + `);`;
                            console.log(sql);
                            var result = await query(sql);
                            console.log(result);
                            let successResult = new ResultSuccess(200, true, 'Update Service', result[0], 1);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        });
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
        let errorResult = new ResultError(500, true, 'services.insertServices() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Services');
        var requiredFields = ['id', 'isActive'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let isActive = req.body.isActive;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveService(` + id + `,` + userId + `,` + isActive + `);`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Service Status', result, 1);
                return res.status(200).send(successResult);

            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'services.activeInactiveServices() Exception', error, '');
        next(errorResult);
    }
};

export default { getServices, insertServices, updateServices, activeInactiveServices };