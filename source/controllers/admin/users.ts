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
import { RoleResponse } from '../../classes/output/admin/roleResponse';
import { UserResponse } from '../../classes/output/admin/userResponse';

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

const NAMESPACE = 'Users';

const algorithm = "aes-128-cbc";
const secretKey = "MyPassWord";

const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Login');
        var requiredFields = ['email', 'password'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
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
                const password = await passwordEncryption(req.body.password);
                var sessionToken = crypto.randomBytes(48).toString('hex');
                let sql = `CALL adminLogin('` + req.body.email + `','` + password + `','` + sessionToken + `',` + appId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    let userRole;
                    let user;
                    if (result[0] && result[0].length > 0) {
                        if (result[0][0].message && result[0][0].message == "User Not Verified") {
                            let errorResult = new ResultError(400, true, "User Not Verified", new Error('User Not Verified'), '');
                            next(errorResult);
                            return;
                        } else {
                            userRole = new RoleResponse(result[0][0].id, result[0][0].name);
                        }

                    }
                    if (result[1] && result[1].length > 0) {
                        let decryptPassword = await passwordDecryption(result[1][0].password);
                        user = new UserResponse(result[1][0].id, result[1][0].fullName, result[1][0].gender, result[1][0].email, result[1][0].countryCode, result[1][0].contactNo
                            , decryptPassword, result[1][0].profilePicUrl, result[1][0].isBlocked, result[1][0].isPasswordSet, result[1][0].isEmailVerified, result[1][0].isDisabled
                            , result[1][0].isActive, result[1][0].isDelete, result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, sessionToken
                            , result[1][0].roleId, userRole);
                    }
                    let successResult = new ResultSuccess(200, true, 'Login Successfull ', [user], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                    // else {
                    //     let errorResult = new ResultError(400, true, "Login Failed", new Error("Email Or Password was Invalid"), '');
                    //     next(errorResult);
                    // }
                } else {
                    let errorResult = new ResultError(400, true, "Login Failed", result, '');
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
        let errorResult = new ResultError(500, true, 'Users.login() Exception', error, '');
        next(errorResult);
    }
};

const passwordEncryption = async (password) => {
    var result;
    var encrypted;
    try {
        let passwordBuff = Buffer.from(password, "base64");
        let newPassWord = passwordBuff.toString("utf-8");
        var mykey = crypto.createCipher(algorithm, secretKey);
        var mystr = mykey.update(newPassWord, "utf8", "hex");
        result = mystr += mykey.final("hex");
    } catch (err) {
        result = err;
    }
    return result;
};

const passwordDecryption = async (password) => {
    var result;
    try {
        var mykey = crypto.createDecipher(algorithm, secretKey);
        var mystr = mykey.update(password, "hex", "utf8");
        result = mystr += mykey.final("utf8");
    } catch (err) {
        result = err;
    }
    return result;
};

const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting User');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let roleIds = req.body.roleIds ? req.body.roleIds : [10, 7];
                let searchString = req.body.searchString ? req.body.searchString : '';
                //Currently Not set OFFSET and LIMIT in SP
                if (req.body.roleIds && req.body.roleIds.length > 0) {
                    let roleIds;
                    for (let index = 0; index < req.body.roleIds.length; index++) {
                        if (index == 0) {
                            roleIds = req.body.roleIds[index];
                        }
                        else
                            roleIds = roleIds + "," + req.body.roleIds[index];
                    }
                    req.body.roleIds = roleIds
                }
                let sql = "CALL adminGetUsers(" + startIndex + "," + fetchRecords + ",'" + roleIds + "','" + searchString + "')";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        for (let i = 0; i < result[0].length; i++) {
                            if (result[0][i].password) {
                                let password;
                                var mykey = crypto.createDecipher(algorithm, secretKey);
                                var mystr = mykey.update(result[0][i].password, 'hex', 'utf8')
                                password = mystr += mykey.final('utf8');
                                result[0][i].password = password;
                            }
                        }
                        let successResult = new ResultSuccess(200, true, 'Get User', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Error While Getting User", result, '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting User", result, '');
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
        let errorResult = new ResultError(500, true, 'Users.getUser() Exception', error, '');
        next(errorResult);
    }
};

const insertUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting User');
        var requiredFields = ['fullName', 'gender', 'email', 'password', 'roleId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUserId = authorizationResult.currentUser.id;
                let profilePicUrl = req.body.profilePicUrl;
                let fullName = req.body.fullName;
                let gender = req.body.gender;
                let email = req.body.email;
                let password = await passwordEncryption(req.body.password);;
                let roleId = req.body.roleId;
                let contactNo = req.body.contactNo
                let designation = req.body.designation ? req.body.designation : '';
                let permissionGroupId = req.body.permissionGroupId ? req.body.permissionGroupId : 0;
                let userId
                let successResult;
                if (profilePicUrl) {
                    let contentType;
                    contentType = 'image/jpeg';
                    let fileExt = contentType.split("/")[1].split("+")[0];
                    let buf = Buffer.from(profilePicUrl, 'base64');
                    let keyName = fullName.replace(" ", "_");
                    let params = {
                        Bucket: 'creditappadminuserprofilepic',
                        Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                        Body: buf,
                        ContentEncoding: 'base64',
                        ContentType: contentType,
                        ACL: 'public-read'
                    };
                    await S3.upload(params, async (error, data) => {
                        if (error) {
                            let errorResult = new ResultError(500, true, 'File Not Uploaded', error, '');
                            next(errorResult);
                            return;
                        }

                        let sql = "CALL adminInsertUsers('" + fullName + "','" + gender + "','" + email + "','" + contactNo + "','" + password + "','" + data.Location + "'," + currentUserId + ", false, " + permissionGroupId + "," + roleId + ",'" + designation + "')";//true
                        let result = await query(sql);
                        if (result && result[1].affectedRows >= 0) {
                            userId = result[0][0].userId
                            successResult = new ResultSuccess(200, true, 'User Inserted', result[0], 1);
                        } else {
                            let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                            next(errorResult);
                        }
                    });
                } else {
                    let sql = "CALL adminInsertUsers('" + fullName + "','" + gender + "','" + email + "','" + contactNo + "','" + password + "',''," + currentUserId + ", false, " + permissionGroupId + ", " + roleId + ",'" + designation + "')";//true
                    let result = await query(sql);
                    if (result && result[1].affectedRows >= 0) {
                        successResult = new ResultSuccess(200, true, 'User Inserted', result, 1);
                        userId = result[0][0].userId

                    } else {
                        let errorResult = new ResultError(400, true, "Error While Inserting User", result, '');
                        next(errorResult);
                    }
                }
                if (req.body.userPages && req.body.userPages.length > 0) {
                    let pageResult
                    for (let i = 0; i < req.body.userPages.length; i++) {
                        req.body.userPages[i].readPermission = req.body.userPages[i].readPermission ? req.body.userPages[i].readPermission : false;
                        req.body.userPages[i].writePermission = req.body.userPages[i].writePermission ? req.body.userPages[i].writePermission : false;
                        req.body.userPages[i].editPermission = req.body.userPages[i].editPermission ? req.body.userPages[i].editPermission : false;
                        req.body.userPages[i].deletePermission = req.body.userPages[i].deletePermission ? req.body.userPages[i].deletePermission : false;
                        req.body.userPages[i].isAdminVerificationRequired = req.body.userPages[i].isAdminVerificationRequired ? req.body.userPages[i].isAdminVerificationRequired : false;
                        let sql = `INSERT INTO userpages(userId, pageId, readPermission, writePermission, editPermission, deletePermission,isAdminVerificationRequired, createdBy, modifiedBy) VALUES(` + userId + `,` + req.body.userPages[i].pageId + `,` + req.body.userPages[i].readPermission + `,` + req.body.userPages[i].writePermission + `
                            ,` + req.body.userPages[i].editPermission + `,` + req.body.userPages[i].deletePermission + `,` + req.body.userPages[i].isAdminVerificationRequired + `,` + currentUserId + `,` + currentUserId + `)`;
                        pageResult = await query(sql);
                        if (pageResult && pageResult.affectedRows > 0) {
                            //
                        } else {
                            await rollback();
                            let errorResult = new ResultError(400, true, "Error While Updating User Page Permission", pageResult, '');
                            next(errorResult);
                        }
                    }
                    let successResult = new ResultSuccess(200, true, 'Inserting User  Successfully', [], 0);
                    return res.status(200).send(successResult);
                }
                else {
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
        let errorResult = new ResultError(500, true, 'Users.insertUser() Exception', error, '');
        next(errorResult);
    }
};

const getRM = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting RM');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let searchString = req.body.searchString ? req.body.searchString : "";
                //Currently Not set OFFSET and LIMIT in SP
                let sql = "CALL adminGetRM(" + startIndex + "," + fetchRecords + ",'" + searchString + "')";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[1] && result[1].length > 0) {
                        for (let i = 0; i < result[1].length; i++) {
                            let password;
                            var mykey = crypto.createDecipher(algorithm, secretKey);
                            var mystr = mykey.update(result[1][i].password, 'hex', 'utf8')
                            password = mystr += mykey.final('utf8');
                            result[1][i].password = password;
                        }
                        let successResult = new ResultSuccess(200, true, 'Get RM', result[1], result[0][0].totalCount);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(200, true, "RM Not Available", [], 0);
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting RM", result, '');
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
        let errorResult = new ResultError(500, true, 'Users.getUser() Exception', error, '');
        next(errorResult);
    }
};

const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Updating User');
        var requiredFields = ['id', 'fullName', 'gender', 'email', 'password'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUserId = authorizationResult.currentUser.id;
                let profilePicUrl = req.body.profilePicUrl;
                let fullName = req.body.fullName;
                let gender = req.body.gender;
                let email = req.body.email;
                let contactNo = req.body.contactNo;
                let password = await passwordEncryption(req.body.password);;
                let successResult
                let result;
                let getSql = `SELECT * FROM userpages WHERE  userId = ` + req.body.id;
                let getResult = await query(getSql);
                if (getResult && getResult.length > 0) {
                    let ar1 = getResult.map(c => c.pageId);
                    let ar2 = req.body.userPages.map(c => c.pageId)
                    var elmts = ar1.filter(f => !ar2.includes(f));
                    console.log(elmts);
                    if (elmts && elmts.length > 0) {
                        let delSql = "DELETE FROM userpages WHERE userId = " + req.body.id + " AND pageId IN(" + elmts.toString() + ")";
                        result = await query(delSql);
                    }
                }

                if (req.body.userPages && req.body.userPages.length > 0) {
                    for (let i = 0; i < req.body.userPages.length; i++) {
                        req.body.userPages[i].readPermission = req.body.userPages[i].readPermission ? req.body.userPages[i].readPermission : false;
                        req.body.userPages[i].writePermission = req.body.userPages[i].writePermission ? req.body.userPages[i].writePermission : false;
                        req.body.userPages[i].editPermission = req.body.userPages[i].editPermission ? req.body.userPages[i].editPermission : false;
                        req.body.userPages[i].deletePermission = req.body.userPages[i].deletePermission ? req.body.userPages[i].deletePermission : false;
                        req.body.userPages[i].isAdminVerificationRequired = req.body.userPages[i].isAdminVerificationRequired ? req.body.userPages[i].isAdminVerificationRequired : false;

                        if (req.body.userPages[i].id && req.body.userPages[i].id > 0) {
                            let sql = `UPDATE userpages SET userId = ` + req.body.id + `, pageId = ` + req.body.userPages[i].pageId + `, readPermission = ` + req.body.userPages[i].readPermission + `, writePermission = ` + req.body.userPages[i].writePermission + `
                            , editPermission = ` + req.body.userPages[i].editPermission + `, deletePermission = ` + req.body.userPages[i].deletePermission + `,isAdminVerificationRequired = ` + req.body.userPages[i].isAdminVerificationRequired + `, modifiedBy = ` + currentUserId + `, modifiedDate = CURRENT_TIMESTAMP() WHERE id = ` + req.body.userPages[i].id;
                            result = await query(sql);
                            if (result && result.affectedRows > 0) {
                                //
                            } else {
                                await rollback();
                                let errorResult = new ResultError(400, true, "Error While Updating User Page Permission", result, '');
                                next(errorResult);
                            }
                        } else {
                            let sql = `INSERT INTO userpages(userId, pageId, readPermission, writePermission, editPermission, deletePermission,isAdminVerificationRequired, createdBy, modifiedBy) VALUES(` + req.body.id + `,` + req.body.userPages[i].pageId + `,` + req.body.userPages[i].readPermission + `,` + req.body.userPages[i].writePermission + `
                            ,` + req.body.userPages[i].editPermission + `,` + req.body.userPages[i].deletePermission + `,` + req.body.userPages[i].isAdminVerificationRequired + `,` + currentUserId + `,` + currentUserId + `)`;
                            result = await query(sql);
                            if (result && result.affectedRows > 0) {
                                //
                            } else {
                                await rollback();
                                let errorResult = new ResultError(400, true, "Error While Updating User Page Permission", result, '');
                                next(errorResult);
                            }
                        }
                    }
                    let pageSuccessResult = new ResultSuccess(200, true, 'Updating User Page Permission Successfully', [], 0);

                }
                if (!profilePicUrl) {
                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + req.body.id;
                    let checkUrlResult = await query(checkUrlSql);
                    if (checkUrlResult && checkUrlResult.length > 0) {
                        if (checkUrlResult[0].profilePicUrl.includes("https:")) {
                            let splt = checkUrlResult[0].profilePicUrl.split("/");
                            const delResp = await S3.deleteObject({
                                Bucket: 'creditappadminuserprofilepic',
                                Key: splt[splt.length - 1],
                            }, async (err, data) => {
                                if (err) {
                                    console.log("Error: Object delete failed.");
                                    let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                    next(errorResult);
                                } else {
                                    try {
                                        let sql = `CALL adminUpdateUser(` + req.body.id + `,'` + fullName + `','` + gender + `','` + email + `','` + contactNo + `','` + password + `',` + `''` + `,` + currentUserId + `,'` + req.body.designation + `',` + req.body.roleId + `)`;
                                        console.log(sql);
                                        let result = await query(sql);
                                        if (result && result.affectedRows >= 0) {
                                            successResult = new ResultSuccess(200, true, 'User Updated', result[0], 1);
                                            return res.status(200).send(successResult)
                                        } else {
                                            let errorResult = new ResultError(400, true, "User Not Updated", result, '');
                                            next(errorResult);
                                        }
                                    }
                                    catch (error) {
                                        let errorResult = new ResultError(500, true, 'Users.updateUser() Exception', error, '');
                                        next(errorResult);
                                    }
                                }
                            });
                        } else {
                            try {
                                let sql = `CALL adminUpdateUser(` + req.body.id + `,'` + fullName + `','` + gender + `','` + email + `','` + contactNo + `','` + password + `',` + `''` + `,` + currentUserId + `,'` + req.body.designation + `',` + req.body.roleId + `)`;
                                console.log(sql);
                                let result = await query(sql);
                                if (result && result.affectedRows >= 0) {

                                    successResult = new ResultSuccess(200, true, 'User Updated', result[0], 1);
                                    return res.status(200).send(successResult)
                                } else {
                                    let errorResult = new ResultError(400, true, "User Not Updated", result, '');
                                    next(errorResult);
                                }
                            }
                            catch (error) {
                                let errorResult = new ResultError(500, true, 'Users.updateUser() Exception', error, '');
                                next(errorResult);
                            }
                        }
                    }

                } else {
                    if (profilePicUrl.includes("https:")) {
                        try {
                            let sql = `CALL adminUpdateUser(` + req.body.id + `,'` + fullName + `','` + gender + `','` + email + `','` + contactNo + `','` + password + `','` + profilePicUrl + `',` + currentUserId + `,'` + req.body.designation + `',` + req.body.roleId + `)`;
                            console.log(sql);
                            let result = await query(sql);
                            if (result && result.affectedRows >= 0) {

                                successResult = new ResultSuccess(200, true, 'User Updated', result[0], 1);
                                return res.status(200).send(successResult)
                            } else {
                                let errorResult = new ResultError(400, true, "User Not Updated", result, '');
                                next(errorResult);
                            }
                        }
                        catch (error) {
                            let errorResult = new ResultError(500, true, 'Users.updateUser() Exception', error, '');
                            next(errorResult);
                        }
                    } else {
                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + req.body.id;
                        let checkUrlResult = await query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0) {
                            if (checkUrlResult[0].profilePicUrl) {
                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                const delResp = await S3.deleteObject({
                                    Bucket: 'creditappadminuserprofilepic',
                                    Key: splt[splt.length - 1],
                                }, async (err, data) => {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    } else {
                                        try {
                                            let buf = Buffer.from(profilePicUrl, 'base64');
                                            let contentType;

                                            contentType = 'image/jpeg'
                                            let isErr = false;

                                            let keyName = fullName.replace(" ", "_");

                                            let params = {
                                                Bucket: 'creditappadminuserprofilepic',
                                                Key: keyName + "_" + req.body.id + "_" + new Date().getTime(),
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
                                                let sql = `CALL adminUpdateUser(` + req.body.id + `,'` + fullName + `','` + gender + `','` + email + `','` + contactNo + `','` + password + `','` + data.Location + `',` + currentUserId + `,'` + req.body.designation + `',` + req.body.roleId + `)`;

                                                let result = await query(sql);
                                                if (result && result.affectedRows >= 0) {
                                                    successResult = new ResultSuccess(200, true, 'User Updated', result[0], 1);
                                                    return res.status(200).send(successResult)
                                                } else {
                                                    let errorResult = new ResultError(400, true, "User Not Updated", result, '');
                                                    next(errorResult);
                                                }
                                            });
                                        }
                                        catch (error) {
                                            let errorResult = new ResultError(500, true, 'Users.updateUser() Exception', error, '');
                                            next(errorResult);
                                        }
                                    }
                                });
                            } else {
                                let buf = Buffer.from(profilePicUrl, 'base64');
                                let contentType;

                                contentType = 'image/jpeg'
                                let isErr = false;
                                let keyName = fullName.replace(" ", "_");
                                let params = {
                                    Bucket: 'creditappadminuserprofilepic',
                                    Key: keyName + "_" + req.body.id + "_" + new Date().getTime(),
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
                                    try {
                                        let sql = `CALL adminUpdateUser(` + req.body.id + `,'` + fullName + `','` + gender + `','` + email + `','` + contactNo + `','` + password + `','` + data.Location + `',` + currentUserId + `,'` + req.body.designation + `',` + req.body.roleId + `)`;
                                        console.log(sql);
                                        let result = await query(sql);
                                        if (result && result.affectedRows >= 0) {

                                            successResult = new ResultSuccess(200, true, 'User Updated', result[0], 1);
                                            return res.status(200).send(successResult)
                                        } else {
                                            let errorResult = new ResultError(400, true, "User Not Updated", result, '');
                                            next(errorResult);
                                        }
                                    }
                                    catch (error) {
                                        let errorResult = new ResultError(500, true, 'Users.updateUser() Exception', error, '');
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
        let errorResult = new ResultError(500, true, 'Users.updateUser() Exception', error, '');
        next(errorResult);
    }
};

const removeUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Removing User');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "CALL adminRemoveUser(" + req.body.id + "," + authorizationResult.currentUser.id + ")";
                let result = await query(sql);
                if (result && result.affectedRows > 0) {
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'User Removed', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "User Not Removed", result, '');
                    next(errorResult);
                }
            }
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'Users.removeUser() Exception', error, '');
        next(errorResult);
    }
};

const blockUnBlockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'activeInactive User');
        var requiredFields = ['id'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let sql = "CALL adminBlockUnBlockUser(" + req.body.id + "," + userId + ")";
                let result = await query(sql);
                if (result && result.affectedRows > 0) {
                    console.log(result);
                    let successResult = new ResultSuccess(200, true, 'User blockUnBlock', result[0], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "User Not Updated", result, '');
                    next(errorResult);
                }
            }
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'Users.blockUnBlockUser() Exception', error, '');
        next(errorResult);
    }
};


const getAdminCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Admin Commission');
        var requiredFields = [];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let bankId = req.body.bankId ? req.body.bankId : 0
                let serviceId = req.body.serviceId ? req.body.serviceId : 0;
                let sql = "CALL adminGetCommission(" + startIndex + "," + fetchRecords + "," + bankId + "," + serviceId + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[1] && result[1].length > 0) {

                        let successResult = new ResultSuccess(200, true, 'Get AdminCommission', result[1], result[0][0].totalCount);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(200, true, "Commission Not Available", [], 0);
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Error While Getting Commission", result, '');
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
        let errorResult = new ResultError(500, true, 'Users.getAdminCommission() Exception', error, '');
        next(errorResult);
    }
};


export default { login, insertUser, getUser, getRM, updateUser, removeUser, blockUnBlockUser, getAdminCommission };