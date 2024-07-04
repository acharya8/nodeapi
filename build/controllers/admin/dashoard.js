"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logging_1 = __importDefault(require("../../config/logging"));
const config_1 = __importDefault(require("../../config/config"));
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
let connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.pass,
    database: config_1.default.mysql.database
});
const S3 = new AWS.S3({
    accessKeyId: config_1.default.s3bucket.aws_Id,
    secretAccessKey: config_1.default.s3bucket.aws_secret
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'Dashboard';
const getDashboard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Dashboard');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetDashboard()`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Dashboard Successfully', result, 1);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dashboard.getDashboard() Exception', error, '');
        next(errorResult);
    }
});
const getPendingApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Pending Application');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetPendingApplication(` + req.body.startIndex + `,` + req.body.fetchRecords + `)`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get PendingApplication Successfully', result[1], result[0][0].totalPendingApplication);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dashboard.getPendingApplication() Exception', error, '');
        next(errorResult);
    }
});
const getDisbursedApplication = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Disbursed Application');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetDisbursedApplication(` + req.body.startIndex + `,` + req.body.fetchRecords + `)`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Disbursed Application Successfully', result[1], result[0][0].totalDisbursedApplication);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dashboard.getDisbursedApplication() Exception', error, '');
        next(errorResult);
    }
});
const getTop10Performer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Top10 Performer');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let partnerSql = "SELECT * FROM partners WHERE parentPartnerId IS NULL";
            let partnerResult = yield query(partnerSql);
            if (partnerResult && partnerResult.length > 0) {
                for (let index = 0; index < partnerResult.length; index++) {
                    let subDsaCountSql = "SELECT COUNT(partners.id) as subDsaCount  FROM partnernetworks INNER JOIN partners ON partnernetworks.networkPartnerId = partners.id INNER JOIN userroles ON userroles.userId = partners.userId WHERE partnernetworks.partnerId = ? AND userroles.roleId = 4";
                    let subDsaCountResult = yield query(subDsaCountSql, partnerResult[index].id);
                    let connectorCountSql = "SELECT COUNT(partners.id) as connectorCount  FROM partnernetworks INNER JOIN partners ON partnernetworks.networkPartnerId = partners.id INNER JOIN userroles ON userroles.userId = partners.userId WHERE partnernetworks.partnerId = 1 AND userroles.roleId = 6";
                    let connectorCountResult = yield query(connectorCountSql, partnerResult[index].id);
                    let employeeCountSql = "SELECT COUNT(partners.id) as employeeCount  FROM partnerteams INNER JOIN partners ON partnerteams.teamPartnerId = partners.id INNER JOIN userroles ON userroles.userId = partners.userId WHERE partnerteams.partnerId = ? AND userroles.roleId = 5";
                    let employeeCountResult = yield query(employeeCountSql, partnerResult[index].id);
                    partnerResult[index].subDsaCount = subDsaCountResult[0].subDsaCount;
                    partnerResult[index].connectorCount = connectorCountResult[0].connectorCount;
                    partnerResult[index].employeeCount = employeeCountResult[0].employeeCount;
                    let pendingApplicationCountSql = "SELECT COUNT(customerloans.id) as pendingApplication FROM customerloans WHERE createdBy = ? OR createdBy IN (SELECT partners.userId FROM partners WHERE partners.parentPartnerId = " + partnerResult[index].id + ") AND statusId IS NULL";
                    let pendingApplicationresult = yield query(pendingApplicationCountSql, partnerResult[index].userId);
                    let sucessApplicationCountSql = "SELECT COUNT(customerloans.id) as successApplicationCount FROM customerloans WHERE createdBy = ? OR createdBy IN (SELECT partners.userId FROM partners WHERE partners.parentPartnerId = " + partnerResult[index].id + " ) AND statusId IS NOT NULL";
                    let sucessApplicationCountResult = yield query(sucessApplicationCountSql, partnerResult[index].userId);
                    partnerResult[index].pendingApplicationCount = pendingApplicationresult[0].pendingApplication;
                    partnerResult[index].successApplicationCount = sucessApplicationCountResult[0].successApplicationCount;
                    let trainingAssignQuery = " SELECT COUNT(id) as totalAssignTraining FROM assignuserstraining WHERE partnerId = ? OR partnerId IN (SELECT partnerId FROM assignuserstraining INNER JOIN partners ON partners.id = assignuserstraining.partnerId WHERE partners.parentPartnerId = " + partnerResult[index].id + ") AND assignuserstraining.trainingStatus = 'Pending'";
                    let trainingAssignresult = yield query(trainingAssignQuery, partnerResult[index].id);
                    let trainingCompleteQuery = " SELECT COUNT(id) as totalCompleteTraining FROM assignuserstraining WHERE partnerId = ? OR partnerId IN (SELECT partnerId FROM assignuserstraining INNER JOIN partners ON partners.id = assignuserstraining.partnerId WHERE partners.parentPartnerId = " + partnerResult[index].id + ") AND assignuserstraining.trainingStatus = 'Completed'";
                    let trainingCompleteResult = yield query(trainingCompleteQuery, partnerResult[index].id);
                    partnerResult[index].totalAssignTraining = trainingAssignresult[0].totalAssignTraining;
                    partnerResult[index].totalCompleteTraining = trainingCompleteResult[0].totalCompleteTraining;
                    partnerResult[index].ratio = 0;
                    if ((partnerResult[index].totalAssignTraining + partnerResult[index].pendingApplicationCount) > 0 && (partnerResult[index].totalCompleteTraining + partnerResult[index].successApplicationCount) > 0)
                        partnerResult[index].ratio = (partnerResult[index].totalAssignTraining + partnerResult[index].pendingApplicationCount) / (partnerResult[index].totalCompleteTraining + partnerResult[index].successApplicationCount);
                }
                partnerResult = partnerResult.sort((a, b) => b.ratio - a.ratio);
                partnerResult.splice(10, partnerResult.length);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Partner Successfully', partnerResult, 10);
                return res.status(200).send(successResult);
            }
            else if (partnerResult && partnerResult.length == 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Partner Successfully', partnerResult, 0);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dashboard.getTop10Performer() Exception', error, '');
        next(errorResult);
    }
});
const getTopPerformer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting TopPerformer');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetTopPerformers(` + req.body.startIndex + `,` + req.body.fetchRecords + `,'` + req.body.selectedInterval + `')`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Top Peroformer Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'dashboard.getTopPerformer() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getDashboard, getPendingApplication, getDisbursedApplication, getTop10Performer, getTopPerformer };
