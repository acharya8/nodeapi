import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

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

const NAMESPACE = 'Faqs';


const getFaqs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `SELECT * FROM faqs WHERE faqType = 2  LIMIT ` + fetchRecords + ` OFFSET ` + startIndex;
                let result = await query(sql);

                if (result && result.length > 0) {

                    let successResult = new ResultSuccess(200, true, 'Get Faqs', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);

                } else {
                    let successResult = new ResultSuccess(200, true, 'Get Faqs', [], 1);
                    console.log(successResult);
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
        let errorResult = new ResultError(500, true, 'loans.getFaqs()', error, '');
        next(errorResult);
    }
};


const getFaqCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Faqs Category');
        let sql = `CALL getFaqCategories();`;
        console.log(sql);
        var result = await query(sql);
        console.log(JSON.stringify(result));
        if (result && result.length > 0) {
            if (result[0].length >= 0) {
                let successResult = new ResultSuccess(200, true, 'Get Faqs Category', result[0], result[0].length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
        } else {
            let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'faqs.getFaqsCategory()', error, '');
        next(errorResult);
    }
}



const getFaqsByCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['faqCategoryId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let faqCategoryId = req.body.faqCategoryId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `SELECT * FROM faqs WHERE faqType = 2 AND faqCategoryId = ` + req.body.faqCategoryId + `  LIMIT ` + fetchRecords + ` OFFSET ` + startIndex;
                let result = await query(sql);

                if (result && result.length > 0) {

                    let successResult = new ResultSuccess(200, true, 'Get Faqs By Categories', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);

                } else {
                    let successResult = new ResultSuccess(200, true, 'Get Faqs By Categories', [], 1);
                    console.log(successResult);
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
        let errorResult = new ResultError(500, true, 'faqs.getFaqsByCategories()', error, '');
        next(errorResult);
    }
};

export default { getFaqs, getFaqCategories, getFaqsByCategories }