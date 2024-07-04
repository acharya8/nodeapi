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
const partnerResponse_1 = require("../../classes/output/partner/partnerResponse");
const roleResponse_1 = require("../../classes/output/admin/roleResponse");
const usersResponse_1 = require("../../classes/output/partner/usersResponse");
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
const NAMESPACE = 'Partners';
const getPartnerUsersByRoleId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Partner User');
        var requiredFields = ["roleId"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let roleId = req.body.roleId;
                let sql = `CALL adminGetPartnerDetail(` + roleId + `,` + startIndex + `,` + fetchRecords + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Users', result[0], 1);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resultsuccess_1.ResultSuccess(200, true, "Users Not Available", [], 0);
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Users", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'Users.getPartnerUsers() Exception', error, '');
        next(errorResult);
    }
});
const getPartnerList = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Partner User');
        var requiredFields = ["roleIds"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecord = req.body.fetchRecord ? req.body.fetchRecord : 0;
                let roleIds = req.body.roleIds ? req.body.roleIds : 0;
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
                    req.body.roleIds = roleIds;
                }
                let sql = `CALL adminGetPartnerList(` + startIndex + `,` + fetchRecord + `,'` + roleIds + `')`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[1] && result[1].length > 0) {
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Partners', result[1], result[0][0].totalCount);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resultsuccess_1.ResultSuccess(200, true, "Users Not Available", [], 0);
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "Error While Getting Partners", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'Users.getPartnerUsers() Exception', error, '');
        next(errorResult);
    }
});
const deletePartnerByPartnerId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Deleting Partner');
        var requiredFields = ['partnerId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = "UPDATE partners SET isDelete = 1, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = " + req.body.partnerId;
                let result = yield query(sql);
                if (result && result.affectedRows >= 0) {
                    let updateUserSql = "UPDATE users SET isDisabled = 1, modifiedBy = " + authorizationResult.currentUser.id + ", modifiedDate = CURRENT_TIMESTAMP() WHERE id = (SELECT userId FROM partners WHERE id = " + req.body.partnerId + ")";
                    let updateUserResult = yield query(updateUserSql);
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Delete Partner Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "partners.deletePartnerByPartnerId() Error", new Error("Error During Deleting Partner"), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'partners.deletePartnerByPartnerId() Exception', error, '');
        next(errorResult);
    }
});
const insertPartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Partner');
        var requiredFields = ['roleId', 'contactNo', 'fullName', 'cityId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
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
                let businessAddress = req.body.businessAddress ? req.body.businessAddress : "";
                let gstNo = req.body.gstNo ? req.body.gstNo : "";
                let commitment = req.body.commitment ? req.body.commitment : null;
                let referralCode = req.body.referralCode ? req.body.referralCode : "";
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : "";
                let accountHolderName = req.body.accountHolderName ? req.body.accountHolderName : "";
                let bankId = req.body.bankId ? req.body.bankId : 0;
                let ifscCode = req.body.ifscCode ? req.body.ifscCode : "";
                let accountNumber = req.body.accountNo ? req.body.accountNo : "";
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode ? req.body.pincode : "";
                let businessAddressLine1 = req.body.businessAddressLine1 ? req.body.businessAddressLine1 : "";
                let businessAddressLine2 = req.body.businessAddressLine2 ? req.body.businessAddressLine2 : "";
                let businessPincode = req.body.businessAddressPincode ? req.body.businessAddressPincode : "";
                let workAddressCityId = req.body.workAddressCityId ? req.body.workAddressCityId : "";
                let jobType = req.body.jobType ? req.body.jobType : "";
                let designationId = req.body.designationId ? req.body.designationId : null;
                let educationTypeId = req.body.educationTypeId ? req.body.educationTypeId : null;
                let instituteName = req.body.instituteName ? req.body.instituteName : "";
                let passingYear = req.body.passingYear ? req.body.passingYear : null;
                let resume = req.body.resume ? req.body.resume : "";
                let otherDetail = req.body.otherDetail ? req.body.otherDetail : "";
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
                let sql = `CALL dsaBazarInsertPartner(` + roleId + `,'` + temporaryCode + `','` + fullName + `','` + gender + `','` + email + `','` + countryCode + `','` + contactNo + `','` + aadhaarCardNo + `','` + panCardNo + `',` + cityId + `,'` + companyName + `'
                ,` + professionTypeId + `,` + workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessAddressLine1 + `','` + businessAddressLine2 + `','` + businessPincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + referralCode + `',` + parentParnerId + `,` + designationId + `,` + authorizationResult.currentUser.id + `)`;
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
                        if (accountNumber) {
                            let bankSql = `CALL dsaBazarInserUpdateBankDetail(` + null + `,` + partnerId + `,` + bankId + `,'` + accountHolderName + `','` + accountNumber + `','` + ifscCode + `',` + authorizationResult.currentUser.id + `)`;
                            let bankResult = yield query(bankSql);
                        }
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
                        userRole = new roleResponse_1.RoleResponse(result[0][0].id, result[0][0].name);
                        if (result[2] && result[2].length > 0) {
                            parentPartner = new partnerResponse_1.partnerResponse(result[2][0].id, result[2][0].parentParnerId, result[2][0].userId, result[2][0].temporaryCode, result[2][0].permanentCode, result[2][0].fullName, result[2][0].gender, result[2][0].contactNo, result[2][0].aadhaarCardNo, result[2][0].panCardNo, result[2][0].cityId, result[2][0].companyName, result[2][0].companyTypeId, result[2][0].udhyamAadhaarNo, result[2][0].companyRegNo, result[2][0].professionTypeId, result[2][0].workExperience, result[2][0].haveOffice, result[2][0].businessName, result[2][0].businessAddress, result[2][0].gstNo, result[2][0].commitment, result[2][0].designationId, result[2][0].referralCode, result[2][0].isActive, result[2][0].isDelete, result[2][0].createdDate, result[2][0].modifiedDate, result[2][0].createdBy, result[2][0].modifiedBy, result[2][0].profilePicUrl);
                        }
                        if (result[1] && result[1].length > 0) {
                            let profilePicUrl;
                            if (result[2][0]) {
                                profilePicUrl = result[2][0].profilePicUrl;
                            }
                            let partnerBadgeSql = "SELECT * FROM partnerbadges WHERE badgeId = " + result[1][0].currentBadgeId;
                            let partnerBadgeResult = yield query(partnerBadgeSql);
                            user = new usersResponse_1.userResponse(result[1][0].userId, result[1][0].email, result[1][0].countryCode, result[1][0].password, profilePicUrl, result[1][0].isDisabled, result[1][0].roleId, result[1][0].id, result[1][0].parentPartnerId, result[1][0].temporaryCode, result[1][0].permanentCode, result[1][0].fullName, result[1][0].gender, result[1][0].contactNo, result[1][0].aadhaarCardNo, result[1][0].panCardNo, result[1][0].cityId, result[1][0].companyName, result[1][0].companyTypeId, result[1][0].udhyamAadhaarNo, result[1][0].companyRegNo, result[1][0].professionTypeId, result[1][0].workExperience, result[1][0].haveOffice, result[1][0].businessName, result[1][0].businessAddress, result[1][0].gstNo, result[1][0].commitment, result[1][0].designationId, result[1][0].referralCode, result[1][0].isActive, result[1][0].isDelete, result[1][0].createdDate, result[1][0].modifiedDate, result[1][0].createdBy, result[1][0].modifiedBy, result[1][0].currentBadgeId, (partnerBadgeResult && partnerBadgeResult.length > 0 ? partnerBadgeResult[0].name : ""), null, userRole, parentPartner, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
                        }
                        let addressSql = `CALL dsaBazarPartnerAddress(` + partnerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `);`;
                        console.log(addressSql);
                        var addressResult = yield query(addressSql);
                        console.log(addressResult);
                        if (parentParnerId) {
                            if (roleName.toLowerCase() == "employee") {
                                //Team
                                let teamSql = `CALL dsaBazarInsertPartnerInTeam(` + parentParnerId + `,` + partnerId + `,null)`;
                                console.log(teamSql);
                                var teamResult = yield query(teamSql);
                                console.log(teamResult);
                            }
                            else {
                                //Network
                                let networkSql = `CALL dsaBazarInsertPartnerInNetwork(` + parentParnerId + `,` + partnerId + `,null)`;
                                console.log(networkSql);
                                var networkResult = yield query(networkSql);
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
                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (error) {
                                        isErr = true;
                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                        next(errorResult);
                                        return;
                                    }
                                    console.log(data);
                                    let documentSql = `CALL dsaBazarInsertPartnerDocument(` + partnerId + `,` + element.documentId + `,'` + data.Location + `');`;
                                    console.log(documentSql);
                                    var documentResult = yield query(documentSql);
                                    console.log(documentResult);
                                    cnt++;
                                    if (cnt == req.body.documents.length) {
                                        let updateProfilePicSql = "UPDATE users INNER JOIN partners ON partners.userId = users.Id SET users.profilePicUrl='" + data.Location + "' WHERE partners.id = " + partnerId;
                                        let updateProfilePicResult = yield query(updateProfilePicSql);
                                        console.log(updateProfilePicResult);
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Inserted', [user], 1);
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
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Inserted', [user], 1);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'partners.insertPartner() Exception', error, '');
        next(errorResult);
    }
});
const updatePartner = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Insert Partner');
        var requiredFields = ['partnerId', 'userId', 'contactNo', 'fullName', 'cityId', 'partnerAddressId', 'partnerEducationId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
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
                let businessAddress = req.body.businessAddress ? req.body.businessAddress : "";
                let gstNo = req.body.gstNo ? req.body.gstNo : "";
                let commitment = req.body.commitment ? req.body.commitment : null;
                let referralCode = req.body.referralCode ? req.body.referralCode : "";
                let parentParnerId = req.body.parentParnerId ? req.body.parentParnerId : null;
                let profilePicUrl = req.body.profilePicUrl ? req.body.profilePicUrl : "";
                let accountHolderName = req.body.accountHolderName ? req.body.accountHolderName : "";
                let bankId = req.body.bankId ? req.body.bankId : 0;
                let ifscCode = req.body.ifscCode ? req.body.ifscCode : "";
                let accountNo = req.body.accountNo ? req.body.accountNo : "";
                let partnerAddressId = req.body.partnerAddressId;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode ? req.body.pincode : "";
                let businessAddressLine1 = req.body.businessAddressLine1 ? req.body.businessAddressLine1 : "";
                let businessAddressLine2 = req.body.businessAddressLine2 ? req.body.businessAddressLine2 : "";
                let businessPincode = req.body.businessAddressPincode ? req.body.businessAddressPincode : "";
                let workAddressCityId = req.body.workAddressCityId ? req.body.workAddressCityId : 0;
                let jobType = req.body.jobType ? req.body.jobType : "";
                let partnerEducationId = req.body.partnerEducationId ? req.body.partnerEducationId : null;
                let designationId = req.body.designationId ? req.body.designationId : null;
                let educationTypeId = req.body.educationTypeId ? req.body.educationTypeId : null;
                let instituteName = req.body.instituteName ? req.body.instituteName : "";
                let passingYear = req.body.passingYear ? req.body.passingYear : null;
                let resume = req.body.resume ? req.body.resume : "";
                let otherDetail = req.body.otherDetail ? req.body.otherDetail : "";
                let partnerBankDetailId = req.body.partnerBankDetailId ? req.body.partnerBankDetailId : null;
                let sql = `CALL dsaBazarUpdatePartner(` + partnerId + `,` + userId + `,'` + fullName + `','` + gender + `','` + email + `','` + contactNo + `','` + aadhaarCardNo + `','` + panCardNo + `',` + cityId + `,'` + companyName + `'
                ,` + professionTypeId + `,` + workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessAddressLine1 + `','` + businessAddressLine2 + `','` + businessPincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + referralCode + `',` + parentParnerId + `,` + designationId + `);`;
                console.log(sql);
                let result = yield query(sql);
                if (result) {
                    if (accountNo) {
                        let bankSql = `CALL dsaBazarInserUpdateBankDetail(` + partnerBankDetailId + `,` + partnerId + `,` + bankId + `,'` + accountHolderName + `','` + accountNo + `','` + ifscCode + `',` + authorizationResult.currentUser.id + `)`;
                        let bankResult = yield query(bankSql);
                    }
                    let addressSql = `CALL dsaBazarUpdatePartnerAddress(` + partnerAddressId + `,` + partnerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `);`;
                    console.log(addressSql);
                    var addressResult = yield query(addressSql);
                    console.log(addressResult);
                    if (req.body.resume) {
                        if (req.body.resume.includes("https:")) {
                            let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + req.body.resume + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                            console.log(documentSql);
                            var documentResult = yield query(documentSql);
                            console.log(documentResult);
                            if (!profilePicUrl) {
                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                let checkUrlResult = yield query(checkUrlSql);
                                if (checkUrlResult && checkUrlResult.length > 0) {
                                    if (checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = yield S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: splt[splt.length - 1],
                                        }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                            if (err) {
                                                console.log("Error: Object delete failed.");
                                                let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                next(errorResult);
                                            }
                                            else {
                                                let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                let updateProfileResult = yield query(updateProfileSql);
                                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        }));
                                    }
                                    else {
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    }
                                }
                            }
                            else {
                                if (profilePicUrl.includes("https:")) {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                    let checkUrlResult = yield query(checkUrlSql);
                                    if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = yield S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: splt[splt.length - 1],
                                        }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                            if (err) {
                                                console.log("Error: Object delete failed.");
                                                let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                next(errorResult);
                                            }
                                            else {
                                                let buf = Buffer.from(profilePicUrl, 'base64');
                                                let contentType;
                                                contentType = 'image/jpeg';
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
                                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (error) {
                                                        isErr = true;
                                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                        next(errorResult);
                                                        return;
                                                    }
                                                    console.log(data);
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                }));
                                            }
                                        }));
                                    }
                                    else {
                                        let buf = Buffer.from(profilePicUrl, 'base64');
                                        let contentType;
                                        contentType = 'image/jpeg';
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
                                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                            if (error) {
                                                isErr = true;
                                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                next(errorResult);
                                                return;
                                            }
                                            console.log(data);
                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                            let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        }));
                                    }
                                }
                            }
                        }
                        else {
                            let checkUrlSql = `SELECT resume from partnereducations WHERE partnerId = ` + partnerId;
                            let checkUrlResult = yield query(checkUrlSql);
                            if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].resume) {
                                let splt = checkUrlResult[0].resume.split("/");
                                const delResp = yield S3.deleteObject({
                                    Bucket: 'dsaappsignupdocuments',
                                    Key: splt[splt.length - 1],
                                }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    }
                                    else {
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
                                            let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                            console.log(documentSql);
                                            var documentResult = yield query(documentSql);
                                            console.log(documentResult);
                                            if (!profilePicUrl) {
                                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                                let checkUrlResult = yield query(checkUrlSql);
                                                if (checkUrlResult && checkUrlResult.length > 0) {
                                                    if (checkUrlResult[0].profilePicUrl) {
                                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                        const delResp = yield S3.deleteObject({
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: splt[splt.length - 1],
                                                        }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                            if (err) {
                                                                console.log("Error: Object delete failed.");
                                                                let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                                next(errorResult);
                                                            }
                                                            else {
                                                                let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                                let updateProfileResult = yield query(updateProfileSql);
                                                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                                console.log(successResult);
                                                                return res.status(200).send(successResult);
                                                            }
                                                        }));
                                                    }
                                                    else {
                                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    }
                                                }
                                            }
                                            else {
                                                if (profilePicUrl.includes("https:")) {
                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                }
                                                else {
                                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                                    let checkUrlResult = yield query(checkUrlSql);
                                                    if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                        const delResp = yield S3.deleteObject({
                                                            Bucket: 'creditapppartnerprofilepic',
                                                            Key: splt[splt.length - 1],
                                                        }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                            if (err) {
                                                                console.log("Error: Object delete failed.");
                                                                let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                                next(errorResult);
                                                            }
                                                            else {
                                                                let buf = Buffer.from(profilePicUrl, 'base64');
                                                                let contentType;
                                                                contentType = 'image/jpeg';
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
                                                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                                    if (error) {
                                                                        isErr = true;
                                                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                                        next(errorResult);
                                                                        return;
                                                                    }
                                                                    console.log(data);
                                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                                    let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                                    console.log(successResult);
                                                                    return res.status(200).send(successResult);
                                                                }));
                                                            }
                                                        }));
                                                    }
                                                    else {
                                                        let buf = Buffer.from(profilePicUrl, 'base64');
                                                        let contentType;
                                                        contentType = 'image/jpeg';
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
                                                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                            if (error) {
                                                                isErr = true;
                                                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                                next(errorResult);
                                                                return;
                                                            }
                                                            console.log(data);
                                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                            let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        }));
                                                    }
                                                }
                                            }
                                        }));
                                        if (isErr) {
                                            let errorResult = new resulterror_1.ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                            next(errorResult);
                                            return;
                                        }
                                    }
                                }));
                            }
                            else {
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
                                    let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'` + data.Location + `','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                    console.log(documentSql);
                                    var documentResult = yield query(documentSql);
                                    console.log(documentResult);
                                    if (!profilePicUrl) {
                                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                        let checkUrlResult = yield query(checkUrlSql);
                                        if (checkUrlResult && checkUrlResult.length > 0) {
                                            if (checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = yield S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    }
                                                    else {
                                                        let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                        let updateProfileResult = yield query(updateProfileSql);
                                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    }
                                                }));
                                            }
                                            else {
                                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        }
                                    }
                                    else {
                                        if (profilePicUrl.includes("https:")) {
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        }
                                        else {
                                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                            let checkUrlResult = yield query(checkUrlSql);
                                            if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = yield S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    }
                                                    else {
                                                        let buf = Buffer.from(profilePicUrl, 'base64');
                                                        let contentType;
                                                        contentType = 'image/jpeg';
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
                                                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                            if (error) {
                                                                isErr = true;
                                                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                                next(errorResult);
                                                                return;
                                                            }
                                                            console.log(data);
                                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                            let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        }));
                                                    }
                                                }));
                                            }
                                            else {
                                                let buf = Buffer.from(profilePicUrl, 'base64');
                                                let contentType;
                                                contentType = 'image/jpeg';
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
                                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (error) {
                                                        isErr = true;
                                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                        next(errorResult);
                                                        return;
                                                    }
                                                    console.log(data);
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                }));
                                            }
                                        }
                                    }
                                }));
                                if (isErr) {
                                    let errorResult = new resulterror_1.ResultError(400, true, 'File Not Uploaded', new Error('File Not Uploaded'), '');
                                    next(errorResult);
                                    return;
                                }
                            }
                        }
                    }
                    else {
                        let checkUrlSql = `SELECT resume from partnereducations WHERE partnerId = ` + partnerId;
                        let checkUrlResult = yield query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].resume) {
                            let splt = checkUrlResult[0].resume.split("/");
                            const delResp = yield S3.deleteObject({
                                Bucket: 'dsaappsignupdocuments',
                                Key: splt[splt.length - 1],
                            }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                if (err) {
                                    console.log("Error: Object delete failed.");
                                    let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                    next(errorResult);
                                }
                                else {
                                    let documentSql = `CALL dsaBazarUpdatePartnerEducation(` + partnerEducationId + `,` + partnerId + `,` + educationTypeId + `,'','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                                    console.log(documentSql);
                                    var documentResult = yield query(documentSql);
                                    console.log(documentResult);
                                    if (!profilePicUrl) {
                                        let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                        let checkUrlResult = yield query(checkUrlSql);
                                        if (checkUrlResult && checkUrlResult.length > 0) {
                                            if (checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = yield S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    }
                                                    else {
                                                        let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                        let updateProfileResult = yield query(updateProfileSql);
                                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                        console.log(successResult);
                                                        return res.status(200).send(successResult);
                                                    }
                                                }));
                                            }
                                            else {
                                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        }
                                    }
                                    else {
                                        if (profilePicUrl.includes("https:")) {
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        }
                                        else {
                                            let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                            let checkUrlResult = yield query(checkUrlSql);
                                            if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                                let splt = checkUrlResult[0].profilePicUrl.split("/");
                                                const delResp = yield S3.deleteObject({
                                                    Bucket: 'creditapppartnerprofilepic',
                                                    Key: splt[splt.length - 1],
                                                }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (err) {
                                                        console.log("Error: Object delete failed.");
                                                        let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                        next(errorResult);
                                                    }
                                                    else {
                                                        let buf = Buffer.from(profilePicUrl, 'base64');
                                                        let contentType;
                                                        contentType = 'image/jpeg';
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
                                                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                            if (error) {
                                                                isErr = true;
                                                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                                next(errorResult);
                                                                return;
                                                            }
                                                            console.log(data);
                                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                            let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                            console.log(successResult);
                                                            return res.status(200).send(successResult);
                                                        }));
                                                    }
                                                }));
                                            }
                                            else {
                                                let buf = Buffer.from(profilePicUrl, 'base64');
                                                let contentType;
                                                contentType = 'image/jpeg';
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
                                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (error) {
                                                        isErr = true;
                                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                        next(errorResult);
                                                        return;
                                                    }
                                                    console.log(data);
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                }));
                                            }
                                        }
                                    }
                                }
                            }));
                        }
                        else {
                            if (!profilePicUrl) {
                                let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                let checkUrlResult = yield query(checkUrlSql);
                                if (checkUrlResult && checkUrlResult.length > 0) {
                                    if (checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = yield S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: splt[splt.length - 1],
                                        }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                            if (err) {
                                                console.log("Error: Object delete failed.");
                                                let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                next(errorResult);
                                            }
                                            else {
                                                let updateProfileSql = `UPDATE users SET profilePicUrl='' WHERE id = ` + userId;
                                                let updateProfileResult = yield query(updateProfileSql);
                                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                console.log(successResult);
                                                return res.status(200).send(successResult);
                                            }
                                        }));
                                    }
                                    else {
                                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                        console.log(successResult);
                                        return res.status(200).send(successResult);
                                    }
                                }
                            }
                            else {
                                if (profilePicUrl.includes("https:")) {
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let checkUrlSql = `SELECT profilePicUrl from users WHERE id = ` + userId;
                                    let checkUrlResult = yield query(checkUrlSql);
                                    if (checkUrlResult && checkUrlResult.length > 0 && checkUrlResult[0].profilePicUrl) {
                                        let splt = checkUrlResult[0].profilePicUrl.split("/");
                                        const delResp = yield S3.deleteObject({
                                            Bucket: 'creditapppartnerprofilepic',
                                            Key: splt[splt.length - 1],
                                        }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                            if (err) {
                                                console.log("Error: Object delete failed.");
                                                let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                                next(errorResult);
                                            }
                                            else {
                                                let buf = Buffer.from(profilePicUrl, 'base64');
                                                let contentType;
                                                contentType = 'image/jpeg';
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
                                                yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                                    if (error) {
                                                        isErr = true;
                                                        let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                        next(errorResult);
                                                        return;
                                                    }
                                                    console.log(data);
                                                    let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                                    let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                                    console.log(successResult);
                                                    return res.status(200).send(successResult);
                                                }));
                                            }
                                        }));
                                    }
                                    else {
                                        let buf = Buffer.from(profilePicUrl, 'base64');
                                        let contentType;
                                        contentType = 'image/jpeg';
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
                                        yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                                            if (error) {
                                                isErr = true;
                                                let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                                                next(errorResult);
                                                return;
                                            }
                                            console.log(data);
                                            let updateUserProfilePicSql = `UPDATE users SET profilePicUrl = '` + data.Location + `' WHERE id = ` + userId;
                                            let updateUserProfilePicResult = yield query(updateUserProfilePicSql);
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Partner Data Updated', [result], 1);
                                            console.log(successResult);
                                            return res.status(200).send(successResult);
                                        }));
                                    }
                                }
                            }
                        }
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Partner Data Not Updated', new Error('Partner Data Not Updated'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'partners.updatePartner() Exception', error, '');
        next(errorResult);
    }
});
const getPartnerDetailByPartnerId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Partner Detail By');
        var requiredFields = ['partnerId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let sql = `CALL adminGetPartnerById(` + partnerId + `)`;
                let result = yield query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let finalResult = { basicDetail: result[0][0], educations: null, documents: null, commission: null, loans: null, customers: null, assignTrainings: null, partnerAddress: null, visitingCard: null, employee: null, group: null, walletHistory: null, partnerBankDetail: null, partnerCommission: null, partners: null, orders: null, leads: null };
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
                            finalResult.partnerBankDetail = result[12][0];
                        }
                        if (result[13] && result[13].length > 0) {
                            finalResult.partnerCommission = result[13];
                        }
                        if (result[14] && result[14].length > 0) {
                            finalResult.partners = result[14];
                        }
                        if (result[15] && result[15].length > 0) {
                            finalResult.orders = result[15];
                        }
                        if (result[16] && result[16].length > 0) {
                            finalResult.leads = result[16];
                        }
                        let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Partner Detail By partnerId', [finalResult], 1);
                        return res.status(200).send(successResult);
                    }
                    else {
                        let errorResult = new resulterror_1.ResultError(400, true, "Data Not Available", [], '');
                        next(errorResult);
                    }
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "partners.getPartnerDetailByPartnerId() Error", result, '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'partners.getPartnerDetailByPartnerId() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getPartnerUsersByRoleId, getPartnerList, deletePartnerByPartnerId, insertPartner, updatePartner, getPartnerDetailByPartnerId };
