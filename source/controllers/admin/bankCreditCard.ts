import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
const AWS = require('aws-sdk');

let connection = mysql.createConnection({
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

const NAMESPACE = 'Bank Credit Card';

const insertUpdateBankCreditCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting/Updating Bank Credit Card');
        let requiredFields = ['bankId', 'creditCardName', 'benifitDescription', 'keyFeatures', 'creditCardUrl', 'joiningfee', 'renualfee'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let bankId = req.body.bankId;
                let creditCardName = req.body.creditCardName;
                let benifitDescription = req.body.benifitDescription;
                let keyFeatures = req.body.keyFeatures;
                let id = req.body.id ? req.body.id : null;
                if (req.body.creditCardUrl.includes("https:")) {
                    let sql = "CALL adminInsertUpdateCreditCard(" + id + "," + bankId + ",'" + creditCardName + "','" + benifitDescription + "','" + keyFeatures + "'," + req.body.renualfee + "," + req.body.joiningfee + ",'" + req.body.creditCardUrl + "'," + currentUser.id + ")";
                    let result = await query(sql);
                    if (result && result.affectedRows > 0) {
                        let successResult = new ResultSuccess(200, true, 'Bank CreditCard Inserted', result, 1);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Error While Inserting Bank Credit Card", result, '');
                        next(errorResult);
                    }
                } else {
                    let contentType;
                    contentType = 'image/jpeg';
                    let fileExt = contentType.split("/")[1].split("+")[0];
                    let buf = Buffer.from(req.body.creditCardUrl, 'base64');
                    let keyName = req.body.creditCardName;
                    let params = {
                        Bucket: 'creditappcreditcardimage',
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
                        let sql = "CALL adminInsertUpdateCreditCard(" + id + "," + bankId + ",'" + creditCardName + "','" + benifitDescription + "','" + keyFeatures + "'," + req.body.renualfee + "," + req.body.joiningfee + ",'" + data.Location + "'," + currentUser.id + ")";
                        let result = await query(sql);
                        if (result && result.affectedRows >= 0) {
                            let successResult = new ResultSuccess(200, true, 'Bank CreditCard Inserted', result, 1);
                            return res.status(200).send(successResult);
                        } else {
                            let errorResult = new ResultError(400, true, "Error While Inserting Bank CreditCard", result, '');
                            next(errorResult);
                        }
                    });
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
        let errorResult = new ResultError(500, true, 'bankCreditCard.insertUpdateBankCreditCard() Exception', error, '');
        next(errorResult);
    }
}

const getBankCreditCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Bank Credit Card');
        let requiredFields = [];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let bankId = req.body.bankId ? req.body.bankId : null;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let sql = `CALL adminGetCreditCards(` + bankId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Bank Credit Card', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "bankCreditCard.getBankCreditCard() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'bankCreditCard.getBankCreditCard() Exception', error, '');
        next(errorResult);
    }
}


export default { insertUpdateBankCreditCard, getBankCreditCard }