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
const fs = require('fs');
const AWS = require('aws-sdk');
const puppeteer = require('puppeteer');
const hb = require('handlebars');
var connection = mysql.createConnection({
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
const NAMESPACE = 'Visiting Card';
const getVisitingCards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting VisitingCards');
        var requiredFields = [];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let roleIds = req.body.roleIds ? req.body.roleIds.toString() : "";
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 15;
                let sql = `CALL adminGetVisitingCards('` + roleIds + `',` + startIndex + `,` + fetchRecords + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[1] && result[1].length > 0) {
                        for (let i = 0; i < result[1].length; i++) {
                            result[1][i].roleIds = ((result[1][i].roleIds.split(',')));
                            if (result[1][i].roleIds && result[1][i].roleIds.length > 0) {
                                for (let index = 0; index < result[1][i].roleIds.length; index++) {
                                    result[1][i].roleIds[index] = parseInt(result[1][i].roleIds[index]);
                                }
                            }
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Visiting Cards', result[1], result[0][0].totalCount);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, "Visiting Card Not Available", [], 0);
                        return res.status(200).send(successResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Visiting Cards", result, '');
                    next(errorResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'visitingCards.getVisitingCards() Exception', error, '');
        next(errorResult);
    }
});
const insertVisitingCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Visiting Card');
        var requiredFields = ["roleIds", 'template'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let roleIds = req.body.roleIds.toString();
                let userId = authorizationResult.currentUser.id;
                let dynamicFields = "";
                let template = req.body.template;
                var regularExpression = /(?<=\[).*?(?=\])/g;
                dynamicFields = template.match(regularExpression);
                template = String(template).replace('\t', '');
                template = String(template).replace('\n', '');
                dynamicFields = dynamicFields && dynamicFields.length > 0 ? dynamicFields.toString() : "";
                const browser = yield puppeteer.launch({
                    headless: true,
                    args: ['--no-sandbox', '--disable-setuid-sandbox'],
                    ignoreDefaultArgs: ['--disable-extensions']
                    //args: ['--use-gl=egl'],
                });
                const page = yield browser.newPage();
                yield page.setViewport({
                    width: 360,
                    height: 190,
                    deviceScaleFactor: 1,
                });
                yield page.setContent(template);
                yield page.screenshot({ path: 'visitingCard' + '_1' + ".png" }).then(() => __awaiter(void 0, void 0, void 0, function* () {
                    yield browser.close();
                    var Content = fs.readFileSync('visitingCard_1.png', { encoding: 'base64' });
                    let buf = Buffer.from(Content, 'base64');
                    let keyName = ("visitingCard_" + new Date().getTime()).replace(" ", "_");
                    let params = {
                        Bucket: 'creditappvisitingcard',
                        Key: keyName + ".png",
                        Body: buf,
                        ContentEncoding: 'base64',
                        ContentType: 'image/png',
                        ACL: 'public-read'
                    };
                    yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                        if (error) {
                            let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                            next(errorResult);
                            return;
                        }
                        console.log(data);
                        let sql = `CALL adminInsertVisitingCard('` + roleIds + `','` + template + `','` + dynamicFields + `','` + data.Location + `',` + userId + `)`;
                        let result = yield query(sql);
                        if (result) {
                            if (result && result[0].length > 0) {
                                var tempFile = fs.openSync('visitingCard_1.png', 'r');
                                // try commenting out the following line to see the different behavior
                                fs.closeSync(tempFile);
                                fs.unlinkSync('visitingCard_1.png');
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Visiting Card', result[0], 1);
                                return res.status(200).send(successResult);
                            }
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, "visitingCards.insertVisitingCard() Error", new Error("Visiting Card Not Inserted."), '');
                            next(errorResult);
                        }
                    }));
                }));
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
            // }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'visitingCards.insertVisitingCard() Exception', error, '');
        next(errorResult);
    }
});
const updateVisitingCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Update Visiting Card');
        var requiredFields = ["id", "roleIds", 'template'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let roleIds = req.body.roleIds.toString();
                let userId = authorizationResult.currentUser.id;
                let dynamicFields = "";
                let template = req.body.template;
                var regularExpression = /(?<=\[).*?(?=\])/g;
                dynamicFields = template.match(regularExpression);
                template = String(template).replace('\t', '');
                template = String(template).replace('\n', '');
                dynamicFields = dynamicFields && dynamicFields.length > 0 ? dynamicFields.toString() : "";
                if (req.body.location) {
                    let splt = req.body.location.split("/");
                    const delResp = yield S3.deleteObject({
                        Bucket: 'creditappvisitingcard',
                        Key: splt[splt.length - 1],
                    }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                        if (err) {
                            console.log("Error: Object delete failed.");
                            let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                            next(errorResult);
                        }
                        else {
                            const browser = yield puppeteer.launch({
                                headless: true,
                                args: ['--no-sandbox', '--disable-setuid-sandbox'],
                                ignoreDefaultArgs: ['--disable-extensions']
                                //args: ['--use-gl=egl'],
                            });
                            const page = yield browser.newPage();
                            yield page.setViewport({
                                width: 360,
                                height: 190,
                                deviceScaleFactor: 1,
                            });
                            yield page.setContent(template);
                            yield page.screenshot({ path: 'visitingCard' + '_1' + ".png" }).then(() => __awaiter(void 0, void 0, void 0, function* () {
                                yield browser.close();
                                var Content = fs.readFileSync('visitingCard_1.png', { encoding: 'base64' });
                                let buf = Buffer.from(Content, 'base64');
                                let keyName = ("visitingCard_1").replace(" ", "_");
                                let params = {
                                    Bucket: 'creditappvisitingcard',
                                    Key: keyName + "_" + new Date().getTime() + ".png",
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: 'image/png',
                                    ACL: 'public-read'
                                };
                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (error) {
                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                        next(errorResult);
                                        return;
                                    }
                                    console.log(data);
                                    let sql = `CALL adminUpdateVisitingCard(` + req.body.id + `,'` + roleIds + `','` + template + `','` + dynamicFields + `','` + data.Location + `',` + userId + `)`;
                                    let result = yield query(sql);
                                    if (result) {
                                        if (result && result.affectedRows) {
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Visiting Card', result[0], 1);
                                            return res.status(200).send(successResult);
                                        }
                                    }
                                    else {
                                        let errorResult = new resulterror_1.ResultError(400, true, "visitingCards.updateVisitingCard() Error", new Error("Visiting Card Not Updated."), '');
                                        next(errorResult);
                                    }
                                }));
                            }));
                        }
                    }));
                }
                else {
                    const browser = yield puppeteer.launch({
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox'],
                        ignoreDefaultArgs: ['--disable-extensions']
                        //args: ['--use-gl=egl'],
                    });
                    const page = yield browser.newPage();
                    yield page.setViewport({
                        width: 360,
                        height: 190,
                        deviceScaleFactor: 1,
                    });
                    yield page.setContent(template);
                    yield page.screenshot({ path: 'visitingCard' + '_1' + ".png" }).then(() => __awaiter(void 0, void 0, void 0, function* () {
                        yield browser.close();
                        var Content = fs.readFileSync('visitingCard_1.png', { encoding: 'base64' });
                        let buf = Buffer.from(Content, 'base64');
                        let keyName = ("visitingCard_1").replace(" ", "_");
                        let params = {
                            Bucket: 'creditappvisitingcard',
                            Key: keyName + "_" + new Date().getTime() + ".png",
                            Body: buf,
                            ContentEncoding: 'base64',
                            ContentType: 'image/png',
                            ACL: 'public-read'
                        };
                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                            if (error) {
                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                next(errorResult);
                                return;
                            }
                            console.log(data);
                            let sql = `CALL adminUpdateVisitingCard(` + req.body.id + `,'` + roleIds + `','` + template + `','` + dynamicFields + `','` + data.Location + `',` + userId + `)`;
                            let result = yield query(sql);
                            if (result) {
                                if (result && result.affectedRows) {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Visiting Card', result[0], 1);
                                    return res.status(200).send(successResult);
                                }
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "visitingCards.updateVisitingCard() Error", new Error("Visiting Card Not Updated."), '');
                                next(errorResult);
                            }
                        }));
                    }));
                }
                // }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
            // }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'visitingCards.updateVisitingCard() Exception', error, '');
        next(errorResult);
    }
});
const activeInactiveVisitingCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive VisitingCard');
        var requiredFields = ['id'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let sql = `CALL adminActiveInActiveVisitingCard(` + id + `,` + currentUser.id + `)`;
                console.log(sql);
                var result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update VisitingCard', result, 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'visitingCards.activeInactiveVisitingCard() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getVisitingCards, insertVisitingCard, updateVisitingCard, activeInactiveVisitingCard };
