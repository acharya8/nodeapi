import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

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

const NAMESPACE = 'Dashboard';

const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Dashboard');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetDashboard()`;
            let result = await query(sql);
            if (result && result.length > 0) {
                let successResult = new ResultSuccess(200, true, 'Get Dashboard Successfully', result, 1);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }

        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'dashboard.getDashboard() Exception', error, '');
        next(errorResult);
    }
};

const getPendingApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Pending Application');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetPendingApplication(` + req.body.startIndex + `,` + req.body.fetchRecords + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Get PendingApplication Successfully', result[1], result[0][0].totalPendingApplication);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }

        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'dashboard.getPendingApplication() Exception', error, '');
        next(errorResult);
    }
};

const getDisbursedApplication = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Disbursed Application');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetDisbursedApplication(` + req.body.startIndex + `,` + req.body.fetchRecords + `)`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Disbursed Application Successfully', result[1], result[0][0].totalDisbursedApplication);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }

        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'dashboard.getDisbursedApplication() Exception', error, '');
        next(errorResult);
    }
};

const getTop10Performer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Top10 Performer');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let partnerSql = "SELECT * FROM partners WHERE parentPartnerId IS NULL";
            let partnerResult = await query(partnerSql);
            if (partnerResult && partnerResult.length > 0) {
                for (let index = 0; index < partnerResult.length; index++) {
                    let subDsaCountSql = "SELECT COUNT(partners.id) as subDsaCount  FROM partnernetworks INNER JOIN partners ON partnernetworks.networkPartnerId = partners.id INNER JOIN userroles ON userroles.userId = partners.userId WHERE partnernetworks.partnerId = ? AND userroles.roleId = 4";
                    let subDsaCountResult = await query(subDsaCountSql, partnerResult[index].id)
                    let connectorCountSql = "SELECT COUNT(partners.id) as connectorCount  FROM partnernetworks INNER JOIN partners ON partnernetworks.networkPartnerId = partners.id INNER JOIN userroles ON userroles.userId = partners.userId WHERE partnernetworks.partnerId = 1 AND userroles.roleId = 6";
                    let connectorCountResult = await query(connectorCountSql, partnerResult[index].id)
                    let employeeCountSql = "SELECT COUNT(partners.id) as employeeCount  FROM partnerteams INNER JOIN partners ON partnerteams.teamPartnerId = partners.id INNER JOIN userroles ON userroles.userId = partners.userId WHERE partnerteams.partnerId = ? AND userroles.roleId = 5";
                    let employeeCountResult = await query(employeeCountSql, partnerResult[index].id)
                    partnerResult[index].subDsaCount = subDsaCountResult[0].subDsaCount
                    partnerResult[index].connectorCount = connectorCountResult[0].connectorCount
                    partnerResult[index].employeeCount = employeeCountResult[0].employeeCount
                    let pendingApplicationCountSql = "SELECT COUNT(customerloans.id) as pendingApplication FROM customerloans WHERE createdBy = ? OR createdBy IN (SELECT partners.userId FROM partners WHERE partners.parentPartnerId = " + partnerResult[index].id + ") AND statusId IS NULL";
                    let pendingApplicationresult = await query(pendingApplicationCountSql, partnerResult[index].userId)
                    let sucessApplicationCountSql = "SELECT COUNT(customerloans.id) as successApplicationCount FROM customerloans WHERE createdBy = ? OR createdBy IN (SELECT partners.userId FROM partners WHERE partners.parentPartnerId = " + partnerResult[index].id + " ) AND statusId IS NOT NULL";
                    let sucessApplicationCountResult = await query(sucessApplicationCountSql, partnerResult[index].userId);
                    partnerResult[index].pendingApplicationCount = pendingApplicationresult[0].pendingApplication
                    partnerResult[index].successApplicationCount = sucessApplicationCountResult[0].successApplicationCount
                    let trainingAssignQuery = " SELECT COUNT(id) as totalAssignTraining FROM assignuserstraining WHERE partnerId = ? OR partnerId IN (SELECT partnerId FROM assignuserstraining INNER JOIN partners ON partners.id = assignuserstraining.partnerId WHERE partners.parentPartnerId = " + partnerResult[index].id + ") AND assignuserstraining.trainingStatus = 'Pending'";
                    let trainingAssignresult = await query(trainingAssignQuery, partnerResult[index].id)
                    let trainingCompleteQuery = " SELECT COUNT(id) as totalCompleteTraining FROM assignuserstraining WHERE partnerId = ? OR partnerId IN (SELECT partnerId FROM assignuserstraining INNER JOIN partners ON partners.id = assignuserstraining.partnerId WHERE partners.parentPartnerId = " + partnerResult[index].id + ") AND assignuserstraining.trainingStatus = 'Completed'";
                    let trainingCompleteResult = await query(trainingCompleteQuery, partnerResult[index].id)
                    partnerResult[index].totalAssignTraining = trainingAssignresult[0].totalAssignTraining
                    partnerResult[index].totalCompleteTraining = trainingCompleteResult[0].totalCompleteTraining;
                    partnerResult[index].ratio = 0;
                    if ((partnerResult[index].totalAssignTraining + partnerResult[index].pendingApplicationCount) > 0 && (partnerResult[index].totalCompleteTraining + partnerResult[index].successApplicationCount) > 0)
                        partnerResult[index].ratio = (partnerResult[index].totalAssignTraining + partnerResult[index].pendingApplicationCount) / (partnerResult[index].totalCompleteTraining + partnerResult[index].successApplicationCount);
                }
                partnerResult = partnerResult.sort((a, b) => b.ratio - a.ratio)
                partnerResult.splice(10, partnerResult.length)
                let successResult = new ResultSuccess(200, true, 'Get Partner Successfully', partnerResult, 10);
                return res.status(200).send(successResult);
            }
            else if (partnerResult && partnerResult.length == 0) {
                let successResult = new ResultSuccess(200, true, 'Get Partner Successfully', partnerResult, 0);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }

        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'dashboard.getTop10Performer() Exception', error, '');
        next(errorResult);
    }
};

const getTopPerformer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting TopPerformer');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetTopPerformers(` + req.body.startIndex + `,` + req.body.fetchRecords + `,'` + req.body.selectedInterval + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Top Peroformer Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }

        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'dashboard.getTopPerformer() Exception', error, '');
        next(errorResult);
    }
};
export default { getDashboard, getPendingApplication, getDisbursedApplication, getTop10Performer, getTopPerformer }