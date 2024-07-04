import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
const AWS = require('aws-sdk');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
import notificationContainer from './../notifications';

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

const NAMESPACE = 'Lead';

const insertUpdateLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Inserting Leads');
        var requiredFields = ["contactNo", "customerFullName", "email", "serviceId", "loanAmount", "pincode", "employmentTypeId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let leadId = req.body.leadId ? req.body.leadId : 0;
                let customerId = req.body.customerId ? req.body.customerId : null;
                let temporaryCode = "";
                let lastTempCodeSql = "CALL websiteGetLastCustomer()";
                let lastTempCodeResult = await query(lastTempCodeSql);
                if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                    let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split("_")[1])
                    temporaryCode = "CT_" + (no + 1).toString().padStart(10, "0");
                } else {
                    temporaryCode = "CT_0000000001";
                }
                let serviceId = req.body.serviceId ? req.body.serviceId : 1;
                var countryCode = req.body.countryCode ? req.body.countryCode : "+91";
                let contactNo = req.body.contactNo;
                let loanAmount = req.body.loanAmount ? req.body.loanAmount : null;
                let customerFullName = req.body.customerFullName;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : null;
                let label = req.body.label ? req.body.label : "";
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode;
                let cityId = req.body.cityId;
                let city = req.body.city ? req.body.city : "";
                let district = req.body.district ? req.body.district : "";
                let state = req.body.state ? req.body.state : "";
                let email = req.body.email ? req.body.email : "";
                let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
                let aadhaarCardNo = req.body.aadhaarCardNo ? req.body.aadhaarCardNo : "";
                let employmentTypeId = req.body.employmentTypeId ? req.body.employmentTypeId : null;
                let leadStatusId = req.body.leadStatusId ? req.body.leadStatusId : null;
                let result
                let checkSql = "CALL checkContactNoExist('" + contactNo + "')";
                let checkResult = await query(checkSql);
                if (checkResult && checkResult.length > 0) {
                    //if customer role then insert lead
                    if (checkResult[0].length && checkResult.length > 0) {
                        if (checkResult[0][0].roleName == "CUSTOMERS") {
                            let sql = `CALL insertUpdateLead(` + leadId + `,` + checkResult[0][0].id + `,` + customerId + `,'` + countryCode + `','` + contactNo + `','` + customerFullName + `', '` + temporaryCode + `'
                            ,` + serviceId + `,` + loanAmount + `,` + customerAddressId + `, ` + addressTypeId + `, '` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                            ,`+ cityId + `,'` + city + `','` + district + `','` + state + `','` + email + `','` + panCardNo + `','` + aadhaarCardNo + `',` + employmentTypeId + `,` + userId + `,` + leadStatusId + `)`;
                            result = await query(sql);
                        }
                    } else {
                        let sql = `CALL insertUpdateLead(` + leadId + `,null,` + customerId + `,'` + countryCode + `','` + contactNo + `','` + customerFullName + `', '` + temporaryCode + `'
                        ,` + serviceId + `,` + loanAmount + `,` + customerAddressId + `, ` + addressTypeId + `, '` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                        ,`+ cityId + `,'` + city + `','` + district + `','` + state + `','` + email + `','` + panCardNo + `','` + aadhaarCardNo + `',` + employmentTypeId + `,` + userId + `,` + leadStatusId + `)`;
                        result = await query(sql);

                    }
                    //else create customer with temp code and then after insert lead
                } else {
                    let sql = `CALL insertUpdateLead(` + leadId + `,null,` + customerId + `,'` + countryCode + `','` + contactNo + `','` + customerFullName + `', '` + temporaryCode + `'
                    ,` + serviceId + `,` + loanAmount + `,` + customerAddressId + `, ` + addressTypeId + `, '` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                    ,`+ cityId + `,'` + city + `','` + district + `','` + state + `','` + email + `','` + panCardNo + `','` + aadhaarCardNo + `',` + employmentTypeId + `,` + userId + `,` + leadStatusId + `)`;
                    result = await query(sql);
                }

                if (leadId == 0) {
                    var rewardCoin = 0;
                    let roleId = await query(`SELECT currentRoleId FROM users WHERE id = ?`, authorizationResult.currentUser.id)
                    let rewardCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 3 AND FIND_IN_SET(" + roleId[0].currentRoleId + ",roleIds)";
                    let rewardCoinResult = await query(rewardCoinSql);
                    if (rewardCoinResult && rewardCoinResult.length > 0) {
                        rewardCoin = rewardCoinResult[0].rewardCoin;
                        if (rewardCoinResult[0].isScratchCard) {
                            console.log(rewardCoinResult[0].isScratchCard)
                            let rewardSql = `INSERT INTO userscratchcards(userId, value, rewardType, createdBy, modifiedBy) VALUES(` + userId + `, ` + rewardCoin + `, 3, ` + userId + `, ` + userId + `);`;
                            let rewardResult = await query(rewardSql);
                        }
                        else {
                            let userWalletId;

                            let userWalletIdResult = await query(`SELECT id,coin FROM userwallet WHERE userId = ?`, userId);
                            console.log("sdfds", userWalletIdResult);

                            if (userWalletIdResult && userWalletIdResult.length > 0) {
                                userWalletId = userWalletIdResult[0].id
                                console.log(userWalletId)
                                let sql = `UPDATE userwallet SET coin = ?,modifiedBy = ` + authorizationResult.currentUser.id + `,modifiedDate = CURRENT_TIMESTAMP WHERE id = ` + userWalletIdResult[0].id;
                                console.log(sql)
                                let updateWalletAmountSql = await query(sql, userWalletIdResult[0].coin + rewardCoin)
                                console.log(updateWalletAmountSql);

                            }
                            else {
                                let insertWalletAmount = await query(`INSERT INTO userwallet (userId,coin,createdBy,modifiedBy) VALUES (` + userId + `,` + rewardCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`)
                                if (insertWalletAmount && insertWalletAmount.insertId) {
                                    userWalletId = insertWalletAmount.insertedId
                                }
                            }

                            let walletSql = `INSERT INTO userwallethistory (userWalletId,userId,coin,createdBy,modifiedBy,rewardType) VALUES (` + userWalletId + `,` + userId + `,` + rewardCoin + `,` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `,` + 3 + `)`
                            console.log(walletSql)
                            let walletResult = await query(walletSql);
                        }
                    }
                }
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {

                        let successResult = new ResultSuccess(200, true, 'Lead inserted', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "leads.insertLeads() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'leads.insertLeads()', error, '');
        next(errorResult);
    }
};

const getLeadGeneratedByUserId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Leads Generated By Users');
        var requiredFields = ["userIds"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {

                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let userIds = (req.body.userIds && req.body.userIds.length > 0) ? req.body.userIds.toString() : authorizationResult.currentUser.id;
                let sql = "CALL getLeadGeneratedByUserId('" + userIds + "'," + startIndex + "," + fetchRecords + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Leads Generated By Users', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "leads.getLeadGeneratedByUserId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'leads.insertLeads()', error, '');
        next(errorResult);
    }
};

const getLeadGeneratedByNetworkAndTeamUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Leads Generated By Users');
        var requiredFields = ["partnerId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId;
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;

                let usersql = "select partners.userId as userId from partners where id IN(select networkPartnerId from partnernetworks where partnerId = " + req.body.partnerId + ") OR id IN(select teamPartnerId from partnerteams where partnerId = " + req.body.partnerId + ")";
                let userResult = await query(usersql);
                if (userResult && userResult.length > 0) {
                    let userIds = userResult.map(c => c.userId);
                    let sql = "CALL getLeadGeneratedByUserId('" + userIds + "'," + startIndex + "," + fetchRecords + ")";
                    let result = await query(sql);
                    if (result && result.length > 0) {
                        if (result[0] && result[0].length > 0) {
                            let successResult = new ResultSuccess(200, true, 'Getting Leads Generated By Users', result[0], result[0].length);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        } else {
                            let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                            console.log(successResult);
                            return res.status(200).send(successResult);
                        }
                    }
                    else {
                        let errorResult = new ResultError(200, true, 'No Data Available', [], 0);
                        next(errorResult);
                    }
                }
                else if (userResult.length == 0) {
                    let errorResult = new ResultError(200, true, 'No Data Available', [], 0);
                    next(errorResult);
                }
                else {
                    let errorResult = new ResultError(400, true, "leads.getLeadGeneratedByUserId() Error", userResult, '');
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
        let errorResult = new ResultError(500, true, 'leads.insertLeads()', error, '');
        next(errorResult);
    }
};

const getLeadAssignByPartnerId = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Leads Assign By Admin to Partner');
        var requiredFields = ["partnerId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {

                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let partnerId = req.body.partnerId;
                let sql = "CALL getLeadAssignByPartnerId('" + partnerId + "'," + startIndex + "," + fetchRecords + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Leads Generated By Users', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "leads.getLeadAssignByPartnerId() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'leads.insertLeads()', error, '');
        next(errorResult);
    }
};

const assignToPartner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let requiredFields = ['leadId', 'partnerId', 'userId', 'assignById']
        logging.info(NAMESPACE, 'Getting Leads');
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let id = req.body.partnerId ? req.body.partnerId : null

                let sql = `CALL dsaLeadAssignToPartner(` + req.body.leadId + `,` + id + `,` + req.body.userId + `,` + req.body.assignById + `)`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {

                    //#region Notification
                    let partnerFcm = "";
                    let partnerUserId = null;
                    let partnerUserIdSql = "SELECT userId FROM partners WHERE id = " + id;
                    let partnerUserIdResult = await query(partnerUserIdSql);
                    if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                        partnerUserId = partnerUserIdResult[0].userId;
                        let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserId + " ORDER BY id DESC LIMIT 1";
                        let partnerFcmResult = await query(partnerFcmSql);
                        if (partnerFcmResult && partnerFcmResult.length > 0) {
                            partnerFcm = partnerFcmResult[0].fcmToken;
                        }
                    }

                    let title = "Your Account Verified";
                    let description = "Your Account Verified";
                    var dataBody = {
                        type: 10,
                        id: req.body.leadId,
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
                                VALUES(`+ partnerUserId + `, 10, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                        let notificationResult = await query(notificationSql);
                        await notificationContainer.sendMultipleNotification([partnerFcm], 10, req.body.leadId, title, description, '', null, null, null, null, null, null);
                    }
                    //#endregion Notification

                    let successResult = new ResultSuccess(200, true, 'Lead Assign Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.getLeads() Exception', error, '');
        next(errorResult);
    }
};

const getLeadListAssignByPartnerToNetwork = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Assigned Leads By User To Network');
        var requiredFields = ["userId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = req.body.userId ? req.body.userId : null
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let sql = "CALL getLeadAssignByPartnerToNetwork('" + userId + "'," + startIndex + "," + fetchRecords + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Assigned Leads By User To Network ', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "leads.getLeadAssignByPartnerToNetwork() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'leads.getLeadAssignByPartnerToNetwork()', error, '');
        next(errorResult);
    }
};

const getAssignedLeadListOfNetwork = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Assigned Leads By User To Network');
        var requiredFields = ["partnerId"];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let partnerId = req.body.partnerId ? req.body.partnerId : null
                let startIndex = req.body.startIndex ? req.body.startIndex : 0;
                let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 10;
                let sql = "CALL getAssignedLeadsOfNetwork('" + partnerId + "'," + startIndex + "," + fetchRecords + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Getting Assigned Leads By User To Network ', result[0], result[0].length);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'No Data Available', [], 0);
                        console.log(successResult);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "leads.getAssignedLeadListOfNetwork() Error", result, '');
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
        let errorResult = new ResultError(500, true, 'leads.getAssignedLeadListOfNetwork()', error, '');
        next(errorResult);
    }
};

const deletelead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let requiredFields = ['leadId']
        logging.info(NAMESPACE, 'Getting Leads');
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let leadId = req.body.leadId ? req.body.leadId : null

                let sql = `CALL dsaDeleteLeads(` + req.body.leadId + `)`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Lead Delete Successfully', result, 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'leads.deletelead() Exception', error, '');
        next(errorResult);
    }
};

export default { insertUpdateLeads, getLeadGeneratedByUserId, getLeadGeneratedByNetworkAndTeamUsers, getLeadAssignByPartnerId, assignToPartner, getLeadListAssignByPartnerToNetwork, getAssignedLeadListOfNetwork, deletelead };