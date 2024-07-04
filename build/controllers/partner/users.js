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
var crypto = require('crypto');
const AWS = require('aws-sdk');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
const roleResponse_1 = require("../../classes/output/partner/roleResponse");
const partnerResponse_1 = require("../../classes/output/partner/partnerResponse");
const usersResponse_1 = require("../../classes/output/partner/usersResponse");
const notifications_1 = __importDefault(require("./../notifications"));
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
const NAMESPACE = 'Partner SignUp';
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['roleId', 'contactNo', 'fullName', 'cityId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Partner SignUp');
            let roleId = req.body.roleId;
            let roleName = req.body.roleName;
            let temporaryCode = '';
            let lastTempCodeSql = 'CALL websiteGetLastPartner()';
            let lastTempCodeResult = yield query(lastTempCodeSql);
            if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split('_')[1]);
                temporaryCode = 'TEMP_' + (no + 1).toString().padStart(10, '0');
            }
            else {
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
                let checkCodeResult = yield query(checkCodeSQl);
                if (checkCodeResult && checkCodeResult.length > 0 && checkCodeResult[0].length > 0) {
                    parentParnerId = checkCodeResult[0][0].id;
                }
                if (roleName.toLowerCase() == "dsa")
                    roleId = 4; //SubDSA Role
            }
            let sql = `CALL dsaBazarSignUp(` + roleId + `,'` + temporaryCode + `','` + fullName + `','` + gender + `','` + email + `','` + countryCode + `','` + contactNo + `','` + aadhaarCardNo + `'
                ,'` + panCardNo + `',` + cityId + `,'` + companyName + `',` + professionTypeId + `,` + workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `'
                '` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `'
                ,'` + gstNo + `',` + commitment + `,'` + referralCode + `',` + parentParnerId + `,` + designationId + `, 1);`;
            console.log(sql);
            var result = yield query(sql);
            console.log(JSON.stringify(result));
            if (result && result.length > 0 && result[0].length > 0) {
                console.log(result[0]);
                if (result[0][0].message == "Contact No Already Exist") {
                    let errorResult = new resulterror_1.ResultError(400, true, "Contact No Already Exist", new Error('Contact No Already Exist'), '');
                    next(errorResult);
                    return;
                }
                else {
                    let partnerId = result[0][0].insertId;
                    // //#region DSA Verify
                    // //Temporory Solution untill verify DSA from Admin Side Not implemented
                    // let pCode = temporaryCode.replace("T", "");
                    // let generatePermanentCodeSQL = "UPDATE partners SET permanentCode = '" + pCode + "' WHERE id=" + partnerId;
                    // let generatePermanentCodeRes = await query(generatePermanentCodeSQL);
                    // let getUserIdSql = "SELECT userId FROM partners WHERE id=" + partnerId;
                    // let getUserIdResult = await query(getUserIdSql);
                    // let verifyDSASql = "UPDATE users SET isDisabled = 0 WHERE id = " + getUserIdResult[0].userId;
                    // let verifyDSAResult = await query(verifyDSASql);
                    // //#endregion DSA Verify
                    let addressSql = `CALL dsaBazarPartnerAddress(` + partnerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `);`;
                    console.log(addressSql);
                    var addressResult = yield query(addressSql);
                    console.log(addressResult);
                    if (parentParnerId) {
                        let message = "";
                        if (roleName.toLowerCase() == "employee") {
                            //Team
                            let teamSql = `CALL dsaBazarInsertPartnerInTeam(` + parentParnerId + `,` + partnerId + `,null)`;
                            console.log(teamSql);
                            var teamResult = yield query(teamSql);
                            console.log(teamResult);
                            message = roleName + " is register in your group";
                        }
                        else {
                            //Network
                            let networkSql = `CALL dsaBazarInsertPartnerInNetwork(` + parentParnerId + `,` + partnerId + `,null)`;
                            console.log(networkSql);
                            var networkResult = yield query(networkSql);
                            console.log(networkResult);
                            message = roleName + " is register in your network";
                        }
                        //#region Notification
                        let partnerFcm = "";
                        let partnerUserId = null;
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + parentParnerId;
                        let partnerUserIdResult = yield query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = yield query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }
                        let title = message;
                        let description = message;
                        var dataBody = {
                            type: 13,
                            id: req.body.assignUserTrainingId,
                            title: title,
                            message: description,
                            json: null,
                            dateTime: null,
                            customerLoanId: null,
                            loanType: null,
                            creditCardId: null,
                            creditCardStatus: null
                        };
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                VALUES(` + partnerUserId + `, 13, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + result[0][0].userId + `, ` + result[0][0].userId + `)`;
                            let notificationResult = yield query(notificationSql);
                            yield notifications_1.default.sendMultipleNotification([partnerFcm], 13, req.body.assignUserTrainingId, title, description, '', null, null, null, null, null, null);
                        }
                        //#endregion Notification
                    }
                    if (req.body.resume) {
                        //let imgSplit = req.body.resume.split(',');
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
                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                            if (error) {
                                isErr = true;
                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                next(errorResult);
                                return;
                            }
                            console.log(data);
                            let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                            console.log(documentSql);
                            var documentResult = yield query(documentSql);
                            console.log(documentResult);
                            //cnt++;
                            //if (cnt == req.body.documents.length) {
                            // let successResult = new ResultSuccess(200, true, 'DSA SignUp', result[0], 1);
                            // console.log(successResult);
                            // return res.status(200).send(successResult);
                            //}
                        }));
                        if (isErr) {
                            let errorResult = new resulterror_1.ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                            next(errorResult);
                            return;
                        }
                    }
                    else {
                        let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                        console.log(documentSql);
                        var documentResult = yield query(documentSql);
                        console.log(documentResult);
                    }
                    if (req.body.documents && req.body.documents.length > 0) {
                        let cnt = 0;
                        for (let i = 0; i < req.body.documents.length; i++) {
                            const element = req.body.documents[i];
                            //base64 to bufferConvert
                            //let imgSplit = req.body.documents[i].fileData.split(',');
                            let buf = Buffer.from(req.body.documents[i].fileData, 'base64');
                            //let buf = Buffer.from(req.body.documents[i].fileData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                            let isErr = false;
                            let params = {
                                Bucket: 'dsaappsignupdocuments',
                                Key: element.fileName + "_" + new Date().getTime(),
                                Body: buf,
                                ContentEncoding: 'base64',
                                ContentType: 'image/' + element.contentType,
                                ACL: 'public-read'
                            };
                            yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                if (error) {
                                    isErr = true;
                                    let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                    next(errorResult);
                                    return;
                                }
                                console.log(data);
                                let documentSql = `CALL websiteInsertPartnerDocument(` + partnerId + `,` + element.documentId + `,'` + data.Location + `');`;
                                console.log(documentSql);
                                var documentResult = yield query(documentSql);
                                console.log(documentResult);
                                cnt++;
                                if (cnt == req.body.documents.length) {
                                    let updateProfilePicSql = "UPDATE users INNER JOIN partners ON partners.userId = users.Id SET users.profilePicUrl='" + data.Location + "' WHERE partners.id = " + partnerId;
                                    let updateProfilePicResult = yield query(updateProfilePicSql);
                                    console.log(updateProfilePicResult);
                                    var referCoin = 0;
                                    let referCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 2";
                                    let referCoinResult = yield query(referCoinSql);
                                    if (referCoinResult && referCoinResult.length > 0) {
                                        referCoin = referCoinResult[0].rewardCoin;
                                        if (referCoinResult[0].isScratchCard) {
                                            let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + result[0][0].userId + `, ` + referCoin + `, 2, ` + result[0][0].userId + `, ` + result[0][0].userId + `);`;
                                            let rewardResult = yield query(rewardSql);
                                        }
                                        else {
                                            let userWalletId;
                                            let userWalletIdResult = yield query(`SELECT id,coin FROM userwallet WHERE userId = ?`, result[0][0].userId);
                                            if (userWalletIdResult && userWalletIdResult.length > 0) {
                                                userWalletId = userWalletIdResult[0].id;
                                                let updateWalletAmountSql = yield query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + result[0][0].userId + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + referCoin);
                                            }
                                            else {
                                                let insertWalletAmount = yield query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + result[0][0].userId + `,` + referCoin + `,` + result[0][0].userId + `,` + result[0][0].userId + `)`);
                                                if (insertWalletAmount && insertWalletAmount.insertId) {
                                                    userWalletId = insertWalletAmount.insertId;
                                                }
                                            }
                                            let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + result[0][0].userId + `,` + referCoin + `,` + result[0][0].userId + `,` + result[0][0].userId + `,` + 2 + `)`;
                                            let walletResult = yield query(walletSql);
                                        }
                                    }
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'DSA SignUp', result[0], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                }
                            }));
                            if (isErr) {
                                break;
                            }
                        }
                    }
                    else {
                        var referCoin = 0;
                        let referCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 2";
                        let referCoinResult = yield query(referCoinSql);
                        if (referCoinResult && referCoinResult.length > 0) {
                            referCoin = referCoinResult[0].rewardCoin;
                            if (referCoinResult[0].isScratchCard) {
                                let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + result[0][0].userId + `, ` + referCoin + `, 2, ` + result[0][0].userId + `, ` + result[0][0].userId + `);`;
                                let rewardResult = yield query(rewardSql);
                            }
                            else {
                                let userWalletId;
                                let userWalletIdResult = yield query(`SELECT id,coin FROM userwallet WHERE userId = ?`, result[0][0].userId);
                                if (userWalletIdResult && userWalletIdResult.length > 0) {
                                    userWalletId = userWalletIdResult[0].id;
                                    let updateWalletAmountSql = yield query(`UPDATE userwallet SET coin = ?,modifiedBy = ` + result[0][0].userId + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id + ``, userWalletIdResult[0].coin + referCoin);
                                }
                                else {
                                    let insertWalletAmount = yield query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + result[0][0].userId + `,` + referCoin + `,` + result[0][0].userId + `,` + result[0][0].userId + `)`);
                                    if (insertWalletAmount && insertWalletAmount.insertId) {
                                        userWalletId = insertWalletAmount.insertId;
                                    }
                                }
                                let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + result[0][0].userId + `,` + referCoin + `,` + result[0][0].userId + `,` + result[0][0].userId + `,` + 2 + `)`;
                                let walletResult = yield query(walletSql);
                            }
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'DSA SignUp', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'users.signup()', error, '');
        next(errorResult);
    }
});
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['contactNo'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Partner Login');
            let contactNo = req.body.contactNo;
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userDevice = authorizationResult.currentUserDevice;
                let appId;
                if (userDevice.app == 'CreditAppAdmin') {
                    appId = 1;
                }
                else if (userDevice.app == 'CreditAppAndroid') {
                    appId = 2;
                }
                else {
                    appId = 3;
                }
                var sessionToken = crypto.randomBytes(48).toString('hex');
                let checkSql = `SELECT users.id, users.isDisabled, roles.id as roleId, roles.name as roleName, partners.parentPartnerId FROM users 
                INNER JOIN userroles ON userroles.userId = users.id 
                INNER JOIN roles ON roles.id = userroles.roleId
                INNER JOIN partners ON partners.userId = users.Id
                WHERE users.contactNo = '` + contactNo + `' AND userroles.roleId IN(3,4,5,6)`;
                let checkResult = yield query(checkSql);
                if (checkResult && checkResult.length > 0) {
                    let sql = `CALL dsaBazarLogin('` + contactNo + `',` + appId + `,'` + userDevice.deviceId + `','` + userDevice.fcmToken + `','` + userDevice.deviceManufacturer + `','` + userDevice.deviceModel + `', '` + sessionToken + `', '` + userDevice.appVersion + `')`;
                    console.log(sql);
                    let result = yield query(sql);
                    console.log(JSON.stringify(result));
                    if (result && result.length > 0) {
                        let userRole;
                        let user;
                        let finalResult = [];
                        let parentPartner;
                        if (result[0].length > 0) {
                            if (result[0][0].message && result[0][0].message == "User Not Verified") {
                                let errorResult = new resulterror_1.ResultError(400, true, "User Not Verified", new Error('User Not Verified'), '');
                                next(errorResult);
                                return;
                            }
                            else {
                                userRole = new roleResponse_1.RoleResponse(result[0][0].roleId, result[0][0].name);
                            }
                        }
                        if (result[5] && result[5].length > 0) {
                            parentPartner = new partnerResponse_1.partnerResponse(result[5][0].id, result[5][0].parentParnerId, result[5][0].userId, result[5][0].temporaryCode, result[5][0].permanentCode, result[5][0].fullName, result[5][0].gender, result[5][0].contactNo, result[5][0].aadhaarCardNo, result[5][0].panCardNo, result[5][0].cityId, result[5][0].companyName, result[5][0].companyTypeId, result[5][0].udhyamAadhaarNo, result[5][0].companyRegNo, result[5][0].professionTypeId, result[5][0].workExperience, result[5][0].haveOffice, result[5][0].businessName, result[5][0].businessAddress, result[5][0].gstNo, result[5][0].commitment, result[5][0].designationId, result[5][0].referralCode, result[5][0].isActive, result[5][0].isDelete, result[5][0].createdDate, result[5][0].modifiedDate, result[5][0].createdBy, result[5][0].modifiedBy, result[5][0].profilePicUrl);
                        }
                        // let profilePicUrl;
                        // if (result[2][0]) {
                        //     profilePicUrl = result[2][0].profilePicUrl;
                        // }
                        if (result[1] && result[1].length > 0) {
                            let address;
                            if (result[3] && result[3].length > 0 && result[3][0]) {
                                address = result[3][0];
                            }
                            let education;
                            if (result[4] && result[4].length > 0 && result[4][0]) {
                                education = result[4][0];
                            }
                            let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[1][0].currentBadgeId;
                            let partnerBadgeResult = yield query(partnerBadgeSql);
                            user = new usersResponse_1.userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl, result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode, result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId, result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId, result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo, result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete, result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId, (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), sessionToken, userRole, parentPartner, (address && address.id), (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district), (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName), (education && education.passingYear), (education && education.resume), result[6][0].addressLine1, result[6][0].addressLine2, result[6][0].pincode, result[6][0].workAddressCityId, result[6][0].jobType);
                            finalResult.push(user);
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Login SuccessFully', finalResult, 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "Login Failed", result, '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(500, true, "User Not Registered", "User Not Registered", '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'users.login()', error, '');
        next(errorResult);
    }
});
const validateSessionToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Validate Session Token');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sessionToken = authorizationResult.currentUser.sessionToken;
            if (sessionToken) {
                let userDevice = authorizationResult.currentUserDevice;
                let appId;
                if (userDevice.app == 'CreditAppAdmin') {
                    appId = 1;
                }
                else if (userDevice.app == 'CreditAppAndroid') {
                    appId = 2;
                }
                else {
                    appId = 3;
                }
                let sql = `CALL dsaBazarVerifySessionToken('` + sessionToken + `',` + appId + `,'` + userDevice.deviceId + `','` + userDevice.fcmToken + `','` + userDevice.deviceManufacturer + `','` + userDevice.deviceModel + `', '` + userDevice.appVersion + `')`;
                console.log(sql);
                let result = yield query(sql);
                console.log(JSON.stringify(result));
                if (result && result.length > 0) {
                    let userRole;
                    let user;
                    let parentPartner;
                    if (result[0].length > 0) {
                        if (result[0][0].message && result[0][0].message == "User Not Verified") {
                            let errorResult = new resulterror_1.ResultError(400, true, "User Not Verified", new Error('User Not Verified'), '');
                            next(errorResult);
                            return;
                        }
                        else {
                            userRole = new roleResponse_1.RoleResponse(result[0][0].id, result[0][0].name);
                        }
                    }
                    if (result[5] && result[5].length > 0) {
                        parentPartner = new partnerResponse_1.partnerResponse(result[5][0].id, result[5][0].parentParnerId, result[5][0].userId, result[5][0].temporaryCode, result[5][0].permanentCode, result[5][0].fullName, result[5][0].gender, result[5][0].contactNo, result[5][0].aadhaarCardNo, result[5][0].panCardNo, result[5][0].cityId, result[5][0].companyName, result[5][0].companyTypeId, result[5][0].udhyamAadhaarNo, result[5][0].companyRegNo, result[5][0].professionTypeId, result[5][0].workExperience, result[5][0].haveOffice, result[5][0].businessName, result[5][0].businessAddress, result[5][0].gstNo, result[5][0].commitment, result[5][0].designationId, result[5][0].referralCode, result[5][0].isActive, result[5][0].isDelete, result[5][0].createdDate, result[5][0].modifiedDate, result[5][0].createdBy, result[5][0].modifiedBy);
                    }
                    if (result[1] && result[1].length > 0) {
                        // let profilePicUrl;
                        // if (result[2][0]) {
                        //     profilePicUrl = result[2][0].profilePicUrl;
                        // }
                        let address;
                        if (result[3] && result[3].length > 0 && result[3][0]) {
                            address = result[3][0];
                        }
                        let education;
                        if (result[4] && result[4].length > 0 && result[4][0]) {
                            education = result[4][0];
                        }
                        let partnerBadgeSql = "SELECT * FROM badges WHERE id = " + result[1][0].currentBadgeId;
                        let partnerBadgeResult = yield query(partnerBadgeSql);
                        // let partnerBadgeSql = "SELECT * FROM partnerbadges WHERE badgeId = " + result[1][0].currentBadgeId;
                        // let partnerBadgeResult = await query(partnerBadgeSql);
                        user = new usersResponse_1.userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, result[1][0].profilePicUrl, result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode, result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId, result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId, result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo, result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete, result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId, (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), sessionToken, userRole, parentPartner, (address && address.id), (address && address.label), (address && address.addressLine1), (address && address.addressLine2), (address && address.pincode), (address && address.city), (address && address.district), (address && address.state), (address && address.districtId), (address && address.stateId), (education && education.id), (education && education.educationTypeId), (education && education.instituteName), (education && education.passingYear), (education && education.resume), result[6][0].addressLine1, result[6][0].addressLine2, result[6][0].pincode, result[6][0].workAddressCityId, result[6][0].jobType);
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Login SuccessFully', [user], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Login Failed", result, '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'users.validateSessionToken()', error, '');
        next(errorResult);
    }
});
const checkContactNoExist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['contactNo'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Customer Contact No Exist');
            let contactNo = req.body.contactNo;
            let sql = `CALL checkContactNoExist('` + contactNo + `')`;
            console.log(sql);
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length > 0) {
                    let partnerRequestResult = yield query(`SELECT becomeapartnerrequest.id FROM becomeapartnerrequest INNER JOIN customers ON becomeapartnerrequest.customerId = customers.id WHERE customers.userId = ` + result[0][0].id);
                    if (partnerRequestResult && partnerRequestResult.length > 0) {
                        result[0][0].isBecomePartnerRequest = true;
                    }
                    else {
                        result[0][0].isBecomePartnerRequest = false;
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'User Exist', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'users.checkContactNoExist()', error, '');
        next(errorResult);
    }
});
exports.default = { signup, login, validateSessionToken, checkContactNoExist };
