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
const AWS = require('aws-sdk');
const util = require('util');
const apiHeader_1 = __importDefault(require("../../middleware/apiHeader"));
const resultsuccess_1 = require("../../classes/response/resultsuccess");
const resulterror_1 = require("../../classes/response/resulterror");
let connection = mysql.createConnection({
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
const NAMESPACE = 'Banks';
const getBanks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Banks');
        let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecord = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let searchString = req.body.searchString ? req.body.searchString : "";
            let sql = `CALL adminGetBanks(` + startIndex + `,` + fetchRecord + `,'` + searchString + `')`;
            let result = yield query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    for (let i = 0; i < result[1].length; i++) {
                        let companyCategoryTypes = yield query(`SELECT bankcompanycategory.*,companycategorytype.name,companycategory.companyName FROM bankcompanycategory INNER JOIN companycategorytype ON companycategorytype.id = bankcompanycategory.companyCategoryTypeId INNER JOIN companycategory ON companycategory.id = bankcompanycategory.companyCategoryId  WHERE bankcompanycategory.bankId = ` + result[1][i].id);
                        if (companyCategoryTypes && companyCategoryTypes.length > 0) {
                            let companyCategoryType = [];
                            let types = [];
                            for (let index = 0; index < companyCategoryTypes.length; index++) {
                                if (companyCategoryType && companyCategoryType.length == 0) {
                                    companyCategoryType.push(companyCategoryTypes[0].companyCategoryTypeId);
                                    let data = {
                                        "id": companyCategoryTypes[index].companyCategoryTypeId,
                                        "name": companyCategoryTypes[index].name,
                                    };
                                    types.push(data);
                                }
                                else {
                                    if (companyCategoryType.indexOf(companyCategoryTypes[index].companyCategoryTypeId) < 0) {
                                        companyCategoryType.push(companyCategoryTypes[index].companyCategoryTypeId);
                                        let data = {
                                            "id": companyCategoryTypes[index].companyCategoryTypeId,
                                            "name": companyCategoryTypes[index].name,
                                        };
                                        types.push(data);
                                    }
                                }
                            }
                            result[1][i].companyCategoryTypes = types;
                            for (let j = 0; j < companyCategoryType.length; j++) {
                                let category = [];
                                let categories = companyCategoryTypes.filter(c => c.companyCategoryTypeId == companyCategoryType[j]);
                                categories.forEach(companyele => {
                                    let data = {
                                        "companyName": companyele.companyName,
                                        "id": companyele.companyCategoryId
                                    };
                                    category.push(data);
                                });
                                result[1][i].companyCategoryTypes[j].selectedCategory = category;
                            }
                        }
                        else {
                            result[1][i].companyCategoryTypes = [];
                        }
                    }
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Banks Successfully', result[1], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else if (result[0] && result[0][0].totalCount == 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Banks Successfully', [], result[0][0].totalCount);
                    return res.status(200).send(successResult);
                }
                else {
                    let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                    next(errorResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, "banks.getBanks() Error", result, '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'banks.getBanks() Exception', error, '');
        next(errorResult);
    }
});
const insertBanks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Inserting Bank');
        let requiredFields = ['name'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                req.body.description = req.body.description ? req.body.description : "";
                req.body.headquarters = req.body.headquarters ? req.body.headquarters : "";
                req.body.bankCode = req.body.bankCode ? req.body.bankCode : "";
                let bankLogo = req.body.bankLogo ? req.body.bankLogo : null;
                if (bankLogo) {
                    let contentType;
                    contentType = 'image/jpeg';
                    let fileExt = contentType.split("/")[1].split("+")[0];
                    let buf = Buffer.from(bankLogo, 'base64');
                    let keyName = req.body.name.replace(" ", "_");
                    let params = {
                        Bucket: 'creditappbanklogo',
                        Key: keyName + "_" + new Date().getTime() + "." + fileExt,
                        Body: buf,
                        ContentEncoding: 'base64',
                        ContentType: contentType,
                        ACL: 'public-read'
                    };
                    yield S3.upload(params, (error, data) => __awaiter(void 0, void 0, void 0, function* () {
                        if (error) {
                            let errorResult = new resulterror_1.ResultError(500, true, 'File Not Uploaded', error, '');
                            next(errorResult);
                            return;
                        }
                        let sql = `CALL adminInsertBanks('` + req.body.name + `','` + req.body.description + `','` + req.body.headquarters + `','` + req.body.bankCode + `',` + userId + `,` + req.body.minAge + `,` + req.body.maxAge + `,'` + data.Location + `')`;
                        let result = yield query(sql);
                        if (result && result.length > 0) {
                            if (result[0][0].nameExist == 1) {
                                let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Bank Already Exist"), '');
                                next(errorResult);
                            }
                            else if (result && result[1].affectedRows >= 0) {
                                let id = result[0][0].bankId;
                                if (req.body.companyCategoryTypes && req.body.companyCategoryTypes.length > 0) {
                                    for (let i = 0; i < req.body.companyCategoryTypes.length; i++) {
                                        if (req.body.companyCategoryTypes[i].selectedCategory && req.body.companyCategoryTypes[i].selectedCategory.length > 0) {
                                            for (let j = 0; j < req.body.companyCategoryTypes[i].selectedCategory.length; j++) {
                                                let categorySql = `INSERT INTO bankcompanycategory(bankId,companyCategoryTypeId,companyCategoryId,createdBy,modifiedBy) VALUES (` + id + `,` + req.body.companyCategoryTypes[i].id + `,` + req.body.companyCategoryTypes[i].selectedCategory[j].id + `,` + userId + `,` + userId + `)`;
                                                let categoryRes = yield query(categorySql);
                                            }
                                        }
                                    }
                                }
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "Bank.insertBank() Error", new Error('Error While Inserting Data'), '');
                                next(errorResult);
                            }
                        }
                    }));
                }
                else {
                    let sql = `CALL adminInsertBanks('` + req.body.name + `','` + req.body.description + `','` + req.body.headquarters + `','` + req.body.bankCode + `',` + userId + `,` + req.body.minAge + `,` + req.body.maxAge + `,'` + '' + `')`;
                    let result = yield query(sql);
                    if (result && result.length > 0) {
                        if (result[0][0].nameExist == 1) {
                            let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Bank Already Exist"), '');
                            next(errorResult);
                        }
                        else if (result && result[1].affectedRows >= 0) {
                            let id = result[0][0].bankId;
                            if (req.body.companyCategoryTypes && req.body.companyCategoryTypes.length > 0) {
                                for (let i = 0; i < req.body.companyCategoryTypes.length; i++) {
                                    if (req.body.companyCategoryTypes[i].selectedCategory && req.body.companyCategoryTypes[i].selectedCategory.length > 0) {
                                        for (let j = 0; j < req.body.companyCategoryTypes[i].selectedCategory.length; j++) {
                                            let categorySql = `INSERT INTO bankcompanycategory(bankId,companyCategoryTypeId,companyCategoryId,createdBy,modifiedBy) VALUES (` + id + `,` + req.body.companyCategoryTypes[i].id + `,` + req.body.companyCategoryTypes[i].selectedCategory[j].id + `,` + userId + `,` + userId + `)`;
                                            let categoryRes = yield query(categorySql);
                                        }
                                    }
                                }
                            }
                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                            return res.status(200).send(successResult);
                        }
                        else {
                            let errorResult = new resulterror_1.ResultError(400, true, "Bank.insertBank() Error", new Error('Error While Inserting Data'), '');
                            next(errorResult);
                        }
                    }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'banks.insertBank() Exception', error, '');
        next(errorResult);
    }
});
const updateBanks = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Updating Banks');
        let requiredFields = ['id', 'name'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let userId = currentUser.id;
                let id = req.body.id ? req.body.id : 0;
                req.body.description = req.body.description ? req.body.description : "";
                req.body.headquarters = req.body.headquarters ? req.body.headquarters : "";
                req.body.bankCode = req.body.bankCode ? req.body.bankCode : "";
                let bankLogo = req.body.bankLogo ? req.body.bankLogo : null;
                let result;
                if (!bankLogo) {
                    let checkUrlSql = `SELECT bankLogo from banks WHERE id = ` + req.body.id;
                    let checkUrlResult = yield query(checkUrlSql);
                    if (checkUrlResult && checkUrlResult.length > 0) {
                        if (checkUrlResult[0].bankLogo.includes("https:")) {
                            let splt = checkUrlResult[0].bankLogo.split("/");
                            const delResp = yield S3.deleteObject({
                                Bucket: 'creditappbanklogo',
                                Key: splt[splt.length - 1],
                            }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                if (err) {
                                    console.log("Error: Object delete failed.");
                                    let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                    next(errorResult);
                                }
                                else {
                                    try {
                                        let sql = `CALL adminUpdateBank(` + id + `,'` + req.body.name + `','` + req.body.description + `','` + req.body.headquarters + `','` + req.body.bankCode + `',` + userId + `,` + req.body.minAge + `,` + req.body.maxAge + `,'` + '' + `')`;
                                        console.log(sql);
                                        result = yield query(sql);
                                        if (result && result.length > 0) {
                                            if (result[0][0].nameExist == 1) {
                                                let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Bank Already Exist"), '');
                                                next(errorResult);
                                            }
                                        }
                                        else if (result && result.affectedRows >= 0) {
                                            let deleteSql = yield query(`DELETE FROM bankcompanycategory WHERE bankId = ?`, id);
                                            if (req.body.companyCategoryTypes && req.body.companyCategoryTypes.length > 0) {
                                                for (let i = 0; i < req.body.companyCategoryTypes.length; i++) {
                                                    if (req.body.companyCategoryTypes[i].selectedCategory && req.body.companyCategoryTypes[i].selectedCategory.length > 0) {
                                                        for (let j = 0; j < req.body.companyCategoryTypes[i].selectedCategory.length; j++) {
                                                            let categorySql = `INSERT INTO bankcompanycategory(bankId,companyCategoryTypeId,companyCategoryId,createdBy,modifiedBy) VALUES (` + id + `,` + req.body.companyCategoryTypes[i].id + `,` + req.body.companyCategoryTypes[i].selectedCategory[j].id + `,` + userId + `,` + userId + `)`;
                                                            let categoryRes = yield query(categorySql);
                                                        }
                                                    }
                                                }
                                            }
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                                            return res.status(200).send(successResult);
                                        }
                                        else {
                                            let errorResult = new resulterror_1.ResultError(400, true, "Bank.updateBank() Error", new Error('Error While Updating Data'), '');
                                            next(errorResult);
                                        }
                                    }
                                    catch (error) {
                                        let errorResult = new resulterror_1.ResultError(500, true, 'Bank.UpdateBank() Exception', error, '');
                                        next(errorResult);
                                    }
                                }
                            }));
                        }
                        else {
                            try {
                                let sql = `CALL adminUpdateBank(` + id + `,'` + req.body.name + `','` + req.body.description + `','` + req.body.headquarters + `','` + req.body.bankCode + `',` + userId + `,` + req.body.minAge + `,` + req.body.maxAge + `,'` + '' + `')`;
                                console.log(sql);
                                result = yield query(sql);
                                if (result && result.length > 0) {
                                    if (result[0][0].nameExist == 1) {
                                        let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Bank Already Exist"), '');
                                        next(errorResult);
                                    }
                                }
                                else if (result && result.affectedRows >= 0) {
                                    let deleteSql = yield query(`DELETE FROM bankcompanycategory WHERE bankId = ?`, id);
                                    if (req.body.companyCategoryTypes && req.body.companyCategoryTypes.length > 0) {
                                        for (let i = 0; i < req.body.companyCategoryTypes.length; i++) {
                                            if (req.body.companyCategoryTypes[i].selectedCategory && req.body.companyCategoryTypes[i].selectedCategory.length > 0) {
                                                for (let j = 0; j < req.body.companyCategoryTypes[i].selectedCategory.length; j++) {
                                                    let categorySql = `INSERT INTO bankcompanycategory(bankId,companyCategoryTypeId,companyCategoryId,createdBy,modifiedBy) VALUES (` + id + `,` + req.body.companyCategoryTypes[i].id + `,` + req.body.companyCategoryTypes[i].selectedCategory[j].id + `,` + userId + `,` + userId + `)`;
                                                    let categoryRes = yield query(categorySql);
                                                }
                                            }
                                        }
                                    }
                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                                    return res.status(200).send(successResult);
                                }
                                else {
                                    let errorResult = new resulterror_1.ResultError(400, true, "Bank.updateBank() Error", new Error('Error While Updating Data'), '');
                                    next(errorResult);
                                }
                            }
                            catch (error) {
                                let errorResult = new resulterror_1.ResultError(500, true, 'Bank.updateUser() Exception', error, '');
                                next(errorResult);
                            }
                        }
                    }
                }
                else {
                    if (bankLogo.includes("https:")) {
                        try {
                            let sql = `CALL adminUpdateBank(` + id + `,'` + req.body.name + `','` + req.body.description + `','` + req.body.headquarters + `','` + req.body.bankCode + `',` + userId + `,` + req.body.minAge + `,` + req.body.maxAge + `,'` + bankLogo + `')`;
                            console.log(sql);
                            result = yield query(sql);
                            if (result && result.length > 0) {
                                if (result[0][0].nameExist == 1) {
                                    let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Bank Already Exist"), '');
                                    next(errorResult);
                                }
                            }
                            else if (result && result.affectedRows >= 0) {
                                let deleteSql = yield query(`DELETE FROM bankcompanycategory WHERE bankId = ?`, id);
                                if (req.body.companyCategoryTypes && req.body.companyCategoryTypes.length > 0) {
                                    for (let i = 0; i < req.body.companyCategoryTypes.length; i++) {
                                        if (req.body.companyCategoryTypes[i].selectedCategory && req.body.companyCategoryTypes[i].selectedCategory.length > 0) {
                                            for (let j = 0; j < req.body.companyCategoryTypes[i].selectedCategory.length; j++) {
                                                let categorySql = `INSERT INTO bankcompanycategory(bankId,companyCategoryTypeId,companyCategoryId,createdBy,modifiedBy) VALUES (` + id + `,` + req.body.companyCategoryTypes[i].id + `,` + req.body.companyCategoryTypes[i].selectedCategory[j].id + `,` + userId + `,` + userId + `)`;
                                                let categoryRes = yield query(categorySql);
                                            }
                                        }
                                    }
                                }
                                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                                return res.status(200).send(successResult);
                            }
                            else {
                                let errorResult = new resulterror_1.ResultError(400, true, "Bank.updateBank() Error", new Error('Error While Updating Data'), '');
                                next(errorResult);
                            }
                        }
                        catch (error) {
                            let errorResult = new resulterror_1.ResultError(500, true, 'Bank.updateBank() Exception', error, '');
                            next(errorResult);
                        }
                    }
                    else {
                        let checkUrlSql = `SELECT bankLogo from banks WHERE id = ` + req.body.id;
                        let checkUrlResult = yield query(checkUrlSql);
                        if (checkUrlResult && checkUrlResult.length > 0) {
                            if (checkUrlResult[0].bankLogo) {
                                let splt = checkUrlResult[0].bankLogo.split("/");
                                const delResp = yield S3.deleteObject({
                                    Bucket: 'creditappbanklogo',
                                    Key: splt[splt.length - 1],
                                }, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                                    if (err) {
                                        console.log("Error: Object delete failed.");
                                        let errorResult = new resulterror_1.ResultError(401, true, "Error: Object delete failed.", err, '');
                                        next(errorResult);
                                    }
                                    else {
                                        try {
                                            let buf = Buffer.from(bankLogo, 'base64');
                                            let contentType;
                                            contentType = 'image/jpeg';
                                            let isErr = false;
                                            let keyName = req.body.name.replace(" ", "_");
                                            let params = {
                                                Bucket: 'creditappbanklogo',
                                                Key: keyName + "_" + req.body.id + "_" + new Date().getTime(),
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
                                                let sql = `CALL adminUpdateBank(` + id + `,'` + req.body.name + `','` + req.body.description + `','` + req.body.headquarters + `','` + req.body.bankCode + `',` + userId + `,` + req.body.minAge + `,` + req.body.maxAge + `,'` + data.Location + `')`;
                                                console.log(sql);
                                                result = yield query(sql);
                                                if (result && result.length > 0) {
                                                    if (result[0][0].nameExist == 1) {
                                                        let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Bank Already Exist"), '');
                                                        next(errorResult);
                                                    }
                                                }
                                                else if (result && result.affectedRows >= 0) {
                                                    let deleteSql = yield query(`DELETE FROM bankcompanycategory WHERE bankId = ?`, id);
                                                    if (req.body.companyCategoryTypes && req.body.companyCategoryTypes.length > 0) {
                                                        for (let i = 0; i < req.body.companyCategoryTypes.length; i++) {
                                                            if (req.body.companyCategoryTypes[i].selectedCategory && req.body.companyCategoryTypes[i].selectedCategory.length > 0) {
                                                                for (let j = 0; j < req.body.companyCategoryTypes[i].selectedCategory.length; j++) {
                                                                    let categorySql = `INSERT INTO bankcompanycategory(bankId,companyCategoryTypeId,companyCategoryId,createdBy,modifiedBy) VALUES (` + id + `,` + req.body.companyCategoryTypes[i].id + `,` + req.body.companyCategoryTypes[i].selectedCategory[j].id + `,` + userId + `,` + userId + `)`;
                                                                    let categoryRes = yield query(categorySql);
                                                                }
                                                            }
                                                        }
                                                    }
                                                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                                                    return res.status(200).send(successResult);
                                                }
                                                else {
                                                    let errorResult = new resulterror_1.ResultError(400, true, "Bank.updateBank() Error", new Error('Error While Updating Data'), '');
                                                    next(errorResult);
                                                }
                                            }));
                                        }
                                        catch (error) {
                                            let errorResult = new resulterror_1.ResultError(500, true, 'Bank.updateBank() Exception', error, '');
                                            next(errorResult);
                                        }
                                    }
                                }));
                            }
                            else {
                                let buf = Buffer.from(bankLogo, 'base64');
                                let contentType;
                                contentType = 'image/jpeg';
                                let isErr = false;
                                let keyName = req.body.name.replace(" ", "_");
                                let params = {
                                    Bucket: 'creditappbanklogo',
                                    Key: keyName + "_" + req.body.id + "_" + new Date().getTime(),
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
                                    try {
                                        let sql = `CALL adminUpdateBank(` + id + `,'` + req.body.name + `','` + req.body.description + `','` + req.body.headquarters + `','` + req.body.bankCode + `',` + userId + `,` + req.body.minAge + `,` + req.body.maxAge + `,'` + data.Location + `')`;
                                        console.log(sql);
                                        result = yield query(sql);
                                        if (result && result.length > 0) {
                                            if (result[0][0].nameExist == 1) {
                                                let errorResult = new resulterror_1.ResultError(400, true, "", new Error("Bank Already Exist"), '');
                                                next(errorResult);
                                            }
                                        }
                                        else if (result && result.affectedRows >= 0) {
                                            let deleteSql = yield query(`DELETE FROM bankcompanycategory WHERE bankId = ?`, id);
                                            if (req.body.companyCategoryTypes && req.body.companyCategoryTypes.length > 0) {
                                                for (let i = 0; i < req.body.companyCategoryTypes.length; i++) {
                                                    if (req.body.companyCategoryTypes[i].selectedCategory && req.body.companyCategoryTypes[i].selectedCategory.length > 0) {
                                                        for (let j = 0; j < req.body.companyCategoryTypes[i].selectedCategory.length; j++) {
                                                            let categorySql = `INSERT INTO bankcompanycategory(bankId,companyCategoryTypeId,companyCategoryId,createdBy,modifiedBy) VALUES (` + id + `,` + req.body.companyCategoryTypes[i].id + `,` + req.body.companyCategoryTypes[i].selectedCategory[j].id + `,` + userId + `,` + userId + `)`;
                                                            let categoryRes = yield query(categorySql);
                                                        }
                                                    }
                                                }
                                            }
                                            let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                                            return res.status(200).send(successResult);
                                        }
                                        else {
                                            let errorResult = new resulterror_1.ResultError(400, true, "Bank.updateBank() Error", new Error('Error While Updating Data'), '');
                                            next(errorResult);
                                        }
                                    }
                                    catch (error) {
                                        let errorResult = new resulterror_1.ResultError(500, true, 'Bank.updateBank() Exception', error, '');
                                        next(errorResult);
                                    }
                                }));
                            }
                        }
                    }
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bank.updateBank() Exception', error, '');
        next(errorResult);
    }
});
const activeInActiveBank = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Active Inactive Bank');
        let requiredFields = ['id'];
        let validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = yield apiHeader_1.default.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let currentUser = authorizationResult.currentUser;
                let id = req.body.id;
                let userId = currentUser.id;
                let sql = `CALL adminActiveInActiveBank(` + id + `, ` + userId + `); `;
                console.log(sql);
                let result = yield query(sql);
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Bank', result, 1);
                return res.status(200).send(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'bank.activeInActiveBank() Exception', error, '');
        next(errorResult);
    }
});
exports.default = { getBanks, insertBanks, updateBanks, activeInActiveBank };
