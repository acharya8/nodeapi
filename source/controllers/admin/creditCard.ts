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

let connection = mysql.createConnection({
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

const NAMESPACE = 'Credit Card';

const getCreditCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting CreditCard');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let customerId = req.body.customerId ? req.body.customerId : 0;

            let fromDate = req.body.dateFrom ? new Date(req.body.dateFrom).getFullYear().toString() + '-' + ("0" + (new Date(req.body.dateFrom).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.dateFrom).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.dateFrom).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.dateFrom).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.dateFrom).getSeconds())).slice(-2) : '';

            let toDate = req.body.dateTo ? new Date(req.body.dateTo).getFullYear().toString() + '-' + ("0" + (new Date(req.body.dateTo).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.dateTo).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.dateTo).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.dateTo).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.dateTo).getSeconds())).slice(-2) : '';
            let sql = `CALL adminGetCustomerCreditCard(` + startIndex + `,` + fetchRecord + `,` + customerId + `,'` + fromDate + `','` + toDate + `')`;
            let result = await query(sql);
            if (result && result[1].length >= 0) {
                if (result && result[1].length >= 0) {
                    let successResult = new ResultSuccess(200, true, 'Get CreditCard Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "creditCard.getCreditCard() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'customers.getCreditCard() Exception', error, '');
        next(errorResult);
    }
};

const insertUpdateCreditCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let requiredFields = ['customerId', 'birthdate', 'fullName', 'gender', 'maritalStatusId', 'panCardNo', 'employmentTypeId', 'bankId', 'bankAccountNo', 'customerAddresses', 'customerWorkAddresses']
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging.info(NAMESPACE, 'Customer');


            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let creditCardId = req.body.id ? req.body.id : 0;
                let otherCreditCardBankId = req.body.otherCreditCardBankId ? req.body.otherCreditCardBankId : 0;
                let customerUserId = req.body.userId ? req.body.userId : 0;
                let maxCreditLimit = req.body.maxCreditLimit ? req.body.maxCreditLimit : null;
                let availableCreditLimit = req.body.availableCreditLimit ? req.body.availableCreditLimit : null;
                let isAlreadyCreditCard = req.body.isAlreadyCreditCard ? req.body.isAlreadyCreditCard : false;
                let customerAddressId = req.body.customerAddressId ? req.body.customerAddressId : 0;
                let userId = authorizationResult.currentUser.id;
                let email = req.body.email ? req.body.email : '';
                let customerId = req.body.customerId;
                let birthDate = req.body.birthdate ? new Date(req.body.birthdate) : '';
                let partnerId = 0;
                let bdt = new Date(birthDate).getFullYear().toString() + '-' + ("0" + (new Date(birthDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(birthDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(birthDate).getHours())).slice(-2) + ':' + ("0" + (new Date(birthDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(birthDate).getSeconds())).slice(-2)
                let dsaCode = req.body.dsaCode ? req.body.dsaCode : null;
                if (dsaCode && !creditCardId) {
                    let dsaSql = "SELECT * FROM partners WHERE permanentCode ='" + dsaCode + "'";
                    let dsaResult = await query(dsaSql);
                    if (dsaResult && dsaResult.length > 0) {
                        partnerId = dsaResult[0].id;
                    }
                }
                let companyName = req.body.companyName ? req.body.companyName : '';
                let professionName = req.body.professionName ? req.body.professionName : '';
                let bankAccountNo = req.body.bankAccountNo ? req.body.bankAccountNo : '';
                let lastItr = req.body.lastItr ? req.body.lastItr : '';
                let educationTypeId = req.body.educationTypeId;
                let creditCardEmploymentDetailId = req.body.creditCardEmploymentDetailId ? req.body.creditCardEmploymentDetailId : 0;
                let employmentTypeId = req.body.employmentTypeId;
                let officeContactNo = req.body.officeContactNo ? req.body.officeContactNo : null;
                let addressId;
                if (!req.body.lastItr.includes("https:")) {
                    let buf = Buffer.from(lastItr, 'base64');
                    let contentType;

                    contentType = 'application/pdf'
                    let isErr = false;
                    let keyName = req.body.fullName.replace(" ", "_");
                    let params = {
                        Bucket: 'creditappcreditcardlastitr',
                        Key: keyName + "_" + customerId + "_creditcard_" + new Date().getTime(),
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
                        lastItr = data.Location
                    });
                }
                let sql = `CALL adminInsertUpdateCustomerCreditCard(` + customerId + `,` + userId + `,` + creditCardId + `,'` + req.body.fullName + `','` + bdt + `','` + req.body.gender + `','` + req.body.panCardNo + `',` + req.body.maritalStatusId + `,` + otherCreditCardBankId + `,` + maxCreditLimit + `,` + availableCreditLimit + `,` + isAlreadyCreditCard + `,'` + email + `',` + customerUserId + `,` + partnerId + `,` + creditCardEmploymentDetailId + `,` + employmentTypeId + `,'` + companyName + `','` + professionName + `',` + req.body.bankId + `,'` + bankAccountNo + `','` + lastItr + `',` + educationTypeId + `,'` + officeContactNo + `')`;
                let result = await query(sql);
                if (result) {
                    if (result.length > 0 && result[0].length > 0) {
                        creditCardId = result[0][0].creditCardId;
                        if (req.body.customerAddresses && req.body.customerAddresses.length > 0) {
                            let addressLength = req.body.customerAddresses.length;
                            for (let i = 0; i < req.body.customerAddresses.length; i++) {
                                let customerAddressId = req.body.customerAddresses[i].customerAddressId ? req.body.customerAddresses[i].customerAddressId : null;
                                let customerId = req.body.customerId ? req.body.customerId : null;
                                let addressTypeId = req.body.customerAddresses[i].addressTypeId ? req.body.customerAddresses[i].addressTypeId : null;
                                let label = req.body.customerAddresses[i].label ? req.body.customerAddresses[i].label : "";
                                let addressLine1 = req.body.customerAddresses[i].addressLine1 ? req.body.customerAddresses[i].addressLine1 : "";
                                let addressLine2 = req.body.customerAddresses[i].addressLine2 ? req.body.customerAddresses[i].addressLine2 : "";
                                let pincode = req.body.customerAddresses[i].pincode ? req.body.customerAddresses[i].pincode : "";
                                let cityId = req.body.customerAddresses[i].cityId ? req.body.customerAddresses[i].cityId : null;
                                let city = req.body.customerAddresses[i].city ? req.body.customerAddresses[i].city : "";
                                let district = req.body.customerAddresses[i].district ? req.body.customerAddresses[i].district : "";
                                let state = req.body.customerAddresses[i].state ? req.body.customerAddresses[i].state : "";
                                let customerCreditCardId = creditCardId;
                                let sql1 = `SELECT id FROM  customeraddresses WHERE customerId = ` + customerId + ` AND addressTypeId = ` + addressTypeId;
                                let result1 = await query(sql1);
                                if (result1 && result1.length > 0) {
                                    customerAddressId = result1[0].id;
                                }

                                let sql = `CALL insertUpdateCustomerCreditCardAddress(` + customerAddressId + `,` + customerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                                    ,` + cityId + `,'` + city + `','` + district + `','` + state + `',` + customerCreditCardId + `,` + userId + `)`;
                                let addressResult = await query(sql);
                                if (addressResult && addressResult.length > 0) {
                                    if (addressResult[0] && addressResult[0].length > 0) {
                                        if (addressLength == (i + 1)) {
                                            let successResult = new ResultSuccess(200, true, 'Crdit Card Address Saved', addressResult, addressResult.length);
                                            if (addressTypeId == "3") {
                                                addressId = addressResult[0][0].customerAddressId
                                            }
                                        }

                                    }

                                } else {
                                    let errorResult = new ResultError(400, true, "Credit Card  Detail Not Saved", result, '');
                                    next(errorResult);
                                }
                            }
                        }
                        let workAddressId
                        if (req.body.customerWorkAddresses) {
                            let customerAddressId = req.body.customerWorkAddresses.customerAddressId ? req.body.customerWorkAddresses.customerAddressId : null;
                            let addressTypeId = req.body.customerWorkAddresses.addressTypeId ? req.body.customerWorkAddresses.addressTypeId : null;
                            let label = req.body.customerWorkAddresses.label ? req.body.customerWorkAddresses.label : "";
                            let addressLine1 = req.body.customerWorkAddresses.addressLine1 ? req.body.customerWorkAddresses.addressLine1 : "";
                            let addressLine2 = req.body.customerWorkAddresses.addressLine2 ? req.body.customerWorkAddresses.addressLine2 : "";
                            let pincode = req.body.customerWorkAddresses.pincode ? req.body.customerWorkAddresses.pincode : "";
                            let cityId = req.body.customerWorkAddresses.cityId ? req.body.customerWorkAddresses.cityId : null;
                            let city = req.body.customerWorkAddresses.city ? req.body.customerWorkAddresses.city : "";
                            let district = req.body.customerWorkAddresses.district ? req.body.customerWorkAddresses.district : "";
                            let state = req.body.customerWorkAddresses.state ? req.body.customerWorkAddresses.state : "";
                            let workAddressSql = `CALL insertUpdateCustomerCreditCardWorkAddress(` + customerAddressId + `,` + customerId + `,` + addressTypeId + `,'` + label + `','` + addressLine1 + `','` + addressLine2 + `','` + pincode + `'
                            ,` + cityId + `,'` + city + `','` + district + `','` + state + `',` + creditCardId + `,` + userId + `)`;
                            let workAddressResult = await query(workAddressSql);
                            if (workAddressResult && workAddressResult.length > 0) {
                                if (workAddressResult[0] && workAddressResult[0].length > 0) {
                                    workAddressId = workAddressResult[0].customerAddressId
                                }
                            } else {
                                let errorResult = new ResultError(400, true, "Credit Card Customer Work Detatil Not Saved", workAddressResult, '');
                                next(errorResult);
                            }
                        }
                        let communicationAddressId = req.body.communicationAddressId ? req.body.communicationAddressId : null;

                        let modifiedDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);

                        let communicationselectioneSql = "UPDATE customercreditcards SET communicationAddressId= " + communicationAddressId + ", modifiedDate = '" + modifiedDate + "' WHERE id=" + creditCardId;
                        let communicationselectioneResult = await query(communicationselectioneSql);
                        if (communicationselectioneResult && communicationselectioneResult.affectedRows >= 0) {

                            let statusSql = `SELECT creditcardstatuses.status FROM customercreditcardstatushistory INNER JOIN creditcardstatuses ON creditcardstatuses.id = customercreditcardstatushistory.creditcardStatusId WHERE customerCreditCardId=` + creditCardId + ` ORDER BY customercreditcardstatushistory.id DESC LIMIT 1`
                            let statusResult = await query(statusSql);
                            let objResult;
                            if (statusResult && statusResult.length > 0) {
                                objResult = {
                                    "loanStatusName": statusResult[0].status,
                                    "creditCardId": creditCardId,
                                };
                            } else {
                                let loanStatusId;
                                let pendingSeatus = await query("SELECT id FROM creditcardstatuses WHERE status = 'PENDING'");
                                if (pendingSeatus && pendingSeatus.length > 0) {
                                    loanStatusId = pendingSeatus[0].id;
                                    let statusSql = "INSERT INTO customercreditcardstatushistory(customerCreditCardId,creditcardStatusId,createdBy,modifiedBy) VALUES(" + creditCardId + "," + loanStatusId + "," + userId + "," + userId + ")";
                                    let statusResult = await query(statusSql);
                                    let transactionDate = new Date().getFullYear().toString() + '-' + ("0" + (new Date().getMonth() + 1)).slice(-2) + '-' + ("0" + new Date().getDate()).slice(-2) + ' ' + ("0" + (new Date().getHours())).slice(-2) + ':' + ("0" + (new Date().getMinutes())).slice(-2) + ':' + ("0" + (new Date().getSeconds())).slice(-2);
                                    let chageStatusSql = "UPDATE customercreditcards SET statusId = " + loanStatusId + ", creditCardTransactionDate = '" + transactionDate + "' WHERE id = ?";
                                    let chageStatusResult = await query(chageStatusSql, creditCardId);

                                    let loancompleteSql = "UPDATE creditcardcompletescreenhistory SET isCompleted=true WHERE customerCreditCardId=" + creditCardId;
                                    let loanCompleteResult = await query(loancompleteSql);
                                    objResult = {
                                        "loanStatusName": "PENDING",
                                        "creditCardId": creditCardId
                                    };
                                }
                            }
                            let successResult = new ResultSuccess(200, true, 'Credit Card communication address changed', objResult, 1);
                            return res.status(200).send(successResult);
                        }
                        else {
                            let errorResult = new ResultError(400, true, "creditCards.chooseCommunicationAddress() Error", new Error('Error While Updating Data'), '');
                            next(errorResult);
                        }
                    }
                }
                else {
                    let errorResult = new ResultError(400, true, "Credit Card  Detail Not Saved", result, '');
                    next(errorResult);
                }
            }

            else {
                let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'customer.insertCustomer()', error, '');
        next(errorResult);
    }
}

const getCreditCardById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting CreditCard');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let customerId = await query("select customerId from customercreditcards WHERE id = ?", req.body.customerCreditCardId);
            let sql = `CALL adminGetCustomerCreditCardById(` + customerId[0].customerId + `,` + req.body.customerCreditCardId + `)`;
            let result = await query(sql);
            if (result && result[0].length > 0) {
                let cusotmerCreditCard = result[0][0];
                cusotmerCreditCard.employmentDetail = result[1] && result[1].length > 0 ? result[1][0] : [];
                cusotmerCreditCard.correspondenceAddressDetail = result[2] && result[2].length > 0 ? result[2][0] : null;
                cusotmerCreditCard.workAddressDetail = result[3] && result[3].length > 0 ? result[3][0] : null;
                cusotmerCreditCard.completeScreeen = result[4] && result[4].length > 0 ? result[4] : null;
                cusotmerCreditCard.creditCardStatusHistory = result[5] && result[5].length > 0 ? result[5] : null;
                cusotmerCreditCard.creditCardOffer = result[6] && result[6].length > 0 ? result[6][0] : null;
                cusotmerCreditCard.customerDetail = result[7] && result[7].length > 0 ? result[7][0] : null;
                cusotmerCreditCard.rejectionReason = result[8] && result[8].length > 0 ? result[8][0] : null;
                if (cusotmerCreditCard.rejectionReason) {
                    cusotmerCreditCard.reasons = cusotmerCreditCard.rejectionReason && result[9] && result[9].length > 0 ? result[9] : null;
                    cusotmerCreditCard.rejectionReason.reasons = cusotmerCreditCard.reasons
                }
                let successResult = new ResultSuccess(200, true, 'Get CreditCard Successfully', cusotmerCreditCard, 1);
                return res.status(200).send(successResult);
            } else {
                let errorResult = new ResultError(400, true, "creditCard.getCreditCard() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'creditcard.getCreditCard() Exception', error, '');
        next(errorResult);
    }
};

const insertUpdateCustomerCreditCardOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert/Update Customer Credit Card Offer');
        let requiredFields = ["customerCreditCardId", "bankCreditCardId"];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let userId = authorizationResult.currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                let customerCreditCardId = req.body.customerCreditCardId;
                let bankCreditCardId = req.body.bankCreditCardId;
                let referenceNo = "";
                if (!req.body.referenceNo) {
                    let refSql = "SELECT * FROM customercreditcardoffer ORDER BY id DESC;"
                    let refResult = await query(refSql);
                    if (refResult && refResult.length > 0) {
                        let no = parseInt(refResult.referenceNo.split("_")[1])
                        referenceNo = "CREF_" + (no + 1).toString().padStart(10, "0");
                    } else {
                        referenceNo = "CREF_0000000001";
                    }
                }
                let idSql = await query(`SELECT id FROM customercreditcardoffer WHERE customerCreditCardId = ?`, customerCreditCardId);
                if (idSql && idSql.length > 0) {
                    id = idSql[0].id
                }
                console.log(idSql);

                console.log(id);

                let sql = "CALL customerInsertUpdateCustomerCreditCardOffer(" + id + "," + customerCreditCardId + "," + bankCreditCardId + ",'" + referenceNo + "'," + userId + ")";
                let result = await query(sql);
                if (result && result.length > 0) {
                    if (result[0] && result[0].length > 0) {
                        let successResult = new ResultSuccess(200, true, 'Credit Card Customer Offer Saved', result[0], 1);
                        return res.status(200).send(successResult);
                    } else {
                        let successResult = new ResultSuccess(200, true, 'Credit Card Customer Offer Saved', result, 1);
                        return res.status(200).send(successResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "Credit Card Customer Offer Not Saved", result, '');
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
        let errorResult = new ResultError(500, true, 'creditCard.insertUpdateCustomerCreditCardOffer()', error, '');
        next(errorResult);
    }
};

const changeCreditCardOfferStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Change Credit Card Offer Status');
        let requiredFields = ['customerCreditCardId', 'creditCardStatusId'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerCreditCardId = req.body.customerCreditCardId;
                let creditCardStatusId = req.body.creditCardStatusId;
                let insertStatusHistorySql = "INSERT INTO customercreditcardstatushistory(customerCreditCardId, creditCardStatusId, createdBy, modifiedBy) VALUES(" + customerCreditCardId + "," + creditCardStatusId + "," + authorizationResult.currentUser.id + "," + authorizationResult.currentUser.id + ")";
                let insertStatusHistoryResutlt = await query(insertStatusHistorySql);
                if (insertStatusHistoryResutlt && insertStatusHistoryResutlt.affectedRows > 0) {
                    let updateSql = "UPDATE customercreditcards SET statusId = " + creditCardStatusId + " WHERE id = " + customerCreditCardId;
                    let updateResutlt = await query(updateSql);
                    if (updateResutlt && updateResutlt.affectedRows > 0) {

                        //#region Notification
                        let customerFcm = "";
                        let customerUserId = null;
                        let partnerFcm = "";
                        let partnerUserId = null;
                        let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customercreditcards WHERE id = " + customerCreditCardId + ")";
                        let customerUserIdResult = await query(customerUserIdSql);
                        if (customerUserIdResult && customerUserIdResult.length > 0) {
                            customerUserId = customerUserIdResult[0].userId;
                            let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let customerFcmResult = await query(customerFcmSql);
                            if (customerFcmResult && customerFcmResult.length > 0) {
                                customerFcm = customerFcmResult[0].fcmToken;
                            }
                        }
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnercustomercreditcards WHERE customerCreditCardId = " + customerCreditCardId + ")";
                        let partnerUserIdResult = await query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = await query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }
                        let status = await query(`SELECT status FROM creditcardstatuses WHERE id = ?`, creditCardStatusId)
                        let title = "CreditCard Status Change to " + status[0].status + "";
                        let description = "CreditCard Status Change to " + status[0].status + "";
                        let creditCardStatus = await query(`SELECT creditcardstatuses.status FROM creditcardstatuses INNER JOIN customercreditcards ON customercreditcards.statusId = creditcardstatuses.id WHERE creditcardstatuses.id = ?`, creditCardStatusId)
                        let dataBody = {
                            type: 7,
                            id: customerCreditCardId,
                            title: title,
                            message: description,
                            json: null,
                            dateTime: null,
                            customerLoanId: null,
                            loanType: null,
                            creditCardId: customerCreditCardId,
                            creditCardStatus: creditCardStatus[0].status
                        }
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ customerUserId + `, 7, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([customerFcm], 7, customerCreditCardId, title, description, '', null, null, null, null, customerCreditCardId, creditCardStatus[0].status);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                        VALUES(`+ partnerUserId + `, 7, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([partnerFcm], 7, customerCreditCardId, title, description, '', null, null, null, null, customerCreditCardId, creditCardStatus[0].status);
                        }
                        //#endregion Notification

                        let successResult = new ResultSuccess(200, true, 'Customer Credit Card Offer Status Change', insertStatusHistoryResutlt, 1);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "creditCards.changeCreditCardOfferStatus() Error", new Error('Error While Change Status'), '');
                        next(errorResult);
                    }
                } else {
                    let errorResult = new ResultError(400, true, "creditCards.changeCreditCardOfferStatus() Error", new Error('Error While Change Status'), '');
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
        let errorResult = new ResultError(500, true, 'creditCards.changeCreditCardOfferStatus()', error, '');
        next(errorResult);
    }
}

const inserUpdaterejectCreditCardOffer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Customer Credit Card Reject');
        let requiredFields = ['customerCreditCardId', 'reason'];
        let validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let customerCreditCardId = req.body.customerCreditCardId;
                let creditCardStatusId = req.body.creditCardStatusId;
                let reason = req.body.reason ? req.body.reason : "";
                let id = req.body.id ? req.body.id : 0;
                if (id) {
                    let updateStatusHistorySql = "UPDATE customercreditcardrejectionreason SET reason='" + reason + "' WHERE id = " + id;
                    let updateStatusHistoryResult = await query(updateStatusHistorySql);
                    if (updateStatusHistoryResult && updateStatusHistoryResult.affectedRows > 0) {
                        if (req.body.reasons && req.body.reasons.length > 0) {
                            let deleteQuery = await query("DELETE FROM reasons WHERE customerCreditCardId = ?", customerCreditCardId);

                            for (let i = 0; i < req.body.reasons.length; i++) {
                                let insertQuery = `INSERT INTO reasons (customerCreditCardId, reason, description, createdBy, modifiedBy) VALUES (` + customerCreditCardId + `,'` + req.body.reasons[i].reason + `','` + req.body.reasons[i].description + `',` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`;
                                let reasonResult = await query(insertQuery);
                            }
                        }

                        //#region Notification
                        let customerFcm = "";
                        let customerUserId = null;
                        let partnerFcm = "";
                        let partnerUserId = null;
                        let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customercreditcards WHERE id = " + customerCreditCardId + ")";
                        let customerUserIdResult = await query(customerUserIdSql);
                        if (customerUserIdResult && customerUserIdResult.length > 0) {
                            customerUserId = customerUserIdResult[0].userId;
                            let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let customerFcmResult = await query(customerFcmSql);
                            if (customerFcmResult && customerFcmResult.length > 0) {
                                customerFcm = customerFcmResult[0].fcmToken;
                            }
                        }
                        let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnercustomercreditcards WHERE customerCreditCardId = " + customerCreditCardId + ")";
                        let partnerUserIdResult = await query(partnerUserIdSql);
                        if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                            partnerUserId = partnerUserIdResult[0].userId;
                            let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                            let partnerFcmResult = await query(partnerFcmSql);
                            if (partnerFcmResult && partnerFcmResult.length > 0) {
                                partnerFcm = partnerFcmResult[0].fcmToken;
                            }
                        }
                        let title = "CreditCard Request Reject";
                        let description = "CreditCard Request Reject";
                        let dataBody = {
                            type: 7,
                            id: customerCreditCardId,
                            title: title,
                            message: description,
                            json: null,
                            dateTime: null,
                            customerLoanId: null,
                            loanType: null,
                            creditCardId: customerCreditCardId,
                            creditCardStatus: null

                        }
                        if (customerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                            VALUES(`+ customerUserId + `, 8, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([customerFcm], 8, customerCreditCardId, title, description, '', null, null, null, null, customerCreditCardId, null);
                        }
                        if (partnerFcm) {
                            let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                            VALUES(`+ partnerUserId + `, 8, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                            let notificationResult = await query(notificationSql);
                            await notificationContainer.sendMultipleNotification([partnerFcm], 8, customerCreditCardId, title, description, '', null, null, null, null, customerCreditCardId, null);
                        }
                        //#endregion Notification


                        let successResult = new ResultSuccess(200, true, 'Customer Credit Card Offer Status Change', updateStatusHistoryResult, 1);
                        return res.status(200).send(successResult);
                    } else {
                        let errorResult = new ResultError(400, true, "creditCards.inserUpdaterejectCreditCardOffer() Error", new Error('Error While Change Status'), '');
                        next(errorResult);
                    }
                }
                else {
                    let insertStatusHistorySql = "INSERT INTO customercreditcardstatushistory(customerCreditCardId, creditCardStatusId, createdBy, modifiedBy) VALUES(" + customerCreditCardId + "," + 5 + "," + authorizationResult.currentUser.id + "," + authorizationResult.currentUser.id + ")";
                    let insertStatusHistoryResutlt = await query(insertStatusHistorySql);
                    if (insertStatusHistoryResutlt && insertStatusHistoryResutlt.affectedRows > 0) {
                        let updateSql = "UPDATE customercreditcards SET statusId = " + 5 + " WHERE id = " + customerCreditCardId;
                        let updateResutlt = await query(updateSql);
                        if (updateResutlt && updateResutlt.affectedRows > 0) {
                            let sql = `INSERT INTO customercreditcardrejectionreason(customerCreditCardId, reason, createdBy, modifiedBy) VALUES(` + customerCreditCardId + `,'` + reason + `',` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `);`
                            let rejectionResult = await query(sql);
                            if (rejectionResult && rejectionResult.affectedRows > 0) {
                                if (req.body.reasons && req.body.reasons.length > 0) {
                                    let deleteQuery = await query("DELETE FROM reasons WHERE customerCreditCardId = ?", customerCreditCardId);
                                    for (let i = 0; i < req.body.reasons.length; i++) {
                                        let insertQuery = `INSERT INTO reasons (customerCreditCardId, reason, description, createdBy, modifiedBy) VALUES (` + customerCreditCardId + `,'` + req.body.reasons[i].reason + `','` + req.body.reasons[i].description + `',` + authorizationResult.currentUser.id + `,` + authorizationResult.currentUser.id + `)`;
                                        let reasonResult = await query(insertQuery);
                                    }
                                }

                                //#region Notification
                                let customerFcm = "";
                                let customerUserId = null;
                                let partnerFcm = "";
                                let partnerUserId = null;
                                let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customercreditcards WHERE id = " + customerCreditCardId + ")";
                                let customerUserIdResult = await query(customerUserIdSql);
                                if (customerUserIdResult && customerUserIdResult.length > 0) {
                                    customerUserId = customerUserIdResult[0].userId;
                                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + customerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                    let customerFcmResult = await query(customerFcmSql);
                                    if (customerFcmResult && customerFcmResult.length > 0) {
                                        customerFcm = customerFcmResult[0].fcmToken;
                                    }
                                }
                                let partnerUserIdSql = "SELECT userId FROM partners WHERE id = (SELECT partnerId FROM partnercustomercreditcards WHERE customerCreditCardId = " + customerCreditCardId + ")";
                                let partnerUserIdResult = await query(partnerUserIdSql);
                                if (partnerUserIdResult && partnerUserIdResult.length > 0) {
                                    partnerUserId = partnerUserIdResult[0].userId;
                                    let partnerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + partnerUserIdResult[0].userId + " ORDER BY id DESC LIMIT 1";
                                    let partnerFcmResult = await query(partnerFcmSql);
                                    if (partnerFcmResult && partnerFcmResult.length > 0) {
                                        partnerFcm = partnerFcmResult[0].fcmToken;
                                    }
                                }
                                let title = "CreditCard Request Reject";
                                let description = "CreditCard Request Reject";
                                let dataBody = {
                                    type: 7,
                                    id: customerCreditCardId,
                                    title: title,
                                    message: description,
                                    json: null,
                                    dateTime: null,
                                    customerLoanId: null,
                                    loanType: null,
                                    creditCardId: customerCreditCardId,
                                    creditCardStatus: null
                                }
                                if (customerFcm) {
                                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                    VALUES(`+ customerUserId + `, 8, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                    let notificationResult = await query(notificationSql);
                                    await notificationContainer.sendMultipleNotification([customerFcm], 8, customerCreditCardId, title, description, '', null, null, null, null, customerCreditCardId, null);
                                }
                                if (partnerFcm) {
                                    let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                    VALUES(`+ partnerUserId + `, 8, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + authorizationResult.currentUser.id + `, ` + authorizationResult.currentUser.id + `)`
                                    let notificationResult = await query(notificationSql);
                                    await notificationContainer.sendMultipleNotification([partnerFcm], 8, customerCreditCardId, title, description, '', null, null, null, null, customerCreditCardId, null);
                                }
                                //#endregion Notification
                            }
                            let successResult = new ResultSuccess(200, true, 'Customer Credit Card Offer Status Change', insertStatusHistoryResutlt, 1);
                            return res.status(200).send(successResult);
                        } else {
                            let errorResult = new ResultError(400, true, "creditCards.inserUpdaterejectCreditCardOffer() Error", new Error('Error While Change Status'), '');
                            next(errorResult);
                        }
                    } else {
                        let errorResult = new ResultError(400, true, "creditCards.inserUpdaterejectCreditCardOffer() Error", new Error('Error While Change Status'), '');
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
        let errorResult = new ResultError(500, true, 'creditCards.inserUpdaterejectCreditCardOffer()', error, '');
        next(errorResult);
    }
}

const getCreditCardStatuses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Credit Card Statuses');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let sql = `CALL adminGetCreditCardStatuses()`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[0] && result[0].length > 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Credit Card Status Successfully', result[0], result[0].length);
                    return res.status(200).send(successResult);
                } else if (result[0] && result[0].length == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Credit Card Status Successfully', [], result[0].length);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "creditCard.getCreditCardStatuses() Error", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'creditCard.getCreditCardStatuses() Exception', error, '');
        next(errorResult);
    }
};



export default { getCreditCard, insertUpdateCreditCard, getCreditCardById, insertUpdateCustomerCreditCardOffer, changeCreditCardOfferStatus, inserUpdaterejectCreditCardOffer, getCreditCardStatuses };