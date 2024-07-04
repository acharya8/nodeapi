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
const NAMESPACE = 'Town';
const getTowns = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logging_1.default.info(NAMESPACE, 'Getting Cities');
        var requiredFields = ['latitude', 'longitude'];
        var validationResult = apiHeader_1.default.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let sql = `CALL websiteGetTowns();`;
            console.log(sql);
            var result = yield query(sql);
            //console.log(JSON.stringify(result));
            if (result && result.length > 0) {
                if (result[0].length >= 0) {
                    //Calculate Distance
                    //var distanceArray=[];
                    for (let i = 0; i < result[0].length; i++) {
                        if (result[0][i].latitude && result[0][i].longitude) {
                            result[0][i].distance = 0;
                            var distance = yield calculateDistance(result[0][i].latitude, result[0][i].longitude, req.body.latitude, req.body.longitude, "k");
                            // let distanceObj = {
                            //     "distance": parseFloat(distance.toString())
                            // }
                            result[0][i].distance = distance;
                            //distanceArray.push(JSON.parse(JSON.stringify(distanceObj)));
                        }
                    }
                    result[0].sort((a, b) => {
                        if (a.distance > b.distance) {
                            return 1;
                        }
                        else {
                            return -1;
                        }
                    });
                    let successResult = new resultsuccess_1.ResultSuccess(200, true, 'Get Towns', [result[0][0]], 1);
                    //console.log(successResult);
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
        let errorResult = new resulterror_1.ResultError(500, true, 'cities.getTowns()', error, '');
        next(errorResult);
    }
});
var calculateDistance = (lat1, lon1, lat2, lon2, unit) => __awaiter(void 0, void 0, void 0, function* () {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    }
    else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") {
            dist = dist * 1.609344;
        }
        if (unit == "N") {
            dist = dist * 0.8684;
        }
        return dist;
    }
});
// const distance = async (lat1, lon1, lat2, lon2, unit) => {
//     if ((lat1 == lat2) && (lon1 == lon2)) {
//         return 0;
//     }
//     else {
//         var radlat1 = Math.PI * lat1 / 180;
//         var radlat2 = Math.PI * lat2 / 180;
//         var theta = lon1 - lon2;
//         var radtheta = Math.PI * theta / 180;
//         var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
//         if (dist > 1) {
//             dist = 1;
//         }
//         dist = Math.acos(dist);
//         dist = dist * 180 / Math.PI;
//         dist = dist * 60 * 1.1515;
//         if (unit == "K") { dist = dist * 1.609344 }
//         if (unit == "N") { dist = dist * 0.8684 }
//         return dist;
//     };
exports.default = { getTowns };
