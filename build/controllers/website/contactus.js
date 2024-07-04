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
const nodemailer = require('nodemailer');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
var connection = mysql.createConnection({
    host: config_1.default.mysql.host,
    user: config_1.default.mysql.user,
    password: config_1.default.mysql.pass,
    database: config_1.default.mysql.database
});
const query = util.promisify(connection.query).bind(connection);
const beginTransaction = util.promisify(connection.beginTransaction).bind(connection);
const commit = util.promisify(connection.commit).bind(connection);
const rollback = util.promisify(connection.rollback).bind(connection);
const NAMESPACE = 'ContactUs';
const insertContactUs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['email', 'contactNo'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Getting Cities');
            let email = req.body.email;
            let contactNo = req.body.contactNo;
            let name = req.body.name ? req.body.name : null;
            let subject = req.body.subject ? req.body.subject : null;
            let message = req.body.message ? req.body.message : null;
            let sql = `CALL websiteInsertContact('` + name + `','` + email + `','` + contactNo + `','` + subject + `','` + message + `');`;
            console.log(sql);
            var result = yield query(sql);
            console.log(JSON.stringify(result));
            if (result && result.affectedRows > 0) {
                let sysSql = "SELECT * FROM systemflags WHERE flagGroupId = 4";
                let sysResult = yield query(sysSql);
                if (sysResult && sysResult.length > 0) {
                    let _host = "";
                    let _port = 0;
                    let _secure = false;
                    let _user = "";
                    let _password = "";
                    let _reciever = "";
                    let _name = "";
                    for (let i = 0; i < sysResult.length; i++) {
                        if (sysResult[i].name == "noReplyEmail")
                            _user = sysResult[i].value;
                        if (sysResult[i].name == "noReplyPassword")
                            _password = sysResult[i].value;
                        if (sysResult[i].name == "noReplyName")
                            _name = sysResult[i].value;
                        if (sysResult[i].name == "noReplyHostName")
                            _host = sysResult[i].value;
                        if (sysResult[i].name == "noReplyPort")
                            _port = (sysResult[i].value ? parseInt(sysResult[i].value) : 0);
                        if (sysResult[i].name == "noReplySecure")
                            _secure = (sysResult[i].value == "1" ? true : false);
                        if (sysResult[i].name == "supportEmailId")
                            _reciever = sysResult[i].value;
                    }
                    let transporter = nodemailer.createTransport({
                        host: _host,
                        port: _port,
                        secure: _secure,
                        auth: {
                            user: _user,
                            pass: _password
                        }
                    });
                    // service: 'gmail',
                    // port: 8000,
                    // secure: false, // use SSL
                    let mailOptions = {
                        // from: from, // sender address
                        // to: to, // list of receivers
                        // subject: subject, // Subject line
                        // text: text, // plain text body
                        // html: html, // html body
                        // attachments: invoicePdf ? [{
                        //     filename: fileName,
                        //     content: Buffer.from(
                        //         invoicePdf,
                        //         'base64'
                        //     ),
                        // }] : []
                        from: _name,
                        to: _reciever,
                        subject: subject,
                        html: message
                    };
                    // send mail with defined transport object
                    let emailResult = yield transporter.sendMail(mailOptions);
                }
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Contact Detail', result, result.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Not Inserted', new Error('Not Inserted'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'contactus.insertContactUs()', error, '');
        next(errorResult);
    }
});
const insertNewsLetterSubscription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['email'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Getting Cities');
            let checkEmailSql = "SELECT * FROM newslettersubscription WHERE email = '" + req.body.email + "'";
            let checkEmailResult = yield query(checkEmailSql);
            if (checkEmailResult && checkEmailResult.length > 0) {
                let errorResult = new resulterror_1.ResultError(400, true, 'Email Already Register', new Error('Email Already Register'), '');
                next(errorResult);
            }
            else {
                let sql = "INSERT INTO newslettersubscription(email) VALUES('" + req.body.email + "')";
                let result = yield query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Email Registered for News Successfully', result, 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Email Registration Fail', new Error('Email Registration Fail'), '');
                    next(errorResult);
                }
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'contactus.insertNewsLetterSubscription()', error, '');
        next(errorResult);
    }
});
exports.default = { insertContactUs, insertNewsLetterSubscription };
