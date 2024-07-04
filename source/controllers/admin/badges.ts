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

const NAMESPACE = 'Badges';

const getBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Badges');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0
            let sql = `CALL adminGetBadges(` + startIndex + `,` + fetchRecord + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Badges Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                } else if (result[0] && result[0][0].totalCount == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Badges Successfully', [], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "badges.getBadges() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'badges.getBadges() Exception', error, '');
        next(errorResult);
    }
};

const insertBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Badges');
        let requiredFields = ['name'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let sql = `CALL adminInsertBadges('` + req.body.name + `',` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert Badges', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "badges.insertBadges() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new ResultError(500, true, 'badges.insertBadges() Exception', error, '');
        next(errorResult);
    }
};

const updateBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating Badges');
        let requiredFields = ['id', 'name'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                let sql = `CALL adminUpdateBadges(` + id + `,'` + req.body.name + `',` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0][0].nameExist == 1) {
                        let errorResult = new ResultError(400, true, "", new Error("Name Already Exist"), '');
                        next(errorResult);
                    }
                }
                else if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Update Badges', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "badges.updateBadges() Error", new Error('Error While Updating Data'), '');
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
        let errorResult = new ResultError(500, true, 'badges.updateBadges() Exception', error, '');
        next(errorResult);
    }
};

const activeInActiveBadges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Active Inactive Badges');
        let requiredFields = ['id'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;

                let sql = `CALL adminActiveInactiveBadges(` + id + `,` + userId + `);`;
                console.log(sql);
                let result = await query(sql);
                let successResult = new ResultSuccess(200, true, 'Update Badges', result, 1);
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
        let errorResult = new ResultError(500, true, 'badges.activeInActiveBadges() Exception', error, '');
        next(errorResult);
    }
};

const updatePartnerBadge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Update Partner Badges');
        let requiredFields = ['partnerId', 'badgeId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let partnerId = req.body.partnerId;
                let badgeId = req.body.badgeId;

                let sql = "INSERT INTO partnerbadges(partnerId, badgeId, createdBy, modifiedBy) VALUES(" + partnerId + "," + badgeId + "," + userId + "," + userId + ");";
                let result = await query(sql);
                if (result && result.insertId > 0) {
                    let updateSql = "UPDATE partners SET currentBadgeId = " + badgeId + " WHERE id = " + partnerId;
                    let updateResult = await query(updateSql);
                    if (updateResult && updateResult.affectedRows >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Update Partner Badges', result, 1);
                        return res.status(200).send(successResult);
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
        let errorResult = new ResultError(500, true, 'badges.updatePartnerBadge() Exception', error, '');
        next(errorResult);
    }
};

export default { getBadges, insertBadges, updateBadges, activeInActiveBadges, updatePartnerBadge };