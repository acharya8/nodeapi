import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const nodemailer = require('nodemailer');
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

const NAMESPACE = 'ContactUs';

const insertContactUs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['email', 'contactNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Getting Cities');
            let email = req.body.email;
            let contactNo = req.body.contactNo;
            let name = req.body.name ? req.body.name : null;
            let subject = req.body.subject ? req.body.subject : null;
            let message = req.body.message ? req.body.message : null;

            let sql = `CALL websiteInsertContact('` + name + `','` + email + `','` + contactNo + `','` + subject + `','` + message + `');`;
            console.log(sql);
            var result = await query(sql);
            console.log(JSON.stringify(result));
            if (result && result.affectedRows > 0) {
                let sysSql = "SELECT * FROM systemflags WHERE flagGroupId = 4";
                let sysResult = await query(sysSql);
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
                            _user = sysResult[i].value
                        if (sysResult[i].name == "noReplyPassword")
                            _password = sysResult[i].value
                        if (sysResult[i].name == "noReplyName")
                            _name = sysResult[i].value
                        if (sysResult[i].name == "noReplyHostName")
                            _host = sysResult[i].value
                        if (sysResult[i].name == "noReplyPort")
                            _port = (sysResult[i].value ? parseInt(sysResult[i].value) : 0)
                        if (sysResult[i].name == "noReplySecure")
                            _secure = (sysResult[i].value == "1" ? true : false)
                        if (sysResult[i].name == "supportEmailId")
                            _reciever = sysResult[i].value
                    }
                    let transporter = nodemailer.createTransport({
                        host: _host,
                        port: _port,
                        secure: _secure, // true for 465, false for other ports
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
                    let emailResult = await transporter.sendMail(mailOptions);
                }
                let successResult = new ResultSuccess(200, true, 'Insert Contact Detail', result, result.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            } else {
                let errorResult = new ResultError(400, true, 'Not Inserted', new Error('Not Inserted'), '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'contactus.insertContactUs()', error, '');
        next(errorResult);
    }
};

const insertNewsLetterSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['email'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Getting Cities');
            let checkEmailSql = "SELECT * FROM newslettersubscription WHERE email = '" + req.body.email + "'";
            let checkEmailResult = await query(checkEmailSql)
            if (checkEmailResult && checkEmailResult.length > 0) {
                let errorResult = new ResultError(400, true, 'Email Already Register', new Error('Email Already Register'), '');
                next(errorResult);
            } else {
                let sql = "INSERT INTO newslettersubscription(email) VALUES('" + req.body.email + "')";
                let result = await query(sql);
                if (result && result.affectedRows > 0) {
                    let successResult = new ResultSuccess(200, true, 'Email Registered for News Successfully', result, 1);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, 'Email Registration Fail', new Error('Email Registration Fail'), '');
                    next(errorResult);
                }
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'contactus.insertNewsLetterSubscription()', error, '');
        next(errorResult);
    }
}

export default { insertContactUs, insertNewsLetterSubscription };
