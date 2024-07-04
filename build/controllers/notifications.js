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
Object.defineProperty(exports, "__esModule", { value: true });
//#region Notification Code
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};
var admin = require("firebase-admin");
var serviceAccount = require("../../credit-app-9be53-firebase-adminsdk-dbci3-1141581325");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
// //Sample
// const payload={
//     notification:{
//         title:"Nottification Title",
//         body:"Notification Body"
//     },
//     data:{
//         data1:"dat1 Value"
//     }
// }
//#endregion Notification Code
//How To call This Function for send Notification
// await sendMultipleNotification(localfcms, body.id, result1[0].title, result1[0].desciption, '', null, imageUrl)
const sendMultipleNotification = (fcmTokens, type, id, title, message, json, dateTime, ImageUrl, customerLoanId, loanType, creditCardId, creditCardStatus) => __awaiter(void 0, void 0, void 0, function* () {
    var result = null;
    try {
        var dataBody = {
            type: type,
            id: id,
            title: title,
            message: message,
            json: json,
            dateTime: dateTime,
            customerLoanId: customerLoanId,
            loanType: loanType,
            creditCardId: creditCardId,
            creditCardStatus: creditCardStatus
        };
        const messaging = admin.messaging();
        var payload = {
            notification: ImageUrl ? {
                title: title,
                body: message,
                //  imageUrl: 'https://picsum.photos/id/237/200/300'
                imageUrl: ImageUrl,
            } : {
                title: title,
                body: message
            },
            data: {
                click_action: "FLUTTER_NOTIFICATION_CLICK",
                body: JSON.stringify(dataBody),
            },
            android: {
                priority: 'high',
            },
            tokens: fcmTokens,
        };
        result = yield messaging.sendMulticast(payload);
    }
    catch (e) {
        console.log(e);
        result = e;
    }
    return null;
});
exports.default = { sendMultipleNotification };
