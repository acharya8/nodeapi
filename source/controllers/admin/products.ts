import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

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

const NAMESPACE = 'Product';

const inserUpdateProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Products');
        var requiredFields = ['name', 'imageUrl', 'coin'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                req.body.description = req.body.description ? req.body.description : ''
                if (req.body.id) {
                    //Update
                    if (req.body.imageUrl && req.body.imageUrl.includes("https:")) {
                        let sql = "CALL adminInsertUpdateProducts(" + req.body.id + ",'" + req.body.name + "','" + req.body.description + "','" + req.body.imageUrl + "'," + req.body.coin + ",'" + req.body.duration + "'," + authorizationResult.currentUser.id + ")";
                        let result = await query(sql);

                        if (result && result.affectedRows >= 0) {
                            let successResult = new ResultSuccess(200, true, 'Insert/Update Product', result, 1);
                            return res.status(200).send(successResult);
                        } else {
                            let errorResult = new ResultError(400, true, "Error While Insert/Update Product", result, '');
                            next(errorResult);
                        }
                    } else {
                        let buf = Buffer.from(req.body.imageUrl, 'base64');
                        let keyName = req.body.name.replace(" ", "_");
                        let params = {
                            Bucket: 'creditapp-gift-product',
                            Key: keyName + "_" + new Date().getTime() + ".jpg",
                            Body: buf,
                            ContentEncoding: 'base64',
                            ContentType: 'image/jpeg',
                            ACL: 'public-read'
                        };
                        await S3.upload(params, async (error, data) => {
                            if (error) {
                                let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                next(errorResult);
                                return;
                            }
                            console.log(data);
                            let sql = "CALL adminInsertUpdateProducts(" + req.body.id + ",'" + req.body.name + "','" + req.body.description + "','" + data.Location + "'," + req.body.coin + ",'" + req.body.duration + "'," + authorizationResult.currentUser.id + ")";
                            let result = await query(sql);

                            if (result && result.affectedRows >= 0) {
                                let successResult = new ResultSuccess(200, true, 'Insert/Update Product', result, 1);
                                return res.status(200).send(successResult);
                            } else {
                                let errorResult = new ResultError(400, true, "Error While Insert/Update Product", result, '');
                                next(errorResult);
                            }
                        });
                    }
                } else {
                    //Insert
                    let buf = Buffer.from(req.body.imageUrl, 'base64');
                    let keyName = req.body.name.replace(" ", "_");
                    let params = {
                        Bucket: 'creditapp-gift-product',
                        Key: keyName + "_" + new Date().getTime() + ".jpg",
                        Body: buf,
                        ContentEncoding: 'base64',
                        ContentType: 'image/jpeg',
                        ACL: 'public-read'
                    };
                    await S3.upload(params, async (error, data) => {
                        if (error) {
                            let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                            next(errorResult);
                            return;
                        }
                        console.log(data);
                        try {
                            let sql = "CALL adminInsertUpdateProducts(0,'" + req.body.name + "','" + req.body.description + "','" + data.Location + "'," + req.body.coin + ",'" + req.body.duration + "'," + authorizationResult.currentUser.id + ")";
                            let result = await query(sql);

                            if (result && result.affectedRows >= 0) {

                                let successResult = new ResultSuccess(200, true, 'Insert/Update Product', result, 1);
                                return res.status(200).send(successResult);
                            } else {
                                let errorResult = new ResultError(400, true, "Error While Insert/Update Product", result, '');
                                next(errorResult);
                            }
                        } catch (error) {
                            let errorResult = new ResultError(500, true, 'products.inserUpdateProducts() Exception', error, '');
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
        let errorResult = new ResultError(500, true, 'products.inserUpdateProducts() Exception', error, '');
        next(errorResult);
    }
};

const getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Products');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let searchString = req.body.searchString ? req.body.searchString : "";
                let minCoin = req.body.minCoin ? req.body.minCoin : 0;
                let maxCoin = req.body.maxCoin ? req.body.maxCoin : 0;

                let sql = "CALL adminGetProduct(" + startIndex + "," + fetchRecords + ",'" + searchString + "'," + minCoin + "," + maxCoin + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[1] && result[1].length >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Products Successfully', result[1], result[0][0].totalCount);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "products.getProducts() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'products.getProducts() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active/InactiveProducts Products');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {

                let sql = `CALL adminProductActiveInactive(` + req.body.id + `,` + authorizationResult.currentUser.id + `);`;
                console.log(sql);
                var result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Active/InactiveProducts Products', result, 1);
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
        let errorResult = new ResultError(500, true, 'products.activeInactiveProducts() Exception', error, '');
        next(errorResult);
    }
};

export default { inserUpdateProducts, getProducts, activeInactiveProducts }