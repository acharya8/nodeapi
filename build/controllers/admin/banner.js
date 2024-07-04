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
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const AWS = require('aws-sdk');
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
const NAMESPACE = 'Banners';
const getBanners = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Banners');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getSeconds())).slice(-2) : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getSeconds())).slice(-2) : '';
            req.body.isActive = req.body.isActive ? req.body.isActive : null;
            let roleIds = req.body.selectedRoles && req.body.selectedRoles.length > 0 ? req.body.selectedRoles.toString() : '';
            let startIndex = req.body.startIndex >= 0 ? req.body.startIndex : null;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : null;
            let sql = `CALL adminGetBanners('` + fromDate + `','` + toDate + `',` + req.body.isActive + `,'` + roleIds + `',` + startIndex + `,` + fetchRecords + `)`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Banners Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "banners.getBanners() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'banners.getBanners() Exception', error, '');
        next(errorResult);
    }
});
const insertBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Banners');
        let requiredFields = ['url'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let fromDate = req.body.fromDate ? new Date(req.body.fromDate) : '';
                let toDate = req.body.toDate ? new Date(req.body.toDate) : '';
                req.body.bannerId = req.body.id ? req.body.id : 0;
                let fdt = '';
                let tdt = '';
                if (fromDate)
                    fdt = new Date(fromDate).getFullYear().toString() + '-' + ("0" + (new Date(fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(fromDate).getSeconds())).slice(-2);
                if (toDate)
                    tdt = new Date(toDate).getFullYear().toString() + '-' + ("0" + (new Date(toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(toDate).getSeconds())).slice(-2);
                if (req.body.url.includes("https:")) {
                    let sql = "CALL adminInsertUpdateBanner(" + req.body.bannerId + "," + req.body.roleId + ",'" + req.body.url + "','" + fdt + "','" + tdt + "'," + userId + ")"; //true
                    let result = yield query(sql);
                    if (result && result.affectedRows >= 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Banner Inserted', result, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Banner", result, '');
                        next(errorResult);
                    }
                }
                else {
                    let contentType;
                    contentType = 'image/jpeg';
                    let fileExt = contentType.split("/")[1].split("+")[0];
                    let buf = Buffer.from(req.body.url, 'base64');
                    let keyName = req.body.roleId;
                    let params = {
                        Bucket: 'creditappbannerimage',
                        Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                        Body: buf,
                        ContentEncoding: 'base64',
                        ContentType: contentType,
                        ACL: 'public-read'
                    };
                    yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                        if (error) {
                            let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                            next(errorResult);
                            return;
                        }
                        console.log(data);
                        try {
                            let sql = "CALL adminInsertUpdateBanner(" + req.body.bannerId + "," + req.body.roleId + ",'" + data.Location + "','" + fdt + "','" + tdt + "'," + userId + ")"; //true
                            let result = yield query(sql);
                            if (result && result.affectedRows >= 0) {
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Banner Inserted', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Banner", result, '');
                                next(errorResult);
                            }
                        }
                        catch (error) {
                            let errorResult = new resulterror_1.ResultError(400, true, "Error While Inserting Banner", error, '');
                            next(errorResult);
                        }
                    }));
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'Banner.insertBanner() Exception', error, '');
        next(errorResult);
    }
});
const activeInActiveBanner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive Banner');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;
                let sql = `CALL adminActiveInactiveBanner(` + id + `,` + userId + `);`;
                console.log(sql);
                let result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Banner', result, 1);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'Banner.activeInActiveBanner() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getBanners, insertBanner, activeInActiveBanner };
