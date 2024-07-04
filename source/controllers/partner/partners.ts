import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { RoleResponse } from '../../classes/output/partner/roleResponse';
import { userResponse } from '../../classes/output/partner/usersResponse';
import { partnerResponse } from '../../classes/output/partner/partnerResponse';
import notificationContainer from './../notifications';

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

const NAMESPACE = 'Partners';

const insertPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Partner');
        var requiredFields = ['roleId', 'contactNo', 'fullName', 'cityId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let roleId = req.body.roleId;
                let roleName = req.body.roleName;
                let temporaryCode = '';
                let lastTempCodeSql = 'CALL websiteGetLastPartner()';
                let lastTempCodeResult = await query(lastTempCodeSql);
                if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                    let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split('_')[1]);
                    temporaryCode = 'TEMP_' + (no + 1).toString().padStart(10, '0');
                } else {
                    temporaryCode = 'TEMP_0000000001';
                }
                let fullName = req.body.fullName;
                let gender = req.body.gender ? req.body.gender : "";
                let email = req.body.email ? req.body.email : "";
                let contactNo = req.body.contactNo;
                let countryCode = req.body.countryCode ? req.body.countryCode : '+91';
                let aadhaarCardNo = req.body.aadhaarCardNo ? req.body.aadhaarCardNo : "";
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
                let cityId = req.body.cityId ? req.body.cityId : null;
                let companyName = req.body.companyName ? req.body.companyName : "";
                let professionTypeId = req.body.professionTypeId ? req.body.professionTypeId : null;
                let workExperience = req.body.workExperience ? req.body.workExperience : null;
                let haveOffice = req.body.haveOffice ? req.body.haveOffice : 0;
                let businessName = req.body.businessName ? req.body.businessName : "";
                let gstNo = req.body.gstNo ? req.body.gstNo : "";
                let commitment = req.body.commitment ? req.body.commitment : null;
                let referralCode = req.body.referralCode ? req.body.referralCode : "";
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : "";


                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode ? req.body.pincode : "";

                let workAddressCityId = req.body.workAddressCityId ? req.body.workAddressCityId : null;
                let businessAddress = req.body.businessAddress ? req.body.businessAddress : "";
                let businessaddressLine1 = req.body.businessaddressLine1 ? req.body.businessaddressLine1 : "";
                let businessaddressLine2 = req.body.businessaddressLine2 ? req.body.businessaddressLine2 : "";
                let businesspincode = req.body.businesspincode ? req.body.businesspincode : "";


                let designationId = req.body.designationId ? req.body.designationId : null;
                let educationTypeId = req.body.educationTypeId ? req.body.educationTypeId : null;
                let instituteName = req.body.instituteName ? req.body.instituteName : "";
                let passingYear = req.body.passingYear ? req.body.passingYear : null;
                let resume = req.body.resume ? req.body.resume : "";
                let otherDetail = req.body.otherDetail ? req.body.otherDetail : "";
                let jobType = req.body.jobType ? req.body.jobType : null;

                let parentParnerId = null;
                if (dsaCode) {
                    let checkCodeSQl = `CALL dsaBazarCheckDSAByCode('` + dsaCode + `')`;
                    let checkCodeResult = await query(checkCodeSQl);
                    if (checkCodeResult && checkCodeResult.length > 0 && checkCodeResult[0].length > 0) {
                        parentParnerId = checkCodeResult[0][0].id;
                    }
                    if (roleName.toLowerCase() == "dsa")
                        roleId = 4; //SubDSA Role
                }

                let sql =
                    `CALL dsaBazarInsertPartner(` + roleId + `,'` + temporaryCode + `','` + fullName + `','` + gender + `','` + email + `','` + countryCode + `','` + contactNo + `','` + aadhaarCardNo + `','` + panCardNo + `',` + cityId + `,'` + companyName + `'
                ,`+ professionTypeId + `,` + workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + referralCode + `',` + parentParnerId + `,` + designationId + `,` + authorizationResult.currentUser.id + `)`;
                console.log(sql);
                var result = await query(sql);
                console.log(JSON.stringify(result));
                if (result && result.length > 0 && result[0].length > 0) {
                    console.log(result[0]);
                    if (result[0][0].message == "Contact No Already Exist") {
                        let errorResult = new ResultError(400, true, "Contact No Already Exist", new Error('Contact No Already Exist'), '');
                        next(errorResult);
                        return;
                    } else {
                        let partnerId = result[0][0].insertId;

                        //#region DSA Verify
                        //Temporory Solution untill verify DSA from Admin Side Not implemented
                        // let pCode = temporaryCode.replace("T", "");
                        // let generatePermanentCodeSQL = "UPDATE partners SET permanentCode = '" + pCode + "' WHERE id=" + partnerId;
                        // let generatePermanentCodeRes = await query(generatePermanentCodeSQL);
                        // let getUserIdSql = "SELECT userId FROM partners WHERE id=" + partnerId;
                        // let getUserIdResult = await query(getUserIdSql);
                        // let verifyDSASql = "UPDATE users SET isDisabled = 0 WHERE id = " + getUserIdResult[0].userId;
                        // let verifyDSAResult = await query(verifyDSASql);
                        //#endregion DSA Verify

                        let userRole;
                        let user;
                        let parentPartner;
                        userRole = new RoleResponse(result[0][0].id, result[0][0].name);
                        if (result[2] && result[2].length > 0) {
                            parentPartner = new partnerResponse(result[2][0].id, result[2][0].parentParnerId, result[2][0].userId, result[2][0].temporaryCode
                                , result[2][0].permanentCode, result[2][0].fullName, result[2][0].gender, result[2][0].contactNo, result[2][0].aadhaarCardNo
                                , result[2][0].panCardNo, result[2][0].cityId, result[2][0].companyName, result[2][0].companyTypeId, result[2][0].udhyamAadhaarNo
                                , result[2][0].companyRegNo, result[2][0].professionTypeId, result[2][0].workExperience, result[2][0].haveOffice, result[2][0].businessName
                                , result[2][0].businessAddress, result[2][0].gstNo, result[2][0].commitment, result[2][0].designationId, result[2][0].referralCode
                                , result[2][0].isActive, result[2][0].isDelete, result[2][0].createdDate, result[2][0].modifiedDate, result[2][0].createdBy, result[2][0].modifiedBy, result[2][0].profilePicUrl);
                        }
                        if (result[1] && result[1].length > 0) {
                            let profilePicUrl;
                            if (result[2][0]) {
                                profilePicUrl = result[2][0].profilePicUrl;
                            }

                            let partnerBadgeSql = "SELECT * FROM partnerbadges WHERE badgeId = " + result[1][0].currentBadgeId;
                            let partnerBadgeResult = await query(partnerBadgeSql);

                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, profilePicUrl
                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
                        }

                        let addressSql =
                            `CALL dsaBazarPartnerAddress(` + partnerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `);`;
                        console.log(addressSql);
                        var addressResult = await query(addressSql);
                        console.log(addressResult);

                        if (parentParnerId) {
                            if (roleName.toLowerCase() == "employee") {
                                //Team
                                let teamSql = `CALL dsaBazarInsertPartnerInTeam(` + parentParnerId + `,` + partnerId + `,null)`;
                                console.log(teamSql);
                                var teamResult = await query(teamSql);
                                console.log(teamResult);
                            } else {
                                //Network
                                let networkSql = `CALL dsaBazarInsertPartnerInNetwork(` + parentParnerId + `,` + partnerId + `,null)`;
                                console.log(networkSql);
                                var networkResult = await query(networkSql);
                                console.log(networkResult);
                            }
                        }

                        if (req.body.resume) {

                            let buf = Buffer.from(req.body.resume, 'base64');
                            let isErr = false;
                            let params = {
                                Bucket: 'dsaappsignupdocuments',
                                Key: "resume_" + partnerId + "_" + new Date().getTime(),
                                Body: buf,
                                ContentEncoding: 'base64',
                                ContentType: 'application/pdf',
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
                                let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                console.log(documentSql);
                                var documentResult = await query(documentSql);
                                console.log(documentResult);
                            });
                            if (isErr) {
                                let errorResult = new ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                next(errorResult);
                                return;
                            }
                        } else {
                            let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                            console.log(documentSql);
                            var documentResult = await query(documentSql);
                            console.log(documentResult);
                        }

                        if (req.body.documents && req.body.documents.length > 0) {
                            let cnt = 0;
                            for (let i = 0; i < req.body.documents.length; i++) {
                                const element = req.body.documents[i];

                                let buf = Buffer.from(req.body.documents[i].fileData, 'base64');

                                let isErr = false;
                                let params = {
                                    Bucket: 'dsaappsignupdocuments',
                                    Key: element.fileName + "_" + new Date().getTime(),
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: 'image/' + element.contentType,
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
                                    let documentSql = `CALL dsaBazarInsertPartnerDocument(` + partnerId + `,` + element.documentId + `,'` + data.Location + `');`;
                                    console.log(documentSql);
                                    var documentResult = await query(documentSql);
                                    console.log(documentResult);
                                    cnt++;
                                    if (cnt == req.body.documents.length) {
                                        let updateProfilePicSql = "UPDATE users INNER JOIN partners ON partners.userId = users.Id SET users.profilePicUrl='" + data.Location + "' WHERE partners.id = " + partnerId;
                                        let updateProfilePicResult = await query(updateProfilePicSql);
                                        console.log(updateProfilePicResult);
                                        var referCoin = 0;
                                        let referCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 2 AND FIND_IN_SET(" + roleId + ",roleIds)";
                                        let referCoinResult = await query(referCoinSql);
                                        if (referCoinResult && referCoinResult.length > 0) {
                                            referCoin = referCoinResult[0].rewardCoin;
                                            if (referCoinResult[0].isScratchCard) {
                                                let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + result[3][0].userId + `, ` + referCoin + `, 2, ` + result[3][0].userId + `, ` + result[3][0].userId + `);`;
                                                let rewardResult = await query(rewardSql);
                                            }
                                            else {
                                                let userWalletId;
                                                let userWalletIdResult = await query(`SELECT id,coin FROM userwallet WHERE userId = ?`, result[3][0].userId);
                                                if (userWalletIdResult && userWalletIdResult.length > 0) {
                                                    userWalletId = userWalletIdResult[0].id
                                                    let updateWalletAmountSql = await query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + authorizationResult.currentUser.id + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + referCoin)
                                                }
                                                else {
                                                    let insertWalletAmount = await query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + result[3][0].userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`)
                                                    if (insertWalletAmount && insertWalletAmount.insertId) {
                                                        userWalletId = insertWalletAmount.insertId
                                                    }
                                                }
                                                let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + result[3][0].userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `,` + 2 + `)`
                                                let walletResult = await query(walletSql);
                                            }

                                        }
                                        let successResult = new ResultSuccess(200, true, 'Partner Inserted', [user], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    }
                                });
                                if (isErr) {
                                    break;
                                }
                            }
                        } else {
                            var referCoin = 0;
                            let referCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 2 ";
                            let referCoinResult = await query(referCoinSql);
                            if (referCoinResult && referCoinResult.length > 0) {
                                referCoin = referCoinResult[0].rewardCoin;
                                if (referCoinResult[0].isScratchCard) {
                                    let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + result[3][0].userId + `, ` + referCoin + `, 2, ` + result[3][0].userId + `, ` + result[3][0].userId + `);`;
                                    let rewardResult = await query(rewardSql);
                                }
                                else {
                                    let userWalletId;
                                    let userWalletIdResult = await query(`SELECT id,coin FROM userwallet WHERE userId = ?`, result[3][0].userId);
                                    if (userWalletIdResult && userWalletIdResult.length > 0) {
                                        userWalletId = userWalletIdResult[0].id
                                        let updateWalletAmountSql = await query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + authorizationResult.currentUser.id + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + referCoin)
                                    }
                                    else {
                                        let insertWalletAmount = await query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + result[3][0].userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`)
                                        if (insertWalletAmount && insertWalletAmount.insertId) {
                                            userWalletId = insertWalletAmount.insertId
                                        }
                                    }
                                    let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + result[3][0].userId + `,` + referCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `,` + 2 + `)`
                                    let walletResult = await query(walletSql);
                                }
                            }

                            let successResult = new ResultSuccess(200, true, 'Partner Inserted', [user], 1);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        }
                    }
                } else {
                    let errorResult = new ResultError(400, true, 'Not Inserted', new Error('Not Inserted'), '');
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
        let errorResult = new ResultError(500, true, 'partners.insertPartner() Exception', error, '');
        next(errorResult);
    }
};

const getNetworkandTeamPartnerListByRoleId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner List Under DSA');
        var requiredFields = ['partnerId', 'roleIds'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let roleIds = req.body.roleIds;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let sql = `CALL dsaBazarGetPartnerByRoleIdandPartnerId(` + partnerId + `,'` + roleIds.toString() + `',` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Partners', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);

                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.insertPartner() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.insertPartner() Exception', error, '');
        next(errorResult);
    }
};

const getNetworkandTeamPartnerHierarchyListByRoleId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner List Under DSA');
        var requiredFields = ['partnerId', 'roleIds'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let roleIds = req.body.roleIds;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
                let sql = `CALL dsaBazarGetPartnerByRoleIdandPartnerId(` + partnerId + `,'` + roleIds + `',` + 0 + `,` + 0 + `)`;
                let result = await query(sql);
                let data;
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let connector = result[0].filter(c => c.roleId == 6)
                        let employee = result[0].filter(c => c.roleId == 5)
                        let subDsa = result[0].filter(c => c.roleId == 4)
                        if (subDsa && subDsa.length > 0) {
                            for (let i = 0; i < subDsa.length; i++) {
                                let subDsaSql = `CALL dsaBazarGetPartnerByRoleIdandPartnerId(` + subDsa[i].id + `,'` + '5,6' + `',` + 0 + `,` + 0 + `)`;
                                let subDsaResult = await query(subDsaSql);
                                if (subDsaResult[0] && subDsaResult[0].length > 0) {
                                    let subDsaConnector = subDsaResult[0].filter(c => c.roleId == 6)
                                    let subDsaEmployee = subDsaResult[0].filter(c => c.roleId == 5)
                                    subDsa[i].connector = subDsaConnector
                                    subDsa[i].employee = subDsaEmployee
                                }
                            }

                        }
                        data = {
                            "connector": connector,
                            "employee": employee,
                            "subDsa": subDsa
                        }
                        result = [data]
                        let successResult = new ResultSuccess(200, true, 'Get Partners', result, 1);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);

                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.insertPartner() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.insertPartner() Exception', error, '');
        next(errorResult);
    }
};

const getNetworkandTeamPartnerListByParentPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner List Under DSA');
        var requiredFields = ['partnerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let sql = `CALL dsaBazarGetPartnerByParentPartnerId(` + partnerId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Partners', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);

                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.getNetworkandTeamPartnerListByParentPartnerId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.getNetworkandTeamPartnerListByParentPartnerId() Exception', error, '');
        next(errorResult);
    }
};

const getPartnerDetailByPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner Detail By');
        var requiredFields = ['partnerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let sql = `CALL dsaBazarGetPartnerById(` + partnerId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let finalResult = { basicDetail: result[0][0], educations: null, documents: null, commission: null, loans: null, customers: null, assignTrainings: null, partnerAddress: null, visitingCard: null, employee: null, group: null, walletHistory: null, earning: null };
                        if (result[1] && result[1].length > 0) {
                            finalResult.educations = result[1];
                        }
                        if (result[2] && result[2].length > 0) {
                            finalResult.documents = result[2];
                        }
                        if (result[3] && result[3].length > 0) {
                            finalResult.commission = result[3];
                        }
                        if (result[4] && result[4].length > 0) {
                            finalResult.loans = result[4];
                        }
                        if (result[5] && result[5].length > 0) {
                            finalResult.customers = result[5];
                        }
                        if (result[6] && result[6].length > 0) {
                            finalResult.assignTrainings = result[6];
                        }
                        if (result[7] && result[7].length > 0) {
                            finalResult.partnerAddress = result[7];
                        }
                        if (result[8] && result[8].length > 0) {
                            finalResult.visitingCard = result[8];
                        }
                        if (result[9] && result[9].length > 0) {
                            finalResult.employee = result[9];
                        }
                        if (result[10] && result[10].length > 0) {
                            finalResult.group = result[10];
                        }
                        if (result[11] && result[11].length > 0) {
                            finalResult.walletHistory = result[11];
                        }
                        if (result[12] && result[12].length > 0) {
                            finalResult.earning = result[12];
                        }
                        let successResult = new ResultSuccess(200, true, 'Get Partner Detail By partnerId', [finalResult], 1);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Data Not Available", [], '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.getPartnerDetailByPartnerId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.getPartnerDetailByPartnerId() Exception', error, '');
        next(errorResult);
    }
};

const verifyPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Verifying Partner');
        var requiredFields = ['userId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let sql = "UPDATE users SET isDisabled = !isDisabled, modifiedBy = " + userId + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = " + req.body.userId;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let temporaryCodeSql = `SELECT partners.id as partnerId,partners.temporaryCode from partners WHERE partners.userId = ?`;
                    let temporaryCodeResult = await query(temporaryCodeSql, req.body.userId);

                    let permanentCode = '';
                    if (!req.body.permanentCode) {
                        permanentCode = temporaryCodeResult[0].temporaryCode.replace("TEMP", "P");
                    }
                    let generatePermanentCodeSQL = "UPDATE partners SET permanentCode = '" + permanentCode + "' WHERE id=" + temporaryCodeResult[0].partnerId;
                    let generatePermanentCodeRes = await query(generatePermanentCodeSQL);
                    //#region Notification
                    let partnerFcm = "";
                    let partnerUserId = req.body.userId;
                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + req.body.userId + " ORDER BY id DESC LIMIT 1";
                    let partnerFcmResult = await query(partnerFcmSql);
                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                        partnerFcm = partnerFcmResult[0].fcmToken;
                    }

                    let title = "Your Account Verified";
                    let description = "Your Account Verified";
                    var dataBody = {
                        type: 9,
                        id: req.body.userId,
                        title: title,
                        message: description,
                        json: null,
                        dateTime: null,
                        customerLoanId: null,
                        loanType: null,
                        creditCardId: null,
                        creditCardStatus: null
                    }

                    if (partnerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                VALUES(`+ partnerUserId + `, 9, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([partnerFcm], 9, partnerUserId, title, description, '', null, null, null, null, null, null);
                    }
                    //#endregion Notification

                    let successResult = new ResultSuccess(200, true, 'Verify Partner Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "partners.getPartnerDetailByPartnerId() Error", new Error("Error During Verifying Partner"), '');
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
        let errorResult = new ResultError(500, true, 'partners.getPartnerDetailByPartnerId() Exception', error, '');
        next(errorResult);
    }
};

const updatePartnerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['partnerId', 'fullName', 'contactNo', 'panCardNo', 'aadhaarCardNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Update Partner Profile');
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let fullName = req.body.fullName;
                let contactNo = req.body.contactNo;
                let panCardNo = req.body.panCardNo;
                let aadhaarCardNo = req.body.aadhaarCardNo;
                let gender = req.body.gender ? req.body.gender : "";
                let partnerAddressId = req.body.partnerAddressId ? req.body.partnerAddressId : null;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : null;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode ? req.body.pincode : "";
                let cityId = req.body.cityId ? req.body.cityId : null;
                let companyName = req.body.companyName ? req.body.companyName : "";
                let professionTypeId = req.body.professionTypeId ? req.body.professionTypeId : null;
                let workExperience = req.body.workExperience ? req.body.workExperience : null;
                let haveOffice = req.body.haveOffice ? req.body.haveOffice : 0;
                let businessName = req.body.businessName ? req.body.businessName : "";

                let gstNo = req.body.gstNo ? req.body.gstNo : "";
                let commitment = req.body.commitment ? req.body.commitment : null;
                let profilePicUrl = req.body.profilePicUrl ? req.body.profilePicUrl : "";
                let userId = authorizationResult.currentUser.id;

                let workAddressCityId = req.body.workAddressCityId ? req.body.workAddressCityId : null;
                let businessAddress = req.body.businessAddress ? req.body.businessAddress : "";
                let businessaddressLine1 = req.body.businessaddressLine1 ? req.body.businessaddressLine1 : "";
                let businessaddressLine2 = req.body.businessaddressLine2 ? req.body.businessaddressLine2 : "";
                let businesspincode = req.body.businesspincode ? req.body.businesspincode : "";

                let partnerEducationId = req.body.partnerEducationId ? req.body.partnerEducationId : null;
                let designationId = req.body.designationId ? req.body.designationId : null;
                let educationTypeId = req.body.educationTypeId ? req.body.educationTypeId : null;
                let instituteName = req.body.instituteName ? req.body.instituteName : "";
                let passingYear = req.body.passingYear ? req.body.passingYear : null;
                let resume = req.body.resume ? req.body.resume : "";
                let otherDetail = req.body.otherDetail ? req.body.otherDetail : "";
                let jobType = req.body.jobType ? req.body.jobType : null;

                if (req.body.resume) {
                    if (req.body.resume.includes("https:")) {
                        let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + req.body.resume + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                        console.log(documentSql);
                        var documentResult = await query(documentSql);
                        console.log(documentResult);

                        //#region ProfileUpdate
                        if (!profilePicUrl) {
                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                            let checkUrlResult = await query(checkUrlSql);
                            if (checkUrlResult && checkUrlResult.length > 0) {
                                if (checkUrlResult[0].profilePicUrl) {
                                    let splt = checkUrlResult[0].profilePicUrl.split("/");
                                    const delResp = await S3.deleteObject({
                                        Bucket: 'creditapppartnerprofilepic',
                                        Key: splt[splt.length - 1],
                                    }, async (err, data) => {
                                        if (err) {
                                            console.log("Error: Object delete failed.");
                                            let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                            next(errorResult);
                                        } else {
                                            let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'')`;
                                            console.log(sql);
                                            let result = await query(sql);
                                            if (result && result[0].length > 0) {

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
                                                if (result[4] && result[4].length > 0) {
                                                    parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                        , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                        , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                        , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                        , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                        , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                }
                                                if (result[1] && result[1].length > 0) {
                                                    let address;
                                                    if (result[2] && result[2].length > 0 && result[2][0]) {
                                                        address = result[2][0];
                                                    }
                                                    let education;
                                                    if (result[3] && result[3].length > 0 && result[3][0]) {
                                                        education = result[3][0];
                                                    }

                                                    let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                    let partnerBadgeResult = await query(partnerBadgeSql);

                                                    user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                        , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                        , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                        , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                        , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                        , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                        , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                        , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                        , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                        , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                        , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                        , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                }

                                                let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            } else {
                                                let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        }
                                    });
                                } else {
                                    let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                    ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                    ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                    console.log(sql);
                                    let result = await query(sql);
                                    if (result && result[0].length > 0) {

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
                                        if (result[4] && result[4].length > 0) {
                                            parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                        }
                                        if (result[1] && result[1].length > 0) {
                                            let address;
                                            if (result[2] && result[2].length > 0 && result[2][0]) {
                                                address = result[2][0];
                                            }
                                            let education;
                                            if (result[3] && result[3].length > 0 && result[3][0]) {
                                                education = result[3][0];
                                            }

                                            let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                            let partnerBadgeResult = await query(partnerBadgeSql);

                                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                        }

                                        let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    } else {
                                        let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                        next(errorResult);
                                    }
                                }
                            }

                        } else {
                            if (profilePicUrl.includes("https:")) {
                                let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                console.log(sql);
                                let result = await query(sql);
                                if (result && result[0].length > 0) {


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
                                    if (result[4] && result[4].length > 0) {
                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                    }
                                    if (result[1] && result[1].length > 0) {
                                        let address;
                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                            address = result[2][0];
                                        }
                                        let education;
                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                            education = result[3][0];
                                        }

                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                            , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                    }

                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                } else {
                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                    next(errorResult);
                                }
                            } else {
                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                let checkUrlResult = await query(checkUrlSql);
                                if (checkUrlResult && checkUrlResult.length > 0) {
                                    if (checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = await S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
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
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                    let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                    ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                    ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                    console.log(sql);
                                                    let result = await query(sql);
                                                    if (result && result[0].length > 0) {
                                                        // console.log(result);
                                                        // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                        // console.log(successResult);
                                                        // return res.status(200).send(successResult);
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
                                                        if (result[4] && result[4].length > 0) {
                                                            parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                        }
                                                        if (result[1] && result[1].length > 0) {
                                                            let address;
                                                            if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                address = result[2][0];
                                                            }
                                                            let education;
                                                            if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                education = result[3][0];
                                                            }

                                                            let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                            let partnerBadgeResult = await query(partnerBadgeSql);

                                                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                , (address && address.state), (address && address.districtId), (education && education.id), (address && address.stateId), (education && education.educationTypeId), (education && education.instituteName)
                                                                , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                        }

                                                        let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    } else {
                                                        let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
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
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                            let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                            console.log(sql);
                                            let result = await query(sql);
                                            if (result && result[0].length > 0) {
                                                // console.log(result);
                                                // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                // console.log(successResult);
                                                // return res.status(200).send(successResult);
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
                                                if (result[4] && result[4].length > 0) {
                                                    parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                        , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                        , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                        , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                        , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                        , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                }
                                                if (result[1] && result[1].length > 0) {
                                                    let address;
                                                    if (result[2] && result[2].length > 0 && result[2][0]) {
                                                        address = result[2][0];
                                                    }
                                                    let education;
                                                    if (result[3] && result[3].length > 0 && result[3][0]) {
                                                        education = result[3][0];
                                                    }

                                                    let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                    let partnerBadgeResult = await query(partnerBadgeSql);

                                                    user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                        , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                        , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                        , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                        , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                        , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                        , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                        , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                        , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                        , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                        , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                        , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                }

                                                let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            } else {
                                                let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                        //#endregion ProfileUpdate
                    } else {
                        let checkUrlSql = `SELECT resume from partnereducations WHERE partnerId = ` + partnerId;
                        let checkUrlResult = await query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0) {
                            if (checkUrlResult[0].resume) {
                                let splt = checkUrlResult[0].resume.split("/");
                                const delResp = await S3.deleteObject({
                                    Bucket: 'dsaappsignupdocuments',
                                    Key: splt[splt.length - 1],
                                }, async (err, data) => {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    } else {
                                        let buf = Buffer.from(req.body.resume, 'base64');
                                        let isErr = false;
                                        let params = {
                                            Bucket: 'dsaappsignupdocuments',
                                            Key: "resume_" + partnerId + "_" + new Date().getTime(),
                                            Body: buf,
                                            ContentEncoding: 'base64',
                                            ContentType: 'application/pdf',
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
                                            let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                            console.log(documentSql);
                                            var documentResult = await query(documentSql);
                                            console.log(documentResult);

                                            //#region ProfileUpdate
                                            if (!profilePicUrl) {
                                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                                let checkUrlResult = await query(checkUrlSql);
                                                if (checkUrlResult && checkUrlResult.length > 0) {
                                                    if (checkUrlResult[0].profilePicUrl) {
                                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                        const delResp = await S3.deleteObject({
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: splt[splt.length - 1],
                                                        }, async (err, data) => {
                                                            if (err) {
                                                                console.log("Error: Object delete failed.");
                                                                let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                                next(errorResult);
                                                            } else {
                                                                let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'')`;
                                                                console.log(sql);
                                                                let result = await query(sql);
                                                                if (result && result[0].length > 0) {
                                                                    // console.log(result);
                                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                                    // console.log(successResult);
                                                                    // return res.status(200).send(successResult);
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
                                                                    if (result[4] && result[4].length > 0) {
                                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                                    }
                                                                    if (result[1] && result[1].length > 0) {
                                                                        let address;
                                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                            address = result[2][0];
                                                                        }
                                                                        let education;
                                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                            education = result[3][0];
                                                                        }

                                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                            , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                                    }

                                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                                    console.log(successResult);
                                                                    return res.status(200).send(successResult);
                                                                } else {
                                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                                    next(errorResult);
                                                                }
                                                            }
                                                        });
                                                    } else {
                                                        let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                        ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                        ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                                        console.log(sql);
                                                        let result = await query(sql);
                                                        if (result && result[0].length > 0) {
                                                            // console.log(result);
                                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                            // console.log(successResult);
                                                            // return res.status(200).send(successResult);
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
                                                            if (result[4] && result[4].length > 0) {
                                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                            }
                                                            if (result[1] && result[1].length > 0) {
                                                                let address;
                                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                    address = result[2][0];
                                                                }
                                                                let education;
                                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                    education = result[3][0];
                                                                }

                                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                    , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                            }

                                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        } else {
                                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                            next(errorResult);
                                                        }
                                                    }
                                                }

                                            } else {
                                                if (profilePicUrl.includes("https:")) {
                                                    let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                    ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                    ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                                    console.log(sql);
                                                    let result = await query(sql);
                                                    if (result && result[0].length > 0) {
                                                        // console.log(result);
                                                        // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                        // console.log(successResult);
                                                        // return res.status(200).send(successResult);

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
                                                        if (result[4] && result[4].length > 0) {
                                                            parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                        }
                                                        if (result[1] && result[1].length > 0) {
                                                            let address;
                                                            if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                address = result[2][0];
                                                            }
                                                            let education;
                                                            if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                education = result[3][0];
                                                            }

                                                            let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                            let partnerBadgeResult = await query(partnerBadgeSql);

                                                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                        }

                                                        let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    } else {
                                                        let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                        next(errorResult);
                                                    }
                                                } else {
                                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                                    let checkUrlResult = await query(checkUrlSql);
                                                    if (checkUrlResult && checkUrlResult.length > 0) {
                                                        if (checkUrlResult[0].profilePicUrl) {
                                                            let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                            const delResp = await S3.deleteObject({
                                                                Bucket: 'creditapppartnerprofilepic',
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
                                                                        Bucket: 'creditapppartnerprofilepic',
                                                                        Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                                        let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                                        ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                                        ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                                        console.log(sql);
                                                                        let result = await query(sql);
                                                                        if (result && result[0].length > 0) {
                                                                            // console.log(result);
                                                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                                            // console.log(successResult);
                                                                            // return res.status(200).send(successResult);
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
                                                                            if (result[4] && result[4].length > 0) {
                                                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                                            }
                                                                            if (result[1] && result[1].length > 0) {
                                                                                let address;
                                                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                                    address = result[2][0];
                                                                                }
                                                                                let education;
                                                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                                    education = result[3][0];
                                                                                }

                                                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                                    , (address && address.state), (address && address.districtId), (education && education.id), (address && address.stateId), (education && education.educationTypeId), (education && education.instituteName)
                                                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                                            }

                                                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                                            console.log(successResult);
                                                                            return res.status(200).send(successResult);
                                                                        } else {
                                                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
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
                                                                Bucket: 'creditapppartnerprofilepic',
                                                                Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                                let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                                console.log(sql);
                                                                let result = await query(sql);
                                                                if (result && result[0].length > 0) {
                                                                    // console.log(result);
                                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                                    // console.log(successResult);
                                                                    // return res.status(200).send(successResult);
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
                                                                    if (result[4] && result[4].length > 0) {
                                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                                    }
                                                                    if (result[1] && result[1].length > 0) {
                                                                        let address;
                                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                            address = result[2][0];
                                                                        }
                                                                        let education;
                                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                            education = result[3][0];
                                                                        }

                                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                            , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                                    }

                                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                                    console.log(successResult);
                                                                    return res.status(200).send(successResult);
                                                                } else {
                                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                                    next(errorResult);
                                                                }
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                            //#endregion ProfileUpdate
                                        });
                                        if (isErr) {
                                            let errorResult = new ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                            next(errorResult);
                                            return;
                                        }
                                    }
                                });
                            } else {
                                let buf = Buffer.from(req.body.resume, 'base64');
                                let isErr = false;
                                let params = {
                                    Bucket: 'dsaappsignupdocuments',
                                    Key: "resume_" + partnerId + "_" + new Date().getTime(),
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: 'application/pdf',
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
                                    let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                    console.log(documentSql);
                                    var documentResult = await query(documentSql);
                                    console.log(documentResult);
                                    //#region ProfileUpdate
                                    if (!profilePicUrl) {
                                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                        let checkUrlResult = await query(checkUrlSql);
                                        if (checkUrlResult && checkUrlResult.length > 0) {
                                            if (checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = await S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, async (err, data) => {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    } else {
                                                        let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                        ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                        ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'')`;
                                                        console.log(sql);
                                                        let result = await query(sql);
                                                        if (result && result[0].length > 0) {
                                                            // console.log(result);
                                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                            // console.log(successResult);
                                                            // return res.status(200).send(successResult);
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
                                                            if (result[4] && result[4].length > 0) {
                                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                            }
                                                            if (result[1] && result[1].length > 0) {
                                                                let address;
                                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                    address = result[2][0];
                                                                }
                                                                let education;
                                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                    education = result[3][0];
                                                                }

                                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                    , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                            }

                                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        } else {
                                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                            next(errorResult);
                                                        }
                                                    }
                                                });
                                            } else {
                                                let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                                console.log(sql);
                                                let result = await query(sql);
                                                if (result && result[0].length > 0) {
                                                    // console.log(result);
                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                    // console.log(successResult);
                                                    // return res.status(200).send(successResult);
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
                                                    if (result[4] && result[4].length > 0) {
                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                    }
                                                    if (result[1] && result[1].length > 0) {
                                                        let address;
                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                            address = result[2][0];
                                                        }
                                                        let education;
                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                            education = result[3][0];
                                                        }

                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                            , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                    }

                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                } else {
                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                    next(errorResult);
                                                }
                                            }
                                        }

                                    } else {
                                        if (profilePicUrl.includes("https:")) {
                                            let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                            console.log(sql);
                                            let result = await query(sql);
                                            if (result && result[0].length > 0) {
                                                // console.log(result);
                                                // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                // console.log(successResult);
                                                // return res.status(200).send(successResult);

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
                                                if (result[4] && result[4].length > 0) {
                                                    parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                        , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                        , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                        , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                        , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                        , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                }
                                                if (result[1] && result[1].length > 0) {
                                                    let address;
                                                    if (result[2] && result[2].length > 0 && result[2][0]) {
                                                        address = result[2][0];
                                                    }
                                                    let education;
                                                    if (result[3] && result[3].length > 0 && result[3][0]) {
                                                        education = result[3][0];
                                                    }

                                                    let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                    let partnerBadgeResult = await query(partnerBadgeSql);

                                                    user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                        , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                        , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                        , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                        , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                        , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                        , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                        , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                        , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                        , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                        , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                        , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                }

                                                let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            } else {
                                                let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        } else {
                                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                            let checkUrlResult = await query(checkUrlSql);
                                            if (checkUrlResult && checkUrlResult.length > 0) {
                                                if (checkUrlResult[0].profilePicUrl) {
                                                    let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                    const delResp = await S3.deleteObject({
                                                        Bucket: 'creditapppartnerprofilepic',
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
                                                                Bucket: 'creditapppartnerprofilepic',
                                                                Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                                let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                                console.log(sql);
                                                                let result = await query(sql);
                                                                if (result && result[0].length > 0) {
                                                                    // console.log(result);
                                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                                    // console.log(successResult);
                                                                    // return res.status(200).send(successResult);
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
                                                                    if (result[4] && result[4].length > 0) {
                                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                                    }
                                                                    if (result[1] && result[1].length > 0) {
                                                                        let address;
                                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                            address = result[2][0];
                                                                        }
                                                                        let education;
                                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                            education = result[3][0];
                                                                        }

                                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                            , (address && address.state), (address && address.districtId), (education && education.id), (address && address.stateId), (education && education.educationTypeId), (education && education.instituteName)
                                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                                    }

                                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                                    console.log(successResult);
                                                                    return res.status(200).send(successResult);
                                                                } else {
                                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
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
                                                        Bucket: 'creditapppartnerprofilepic',
                                                        Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                        let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                        ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                        ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                        console.log(sql);
                                                        let result = await query(sql);
                                                        if (result && result[0].length > 0) {
                                                            // console.log(result);
                                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                            // console.log(successResult);
                                                            // return res.status(200).send(successResult);
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
                                                            if (result[4] && result[4].length > 0) {
                                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                            }
                                                            if (result[1] && result[1].length > 0) {
                                                                let address;
                                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                    address = result[2][0];
                                                                }
                                                                let education;
                                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                    education = result[3][0];
                                                                }

                                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                    , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                            }

                                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        } else {
                                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                            next(errorResult);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    //#endregion ProfileUpdate

                                });
                                if (isErr) {
                                    let errorResult = new ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                    next(errorResult);
                                    return;
                                }
                            }
                        } else {
                            let buf = Buffer.from(req.body.resume, 'base64');
                            let isErr = false;
                            let params = {
                                Bucket: 'dsaappsignupdocuments',
                                Key: "resume_" + partnerId + "_" + new Date().getTime(),
                                Body: buf,
                                ContentEncoding: 'base64',
                                ContentType: 'application/pdf',
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
                                let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                console.log(documentSql);
                                var documentResult = await query(documentSql);
                                console.log(documentResult);

                                //#region ProfileUpdate
                                if (!profilePicUrl) {
                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                    let checkUrlResult = await query(checkUrlSql);
                                    if (checkUrlResult && checkUrlResult.length > 0) {
                                        if (checkUrlResult[0].profilePicUrl) {
                                            let splt = checkUrlResult[0].profilePicUrl.split("/");
                                            const delResp = await S3.deleteObject({
                                                Bucket: 'creditapppartnerprofilepic',
                                                Key: splt[splt.length - 1],
                                            }, async (err, data) => {
                                                if (err) {
                                                    console.log("Error: Object delete failed.");
                                                    let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                    next(errorResult);
                                                } else {
                                                    let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                    ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                    ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'')`;
                                                    console.log(sql);
                                                    let result = await query(sql);
                                                    if (result && result[0].length > 0) {
                                                        // console.log(result);
                                                        // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                        // console.log(successResult);
                                                        // return res.status(200).send(successResult);
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
                                                        if (result[4] && result[4].length > 0) {
                                                            parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                        }
                                                        if (result[1] && result[1].length > 0) {
                                                            let address;
                                                            if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                address = result[2][0];
                                                            }
                                                            let education;
                                                            if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                education = result[3][0];
                                                            }

                                                            let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                            let partnerBadgeResult = await query(partnerBadgeSql);

                                                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                        }

                                                        let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    } else {
                                                        let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                        next(errorResult);
                                                    }
                                                }
                                            });
                                        } else {
                                            let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                            console.log(sql);
                                            let result = await query(sql);
                                            if (result && result[0].length > 0) {
                                                // console.log(result);
                                                // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                // console.log(successResult);
                                                // return res.status(200).send(successResult);
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
                                                if (result[4] && result[4].length > 0) {
                                                    parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                        , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                        , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                        , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                        , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                        , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                }
                                                if (result[1] && result[1].length > 0) {
                                                    let address;
                                                    if (result[2] && result[2].length > 0 && result[2][0]) {
                                                        address = result[2][0];
                                                    }
                                                    let education;
                                                    if (result[3] && result[3].length > 0 && result[3][0]) {
                                                        education = result[3][0];
                                                    }

                                                    let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                    let partnerBadgeResult = await query(partnerBadgeSql);

                                                    user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                        , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                        , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                        , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                        , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                        , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                        , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                        , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                        , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                        , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                        , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                        , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                }

                                                let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            } else {
                                                let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        }
                                    }

                                } else {
                                    if (profilePicUrl.includes("https:")) {
                                        let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                        ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                        ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                        console.log(sql);
                                        let result = await query(sql);
                                        if (result && result[0].length > 0) {
                                            // console.log(result);
                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                            // console.log(successResult);
                                            // return res.status(200).send(successResult);

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
                                            if (result[4] && result[4].length > 0) {
                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                            }
                                            if (result[1] && result[1].length > 0) {
                                                let address;
                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                    address = result[2][0];
                                                }
                                                let education;
                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                    education = result[3][0];
                                                }

                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                    , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                            }

                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        } else {
                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                            next(errorResult);
                                        }
                                    } else {
                                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                        let checkUrlResult = await query(checkUrlSql);
                                        if (checkUrlResult && checkUrlResult.length > 0) {
                                            if (checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = await S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
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
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                            let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                            console.log(sql);
                                                            let result = await query(sql);
                                                            if (result && result[0].length > 0) {
                                                                // console.log(result);
                                                                // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                                // console.log(successResult);
                                                                // return res.status(200).send(successResult);
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
                                                                if (result[4] && result[4].length > 0) {
                                                                    parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                        , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                        , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                        , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                        , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                        , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                                }
                                                                if (result[1] && result[1].length > 0) {
                                                                    let address;
                                                                    if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                        address = result[2][0];
                                                                    }
                                                                    let education;
                                                                    if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                        education = result[3][0];
                                                                    }

                                                                    let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                    let partnerBadgeResult = await query(partnerBadgeSql);

                                                                    user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                        , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                        , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                        , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                        , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                        , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                        , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                        , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                        , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                        , (address && address.state), (address && address.districtId), (education && education.id), (address && address.stateId), (education && education.educationTypeId), (education && education.instituteName)
                                                                        , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                        , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                                }

                                                                let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                                console.log(successResult);
                                                                return res.status(200).send(successResult);
                                                            } else {
                                                                let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
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
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                    let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                    ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                    ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                    console.log(sql);
                                                    let result = await query(sql);
                                                    if (result && result[0].length > 0) {
                                                        // console.log(result);
                                                        // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                        // console.log(successResult);
                                                        // return res.status(200).send(successResult);
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
                                                        if (result[4] && result[4].length > 0) {
                                                            parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                        }
                                                        if (result[1] && result[1].length > 0) {
                                                            let address;
                                                            if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                address = result[2][0];
                                                            }
                                                            let education;
                                                            if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                education = result[3][0];
                                                            }

                                                            let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                            let partnerBadgeResult = await query(partnerBadgeSql);

                                                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                        }

                                                        let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    } else {
                                                        let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                        next(errorResult);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                                //#endregion ProfileUpdate
                            });
                            if (isErr) {
                                let errorResult = new ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                next(errorResult);
                                return;
                            }
                        }

                    }
                } else {
                    let checkUrlSql = `SELECT resume from partnereducations WHERE partnerId = ` + partnerId;
                    let checkUrlResult = await query(checkUrlSql);
                    if (checkUrlResult && checkUrlResult.length > 0) {
                        if (checkUrlResult[0].resume) {
                            let splt = checkUrlResult[0].resume.split("/");
                            const delResp = await S3.deleteObject({
                                Bucket: 'dsaappsignupdocuments',
                                Key: splt[splt.length - 1],
                            }, async (err, data) => {
                                if (err) {
                                    console.log("Error: Object delete failed.");
                                    let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                    next(errorResult);
                                } else {
                                    //   if(!partnerEducationId){
                                    let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                    console.log(documentSql);
                                    var documentResult = await query(documentSql);
                                    console.log(documentResult);
                                    //  }

                                    //#region ProfileUpdate
                                    if (!profilePicUrl) {
                                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                        let checkUrlResult = await query(checkUrlSql);
                                        if (checkUrlResult && checkUrlResult.length > 0) {
                                            if (checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = await S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, async (err, data) => {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    } else {
                                                        let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                        ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                        ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'')`;
                                                        console.log(sql);
                                                        let result = await query(sql);
                                                        if (result && result[0].length > 0) {
                                                            // console.log(result);
                                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                            // console.log(successResult);
                                                            // return res.status(200).send(successResult);
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
                                                            if (result[4] && result[4].length > 0) {
                                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                            }
                                                            if (result[1] && result[1].length > 0) {
                                                                let address;
                                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                    address = result[2][0];
                                                                }
                                                                let education;
                                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                    education = result[3][0];
                                                                }

                                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                    , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                            }

                                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        } else {
                                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                            next(errorResult);
                                                        }
                                                    }
                                                });
                                            } else {
                                                let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                                console.log(sql);
                                                let result = await query(sql);
                                                if (result && result[0].length > 0) {
                                                    // console.log(result);
                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                    // console.log(successResult);
                                                    // return res.status(200).send(successResult);
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
                                                    if (result[4] && result[4].length > 0) {
                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                    }
                                                    if (result[1] && result[1].length > 0) {
                                                        let address;
                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                            address = result[2][0];
                                                        }
                                                        let education;
                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                            education = result[3][0];
                                                        }

                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                            , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                    }

                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                } else {
                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                    next(errorResult);
                                                }
                                            }
                                        }

                                    } else {
                                        if (profilePicUrl.includes("https:")) {
                                            let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                            console.log(sql);
                                            let result = await query(sql);
                                            if (result && result[0].length > 0) {
                                                // console.log(result);
                                                // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                // console.log(successResult);
                                                // return res.status(200).send(successResult);

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
                                                if (result[4] && result[4].length > 0) {
                                                    parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                        , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                        , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                        , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                        , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                        , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                }
                                                if (result[1] && result[1].length > 0) {
                                                    let address;
                                                    if (result[2] && result[2].length > 0 && result[2][0]) {
                                                        address = result[2][0];
                                                    }
                                                    let education;
                                                    if (result[3] && result[3].length > 0 && result[3][0]) {
                                                        education = result[3][0];
                                                    }

                                                    let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                    let partnerBadgeResult = await query(partnerBadgeSql);

                                                    user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                        , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                        , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                        , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                        , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                        , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                        , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                        , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                        , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                        , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                        , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                        , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                }

                                                let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            } else {
                                                let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                next(errorResult);
                                            }
                                        } else {
                                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                            let checkUrlResult = await query(checkUrlSql);
                                            if (checkUrlResult && checkUrlResult.length > 0) {
                                                if (checkUrlResult[0].profilePicUrl) {
                                                    let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                    const delResp = await S3.deleteObject({
                                                        Bucket: 'creditapppartnerprofilepic',
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
                                                                Bucket: 'creditapppartnerprofilepic',
                                                                Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                                let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                                console.log(sql);
                                                                let result = await query(sql);
                                                                if (result && result[0].length > 0) {
                                                                    // console.log(result);
                                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                                    // console.log(successResult);
                                                                    // return res.status(200).send(successResult);
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
                                                                    if (result[4] && result[4].length > 0) {
                                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                                    }
                                                                    if (result[1] && result[1].length > 0) {
                                                                        let address;
                                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                            address = result[2][0];
                                                                        }
                                                                        let education;
                                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                            education = result[3][0];
                                                                        }

                                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                            , (address && address.state), (address && address.districtId), (education && education.id), (address && address.stateId), (education && education.educationTypeId), (education && education.instituteName)
                                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                                    }

                                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                                    console.log(successResult);
                                                                    return res.status(200).send(successResult);
                                                                } else {
                                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
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
                                                        Bucket: 'creditapppartnerprofilepic',
                                                        Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                        let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                        ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                        ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                        console.log(sql);
                                                        let result = await query(sql);
                                                        if (result && result[0].length > 0) {
                                                            // console.log(result);
                                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                            // console.log(successResult);
                                                            // return res.status(200).send(successResult);
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
                                                            if (result[4] && result[4].length > 0) {
                                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                            }
                                                            if (result[1] && result[1].length > 0) {
                                                                let address;
                                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                    address = result[2][0];
                                                                }
                                                                let education;
                                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                    education = result[3][0];
                                                                }

                                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                    , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                            }

                                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        } else {
                                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                            next(errorResult);
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    }
                                    //#endregion ProfileUpdate
                                }
                            });
                        } else {
                            if (!partnerEducationId) {
                                let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                console.log(documentSql);
                                var documentResult = await query(documentSql);
                                console.log(documentResult);
                            }
                            //#region ProfileUpdate
                            if (!profilePicUrl) {
                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                let checkUrlResult = await query(checkUrlSql);
                                if (checkUrlResult && checkUrlResult.length > 0) {
                                    if (checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = await S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: splt[splt.length - 1],
                                        }, async (err, data) => {
                                            if (err) {
                                                console.log("Error: Object delete failed.");
                                                let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                next(errorResult);
                                            } else {
                                                let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'')`;
                                                console.log(sql);
                                                let result = await query(sql);
                                                if (result && result[0].length > 0) {
                                                    // console.log(result);
                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                    // console.log(successResult);
                                                    // return res.status(200).send(successResult);
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
                                                    if (result[4] && result[4].length > 0) {
                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                    }
                                                    if (result[1] && result[1].length > 0) {
                                                        let address;
                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                            address = result[2][0];
                                                        }
                                                        let education;
                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                            education = result[3][0];
                                                        }

                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                            , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                    }

                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                } else {
                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                    next(errorResult);
                                                }
                                            }
                                        });
                                    } else {
                                        let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                    ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                    ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                        console.log(sql);
                                        let result = await query(sql);
                                        if (result && result[0].length > 0) {
                                            // console.log(result);
                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                            // console.log(successResult);
                                            // return res.status(200).send(successResult);
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
                                            if (result[4] && result[4].length > 0) {
                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                            }
                                            if (result[1] && result[1].length > 0) {
                                                let address;
                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                    address = result[2][0];
                                                }
                                                let education;
                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                    education = result[3][0];
                                                }

                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                    , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                            }

                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        } else {
                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                            next(errorResult);
                                        }
                                    }
                                }

                            } else {
                                if (profilePicUrl.includes("https:")) {
                                    let sql = `CALL dsaBazarUpdatePartnerProfile(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `)`;
                                    console.log(sql);
                                    let result = await query(sql);
                                    if (result && result[0].length > 0) {
                                        // console.log(result);
                                        // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                        // console.log(successResult);
                                        // return res.status(200).send(successResult);

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
                                        if (result[4] && result[4].length > 0) {
                                            parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                        }
                                        if (result[1] && result[1].length > 0) {
                                            let address;
                                            if (result[2] && result[2].length > 0 && result[2][0]) {
                                                address = result[2][0];
                                            }
                                            let education;
                                            if (result[3] && result[3].length > 0 && result[3][0]) {
                                                education = result[3][0];
                                            }

                                            let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                            let partnerBadgeResult = await query(partnerBadgeSql);

                                            user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                        }

                                        let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    } else {
                                        let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                        next(errorResult);
                                    }
                                } else {
                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                    let checkUrlResult = await query(checkUrlSql);
                                    if (checkUrlResult && checkUrlResult.length > 0) {
                                        if (checkUrlResult[0].profilePicUrl) {
                                            let splt = checkUrlResult[0].profilePicUrl.split("/");
                                            const delResp = await S3.deleteObject({
                                                Bucket: 'creditapppartnerprofilepic',
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
                                                        Bucket: 'creditapppartnerprofilepic',
                                                        Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                        let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                                    ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                                    ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                        console.log(sql);
                                                        let result = await query(sql);
                                                        if (result && result[0].length > 0) {
                                                            // console.log(result);
                                                            // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                            // console.log(successResult);
                                                            // return res.status(200).send(successResult);
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
                                                            if (result[4] && result[4].length > 0) {
                                                                parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                                    , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                                    , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                                    , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                                    , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                                    , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                            }
                                                            if (result[1] && result[1].length > 0) {
                                                                let address;
                                                                if (result[2] && result[2].length > 0 && result[2][0]) {
                                                                    address = result[2][0];
                                                                }
                                                                let education;
                                                                if (result[3] && result[3].length > 0 && result[3][0]) {
                                                                    education = result[3][0];
                                                                }

                                                                let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                                let partnerBadgeResult = await query(partnerBadgeSql);

                                                                user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                                    , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                                    , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                                    , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                                    , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                                    , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                                    , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                                    , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                                    , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                                    , (address && address.state), (address && address.districtId), (education && education.id), (address && address.stateId), (education && education.educationTypeId), (education && education.instituteName)
                                                                    , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                                    , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                            }

                                                            let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        } else {
                                                            let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
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
                                                Bucket: 'creditapppartnerprofilepic',
                                                Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                let sql = `CALL dsaBazarUpdatePartnerProfileWithPic(` + userId + `,` + partnerId + `,'` + fullName + `','` + contactNo + `','` + panCardNo + `','` + aadhaarCardNo + `','` + gender + `'
                                            ,` + partnerAddressId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `
                                            ,`+ workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + data.Location + `')`;
                                                console.log(sql);
                                                let result = await query(sql);
                                                if (result && result[0].length > 0) {
                                                    // console.log(result);
                                                    // let successResult = new ResultSuccess(200, true, 'Partner Updated', result[0], 1);
                                                    // console.log(successResult);
                                                    // return res.status(200).send(successResult);
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
                                                    if (result[4] && result[4].length > 0) {
                                                        parentPartner = new partnerResponse(result[4][0].id, result[4][0].parentParnerId, result[4][0].userId, result[4][0].temporaryCode
                                                            , result[4][0].permanentCode, result[4][0].fullName, result[4][0].gender, result[4][0].contactNo, result[4][0].aadhaarCardNo
                                                            , result[4][0].panCardNo, result[4][0].cityId, result[4][0].companyName, result[4][0].companyTypeId, result[4][0].udhyamAadhaarNo
                                                            , result[4][0].companyRegNo, result[4][0].professionTypeId, result[4][0].workExperience, result[4][0].haveOffice, result[4][0].businessName
                                                            , result[4][0].businessAddress, result[4][0].gstNo, result[4][0].commitment, result[4][0].designationId, result[4][0].referralCode
                                                            , result[4][0].isActive, result[4][0].isDelete, result[4][0].createdDate, result[4][0].modifiedDate, result[4][0].createdBy, result[4][0].modifiedBy);
                                                    }
                                                    if (result[1] && result[1].length > 0) {
                                                        let address;
                                                        if (result[2] && result[2].length > 0 && result[2][0]) {
                                                            address = result[2][0];
                                                        }
                                                        let education;
                                                        if (result[3] && result[3].length > 0 && result[3][0]) {
                                                            education = result[3][0];
                                                        }

                                                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[5][0].currentBadgeId;
                                                        let partnerBadgeResult = await query(partnerBadgeSql);

                                                        user = new userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl
                                                            , result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode
                                                            , result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId
                                                            , result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId
                                                            , result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo
                                                            , result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete
                                                            , result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId
                                                            , (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, (address && address.id)
                                                            , (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district)
                                                            , (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName)
                                                            , (education && education.passingYear), (education && education.resume), result[1][0].addressLine1
                                                            , result[1][0].addressLine2, result[1][0].pincode, result[1][0].workAddressCityId, result[1][0].jobType);
                                                    }

                                                    let successResult = new ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                } else {
                                                    let errorResult = new ResultError(400, true, "Partner Not Updated", result, '');
                                                    next(errorResult);
                                                }
                                            });
                                        }
                                    }
                                }
                            }
                            //#endregion ProfileUpdate
                        }
                    } else {
                        //
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
        let errorResult = new ResultError(500, true, 'partners.updatePartnerProfile()', error, '');
        next(errorResult);
    }
};

const getCommisionListByPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['partnerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Update Partner Profile');
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let sql = `CALL dsaBazarGetPartnerCommission(` + partnerId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Partner Commission List', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Data Not Available", [], '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.getCommisionListByPartnerId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.getCommisionListByPartnerId()', error, '');
        next(errorResult);
    }
};

const insertUpdatePartnerBankDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Partner Bank Detail');
        var requiredFields = ['partnerId', 'bankId', 'accountHolderName', 'accountNo', 'ifscCode'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let partnerId = req.body.partnerId;
                let bankId = req.body.bankId;
                let accountHolderName = req.body.accountHolderName;
                let accountNo = req.body.accountNo;
                let ifscCode = req.body.ifscCode;
                let id = req.body.id ? req.body.id : null;

                let sql = `CALL dsaBazarInserUpdateBankDetail(` + id + `,` + partnerId + `,` + bankId + `,'` + accountHolderName + `','` + accountNo + `','` + ifscCode + `',` + userId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Insert Partner Bank Detail', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Data Not Available", [], '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.insertPartnerBankDetail() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.insertPartnerBankDetail() Exception', error, '');
        next(errorResult);
    }
};

const getBankDetailByPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['partnerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Update Partner Profile');
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let sql = `CALL dsaBazarGetPartnerBankDetail(` + partnerId + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length >= 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Partner Bank Detail', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "Data Not Available", [], '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.getBankDetailByPartnerId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'partners.getBankDetailByPartnerId()', error, '');
        next(errorResult);
    }
};

const updatePartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Partner');
        var requiredFields = ['partnerId', 'userId', 'contactNo', 'fullName', 'cityId', 'partnerAddressId', 'partnerEducationId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let userId = req.body.userId;
                let fullName = req.body.fullName;
                let gender = req.body.gender ? req.body.gender : "";
                let email = req.body.email ? req.body.email : "";
                let contactNo = req.body.contactNo;
                let aadhaarCardNo = req.body.aadhaarCardNo ? req.body.aadhaarCardNo : "";
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
                let cityId = req.body.cityId ? req.body.cityId : null;
                let companyName = req.body.companyName ? req.body.companyName : "";
                let professionTypeId = req.body.professionTypeId ? req.body.professionTypeId : null;
                let workExperience = req.body.workExperience ? req.body.workExperience : null;
                let haveOffice = req.body.haveOffice ? req.body.haveOffice : 0;
                let businessName = req.body.businessName ? req.body.businessName : "";
                //let businessAddress = req.body.businessAddress ? req.body.businessAddress : "";
                let gstNo = req.body.gstNo ? req.body.gstNo : "";
                let commitment = req.body.commitment ? req.body.commitment : null;
                let referralCode = req.body.referralCode ? req.body.referralCode : "";
                let parentParnerId = req.body.parentParnerId ? req.body.parentParnerId : null;
                let profilePicUrl = req.body.profilePicUrl ? req.body.profilePicUrl : "";

                let partnerAddressId = req.body.partnerAddressId;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode ? req.body.pincode : "";

                let workAddressCityId = req.body.workAddressCityId ? req.body.workAddressCityId : null;
                let businessAddress = req.body.businessAddress ? req.body.businessAddress : "";
                let businessaddressLine1 = req.body.businessaddressLine1 ? req.body.businessaddressLine1 : "";
                let businessaddressLine2 = req.body.businessaddressLine2 ? req.body.businessaddressLine2 : "";
                let businesspincode = req.body.businesspincode ? req.body.businesspincode : "";

                let partnerEducationId = req.body.partnerEducationId ? req.body.partnerEducationId : null;
                let designationId = req.body.designationId ? req.body.designationId : null;
                let educationTypeId = req.body.educationTypeId ? req.body.educationTypeId : null;
                let instituteName = req.body.instituteName ? req.body.instituteName : "";
                let passingYear = req.body.passingYear ? req.body.passingYear : null;
                let resume = req.body.resume ? req.body.resume : "";
                let otherDetail = req.body.otherDetail ? req.body.otherDetail : "";
                let jobType = req.body.jobType ? req.body.jobType : null;

                let sql = `CALL dsaBazarUpdatePartner(` + partnerId + `,` + userId + `,'` + fullName + `','` + gender + `','` + email + `','` + contactNo + `','` + aadhaarCardNo + `','` + panCardNo + `',` + cityId + `,'` + companyName + `'
                ,`+ professionTypeId + `,` + workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + referralCode + `',` + parentParnerId + `,` + designationId + `);`;
                console.log(sql);
                let result = await query(sql);
                if (result) {
                    let addressSql =
                        `CALL dsaBazarUpdatePartnerAddress(` + partnerAddressId + `,` + partnerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `);`;
                    console.log(addressSql);
                    var addressResult = await query(addressSql);
                    console.log(addressResult);

                    if (req.body.resume) {
                        if (req.body.resume.includes("https:")) {
                            let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + req.body.resume + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                            console.log(documentSql);
                            var documentResult = await query(documentSql);
                            console.log(documentResult);
                            if (!profilePicUrl) {
                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                let checkUrlResult = await query(checkUrlSql);
                                if (checkUrlResult && checkUrlResult.length > 0) {
                                    if (checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = await S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: splt[splt.length - 1],
                                        }, async (err, data) => {
                                            if (err) {
                                                console.log("Error: Object delete failed.");
                                                let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                next(errorResult);
                                            } else {
                                                let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                let updateProfileResult = await query(updateProfileSql);

                                                let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        });
                                    } else {
                                        let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    }
                                }
                            } else {
                                if (profilePicUrl.includes("https:")) {
                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                } else {
                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                    let checkUrlResult = await query(checkUrlSql);
                                    if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = await S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
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
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
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
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                            let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                            let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        });
                                    }
                                }
                            }
                        } else {
                            let checkUrlSql = `SELECT resume from partnereducations WHERE partnerId = ` + partnerId;
                            let checkUrlResult = await query(checkUrlSql);
                            if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].resume) {
                                let splt = checkUrlResult[0].resume.split("/");
                                const delResp = await S3.deleteObject({
                                    Bucket: 'dsaappsignupdocuments',
                                    Key: splt[splt.length - 1],
                                }, async (err, data) => {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    } else {
                                        let buf = Buffer.from(req.body.resume, 'base64');
                                        let isErr = false;
                                        let params = {
                                            Bucket: 'dsaappsignupdocuments',
                                            Key: "resume_" + partnerId + "_" + new Date().getTime(),
                                            Body: buf,
                                            ContentEncoding: 'base64',
                                            ContentType: 'application/pdf',
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
                                            let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                            console.log(documentSql);
                                            var documentResult = await query(documentSql);
                                            console.log(documentResult);


                                            if (!profilePicUrl) {
                                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                                let checkUrlResult = await query(checkUrlSql);
                                                if (checkUrlResult && checkUrlResult.length > 0) {
                                                    if (checkUrlResult[0].profilePicUrl) {
                                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                        const delResp = await S3.deleteObject({
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: splt[splt.length - 1],
                                                        }, async (err, data) => {
                                                            if (err) {
                                                                console.log("Error: Object delete failed.");
                                                                let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                                next(errorResult);
                                                            } else {
                                                                let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                                let updateProfileResult = await query(updateProfileSql);

                                                                let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                                console.log(successResult);
                                                                return res.status(200).send(successResult);
                                                            }
                                                        });
                                                    } else {
                                                        let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    }
                                                }
                                            } else {
                                                if (profilePicUrl.includes("https:")) {
                                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                } else {
                                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                                    let checkUrlResult = await query(checkUrlSql);
                                                    if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                        const delResp = await S3.deleteObject({
                                                            Bucket: 'creditapppartnerprofilepic',
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
                                                                    Bucket: 'creditapppartnerprofilepic',
                                                                    Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                                    let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                                    console.log(successResult);
                                                                    return res.status(200).send(successResult);
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
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                            let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                            let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        });
                                                    }
                                                }
                                            }
                                        });
                                        if (isErr) {
                                            let errorResult = new ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                            next(errorResult);
                                            return;
                                        }
                                    }
                                });
                            } else {
                                let buf = Buffer.from(req.body.resume, 'base64');
                                let isErr = false;
                                let params = {
                                    Bucket: 'dsaappsignupdocuments',
                                    Key: "resume_" + partnerId + "_" + new Date().getTime(),
                                    Body: buf,
                                    ContentEncoding: 'base64',
                                    ContentType: 'application/pdf',
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
                                    let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                    console.log(documentSql);
                                    var documentResult = await query(documentSql);
                                    console.log(documentResult);


                                    if (!profilePicUrl) {
                                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                        let checkUrlResult = await query(checkUrlSql);
                                        if (checkUrlResult && checkUrlResult.length > 0) {
                                            if (checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = await S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, async (err, data) => {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    } else {
                                                        let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                        let updateProfileResult = await query(updateProfileSql);

                                                        let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    }
                                                });
                                            } else {
                                                let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        }
                                    } else {
                                        if (profilePicUrl.includes("https:")) {
                                            let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        } else {
                                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                            let checkUrlResult = await query(checkUrlSql);
                                            if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = await S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
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
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                            let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                            let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
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
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                });
                                            }
                                        }
                                    }
                                });
                                if (isErr) {
                                    let errorResult = new ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                    next(errorResult);
                                    return;
                                }
                            }
                        }
                    } else {
                        let checkUrlSql = `SELECT resume from partnereducations WHERE partnerId = ` + partnerId;
                        let checkUrlResult = await query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].resume) {
                            let splt = checkUrlResult[0].resume.split("/");
                            const delResp = await S3.deleteObject({
                                Bucket: 'dsaappsignupdocuments',
                                Key: splt[splt.length - 1],
                            }, async (err, data) => {
                                if (err) {
                                    console.log("Error: Object delete failed.");
                                    let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                    next(errorResult);
                                } else {
                                    let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                    console.log(documentSql);
                                    var documentResult = await query(documentSql);
                                    console.log(documentResult);
                                    if (!profilePicUrl) {
                                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                        let checkUrlResult = await query(checkUrlSql);
                                        if (checkUrlResult && checkUrlResult.length > 0) {
                                            if (checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = await S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, async (err, data) => {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    } else {
                                                        let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                        let updateProfileResult = await query(updateProfileSql);

                                                        let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    }
                                                });
                                            } else {
                                                let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        }
                                    } else {
                                        if (profilePicUrl.includes("https:")) {
                                            let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        } else {
                                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                            let checkUrlResult = await query(checkUrlSql);
                                            if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = await S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
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
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                            let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                            let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
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
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                });
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            if (!profilePicUrl) {
                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                let checkUrlResult = await query(checkUrlSql);
                                if (checkUrlResult && checkUrlResult.length > 0) {
                                    if (checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = await S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: splt[splt.length - 1],
                                        }, async (err, data) => {
                                            if (err) {
                                                console.log("Error: Object delete failed.");
                                                let errorResult = new ResultError(401, true, "Error: Object delete failed.", err, '');
                                                next(errorResult);
                                            } else {
                                                let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                let updateProfileResult = await query(updateProfileSql);

                                                let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        });
                                    } else {
                                        let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    }
                                }
                            } else {
                                if (profilePicUrl.includes("https:")) {
                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                } else {
                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                    let checkUrlResult = await query(checkUrlSql);
                                    if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = await S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
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
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                                    let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
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
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: keyName + "_" + partnerId + "_" + new Date().getTime(),
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
                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                            let updateUserProfilePicResult = await query(updateUserProfilePicSql);

                                            let successResult = new ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        });
                                    }
                                }
                            }
                        }
                    }
                } else {
                    let errorResult = new ResultError(400, true, 'Partner Data Not Updated', new Error('Partner Data Not Updated'), '');
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
        let errorResult = new ResultError(500, true, 'partners.updatePartner() Exception', error, '');
        next(errorResult);
    }
};

const checkContactNoExistWithServiceId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['contactNo', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Customer Contact No Exist');
            let contactNo = req.body.contactNo;
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let contactNo = req.body.contactNo;
                let serviceId = req.body.serviceId;
                let partnerId = req.body.partnerId;
                let daysResult = await query(`SELECT value FROM systemflags WHERE name = 'daysrequiredforrequestloantoanotherpartner'`)
                let isLoanAvailable = false;
                if (daysResult && daysResult.length > 0) {
                    let loans = await query(`SELECT customerloans.id,partnerscustomerloans.partnerId,customerloans.createdDate FROM partnerscustomerloans INNER JOIN customerloans ON customerloans.id = partnerscustomerloans.customerLoanId INNER JOIN customers ON customers.id = customerloans.customerId WHERE customers.contactNo = ? AND (customerloans.statusId IS NULL OR customerloans.statusId NOT IN(8,13,14,16))`, contactNo)
                    if (loans && loans.length > 0) {
                        for (let i = 0; i < loans.length; i++) {
                            if (loans[i].partnerId != partnerId) {
                                let dt1 = new Date(loans[i].createdDate);
                                let dt2 = new Date();
                                let days = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
                                if (days < daysResult[0].value) {
                                    let errorResult = new ResultError(402, true, '', new Error("This Contact Number has already apply for Loan with another partner so,you can't use this contact number "), '');
                                    next(errorResult);
                                    break;
                                }
                                else {
                                    let updateQueryResult = await query(`UPDATE partnercustomers SET partnerId = ?,modifiedDate = CURRENT_TIMESTAMP(),modifiedBy = ` + authorizationResult.currentUser.id + ``, partnerId)

                                }

                            }
                            else {
                                let sql = `CALL customerCheckContactNoExistWithServiceId('` + contactNo + `','` + serviceId + `')`;
                                console.log(sql);
                                let result = await query(sql);
                                if (result && result.length > 0) {
                                    if (result[0] && result[0].length > 0) {
                                        if (result[1] && result[1].length > 0) {
                                            result[0][0].transactionDate = result[1][0].transactionDate;
                                        }
                                        else {

                                            result[0][0].transactionDate = null;
                                        }
                                        let successResult = new ResultSuccess(200, true, 'User Exist', result[0], result[0].length);
                                        return res.status(200).send(successResult);
                                    } else {
                                        let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                                        next(errorResult);
                                    }
                                }
                            }

                        }
                    }
                    else {
                        let sql = `CALL customerCheckContactNoExistWithServiceId('` + contactNo + `','` + serviceId + `')`;
                        console.log(sql);
                        let result = await query(sql);
                        if (result && result.length > 0) {
                            if (result[0] && result[0].length > 0) {
                                if (result[1] && result[1].length > 0) {
                                    result[0][0].transactionDate = result[1][0].transactionDate;
                                }
                                else {

                                    result[0][0].transactionDate = null;
                                }
                                let successResult = new ResultSuccess(200, true, 'User Exist', result[0], result[0].length);
                                return res.status(200).send(successResult);
                            } else {
                                let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                                next(errorResult);
                            }
                        }
                    }
                }
                else {
                    let sql = `CALL customerCheckContactNoExistWithServiceId('` + contactNo + `','` + serviceId + `')`;
                    console.log(sql);
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[0] && result[0].length > 0) {
                            if (result[1] && result[1].length > 0) {
                                result[0][0].transactionDate = result[1][0].transactionDate;
                            }
                            else {

                                result[0][0].transactionDate = null;
                            }
                            let successResult = new ResultSuccess(200, true, 'User Exist', result[0], result[0].length);
                            return res.status(200).send(successResult);
                        } else {
                            let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                            next(errorResult);
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
        let errorResult = new ResultError(500, true, 'users.checkContactNoExist()', error, '');
        next(errorResult);
    }
};

const checkContactNoExistForCreditCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['contactNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Customer Contact No Exist For Credit Card');
            let contactNo = req.body.contactNo;
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let contactNo = req.body.contactNo;

                let sql = `CALL customerCheckContactNoExistForCreditCard('` + contactNo + `')`;
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

const checkContactNoExistWithServiceIdFroOtherLoansAndServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['contactNo', 'serviceId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Customer Contact No Exist');
            let contactNo = req.body.contactNo;
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let contactNo = req.body.contactNo;
                let serviceId = req.body.serviceId;

                let sql = `CALL CheckContactNoExistWithServiceIdForOtherLoanAndOtherService('` + contactNo + `','` + serviceId + `')`;
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

const getPartnerGroupCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['partnerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Getting Partner Customers');
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let sql = `CALL getPartnerCustomers(` + partnerId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Get Partner Customers', result[0], result[0].length);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "partners.getPartnerGroupCustomers() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'users.getPartnerGroupCustomers()', error, '');
        next(errorResult);
    }
}

const deletePartnerByPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Deleting Partner');
        var requiredFields = ['partnerId'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "UPDATE partners SET isDelete = 1, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = " + req.body.partnerId;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let updateUserSql = "UPDATE users SET isDisabled = 1, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = (SELECT userId FROM partners WHERE id = " + req.body.partnerId + ")";
                    let updateUserResult = await query(updateUserSql);
                    let successResult = new ResultSuccess(200, true, 'Delete Partner Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                } else {
                    let errorResult = new ResultError(400, true, "partners.deletePartnerByPartnerId() Error", new Error("Error During Deleting Partner"), '');
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
        let errorResult = new ResultError(500, true, 'partners.deletePartnerByPartnerId() Exception', error, '');
        next(errorResult);
    }
}

export default {
    insertPartner, getNetworkandTeamPartnerListByRoleId, getNetworkandTeamPartnerHierarchyListByRoleId, getPartnerDetailByPartnerId, verifyPartner, updatePartnerProfile, getCommisionListByPartnerId
    , insertUpdatePartnerBankDetail, getBankDetailByPartnerId, updatePartner, checkContactNoExistWithServiceId, checkContactNoExistWithServiceIdFroOtherLoansAndServices, checkContactNoExistForCreditCard
    , getNetworkandTeamPartnerListByParentPartnerId, getPartnerGroupCustomers, deletePartnerByPartnerId
}