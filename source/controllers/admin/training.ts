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
import notificationContainer from './../notifications';

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

const NAMESPACE = 'Trainings';

const getTrainings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Trainings');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
            let searchString = req.body.searchString ? req.body.searchString : "";
            let categoryIds;
            if (req.body.categoryIds && req.body.categoryIds.length > 0) {
                for (let index = 0; index < req.body.categoryIds.length; index++) {
                    if (index == 0) {
                        categoryIds = req.body.categoryIds[index];
                    }
                    else
                        categoryIds = categoryIds + "," + req.body.categoryIds[index];
                }
            }

            categoryIds = categoryIds ? categoryIds : "";
            let sql = `CALL adminGetTrainings(` + startIndex + `,` + fetchRecord + `,'` + searchString + `','` + categoryIds + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0]) {
                    let successResult = new ResultSuccess(200, true, 'Get Training Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "training.getTrainings() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'training.getTrainings() Exception', error, '');
        next(errorResult);
    }
};

const insertTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Training');
        var requiredFields = ['title', 'trainingCategoryId', 'url', 'documentType'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                req.body.trainingSubCategoryId = req.body.trainingSubCategoryId ? req.body.trainingSubCategoryId : 0
                req.body.assignRole = req.body.assignRole && req.body.assignRole.length > 0 ? req.body.assignRole.toString() : '';
                let result;

                let ids;
                let assignUserIds = await query(`SELECT partners.id FROM partners INNER JOIN userroles ON userroles.userId = partners.userId WHERE userroles.roleId IN (` + req.body.assignRole + `)`);

                if (assignUserIds && assignUserIds.length > 0) {

                    for (let index = 0; index < assignUserIds.length; index++) {
                        if (index == 0) {
                            ids = assignUserIds[index].id;
                        }
                        else
                            ids = ids + "," + assignUserIds[index].id;
                    }

                }
                else {
                    ids = '';
                }

                if (req.body.url) {
                    if (req.body.documentType == "webLink") {
                        req.body.fileName = req.body.fileName ? req.body.fileName : "";

                        let sql = `CALL adminInsertTraining('` + req.body.title + `','` + req.body.url + `',` + req.body.trainingCategoryId + `,` + currentUser.id + `,'` + req.body.fileName + `','` + req.body.documentType + `',` + req.body.trainingSubCategoryId + `,'` + ids + `','` + req.body.trainingStatus + `','` + req.body.assignRole + `',` + req.body.completionTime + `)`;
                        console.log(sql);

                        result = await query(sql);
                        if (result && result.affectedRows >= 0) {
                            let trainingId = result[0].trainingId;
                            //#region Notification
                            if (assignUserIds && assignUserIds.length > 0) {
                                for (let i = 0; i < assignUserIds.length; i++) {
                                    let partnerFcm = "";
                                    let partnerUserId = null;

                                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + assignUserIds[i].id;
                                    let partnerUserIdResult = await query(partnerUserIdSql);
                                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                        partnerUserId = partnerUserIdResult[0].userId;
                                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                        let partnerFcmResult = await query(partnerFcmSql);
                                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                                            partnerFcm = partnerFcmResult[0].fcmToken;
                                        }
                                    }

                                    let title = "Assign Training";
                                    let description = "Assign Training";
                                    var dataBody = {
                                        type: 5,
                                        id: trainingId,
                                        title: title,
                                        message: description,
                                        json: null,
                                        dateTime: null,
                                        customerLoanId: null,
                                        loanType: null,
                                        creditCardId: null,
                                        creditCardStatus: null
                                    }

                                    if (partnerFcm) {
                                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                            VALUES(`+ partnerUserId + `, 6, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                        let notificationResult = await query(notificationSql);
                                        await notificationContainer.sendMultipleNotification([partnerFcm], 6, req.body.trainingId, title, description, '', null, null, null, null, null, null);
                                    }

                                }
                            }

                            //#endregion Notification
                            let successResult = new ResultSuccess(200, true, 'Training Inserted', result[0], 1);
                            return res.status(200).send(successResult);
                        }
                        else {
                            let errorResult = new ResultError(400, true, "Error While Inserting Training", result, '');
                            next(errorResult);
                        }

                    }
                    else {
                        let contentType;
                        let fileExt;
                        contentType = req.body.documentType
                        if (contentType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                            fileExt = "docx"
                        else if (contentType == "text/plain")
                            fileExt = "txt"
                        else if (contentType == "application/msword")
                            fileExt = "doc"
                        else if (contentType == "application/vnd.ms-powerpoint")
                            fileExt = "ppt"
                        else if (contentType == "application/vnd.openxmlformats-officedocument.presentationml.presentation")
                            fileExt = "pptx"
                        else
                            fileExt = contentType.split("/")[1].split("+")[0];
                        let buf = Buffer.from(req.body.url, 'base64');
                        let keyName = req.body.title.replace(" ", "_");
                        let params = {
                            Bucket: 'creditappadmintrainings',
                            Key: keyName + "_" + new Date().getTime() + "." + fileExt,
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


                            let sql = `CALL adminInsertTraining('` + req.body.title + `','` + data.Location + `',` + req.body.trainingCategoryId + `,` + currentUser.id + `,'` + req.body.fileName + `','` + fileExt + `',` + req.body.trainingSubCategoryId + `,'` + ids + `','` + req.body.trainingStatus + `','` + req.body.assignRole + `',` + req.body.completionTime + `)`;
                            result = await query(sql);
                            if (result && result[0][0].trainingId >= 0) {
                                let trainingId = result[0][0].trainingId;
                                //#region Notification
                                if (assignUserIds && assignUserIds.length > 0) {
                                    for (let i = 0; i < assignUserIds.length; i++) {
                                        let partnerFcm = "";
                                        let partnerUserId = null;

                                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + assignUserIds[i].id;
                                        let partnerUserIdResult = await query(partnerUserIdSql);
                                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                            partnerUserId = partnerUserIdResult[0].userId;
                                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                            let partnerFcmResult = await query(partnerFcmSql);
                                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                                partnerFcm = partnerFcmResult[0].fcmToken;
                                            }
                                        }

                                        let title = "Assign Training";
                                        let description = "Assign Training";
                                        var dataBody = {
                                            type: 5,
                                            id: trainingId,
                                            title: title,
                                            message: description,
                                            json: null,
                                            dateTime: null,
                                            customerLoanId: null,
                                            loanType: null,
                                            creditCardId: null,
                                            creditCardStatus: null
                                        }

                                        if (partnerFcm) {
                                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                                VALUES(`+ partnerUserId + `, 6, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                            let notificationResult = await query(notificationSql);
                                            await notificationContainer.sendMultipleNotification([partnerFcm], 6, req.body.trainingId, title, description, '', null, null, null, null, null, null);
                                        }

                                    }
                                }

                                //#endregion Notification
                                let successResult = new ResultSuccess(200, true, 'Training Inserted', result[0], 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new ResultError(400, true, "Error While Inserting Training", result, '');
                                next(errorResult);
                            }
                        });

                    }


                } else {
                    let errorResult = new ResultError(400, true, "Error While Inserting Training", result, '');
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
        let errorResult = new ResultError(500, true, 'Training.insertTraining() Exception', error, '');
        next(errorResult);
    }
};

const updateTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Training');
        var requiredFields = ['title', 'trainingCategoryId', 'url'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.trainingSubCategoryId = req.body.trainingSubCategoryId ? req.body.trainingSubCategoryId : 0
                req.body.fileName = req.body.fileName ? req.body.fileName : "";
                let currentUser = authorizationResult.currentUser;
                req.body.assignRole = req.body.assignRole && req.body.assignRole.length > 0 ? req.body.assignRole.toString() : '';
                req.body.completionTime = req.body.completionTime ? req.body.completionTime : null
                let assignUserIds = await query(`SELECT partners.id FROM partners INNER JOIN userroles ON userroles.userId = partners.userId WHERE userroles.roleId IN (` + req.body.assignRole + `)`);
                let result;
                let ids;
                if (assignUserIds && assignUserIds.length > 0) {

                    for (let index = 0; index < assignUserIds.length; index++) {
                        if (index == 0) {
                            ids = assignUserIds[index].id;
                        }
                        else
                            ids = ids + "," + assignUserIds[index].id;
                    }

                }
                else {
                    assignUserIds = '';
                }
                if (req.body.documentType == "webLink") {
                    let sql = `CALL adminUpdateTraining(` + req.body.id + `,'` + req.body.title + `','` + req.body.url + `',` + req.body.trainingCategoryId + `,` + currentUser.id + `,'` + req.body.fileName + `','` + req.body.documentType + `',` + req.body.trainingSubCategoryId + `,'` + ids + `','` + req.body.trainingStatus + `','` + req.body.assignRole + `',` + req.body.completionTime + `)`;
                    console.log(sql);
                    result = await query(sql);

                }
                else {
                    if (req.body.url.includes("https:")) {
                        try {
                            let sql = `CALL adminUpdateTraining(` + req.body.id + `,'` + req.body.title + `','` + req.body.url + `',` + req.body.trainingCategoryId + `,` + currentUser.id + `,'` + req.body.fileName + `','` + req.body.documentType + `',` + req.body.trainingSubCategoryId + `,'` + ids + `','` + req.body.trainingStatus + `','` + req.body.assignRole + `',` + req.body.completionTime + `)`;
                            console.log(sql);
                            result = await query(sql);

                        }
                        catch (error) {
                            let errorResult = new ResultError(500, true, 'Training.updateTraining() Exception', error, '');
                            next(errorResult);
                        }
                    } else {
                        let checkUrlSql = `SELECT url from trainings WHERE id = ` + req.body.id;
                        let checkUrlResult = await query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0) {
                            if (checkUrlResult[0].url) {
                                let splt = checkUrlResult[0].url.split("/");
                                const delResp = await S3.deleteObject({
                                    Bucket: 'creditappadmintrainings',
                                    Key: splt[splt.length - 1],
                                }, async (err, data) => {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    } else {
                                        try {
                                            let buf = Buffer.from(req.body.url, 'base64');
                                            let contentType;
                                            let fileExt;
                                            contentType = req.body.awsDocumentType
                                            if (contentType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                                                fileExt = "docx"
                                            else if (contentType == "text/plain")
                                                fileExt = "txt"
                                            else if (contentType == "application/msword")
                                                fileExt = "doc"
                                            else if (contentType == "application/vnd.ms-powerpoint")
                                                fileExt = "ppt"
                                            else if (contentType == "application/vnd.openxmlformats-officedocument.presentationml.presentation")
                                                fileExt = "pptx"
                                            else
                                                fileExt = contentType.split("/")[1].split("+")[0];
                                            let isErr = false;

                                            let keyName = req.body.title.replace(" ", "_");

                                            let params = {
                                                Bucket: 'creditappadmintrainings',
                                                Key: keyName + "_" + req.body.id + "_" + new Date().getTime() + "." + fileExt,
                                                Body: buf,
                                                ContentEncoding: 'base64',
                                                ContentType: contentType,
                                                ACL: 'public-read'
                                            };
                                            await S3.upload(params, async (error, data) => {
                                                if (error) {
                                                    isErr = true;
                                                    let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                                    next(errorResult);
                                                    return;
                                                }

                                                console.log(data);
                                                let sql = `CALL adminUpdateTraining(` + req.body.id + `,'` + req.body.title + `','` + data.Location + `',` + req.body.trainingCategoryId + `,` + currentUser.id + `,'` + req.body.fileName + `','` + fileExt + `',` + req.body.trainingSubCategoryId + `,'` + ids + `','` + req.body.trainingStatus + `','` + req.body.assignRole + `',` + req.body.completionTime + `)`;
                                                console.log(sql);
                                                let result = await query(sql);
                                                if (result && result.affectedRows >= 0) {
                                                    console.log(result);
                                                    let successResult = new ResultSuccess(200, true, 'Training Updated', result[0], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                } else {
                                                    let errorResult = new ResultError(400, true, "Training Not Updated", result, '');
                                                    next(errorResult);
                                                }
                                            });
                                        }
                                        catch (error) {
                                            let errorResult = new ResultError(500, true, 'Training.updateTrainig() Exception', error, '');
                                            next(errorResult);
                                        }
                                    }
                                });
                            } else {
                                let buf = Buffer.from(req.body.url, 'base64');
                                let contentType;
                                let fileExt;
                                contentType = req.body.awsDocumentType
                                if (contentType == "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                                    fileExt = "docx"
                                else if (contentType == "text/plain")
                                    fileExt = "txt"
                                else if (contentType == "application/msword")
                                    fileExt = "doc"
                                else if (contentType == "application/vnd.ms-powerpoint")
                                    fileExt = "ppt"
                                else if (contentType == "application/vnd.openxmlformats-officedocument.presentationml.presentation")
                                    fileExt = "pptx"
                                else
                                    fileExt = contentType.split("/")[1].split("+")[0];
                                let isErr = false;
                                let keyName = req.body.title.replace(" ", "_");
                                let params = {
                                    Bucket: 'creditappadmintrainings',
                                    Key: keyName + "_" + req.body.id + "_" + new Date().getTime() + "." + fileExt,
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: contentType,
                                    ACL: 'public-read'
                                };
                                await S3.upload(params, async (error, data) => {
                                    if (error) {
                                        isErr = true;
                                        let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                        next(errorResult);
                                        return;
                                    }
                                    console.log(data);
                                    try {
                                        let sql = `CALL adminUpdateTraining(` + req.body.id + `,'` + req.body.title + `','` + data.Location + `',` + req.body.trainingCategoryId + `,` + currentUser.id + `,'` + req.body.fileName + `','` + fileExt + `',` + req.body.trainingSubCategoryId + `,'` + ids + `','` + req.body.trainingStatus + `','` + req.body.assignRole + `',` + req.body.completionTime + `)`;
                                        console.log(sql);
                                        let result = await query(sql);
                                        if (result && result.affectedRows >= 0) {
                                            console.log(result);
                                            let successResult = new ResultSuccess(200, true, 'Training Updated', result[0], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        } else {
                                            let errorResult = new ResultError(400, true, "Training Not Updated", result, '');
                                            next(errorResult);
                                        }
                                    }
                                    catch (error) {
                                        let errorResult = new ResultError(500, true, 'Training.updateTraining() Exception', error, '');
                                        next(errorResult);
                                    }
                                });
                            }
                        }
                    }
                }
                if (result && result.affectedRows >= 0) {
                    if (assignUserIds && assignUserIds.length > 0) {
                        for (let i = 0; i < assignUserIds.length; i++) {
                            let partnerFcm = "";
                            let partnerUserId = null;

                            let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + assignUserIds[i].id;
                            let partnerUserIdResult = await query(partnerUserIdSql);
                            if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                partnerUserId = partnerUserIdResult[0].userId;
                                let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                let partnerFcmResult = await query(partnerFcmSql);
                                if (partnerFcmResult && partnerFcmResult.length > 0) {
                                    partnerFcm = partnerFcmResult[0].fcmToken;
                                }
                            }

                            let title = "Assign Training";
                            let description = "Assign Training";
                            var dataBody = {
                                type: 5,
                                id: req.body.trainingId,
                                title: title,
                                message: description,
                                json: null,
                                dateTime: null,
                                customerLoanId: null,
                                loanType: null,
                                creditCardId: null,
                                creditCardStatus: null
                            }

                            if (partnerFcm) {
                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                VALUES(`+ partnerUserId + `, 6, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                let notificationResult = await query(notificationSql);
                                await notificationContainer.sendMultipleNotification([partnerFcm], 6, req.body.trainingId, title, description, '', null, null, null, null, null, null);
                            }

                        }
                    }
                    let successResult = new ResultSuccess(200, true, 'Training Updated', result[0], 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "Training Not Updated", result, '');
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
        let errorResult = new ResultError(500, true, 'training.UpdateTraining() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Training');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;

                let sql = `CALL adminActiveInactiveTraining(` + id + `,` + currentUser.id + `)`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Training', result, 1);
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
        let errorResult = new ResultError(500, true, 'training.activeInactiveTraining() Exception', error, '');
        next(errorResult);
    }
};

const removeTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Delete Training');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;

                let sql = `CALL adminRemoveTraining(` + id + `)`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Remove Training', result, 1);
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
        let errorResult = new ResultError(500, true, 'training.removeTraining() Exception', error, '');
        next(errorResult);
    }
};

const insertAssignTraining = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Training Assign Users');
        var requiredFields = ['trainingId', 'assignUserIds', 'trainingStatus'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {

                let partnerIds = req.body.assignUserIds;
                if (req.body.assignUserIds && req.body.assignUserIds.length > 0) {
                    let assignUserIds;
                    for (let index = 0; index < req.body.assignUserIds.length; index++) {
                        if (index == 0) {
                            assignUserIds = req.body.assignUserIds[index];
                        }
                        else
                            assignUserIds = assignUserIds + "," + req.body.assignUserIds[index];
                    }
                    req.body.assignUserIds = assignUserIds
                }
                let sql = `CALL adminInsertTrainingAssignUsers(` + req.body.trainingId + `,'` + req.body.assignUserIds + `',` + authorizationResult.currentUser.id + `,'` + req.body.trainingStatus + `')`;
                let result = await query(sql);
                let successResult;
                if (result && result.affectedRows > 0) {
                    //#region Notification
                    if (partnerIds && partnerIds.length > 0) {
                        for (let i = 0; i < partnerIds.length; i++) {
                            let partnerFcm = "";
                            let partnerUserId = null;

                            let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + partnerIds[i];
                            let partnerUserIdResult = await query(partnerUserIdSql);
                            if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                partnerUserId = partnerUserIdResult[0].userId;
                                let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                let partnerFcmResult = await query(partnerFcmSql);
                                if (partnerFcmResult && partnerFcmResult.length > 0) {
                                    partnerFcm = partnerFcmResult[0].fcmToken;
                                }
                            }

                            let title = "Assign Training";
                            let description = "Assign Training";
                            var dataBody = {
                                type: 5,
                                id: req.body.trainingId,
                                title: title,
                                message: description,
                                json: null,
                                dateTime: null,
                                customerLoanId: null,
                                loanType: null,
                                creditCardId: null,
                                creditCardStatus: null
                            }

                            if (partnerFcm) {
                                let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                VALUES(`+ partnerUserId + `, 6, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                let notificationResult = await query(notificationSql);
                                await notificationContainer.sendMultipleNotification([partnerFcm], 6, req.body.trainingId, title, description, '', null, null, null, null, null, null);
                            }

                        }
                    }

                    //#endregion Notification
                    successResult = new ResultSuccess(200, true, 'Training Assing User Inserted', result[0], 1);
                    console.log(successResult);

                } else {
                    let errorResult = new ResultError(400, true, "Error While Inserting Training Assign User", result, '');
                    next(errorResult);
                }

                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'Training.insertTrainingAssignUsers() Exception', error, '');
        next(errorResult);
    }
};

const getAssignTrainingUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Trainings Assing Users');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
            let roleIds = req.body.roleIds && req.body.roleIds.length > 0 ? req.body.roleIds.toString() : '';
            let sql = `CALL adminGetTrainingAssignUsers(` + startIndex + `,` + fetchRecord + `,` + req.body.trainingId + `,'` + roleIds + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0]) {
                    let successResult = new ResultSuccess(200, true, 'Get Training Assing User Successfully', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "training.getTrainingAssignUsers() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'training.getTrainingAssignUsers() Exception', error, '');
        next(errorResult);
    }
};

export default { getTrainings, insertTraining, updateTraining, activeInactiveTraining, removeTraining, insertAssignTraining, getAssignTrainingUsers };