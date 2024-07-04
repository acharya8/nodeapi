import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';

var connection = mysql.createConnection({
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

const NAMESPACE = 'OtherLoan';



const insertCustomerOtherLoanDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Other Loan Detail');
        var requiredFields = ['serviceId', 'serviceTypeId', 'fullName', 'birthdate', 'panCardNo', 'aadhaarCardNo', 'contactNo', 'email', 'employmentTypeId', 'monthlyincome', 'pincode'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let serviceId = req.body.serviceId;
                let serviceTypeId = req.body.serviceTypeId;
                let fullName = req.body.fullName;
                let birthdate = req.body.birthdate;
                let panCardNo = req.body.panCardNo;
                let aadhaarCardNo = req.body.aadhaarCardNo;
                let contactNo = req.body.contactNo;
                let email = req.body.email;
                let employmentTypeId = req.body.employmentTypeId;
                let monthlyincome = req.body.monthlyincome ? req.body.monthlyincome : '';
                let label = req.body.label ? req.body.label : '';
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : '';
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : '';
                let pincode = req.body.pincode ? req.body.pincode : '';
                let cityId = req.body.cityId ? req.body.cityId : '';
                let city = req.body.city ? req.body.city : '';
                let district = req.body.district ? req.body.district : '';
                let state = req.body.state ? req.body.state : '';

                let sql = `CALL InsertCustomerOtherLoanDetail(` + userId + `,` + serviceId + `,` + serviceTypeId + `,'` + fullName + `','` + birthdate + `','` + panCardNo + `','` + aadhaarCardNo + `','` + contactNo + `','` + email + `','` + employmentTypeId + `','` + monthlyincome + `','` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `','` + cityId + `','` + city + `','` + district + `','` + state + `')`;
                let result = await query(sql);
                if (result) {
                    let successResult = new ResultSuccess(200, true, 'Insert Other Loan Detail', result, 1);
                    return res.status(200).send(successResult);

                } else {
                    let errorResult = new ResultError(400, true, "otherLoan.insertCustomerOtherLoanDetail() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'otherLoan.insertCustomerOtherLoanDetail() Exception', error, '');
        next(errorResult);
    }
};

const getOtherLoanDetailByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['userId', 'serviceTypeId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Get Other Loan Customers');
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let serviceTypeId = req.body.serviceTypeId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 20;
                let sql = `CALL GetOtherLoansByuserId(` + userId + `,` + serviceTypeId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {

                    let successResult = new ResultSuccess(200, true, 'Get Other Loan Customers', result[0], result[0].length);
                    return res.status(200).send(successResult);

                } else {
                    let errorResult = new ResultError(400, true, "partners.getOtherLoanDetailByUserId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.getOtherLoanDetailByUserId()', error, '');
        next(errorResult);
    }
};

export default { insertCustomerOtherLoanDetail, getOtherLoanDetailByUserId }