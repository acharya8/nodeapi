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
const NAMESPACE = 'Leads';
const getLeadsByContactNoAndServiceId = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['contactNo', 'serviceId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            logging_1.default.info(NAMESPACE, 'Verify Contact No');
            var serviceId = req.body.serviceId;
            var contactNo = req.body.contactNo;
            let sql = `CALL websiteGetLeadsByContactNoAndServiceId('` + contactNo + `',` + serviceId + `);`;
            console.log(sql);
            var result = yield query(sql);
            console.log(JSON.stringify(result));
            if (result && result.length > 0) {
                if (result[0].length >= 0) {
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Leads By ContactNo And ServiceId', result[0], result[0].length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'leads.getLeadsByContactNoAndServiceId()', error, '');
        next(errorResult);
    }
});
const insertLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['contactNo', 'serviceId', 'customerFullName', 'pincode', 'cityId'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let userId = req.body.userId ? req.body.userId : null;
            let temporaryCode = "";
            let lastTempCodeSql = "CALL websiteGetLastCustomer()";
            let lastTempCodeResult = yield query(lastTempCodeSql);
            if (lastTempCodeResult && lastTempCodeResult.length > 0 && lastTempCodeResult[0].length > 0) {
                let no = parseInt(lastTempCodeResult[0][0].temporaryCode.split("_")[1]);
                temporaryCode = "CT_" + (no + 1).toString().padStart(10, "0");
            }
            else {
                temporaryCode = "CT_0000000001";
            }
            //req.body.temporaryCode?req.body.temporaryCode:null;
            let addressTypeId = req.body.addressTypeId ? req.body.addressTypeId : 1;
            let serviceId = req.body.serviceId ? req.body.serviceId : 1;
            var countryCode = req.body.countryCode ? req.body.countryCode : "+91";
            let contactNo = req.body.contactNo;
            let loanAmount = req.body.loanAmount ? req.body.loanAmount : null;
            let customerFullName = req.body.customerFullName;
            let pincode = req.body.pincode;
            let cityId = req.body.cityId;
            let professionTypeId = req.body.professionTypeId ? req.body.professionTypeId : null;
            let email = req.body.email ? req.body.email : "";
            let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
            let aadhaarCardNo = req.body.aadhaarCardNo ? req.body.aadhaarCardNo : "";
            let primaryBankId = req.body.primaryBankId ? req.body.primaryBankId : null;
            let employmentTypeId = req.body.employmentTypeId ? req.body.employmentTypeId : null;
            let loanPurpose = req.body.loanPurpose ? req.body.loanPurpose : "";
            let studiedCountryId = req.body.studiedCountryId ? req.body.studiedCountryId : null;
            let degreeId = req.body.degreeId ? req.body.degreeId : null;
            let courseId = req.body.courseId ? req.body.courseId : null;
            let monthlyIncome = req.body.monthlyIncome ? req.body.monthlyIncome : null;
            if (!userId) {
                let usersql = `CALL websiteVerifyContactNo('` + countryCode + `','` + contactNo + `');`;
                console.log(usersql);
                var userResult = yield query(usersql);
                if (userResult && userResult.length > 0) {
                    if (userResult[0].length > 0) {
                        //UserId
                        userId = userResult[0][0].insertId;
                    }
                    if (userResult[1].length > 0) {
                        userId = userResult[1][0].id;
                    }
                }
            }
            let data = yield query(`SELECT districts.name as districtName,states.name as stateName FROM districts INNER JOIN cities ON cities.districtId = districts.id INNER JOIN states ON states.id = districts.stateId WHERE cities.id = ?`, req.body.cityId);
            let sql = `CALL websiteInsertLead(` + userId + `,'` + temporaryCode + `',` + addressTypeId + `,` + serviceId + `,'` + contactNo + `',` + loanAmount + `,'` + customerFullName + `','` + pincode + `',` + cityId + `,` + professionTypeId + `,'` + email + `','` + panCardNo + `','` + aadhaarCardNo + `',` + primaryBankId + `,` + employmentTypeId + `,'` + loanPurpose + `',` + studiedCountryId + `,` + degreeId + `,` + courseId + `,` + monthlyIncome + `,'` + data[0].districtName + `','` + data[0].stateName + `')`;
            console.log(sql);
            let result = yield query(sql);
            if (result.length > 0) {
                //LeadData in Last Index
                let LeadData = result[0];
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Insert Lead', LeadData, LeadData.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'leads.insertLeads()', error, '');
        next(errorResult);
    }
});
const updateLeads = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        var requiredFields = ['id', 'contactNo', 'serviceId', 'customerFullName', 'pincode', 'cityId', 'email'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let userId = req.body.userId ? req.body.userId : null;
            //let temporaryCode = req.body.temporaryCode?req.body.temporaryCode:null;
            //let addressTypeId = req.body.addressTypeId?req.body.addressTypeId:null;
            let serviceId = req.body.serviceId;
            let contactNo = req.body.contactNo;
            let loanAmount = req.body.loanAmount ? req.body.loanAmount : null;
            let customerFullName = req.body.customerFullName;
            let pincode = req.body.pincode;
            let cityId = req.body.cityId;
            let email = req.body.email;
            let panCardNo = req.body.panCardNo ? req.body.panCardNo : "";
            let aadhaarCardNo = req.body.aadhaarCardNo ? req.body.aadhaarCardNo : "";
            let primaryBankId = req.body.primaryBankId ? req.body.primaryBankId : null;
            let employmentTypeId = req.body.employmentTypeId ? req.body.employmentTypeId : null;
            let loanPurpose = req.body.loanPurpose ? req.body.loanPurpose : "";
            let studiedCountryId = req.body.studiedCountryId ? req.body.studiedCountryId : null;
            let degreeId = req.body.degreeId ? req.body.degreeId : null;
            let courseId = req.body.courseId ? req.body.courseId : null;
            let leadId = req.body.id ? req.body.id : null;
            let experience = req.body.experience ? req.body.experience : null;
            let annualIncome = req.body.annualIncome ? req.body.annualIncome : null;
            let monthlyIncome = req.body.monthlyIncome ? req.body.monthlyIncome : null;
            let sql = `CALL websiteUpdateLead(` + leadId + `,` + userId + `,` + serviceId + `,'` + contactNo + `',` + loanAmount + `,'` + customerFullName + `','` + pincode + `',` + cityId + `,'` + email + `','` + panCardNo + `','` + aadhaarCardNo + `'
            ,` + primaryBankId + `,` + employmentTypeId + `,'` + loanPurpose + `',` + studiedCountryId + `,` + degreeId + `,` + courseId + `,` + experience + `,` + annualIncome + `,` + monthlyIncome + `);`;
            let result = yield query(sql);
            if (result.length > 0) {
                //LeadData in Last Index
                let LeadData = result[0];
                let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Update Lead', LeadData, LeadData.length);
                console.log(successResult);
                return res.status(200).send(successResult);
            }
            else {
                let errorResult = new resulterror_1.ResultError(400, true, 'Data Not Available', new Error('Data Not Available'), '');
                next(errorResult);
            }
        }
        else {
            let errorResult = new resulterror_1.ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
            next(errorResult);
        }
    }
    catch (error) {
        let errorResult = new resulterror_1.ResultError(500, true, 'leads.updateLeads()', error, '');
        next(errorResult);
    }
});
exports.default = { getLeadsByContactNoAndServiceId, insertLeads, updateLeads };
