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
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
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
const firebaseApp = (0, app_1.initializeApp)(firebaseConfig);
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
const NAMESPACE = 'Users';
const auth = (0, auth_1.getAuth)();
const websiteVerifyContactNo = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var userData;
        var requiredFields = ['countryCode', 'contactNo'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Verify Contact No');
            var countryCode = req.body.countryCode;
            var contactNo = req.body.contactNo;
            let sql = `CALL websiteVerifyContactNo('` + countryCode + `','` + contactNo + `');`;
            console.log(sql);
            var result = yield query(sql);
            console.log(JSON.stringify(result));
            if (result && result.length > 0) {
                if (result[0].length > 0) {
                    //UserId
                    let userId = result[0][0].insertId;
                }
                if (result[1].length > 0) {
                    userData = result[1];
                }
            }
            else {
                //
            }
            if (userData && userData.length >= 0) {
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get User', userData, userData.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.websiteVerifyContactNo() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { websiteVerifyContactNo };
