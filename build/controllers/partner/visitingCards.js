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
const fs = require('fs');
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const node_html_to_image_1 = __importDefault(require("node-html-to-image"));
const puppeteer = require('puppeteer');
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
const pdf = require('html-pdf-node');
const options = {
    format: 'Letter',
    timeout: 540000,
};
const NAMESPACE = 'Visiting Cards';
const getVisitingCards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting  Visiting Cards');
        var requiredFields = ['roleId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
                let sql = `CALL dsaBazarGetVisitingCard(` + req.body.roleId + `,` + startIndex + `,` + fetchRecord + `);`;
                console.log(sql);
                var result = yield query(sql);
                console.log(result);
                if (result && result.length > 0) {
                    if (result[0][0].totalCount > 0) {
                        if (result[1] && result[1].length > 0) {
                            console.log(result[1]);
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get VisitingCards', result[1], result[0][0].totalCount);
                            return res.status(200).send(successResult);
                        }
                    }
                    else if (result[0][0].totalCount == 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get VisitingCards', [], 0);
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
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'visitingCards.getVisitingCards()', error, '');
        next(errorResult);
    }
});
const insertVisitingCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Visiting Card');
        var requiredFields = ['partnerId', 'template', 'visitingCardId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId ? req.body.partnerId : null;
                let visitingCardId = req.body.visitingCardId ? req.body.visitingCardId : null;
                let userId = authorizationResult.currentUser.id;
                let template = req.body.template;
                let dynamicFields = req.body.dynamicFields ? req.body.dynamicFields : null;
                let partnerVisitingCardId = req.body.partnerVisitingCardId ? req.body.partnerVisitingCardId : null;
                if (dynamicFields) {
                    dynamicFields = JSON.stringify(dynamicFields);
                }
                template = String(template).replace('\t', '');
                template = String(template).replace('\n', '');
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
                    let keyName = ("visitingCard_" + partnerId + "_" + new Date().getTime()).replace(" ", "_");
                    let params = {
                        Bucket: 'creditappusersvisitingcard',
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
                        let sql = `CALL partnerInsertVisitingCard('` + partnerId + `','` + template + `','` + data.Location + `',` + userId + `,` + visitingCardId + `,` + partnerVisitingCardId + `,'` + dynamicFields + `')`;
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
                //// }
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
        var requiredFields = ["partnerVisitingCardId", 'template', 'visitingCardId', 'partnerId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId ? req.body.partnerId : null;
                let userId = authorizationResult.currentUser.id;
                let template = req.body.template;
                let dynamicFields = req.body.dynamicFields ? req.body.dynamicFields : null;
                if (dynamicFields) {
                    dynamicFields = JSON.stringify(dynamicFields);
                }
                let visitingCardId = req.body.visitingCardId ? req.body.visitingCardId : null;
                let partnerVisitingCardId = req.body.partnerVisitingCardId ? req.body.partnerVisitingCardId : null;
                template = String(template).replace('\t', '');
                template = String(template).replace('\n', '');
                if (req.body.location) {
                    let splt = req.body.location.split("/");
                    const delResp = yield S3.deleteObject({
                        Bucket: 'creditappusersvisitingcard',
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
                                let keyName = ("visitingCard_" + partnerId + "_" + new Date().getTime()).replace(" ", "_");
                                let params = {
                                    Bucket: 'creditappusersvisitingcard',
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
                                    let sql = `CALL partnerInsertVisitingCard('` + partnerId + `','` + template + `','` + data.Location + `',` + userId + `,` + visitingCardId + `,` + partnerVisitingCardId + `,'` + dynamicFields + `')`;
                                    let result = yield query(sql);
                                    if (result && result[0].length > 0) {
                                        var tempFile = fs.openSync('visitingCard_1.png', 'r');
                                        fs.closeSync(tempFile);
                                        fs.unlinkSync('visitingCard_1.png');
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Visiting Card', result[0], 1);
                                        return res.status(200).send(successResult);
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
                    (0, node_html_to_image_1.default)({
                        output: 'visitingCard' + '_1' + ".png",
                        html: template
                    }).then(() => __awaiter(void 0, void 0, void 0, function* () {
                        //result[1][i].visitingCard = output
                        var Content = fs.readFileSync('visitingCard_1.png', { encoding: 'base64' });
                        let buf = Buffer.from(Content, 'base64');
                        let keyName = ("visitingCard_" + partnerId + "_" + new Date().getTime()).replace(" ", "_");
                        let params = {
                            Bucket: 'creditappusersvisitingcard',
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
                            let sql = `CALL partnerInsertVisitingCard('` + partnerId + `','` + template + `','` + data.Location + `',` + userId + `,` + visitingCardId + `,` + partnerVisitingCardId + `)`;
                            let result = yield query(sql);
                            if (result && result[0].length > 0) {
                                var tempFile = fs.openSync('visitingCard_1.png', 'r');
                                // try commenting out the following line to see the different behavior
                                fs.closeSync(tempFile);
                                fs.unlinkSync('visitingCard_1.png');
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Visiting Card', result[0], 1);
                                return res.status(200).send(successResult);
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
const getCompletedVisitingCard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting  Visiting Cards');
        var requiredFields = ['partnerId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId ? req.body.partnerId : null;
                let sql = `CALL getDSABazaarCompletedVisitingCard(` + partnerId + `);`;
                console.log(sql);
                var result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0][0]) {
                        console.log(result[0][0].dynamicFields);
                        result[0][0].dynamicFields = JSON.parse((result[0][0].dynamicFields));
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get VisitingCards', [result[0][0]], 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get VisitingCards', [], 1);
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
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'visitingCards.getVisitingCards()', error, '');
        next(errorResult);
    }
});
exports.default = { getVisitingCards, insertVisitingCard, getCompletedVisitingCard, updateVisitingCard };
