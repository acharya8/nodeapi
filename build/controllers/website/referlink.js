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
const notifications_1 = __importDefault(require("./../notifications"));
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
const NAMESPACE = 'Refer Link';
const validateReferLink = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Validate Refer Link');
        var requiredFields = ["linkKey"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let linkKey = req.body.linkKey;
            let sql = "CALL validateReferLink('" + linkKey + "')";
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[0].length > 0) {
                    //#region Notification Sample
                    //let registerToken = "f78HORuvTC6gpCX9R_HS5H:APA91bEKQgDuo3Ox0-Wbro4VUx1XYGERHYiEwUX_LHJr5nRq-nDtdDg8272HNzbjEk1DQRZ-FgTn4L1FzfkutA3oH0eBqxMubgXUJygdlefhQAIG2dlIzJ8R-nWsL4g8MCM299srYxuG";
                    // admin.messaging().sendToDevice(registerToken, payload, notification_options)
                    //     .then(response => {
                    //         debugger;
                    //     });
                    //#endregion Notification Sample
                    //Dynammic Notification With Body and Multiple devices
                    // await sendMultipleNotification(
                    //     localfcms,
                    //     body.id,
                    //     result1[0].title,
                    //     result1[0].desciption,
                    //     '',
                    //     null,
                    //     imageUrl
                    // )
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Validate Refer Link', result[0], 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Refer Link Is Not Valid', [], 1);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "Refer Link is not valid", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'referLink.validateReferLink() Exception', error, '');
        next(errorResult);
    }
});
const insertReferCustomer = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Refer Customers');
        var requiredFields = ["contactNo", "fullName", "panCardNo", "pincode", "cityId", "city", "district", "state", "referenceUserId", "referLinkId"];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let checkUserSql = "SELECT * FROM users WHERE contactNo = '" + req.body.contactNo + "'";
            let checkUserResult = yield query(checkUserSql);
            if (checkUserResult && checkUserResult.length > 0) {
                let errorResult = new resulterror_1.ResultError(400, true, "referLink.insertReferCustomer() Error", new Error('Contact no already used'), '');
                next(errorResult);
            }
            else {
                let referCoin = 0;
                let registerCoin = 0;
                let referCoinRewardTypeId = 1;
                let registerCoinRewardTypeId = 2;
                let referCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 1";
                let referCoinResult = yield query(referCoinSql);
                if (referCoinResult && referCoinResult.length > 0) {
                    console.log(referCoinResult[0].rewardCoin);
                    referCoin = referCoinResult[0].rewardCoin;
                }
                let registerCoinSql = "SELECT * FROM rewardcoin WHERE rewardTypeId = 2";
                let registerCoinResult = yield query(registerCoinSql);
                if (registerCoinResult && registerCoinResult.length > 0) {
                    console.log(registerCoinResult[0].rewardCoin);
                    registerCoin = registerCoinResult[0].rewardCoin;
                }
                let contactNo = req.body.contactNo;
                let countryCode = req.body.countryCode ? req.body.countryCode : '+91';
                let email = req.body.email ? req.body.email : '';
                let temporaryCode = "";
                let lastTempCodeSql = "CALL websiteGetLastCustomer()";
                let lastTempCodeResult = yield query(lastTempCodeSql);
                console.log(lastTempCodeResult);
                if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0] && lastTempCodeResult[0].length > 0) {
                    let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split("_")[1]);
                    temporaryCode = "CT_" + (no + 1).toString().padStart(10, "0");
                }
                else {
                    temporaryCode = "CT_0000000001";
                }
                let fullName = req.body.fullName;
                let panCardNo = req.body.panCardNo;
                let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
                let label = req.body.label ? req.body.label : null;
                let addressLine1 = req.body.addressLine1 ? req.body.addressLine1 : "";
                let addressLine2 = req.body.addressLine2 ? req.body.addressLine2 : "";
                let pincode = req.body.pincode;
                let cityId = req.body.cityId;
                let city = req.body.city;
                let district = req.body.district;
                let state = req.body.state;
                let referenceUserId = req.body.referenceUserId;
                let referLinkId = req.body.referLinkId;
                console.log("insert");
                let sql = `CALL webInsertReferCustomer('` + countryCode + `','` + contactNo + `','` + email + `', '` + temporaryCode + `','` + fullName + `','` + panCardNo + `',` + addressTypeId + `,'` + label + `'
            ,'` + addressLine1 + `','` + addressLine2 + `','` + pincode + `',` + cityId + `,'` + city + `','` + district + `','` + state + `',` + referenceUserId + `,` + referCoin + `,` + registerCoin + `,` + referLinkId + `,` + referCoinRewardTypeId + `,` + registerCoinRewardTypeId + `)`;
                let result = yield query(sql);
                if (result && result[1].affectedRows >= 0) {
                    //#region Notification
                    let customerFcm = "";
                    let customerUserId = null;
                    // let customerUserIdSql = "SELECT userId FROM customers WHERE id = (SELECT customerId FROM customerloans WHERE id = " + req.body.customerLoanId + ")";
                    // let customerUserIdResult = await query(customerUserIdSql);
                    // if (customerUserIdResult && customerUserIdResult.length > 0) {
                    customerUserId = referenceUserId;
                    let customerFcmSql = "SELECT fcmToken FROM userdevicedetail WHERE userId = " + referenceUserId + " ORDER BY id DESC LIMIT 1";
                    let customerFcmResult = yield query(customerFcmSql);
                    if (customerFcmResult && customerFcmResult.length > 0) {
                        customerFcm = customerFcmResult[0].fcmToken;
                    }
                    //}
                    let title = req.body.fullName + " register via your reference link";
                    let description = req.body.fullName + " register via your reference link";
                    var dataBody = {
                        type: 14,
                        id: null,
                        title: title,
                        message: description,
                        json: null,
                        dateTime: null,
                        customerLoanId: null,
                        loanType: null,
                        creditCardId: null,
                        creditCardStatus: null
                    };
                    console.log('result', result);
                    if (customerFcm) {
                        let notificationSql = `INSERT INTO usersnotification(userId, notificationType, title, message, bodyJson, imgUrl, createdBy, modifiedBy) 
                                        VALUES(` + customerUserId + `, 14, '` + title + `', '` + description + `', '` + JSON.stringify(dataBody) + `', null, ` + result[0][0].userId + `, ` + result[0][0].userId + `)`;
                        let notificationResult = yield query(notificationSql);
                        yield notifications_1.default.sendMultipleNotification([customerFcm], 14, null, title, description, '', null, null, null, null, null, null);
                    }
                    //#endregion Notification
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Validate Refer Link', result[1], 1);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, "referLink.insertReferCustomer() Error", new Error('Error While Inserting Data'), '');
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
        let errorResult = new resulterror_1.ResultError(500, true, 'referLink.insertReferCustomer() Exception', error, '');
        next(errorResult);
    }
});
// const sendMultipleNotification= async (fcmTokens, id, title, message, json, dateTime, ImageUrl) => {
//     var result = null;
//     // var ImageUrl2;
//     // if(ImageUrl == null)
//     // {
//     //     ImageUrl2 = null;
//     // }
//     // else
//     // {
//     //     ImageUrl2 = ImageUrl;
//     // }
//     try {
//         var dataBody = {
//             id: id,
//             title: title,
//             message: message,
//             json: json,
//             dateTime: dateTime,
//         }
//         const messaging = admin.messaging();
//         var payload = {
//             notification: {
//                 title: title,
//                 body: message,
//                 //  imageUrl: 'https://picsum.photos/id/237/200/300'
//                 imageUrl: ImageUrl,
//             },
//             data: {
//                 click_action: "FLUTTER_NOTIFICATION_CLICK",
//                 body: JSON.stringify(dataBody),
//             },
//             android: {
//                 priority: 'high',
//             },
//             tokens: fcmTokens,
//         };
//         result = await messaging.sendMulticast(payload);
//     }
//     catch (e) {
//         console.log(e);
//         result = e;
//     }
//     return null;
// };
exports.default = { validateReferLink, insertReferCustomer };
