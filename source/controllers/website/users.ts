import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBwWWPyMCr2qOFQxlM-4ui2gMCSkIsozss",
    authDomain: "credit-app-9be53.firebaseapp.com",
    projectId: "credit-app-9be53",
    storageBucket: "credit-app-9be53.appspot.com",
    messagingSenderId: "876031595606",
    appId: "1:876031595606:web:10da02dc14e23baff757f7",
    measurementId: "G-V9PFG9KFS9"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

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

const NAMESPACE = 'Users';

const auth = getAuth();

const websiteVerifyContactNo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var userData;
        var requiredFields = ['countryCode', 'contactNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Verify Contact No');
            var countryCode = req.body.countryCode;
            var contactNo = req.body.contactNo;
            let sql = `CALL websiteVerifyContactNo('` + countryCode + `','` + contactNo + `');`;
            console.log(sql);
            var result = await query(sql);
            console.log(JSON.stringify(result));
            if (result && result.length > 0) {
                if (result[0].length > 0) {
                    //UserId
                    let userId = result[0][0].insertId;
                }
                if (result[1].length > 0) {
                    userData = result[1];

                }
            } else {
                //
            }
            if (userData && userData.length >= 0) {
                let successResult = new ResultSuccess(200, true, 'Get User', userData, userData.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'users.websiteVerifyContactNo() Exception', error, '');
        next(errorResult);
    }
};

export default { websiteVerifyContactNo };
