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

const NAMESPACE = 'Faqs';

const getFaqCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting FAQ Category');
        let requiredFields = [''];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;

                let startIndexFaqs = req.body.startIndexFaqs ? req.body.startIndexFaqs : 0;
                let fetchRecordFaqs = req.body.fetchRecordFaqs ? req.body.fetchRecordFaqs : 0;

                let sql = `CALL adminGetFaqCategories(` + startIndex + `,` + fetchRecord + `);`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0][0].totalCount > 0) {
                        for (let i = 0; i < result[1].length; i++) {
                            let faqSql = `CALL adminGetFaqs(` + result[1][i].id + `,` + startIndexFaqs + `,` + fetchRecordFaqs + `);`;
                            let faqResult = await query(faqSql);
                            if (faqResult && faqResult.length > 0) {
                                result[1][i].faqTotalRecord = faqResult[0][0].totalCount
                                result[1][i].faqs = faqResult[1];
                            }
                        }
                        let successResult = new ResultSuccess(200, true, 'Getting FAQ Category Successfully', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    } else if (result[1]) {
                        let successResult = new ResultSuccess(200, true, 'Getting FAQ Category Successfully', [], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "faqs.getFaqCategories() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'faqs.getFaqCategories() Exception', error, '');
        next(errorResult);
    }
};

const insertUpdateFaqCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Faq Category');
        let requiredFields = ['categoryName'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let categoryId = req.body.categoryId ? req.body.categoryId : 0;
                let categoryName = req.body.categoryName;
                let sql = `CALL adminInsertUpdateFaqCategories(` + categoryId + `,'` + categoryName + `',` + currentUser.id + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Status Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'InsertUpdate FAQ Category', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "faqs.insertUpdateFaqCategories() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'faqs.insertUpdateFaqCategories() Exception', error, '');
        next(errorResult);
    }
};

const getFaqs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting FAQs');
        let requiredFields = ['faqCategoryId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let faqCategoryId = req.body.faqCategoryId;

                let sql = `CALL adminGetFaqs(` + faqCategoryId + `,` + startIndex + `,` + fetchRecord + `);`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0][0].totalCount > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting FAQs Successfully', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    } else if (result[1]) {
                        let successResult = new ResultSuccess(200, true, 'Getting FAQs Successfully', [], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "faqs.getFaqs() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'faqs.getFaqs() Exception', error, '');
        next(errorResult);
    }
};

const insertUpdateFaqs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting FAQs');
        let requiredFields = ['faqType', 'faqCategoryId', 'question', 'answer'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id ? req.body.id : 0;
                let faqType = req.body.faqType;
                let faqCategoryId = req.body.faqCategoryId;
                let question = req.body.question;
                let answer = req.body.answer;
                let sql = `CALL adminInsertUpdateFaq(` + id + `,` + faqType + `,` + faqCategoryId + `,'` + question + `','` + answer + `',` + currentUser.id + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Status Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'InsertUpdate FAQs', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "faqs.insertUpdateFaqs() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'faqs.insertUpdateFaqs() Exception', error, '');
        next(errorResult);
    }
};

const getFaqType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting FAQ Type');
        let requiredFields = [''];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;

                let sql = `CALL adminGetFaqType();`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting FAQ Type Successfully', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "faqs.getFaqType() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'faqs.getFaqType() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveFaqs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive FAQs');
        let requiredFields = ['id', 'isActive'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let isActive = req.body.isActive;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveFaqs(` + id + `,` + userId + `,` + isActive + `);`;
                console.log(sql);
                let result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Faqs Status', result, 1);
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
        let errorResult = new ResultError(500, true, 'faqs.activeInactiveFaqs() Exception', error, '');
        next(errorResult);
    }
};

const activeInactiveFaqsCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive FAQs');
        let requiredFields = ['id', 'isActive'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let isActive = req.body.isActive;
                let userId = currentUser.id;

                let sql = `CALL activeInactiveFaqsCategories(` + id + `,` + userId + `,` + isActive + `);`;
                console.log(sql);
                let result = await query(sql);

                let resultsql = `select * from faqcategories where id =` + id;
                let ress = await query(resultsql)
                console.log(ress)

                let successResult = new ResultSuccess(200, true, 'Update faqs Category Status', result, 1);
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
        let errorResult = new ResultError(500, true, 'faqs.activeInactiveFaqsCategories() Exception', error, '');
        next(errorResult);
    }
};

export default { getFaqCategories, insertUpdateFaqCategories, getFaqs, insertUpdateFaqs, getFaqType, activeInactiveFaqs, activeInactiveFaqsCategories }