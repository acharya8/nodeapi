import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import { RoleResponse } from '../../classes/output/admin/roleResponse';
import { partnerResponse } from '../../classes/output/partner/partnerResponse';
import { userResponse } from '../../classes/output/partner/usersResponse';

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

const NAMESPACE = 'DSA SignUp';


const insertRequestForBecomePartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['contactNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {

            //let customerId = req.body.customerId;
            let fullName = req.body.fullName ? req.body.fullName : "";
            let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
            let cityId = req.body.cityId ? req.body.cityId : "";
            let district = req.body.district ? req.body.district : "";
            let state = req.body.state ? req.body.state : "";
            let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
            let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
            let gender = req.body.gender ? req.body.gender : "";
            let contactNo = req.body.contactNo;
            let aadharCardNo = req.body.aadharCardNo ? req.body.aadharCardNo : "";
            let jobType = req.body.jobType ? req.body.jobType : "";
            let businessCommitement = req.body.businessCommitement ? req.body.businessCommitement : "";
            let pincode = req.body.pincode ? req.body.pincode : "";

            let sql = `INSERT INTO becomeapartnerrequest (fullName, contactNo, customerId, gender, aadharCardNo, panCardNo, businessCommitement, jobType, addressLine1, addressLine2, pincode, cityId, district, state) 
                VALUES ('` + fullName + `','` + contactNo + `', null ,'` + gender + `','` + aadharCardNo + `','` + panCardNo + `','` + businessCommitement + `','` + jobType + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + district + `','` + state + `')`
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
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'dsaSignUps.insertRequestForBecomePartner()', error, '');
        next(errorResult);
    }
};

const referPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        var requiredFields = ['contactNo'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {

            let fullName = req.body.fullName ? req.body.fullName : "";
            let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
            let cityId = req.body.cityId ? req.body.cityId : "";
            let district = req.body.district ? req.body.district : "";
            let state = req.body.state ? req.body.state : "";
            let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
            let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
            let gender = req.body.gender ? req.body.gender : "";
            let contactNo = req.body.contactNo;
            let aadharCardNo = req.body.aadharCardNo ? req.body.aadharCardNo : "";
            let jobType = req.body.jobType ? req.body.jobType : "";
            let businessCommitement = req.body.businessCommitement ? req.body.businessCommitement : "";
            let pincode = req.body.pincode ? req.body.pincode : "";
            let roleId = req.body.roleId;
            let partnerCode = req.body.referCode;
            let partnerRole = req.body.referRole;

            let email = req.body.email ? req.body.email : "";
            let countryCode = req.body.countryCode ? req.body.countryCode : '+91';
            let companyName = req.body.companyName ? req.body.companyName : "";
            let professionTypeId = req.body.professionTypeId ? req.body.professionTypeId : null;
            let workExperience = req.body.workExperience ? req.body.workExperience : null;
            let haveOffice = req.body.haveOffice ? req.body.haveOffice : 0;
            let businessName = req.body.businessName ? req.body.businessName : "";
            let gstNo = req.body.gstNo ? req.body.gstNo : "";
            let commitment = req.body.commitment ? req.body.commitment : null;
            let referralCode = req.body.referralCode ? req.body.referralCode : "";
            let temporaryCode = '';
            let lastTempCodeSql = 'CALL websiteGetLastPartner()';
            let lastTempCodeResult = await query(lastTempCodeSql);
            if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split('_')[1]);
                temporaryCode = 'TEMP_' + (no + 1).toString().padStart(10, '0');
            } else {
                temporaryCode = 'TEMP_0000000001';
            }
            let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
            let label = req.body.label ? req.body.label : "";
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

            let parentParnerId = null;
            let referPartnerId = null;
            let referPartnerUserId = null;

            let checkCodeSQl = `CALL dsaBazarCheckDSAByCode('` + partnerCode + `')`;
            let checkCodeResult = await query(checkCodeSQl);
            if (checkCodeResult && checkCodeResult.length > 0 && checkCodeResult[0].length > 0) {
                referPartnerId = checkCodeResult[0][0].id;
                referPartnerUserId = checkCodeResult[0][0].userId;
                if (partnerRole == 'dsa' || partnerRole == 'subdsa') {
                    parentParnerId = checkCodeResult[0][0].id;
                }
            }

            let sql =
                `CALL dsaBazarInsertPartner(` + roleId + `,'` + temporaryCode + `','` + fullName + `','` + gender + `','` + email + `','` + countryCode + `','` + contactNo + `','` + aadharCardNo + `','` + panCardNo + `',` + cityId + `,'` + companyName + `'
                ,`+ professionTypeId + `,` + workExperience + `,` + haveOffice + `,'` + businessName + `','` + businessAddress + `','` + businessaddressLine1 + `','` + businessaddressLine2 + `','` + businesspincode + `',` + workAddressCityId + `,'` + jobType + `','` + gstNo + `',` + commitment + `,'` + referralCode + `',` + parentParnerId + `,` + designationId + `,` + referPartnerUserId + `)`;
            console.log(sql);
            var result = await query(sql);
            console.log(JSON.stringify(result));
            if (result && result.length > 0 && result[0].length > 0) {
                if (result[0][0].message == "Contact No Already Exist") {
                    let errorResult = new ResultError(400, true, "Contact No Already Exist", new Error('Contact No Already Exist'), '');
                    next(errorResult);
                    return;
                } else {
                    let partnerId = result[0][0].insertId;

                    let insertPartnerReferSql = `INSERT INTO referpartner(partnerId, referPartnerId, createdBy, modifiedBy) 
                    VALUES(` + parentParnerId + `, ` + referPartnerId + `, ` + referPartnerUserId + `, ` + referPartnerUserId + `)`;
                    let insertPartnerReferResult = await query(insertPartnerReferSql);

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
                        if (roleId == 5) {
                            //Team
                            let teamSql = `CALL dsaBazarInsertPartnerInTeam(` + parentParnerId + `,` + partnerId + `,null)`;
                            console.log(teamSql);
                            var teamResult = await query(teamSql);
                            console.log(teamResult);
                        } else if (roleId == 6) {
                            //Network
                            let networkSql = `CALL dsaBazarInsertPartnerInNetwork(` + parentParnerId + `,` + partnerId + `,null)`;
                            console.log(networkSql);
                            var networkResult = await query(networkSql);
                            console.log(networkResult);
                        }
                    }

                    let documentSql = `CALL dsaBazarInsertPartnerEducation(` + partnerId + `,` + educationTypeId + `,'','` + instituteName + `',` + passingYear + `,'` + otherDetail + `');`;
                    console.log(documentSql);
                    var documentResult = await query(documentSql);
                    console.log(documentResult);

                    let successResult = new ResultSuccess(200, true, 'Partner Inserted', [user], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);

                }
            } else {
                let errorResult = new ResultError(400, true, 'Not Inserted', new Error('Not Inserted'), '');
                next(errorResult);
            }

        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'dsaSignUps.insertRequestForBecomePartner()', error, '');
        next(errorResult);
    }
};



export default { insertRequestForBecomePartner, referPartner };
