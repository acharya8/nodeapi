import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
var crypto = require('crypto');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { RoleResponse } from '../../classes/output/customer/roleResponse';
import { userResponse } from '../../classes/output/customer/usersResponse';

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

const NAMESPACE = 'Customer Users';

const clientVerifyContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['contactNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Customer Verify Contact No');
            let contactNo = req.body.contactNo;
            let countryCode = req.body.countryCode ? req.body.countryCode : '+91';

            let email = req.body.email ? req.body.email : '';
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userDevice = authorizationResult.currentUserDevice;
                let appId
                if (userDevice.app == 'CreditAppAdmin') {
                    appId = 1;
                } else if (userDevice.app == 'CreditAppAndroid') {
                    appId = 2;
                } else {
                    appId = 3;
                }
                let temporaryCode = "";
                let lastTempCodeSql = "CALL websiteGetLastCustomer()";
                let lastTempCodeResult = await query(lastTempCodeSql);
                if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                    let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split("_")[1])
                    temporaryCode = "CT_" + (no + 1).toString().padStart(10, "0");
                } else {
                    temporaryCode = "CT_0000000001";
                }
                var sessionToken = crypto.randomBytes(48).toString('hex');
                let checkSql = `SELECT users.* fROM users 
                INNER JOIN userroles ON userroles.userId = users.id
                WHERE userroles.roleId != 2 AND users.contactNo ='` + contactNo + `'`;
                let checkResult = await query(checkSql);
                if (checkResult && checkResult.length == 0) {
                    var referCoin = 0;
                    let referCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 2";
                    let referCoinResult = await query(referCoinSql);
                    if (referCoinResult && referCoinResult.length > 0) {
                        referCoin = referCoinResult[0].rewardCoin;
                    }
                    let partnerUserId = 0;
                    if (req.body.partNerId) {
                        let userId = await query(`SELECT userId FROM partners WHERE id = ` + req.body.partNerId)
                        partnerUserId = userId[0].userId;
                    }
                    let sql = `CALL customerVerifyContactNo('` + countryCode + `', '` + contactNo + `','` + email + `','` + temporaryCode + `',` + appId + `,'` + userDevice.deviceId + `'
                    ,'` + userDevice.fcmToken + `','` + userDevice.deviceManufacturer + `','` + userDevice.deviceModel + `', '` + sessionToken + `', '` + userDevice.appVersion + `'
                    ,` + partnerUserId + `, 2 , ` + referCoin + `)`;
                    console.log(sql);
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        let userRole;
                        let user;
                        let finalResult = [];
                        let parentPartner;
                        if (result[0].length > 0) {
                            if (result[0][0].message && result[0][0].message == "User Not Verified") {
                                let errorResult = new ResultError(400, true, "User Not Verified", new Error('User Not Verified'), '');
                                next(errorResult);
                                return;
                            } else {
                                userRole = new RoleResponse(result[0][0].id, result[0][0].name);
                            }
                        }

                        if (result[1] && result[1].length > 0) {

                            if (req.body.partNerId) {

                                let checkPartnerCustomerSql = "SELECT * FROM partnercustomers WHERE partnerId = " + req.body.partNerId + " AND customerId = " + result[1][0].id;
                                let checkPartnerCustomerResult = await query(checkPartnerCustomerSql);
                                if (!(checkPartnerCustomerResult && checkPartnerCustomerResult.length > 0)) {
                                    let partnerCustomeSql = "INSERT INTO partnercustomers(partnerId, customerId, createdBy, modifiedBy) VALUES(" + req.body.partNerId + ", " + result[1][0].id + ", " + req.body.partNerId + ", " + req.body.partNerId + ")";
                                    let partnerCustomeResult = await query(partnerCustomeSql);


                                }

                            }
                            if (req.body.isReceiveMarketingCalls != undefined && req.body.isReceiveMarketingCalls != null) {

                                let changeFlag = "UPDATE users SET isReceiveMarketingCalls = " + req.body.isReceiveMarketingCalls + ",modifiedDate=CURRENT_TIMESTAMP() WHERE contactNo = " + contactNo;
                                let changeFlagResult = await query(changeFlag);

                            }

                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].temporaryCode, result[1][0].permanentCode
                                , result[1][0].fullName, result[1][0].birthdate, result[1][0].gender, result[1][0].contactNo, result[1][0].alternativeContactNo
                                , result[1][0].groupId, result[1][0].partnerId, result[1][0].panCardNo, result[1][0].aadhaarCardNo, result[1][0].isActive
                                , result[1][0].isDelete, result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy
                                , sessionToken, userRole, result[1][0].addressId, result[1][0].addressTypeId, result[1][0].label, result[1][0].addressLine1
                                , result[1][0].addressLine2, result[1][0].pincode, result[1][0].cityId);
                            finalResult.push(user)
                        }

                        let successResult = new ResultSuccess(200, true, 'Login SuccessFully', finalResult, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Login Failed", result, '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "ContactNo already exist try another contact", 'ContactNo already exist try another contact', '');
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
        let errorResult = new ResultError(500, true, 'users.clientVerifyContact()', error, '');
        next(errorResult);
    }
};

const checkContactNoExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['contactNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Customer Contact No Exist');
            let contactNo = req.body.contactNo;
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL customerCheckContactNoExist('` + contactNo + `')`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {

                        let successResult = new ResultSuccess(200, true, 'User Exist', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
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
        let errorResult = new ResultError(500, true, 'users.checkContactNoExist()', error, '');
        next(errorResult);
    }
};

const validateSessionToken = async (req: Request, res: Response, next: NextFunction) => {
    try {

        logging.info(NAMESPACE, 'Validate Session Token');

        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sessionToken = authorizationResult.currentUser.sessionToken;
            if (sessionToken) {
                let userDevice = authorizationResult.currentUserDevice;
                let appId
                if (userDevice.app == 'CreditAppAdmin') {
                    appId = 1;
                } else if (userDevice.app == 'CreditAppAndroid') {
                    appId = 2;
                } else {
                    appId = 3;
                }
                let sql = `CALL customerVerifySessionToken('` + sessionToken + `',` + appId + `,'` + userDevice.deviceId + `','` + userDevice.fcmToken + `','` + userDevice.deviceManufacturer + `','` + userDevice.deviceModel + `', '` + userDevice.appVersion + `')`;
                console.log(sql);
                let result = await query(sql);
                console.log(JSON.stringify(result));
                if (result && result.length > 0) {
                    let userRole;
                    let user;
                    let parentPartner;
                    if (result[0].length > 0) {
                        if (result[0][0].message && result[0][0].message == "User Not Verified") {
                            let errorResult = new ResultError(400, true, "User Not Verified", new Error('User Not Verified'), '');
                            next(errorResult);
                            return;
                        } else {
                            userRole = new RoleResponse(result[0][0].id, result[0][0].name);
                        }
                    }
                    if (result[1] && result[1].length > 0) {
                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].temporaryCode, result[1][0].permanentCode
                            , result[1][0].fullName, result[1][0].birthdate, result[1][0].gender, result[1][0].contactNo, result[1][0].alternativeContactNo
                            , result[1][0].groupId, result[1][0].partnerId, result[1][0].panCardNo, result[1][0].aadhaarCardNo, result[1][0].isActive
                            , result[1][0].isDelete, result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy
                            , sessionToken, userRole, result[1][0].addressId, result[1][0].addressTypeId, result[1][0].label, result[1][0].addressLine1
                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].cityId);
                    }

                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Login Failed", result, '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }

    } catch (error) {
        let errorResult = new ResultError(500, true, 'users.validateSessionToken()', error, '');
        next(errorResult);
    }
};

const updateCustomerDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['userId', 'customerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = req.body.userId ? req.body.userId : authorizationResult.currentUser.id;
                let customerId = req.body.customerId;
                let fullName = req.body.fullName ? req.body.fullName : "";
                req.body.birtheDate = new Date(new Date().toUTCString());
                let birthDate = req.body.birthdate ? new Date(req.body.birthdate) : null;
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
                let alternativeContactNo = req.body.alternativeContactNo ? req.body.alternativeContactNo : "";
                let gender = req.body.gender ? req.body.gender : "";
                let maritalStatusId = req.body.maritalStatusId ? req.body.maritalStatusId : null;

                let dDate = null;
                if (birthDate)
                    dDate = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2);
                let sql = `CALL customerUpdateCustomer(` + userId + `,` + customerId + `,'` + fullName + `','` + dDate + `','` + panCardNo + `','` + alternativeContactNo + `','` + gender + `',` + maritalStatusId + `)`;
                console.log(sql);
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'Customer Updated', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Customer Not Updated", result, '');
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
        let errorResult = new ResultError(500, true, 'users.updateCustomerDetail()', error, '');
        next(errorResult);
    }
};

const updateCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerId', 'fullName', 'contactNo', 'panCardNo', 'aadhaarCardNo', 'birthdate'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Update Customer Profile');
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerId = req.body.customerId;
                let fullName = req.body.fullName;
                let contactNo = req.body.contactNo;
                let panCardNo = req.body.panCardNo;
                let aadhaarCardNo = req.body.aadhaarCardNo;
                let birthdate = req.body.birthdate;
                let userId = authorizationResult.currentUser.id;
                let profilePicUrl = req.body.profilePicUrl;
                let email = req.body.email ? req.body.email : '';
                if (!profilePicUrl) {
                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                    let checkUrlResult = await query(checkUrlSql);
                    if (checkUrlResult && checkUrlResult.length > 0) {
                        if (checkUrlResult[0].profilePicUrl) {
                            let splt = checkUrlResult[0].profilePicUrl.split("/");
                            const delResp = await S3.deleteObject({
                                Bucket: 'creditappcustomerprofilepic',
                                Key: splt[splt.length - 1],
                            }, async (err, data) => {
                                if (err) {
                                    console.log("Error: Object delete failed.");
                                    let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                    next(errorResult);
                                } else {
                                    let dDate = null;
                                    if (birthdate)
                                        dDate = new Date(birthdate).getFullYear().toString() + '-' + ("0" + (new Date(birthdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthdate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthdate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthdate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthdate).getSeconds())).slice(-2);
                                    let sql = `CALL customerUpdateCustomerProfileWithPic(` + userId + `,` + customerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + dDate + `','','` + email + `')`;
                                    console.log(sql);
                                    let result = await query(sql);
                                    if (result && result[0].length > 0) {
                                        console.log(result);
                                        let successResult = new ResultSuccess(200, true, 'Customer Updated', result[0], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    } else {
                                        let errorResult = new ResultError(400, true, "Customer Not Updated", result, '');
                                        next(errorResult);
                                    }
                                }
                            });
                        } else {
                            let dDate = null;
                            if (birthdate)
                                dDate = new Date(birthdate).getFullYear().toString() + '-' + ("0" + (new Date(birthdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthdate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthdate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthdate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthdate).getSeconds())).slice(-2);
                            let sql = `CALL customerUpdateCustomerProfile(` + userId + `,` + customerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + dDate + `','` + email + `')`;
                            console.log(sql);
                            let result = await query(sql);
                            if (result && result[0].length > 0) {
                                console.log(result);
                                let successResult = new ResultSuccess(200, true, 'Customer Updated', result[0], 1);
                                console.log(successResult);
                                return res.status(200).send(successResult);
                            } else {
                                let errorResult = new ResultError(400, true, "Customer Not Updated", result, '');
                                next(errorResult);
                            }
                        }
                    }

                } else {
                    if (profilePicUrl.includes("https:")) {
                        let dDate = null;
                        if (birthdate)
                            dDate = new Date(birthdate).getFullYear().toString() + '-' + ("0" + (new Date(birthdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthdate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthdate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthdate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthdate).getSeconds())).slice(-2);
                        let sql = `CALL customerUpdateCustomerProfile(` + userId + `,` + customerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + dDate + `','` + email + `')`;
                        console.log(sql);
                        let result = await query(sql);
                        if (result && result[0].length > 0) {
                            console.log(result);
                            let successResult = new ResultSuccess(200, true, 'Customer Updated', result[0], 1);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        } else {
                            let errorResult = new ResultError(400, true, "Customer Not Updated", result, '');
                            next(errorResult);
                        }
                    } else {
                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                        let checkUrlResult = await query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0) {
                            if (checkUrlResult[0].profilePicUrl) {
                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                const delResp = await S3.deleteObject({
                                    Bucket: 'creditappcustomerprofilepic',
                                    Key: splt[splt.length - 1],
                                }, async (err, data) => {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    } else {

                                        let buf = Buffer.from(profilePicUrl, 'base64');
                                        let contentType;

                                        contentType = 'image/jpeg'
                                        let isErr = false;

                                        let keyName = fullName.replace(" ", "_");

                                        let params = {
                                            Bucket: 'creditappcustomerprofilepic',
                                            Key: keyName + "_" + customerId + "_" + new Date().getTime(),
                                            Body: buf,
                                            ContentEncoding: 'base64',
                                            ContentType: contentType,
                                            ACL: 'public-read'
                                        };
                                        await S3.upload(params, async (error, data) => {
                                            if (error) {
                                                isErr = true;
                                                let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                                next(errorResult);
                                                return;
                                            }

                                            console.log(data);
                                            let dDate = null;
                                            if (birthdate)
                                                dDate = new Date(birthdate).getFullYear().toString() + '-' + ("0" + (new Date(birthdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthdate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthdate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthdate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthdate).getSeconds())).slice(-2);
                                            let sql = `CALL customerUpdateCustomerProfileWithPic(` + userId + `,` + customerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + dDate + `','` + data.Location + `','` + email + `')`;
                                            console.log(sql);
                                            let result = await query(sql);
                                            if (result && result[0].length > 0) {
                                                console.log(result);
                                                let successResult = new ResultSuccess(200, true, 'Customer Updated', result[0], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            } else {
                                                let errorResult = new ResultError(400, true, "Customer Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        });

                                    }
                                });
                            } else {
                                let buf = Buffer.from(profilePicUrl, 'base64');
                                let contentType;

                                contentType = 'image/jpeg'
                                let isErr = false;
                                let keyName = fullName.replace(" ", "_");
                                let params = {
                                    Bucket: 'creditappcustomerprofilepic',
                                    Key: keyName + "_" + customerId + "_" + new Date().getTime(),
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: contentType,
                                    ACL: 'public-read'
                                };
                                await S3.upload(params, async (error, data) => {
                                    if (error) {
                                        isErr = true;
                                        let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                                        next(errorResult);
                                        return;
                                    }

                                    console.log(data);
                                    let dDate = null;
                                    if (birthdate)
                                        dDate = new Date(birthdate).getFullYear().toString() + '-' + ("0" + (new Date(birthdate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthdate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthdate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthdate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthdate).getSeconds())).slice(-2);
                                    let sql = `CALL customerUpdateCustomerProfileWithPic(` + userId + `,` + customerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + dDate + `','` + data.Location + `','` + email + `' )`;
                                    console.log(sql);
                                    let result = await query(sql);
                                    if (result && result[0].length > 0) {
                                        console.log(result);
                                        let successResult = new ResultSuccess(200, true, 'Customer Updated', result[0], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    } else {
                                        let errorResult = new ResultError(400, true, "Customer Not Updated", result, '');
                                        next(errorResult);
                                    }
                                });
                            }
                        }
                    }
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
        let errorResult = new ResultError(500, true, 'users.updateCustomerProfile()', error, '');
        next(errorResult);
    }
};

const insertRequestForBecomePartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let customerId = req.body.customerId;
                let fullName = req.body.fullName ? req.body.fullName : "";
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
                let cityId = req.body.cityId ? req.body.cityId : "";
                let district = req.body.district ? req.body.district : "";
                let state = req.body.state ? req.body.state : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let gender = req.body.gender ? req.body.gender : "";
                let contactNo = req.body.contactNo ? req.body.contactNo : "";
                let aadharCardNo = req.body.aadharCardNo ? req.body.aadharCardNo : "";
                let jobType = req.body.jobType ? req.body.jobType : "";
                let businessCommitement = req.body.businessCommitement ? req.body.businessCommitement : "";
                let pincode = req.body.pincode ? req.body.pincode : "";

                let sql = `INSERT INTO becomeapartnerrequest (fullName, contactNo, customerId, gender, aadharCardNo, panCardNo, businessCommitement, jobType, addressLine1, addressLine2, pincode, cityId, district, state, createdBy, modifiedBy) 
                VALUES ('` + fullName + `','` + contactNo + `',` + customerId + `,'` + gender + `','` + aadharCardNo + `','` + panCardNo + `','` + businessCommitement + `','` + jobType + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + district + `','` + state + `',` + userId + `,` + userId + `)`
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Insert Request SuccessFully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "Not Insert Request", result, '');
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
        let errorResult = new ResultError(500, true, 'users.insertRequestForBecomePartner()', error, '');
        next(errorResult);
    }
};

const checkStatusForBecomeapartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['customerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Customer Get Non Disbursed Loan');
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let isAllow = false;
                let isLoanAvailable = false;
                let loans = await query(`SELECT id FROM customerloans WHERE customerId = ?`, req.body.customerId);
                if (loans && loans.length > 0) {
                    let sql = `CALL customerGetNonDisbursedLoan(` + req.body.customerId + `)`;
                    console.log(sql);
                    let result = await query(sql);
                    if (result && result[0].length > 0) {
                        isAllow = false;
                        let data = {
                            "isAllow": isAllow,
                            "isLoanAvailable": true,
                        }
                        let successResult = new ResultSuccess(200, true, 'Loan Exist', data, 1);
                        return res.status(200).send(successResult);
                    }
                    else if (result && result[0].length == 0) {
                        isAllow = true;
                        let data = {
                            "isAllow": isAllow,
                            "isLoanAvailable": true,
                        }
                        let successResult = new ResultSuccess(200, true, 'Loan Exist', data, 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                        next(errorResult);
                    }
                }
                else {
                    isLoanAvailable = false;
                    let data = {
                        "isLoanAvailable": false,
                        "isAllow": false
                    }
                    let successResult = new ResultSuccess(200, true, 'Loan Exist', data, 1);
                    return res.status(200).send(successResult);
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
        let errorResult = new ResultError(500, true, 'users.checkStatusForBecomeapartner()', error, '');
        next(errorResult);
    }
};

export default { clientVerifyContact, checkContactNoExist, validateSessionToken, updateCustomerDetail, updateCustomerProfile, insertRequestForBecomePartner, checkStatusForBecomeapartner };