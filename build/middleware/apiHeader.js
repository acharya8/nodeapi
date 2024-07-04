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
const config_1 = __importDefault(require("../config/config"));
const logging_1 = __importDefault(require("../config/logging"));
const typescript_pluralize_1 = __importDefault(require("typescript-pluralize"));
const users_1 = require("../classes/output/header/users");
const mysql = require('mysql');
const util = require('util');
//import { Connect, Query } from '../config/msql';
const NAMESPACE = 'API Header';
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
const validateAuthorization = (request, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //, requiredFields
    logging_1.default.info(NAMESPACE, 'Validating Request Body');
    var keys = Object.keys(request.body);
    let index = 0;
    var message = '';
    let currentUser;
    var currentUserDevice = {
        app: null,
        appVersion: "",
        fcmToken: "",
        deviceId: "",
        deviceLocation: "",
        deviceManufacturer: "",
        deviceModel: "",
        apiCallTime: null
    };
    var authorization = '';
    var requestUrl = request.originalUrl;
    console.log('Request URL:' + requestUrl);
    var statusCode = 200;
    if (request.headers['authorization'] != undefined && request.headers['authorization'] != '') {
        try {
            if (request.headers['deviceinfo'] != undefined && request.headers['deviceinfo'] != '') {
                currentUserDevice = JSON.parse(request.headers['deviceinfo']);
            }
            var authorizationHeader = request.headers['authorization'];
            if (authorizationHeader.indexOf('|') > 0) {
                currentUserDevice.app = authorizationHeader.split('|')[0];
                authorization = authorizationHeader.split('|')[1];
            }
            else {
                currentUserDevice.app = authorizationHeader;
                authorization = authorizationHeader;
            }
            currentUserDevice.apiCallTime = new Date().toISOString();
            console.log(JSON.stringify(currentUserDevice));
            if (config_1.default.baseRequests.indexOf(requestUrl) == -1) {
                try {
                    if (authorization != '') {
                        console.log('Checking Token');
                        //need to create 1 api for validate session Token
                        let sql = `SELECT users.* FROM users INNER JOIN usersessions ON users.id = usersessions.userId WHERE usersessions.sessionToken ='` +
                            authorization +
                            `' AND usersessions.expireAt > CURDATE()`;
                        var queryResult = yield query(sql);
                        if (queryResult && queryResult.length > 0) {
                            let roleSql = `SELECT roleId,roles.name as roleName FROM userroles INNER JOIN roles  ON  roles.id = userroles.roleId WHERE userId =` + queryResult[0].id;
                            let roleResult = yield query(roleSql);
                            var roles = {
                                id: roleResult[0].roleId,
                                name: roleResult[0].roleName
                            };
                            let data = new users_1.Users(queryResult[0].id, queryResult[0].fullName, queryResult[0].gender, queryResult[0].email, queryResult[0].contactNo, queryResult[0].password, queryResult[0].profilePicUrl, queryResult[0].isBlock, queryResult[0].isPasswordSet, queryResult[0].isEmailVerified, queryResult[0].isDisabled, queryResult[0].isActive, authorization, roles.id, roles);
                            currentUser = data;
                            // console.log('currentUser:' + JSON.stringify(currentUser));
                        }
                        else {
                            statusCode = 400;
                            message = "UnAuthorize";
                        }
                        // Connect()
                        //     .then((connection) => {
                        //         Query(connection, query)
                        //             .then((results) => {
                        //                 logging.info(NAMESPACE, 'Retrieved books: ', results);
                        //                 //  return res.status(200).json({
                        //                 //      results
                        //                 //  });
                        //                 if (results[0]) {
                        //                 }
                        //             })
                        //             .catch((error) => {
                        //                 logging.error(NAMESPACE, error.message, error);
                        //                 return res.status(200).json({
                        //                     message: error.message,
                        //                     error
                        //                 });
                        //             })
                        //             .finally(() => {
                        //                 logging.info(NAMESPACE, 'Closing connection.');
                        //                 connection.end();
                        //             });
                        //     })
                        //     .catch((error) => {
                        //         logging.error(NAMESPACE, error.message, error);
                        //         return res.status(200).json({
                        //             message: error.message,
                        //             error
                        //         });
                        //     });
                        // let result = await dbHelper.validateSession(authorization);
                        // console.log('auth' + result);
                        // currentUser = result;
                        // Parse.User.enableUnsafeCurrentUser();
                        // var result = await Parse.User.become(authorization);
                        // if (result.message != undefined) {
                        //     message = result.message;
                        // } else {
                        //     await result.fetchWithInclude("role");
                        //     var allowedAPIs = result.attributes.role.attributes.allowedAPIs;
                        //     if (allowedAPIs.indexOf(request.originalUrl) > -1 && (((currentUserDevice.app == config.appCodes.businessUserApp || currentUserDevice.app == config.appCodes.businessUserWeb) && config.businessUserAppRequests.indexOf(request.originalUrl) > -1) || (currentUserDevice.app == config.appCodes.customerUserApp && config.customerUserAppRequests.indexOf(request.originalUrl) > -1))) {
                        //         currentUser = result;
                        //     } else {
                        //         statusCode = 401;
                        //         message = "Unauthorized request";
                        //     }
                        // }
                    }
                    else {
                        statusCode = 300;
                        message = 'Authorization header is required.';
                    }
                }
                catch (error) {
                    statusCode = error.code;
                    message = error.message;
                }
            }
        }
        catch (error) {
            statusCode = 500;
            message = error.message;
            console.log(message);
        }
    }
    else {
        statusCode = 401;
        message = 'Unauthorized request';
    }
    let resultObj = {
        statusCode: statusCode,
        message: message,
        currentUser: currentUser,
        currentUserDevice: currentUserDevice,
        validate: message != '' ? false : true
    };
    if (statusCode == 200) {
        return resultObj;
    }
    else {
        return resultObj;
    }
});
const parseFieldValue = (field, value) => {
    if (field.endsWith('Date')) {
        value = new Date(new Date(value).getFullYear(), new Date(value).getMonth(), new Date(value).getDate());
    }
    else if (['skip', 'limit'].includes(field) || field.endsWith('Number') || field.endsWith('Days') || field.endsWith('Range')) {
        if (value.indexOf(',') > 0) {
            value = value.split(',');
            value.forEach((v, index) => {
                value[index] = Number(v);
            });
        }
        else {
            value = Number(value);
        }
    }
    else if (field.startsWith('is') && !field.startsWith('iso')) {
        value = JSON.parse(value);
    }
    else if (value.indexOf(',') > 0) {
        value = value.split(',');
    }
    return value;
};
const validateField = (request, field) => {
    var message = '';
    var keys = Object.keys(request.body);
    var optionalField = false;
    if (field.indexOf('[') == 0) {
        optionalField = true;
        field = field.substring(1, field.length - 1);
    }
    if (field.indexOf('=') > -1) {
        var fieldValue = field.split('=')[1];
        field = field.split('=')[0];
        fieldValue = parseFieldValue(field, fieldValue);
        var reqFieldValue = request.body[field];
        if (Array.isArray(fieldValue)) {
            if (reqFieldValue != undefined) {
                if (!fieldValue.includes(reqFieldValue)) {
                    message += ', ' + field + ' value must be any of (' + fieldValue.join(', ') + ')';
                }
            }
            else {
                if (!optionalField) {
                    message += ', ' + field + ' value must be any of (' + fieldValue.join(', ') + ')';
                }
            }
        }
        else if (fieldValue != reqFieldValue) {
            message += ', ' + field + ' value must be ' + fieldValue;
        }
    }
    else {
        if (field.indexOf('[') == -1) {
            if (!keys.includes(field)) {
                message += ', ' + field + ' is required';
            }
            if (request.body[field] == null) {
                message += ', ' + field + ' value must required';
            }
        }
    }
    return message;
};
const validateRequiredFields = (request, requiredFields) => {
    var keys = Object.keys(request.body);
    let index = 0;
    var message = '';
    var statusCode = 200;
    if (requiredFields != '' && requiredFields != undefined) {
        requiredFields.some((field) => {
            if (field.indexOf(':') > -1) {
                var childFieldFormat = field.split(':')[0];
                var childField = '';
                var childFieldValue = '';
                if (childFieldFormat.indexOf('=') > -1) {
                    childFieldValue = field.split('=')[1];
                    childField = childFieldFormat.split('=')[0];
                    childFieldValue = parseFieldValue(childField, childFieldValue);
                }
                else {
                    childField = childFieldFormat;
                }
                var parentField = field.split(':')[1];
                if (parentField.indexOf('=') > -1) {
                    var parentFieldValue = parentField.split('=')[1];
                    parentField = parentField.split('=')[0];
                    parentFieldValue = parseFieldValue(parentField, parentFieldValue);
                    var parentReqFieldValue = request.body[parentField];
                    if (Array.isArray(parentFieldValue)) {
                        if (parentFieldValue.includes(parentReqFieldValue)) {
                            if (!keys.includes(childField)) {
                                message += ', ' + parentField + ' = ' + parentReqFieldValue + ' so ' + childField + ' is required';
                            }
                            else {
                                message += validateField(request, childFieldFormat);
                            }
                        }
                    }
                    else if (parentFieldValue == parentReqFieldValue) {
                        if (!keys.includes(childField)) {
                            message += ', ' + parentField + ' = ' + parentReqFieldValue + ' so ' + childField + ' is required';
                        }
                        else {
                            message += validateField(request, childFieldFormat);
                        }
                    }
                }
                else if (keys.includes(parentField)) {
                    if (!keys.includes(childField)) {
                        message += ', ' + parentField + ' is passed. So ' + childField + ' is required';
                    }
                    else {
                        message += validateField(request, childFieldFormat);
                    }
                }
            }
            else {
                message += validateField(request, field);
            }
        });
    }
    console.log('====>' + message);
    if (message == '') {
        while (index < keys.length) {
            var value = request.body[keys[index]];
            if (value != null) {
                if (value === "" || value == undefined) {
                    message = keys[index] + " is required. If blank then please don't pass.";
                    break;
                    // } else if (keys[index].endsWith('Date')) {
                    //     if (!Date.parse(value)) {
                    //         message = keys[index] + ' - date format (yyyy-mm-dd) is required';
                    //         break;
                    //     } else {
                    //         var dateValue = new Date(value);
                    //         request.body[keys[index]] = new Date(dateValue.getFullYear(), dateValue.getMonth(), dateValue.getDate());
                    //     }
                }
                else if (['skip', 'limit'].includes(keys[index]) || keys[index].endsWith('Days') || keys[index].endsWith('Range')) {
                    if (!Number.isInteger(value)) {
                        message = keys[index] + ' - number datatype is required';
                        break;
                    }
                }
                else if (keys[index].startsWith('is') && !keys[index].startsWith('iso')) {
                    if (!(typeof value == 'boolean')) {
                        message = keys[index] + ' - boolean datatype is required';
                        break;
                    }
                }
                else if (typescript_pluralize_1.default.isPlural(keys[index])) {
                    // if (!Array.isArray(value)) {
                    //     message = keys[index] + ' - Array datatype is required';
                    //     break;
                    // } else if (value.length == 0) {
                    //     message = keys[index] + ' - Array is blank.';
                    //     break;
                    // }
                }
            }
            else {
                request.body[keys[index]] = undefined;
                // message = keys[index] + " is required.";
                // break;
            }
            index++;
        }
    }
    if (message.length > 0) {
        statusCode = 300;
        message = message.indexOf(',') == 1 ? message.substring(2) : message;
    }
    let resultObj = {
        statusCode: statusCode,
        message: message,
        validate: message != '' ? false : true
    };
    return resultObj;
};
exports.default = { validateAuthorization, validateRequiredFields };
