import { NextFunction, Request, Response } from 'express';
import logging from '../../config/logging';
import config from '../../config/config';
const mysql = require('mysql');
const util = require('util');
var crypto = require('crypto');
const AWS = require('aws-sdk');
var convertRupeesIntoWords = require('convert-rupees-into-words');
import header from '../../middleware/apiHeader';
import { ResultSuccess } from '../../classes/response/resultsuccess';
import { ResultError } from '../../classes/response/resulterror';
const pdf = require('html-pdf-node');
const fs = require('fs');
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

const NAMESPACE = 'Payout';


const getpartnerPayout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Getting Partner Payout');
        let authorizationResult = await header.validateAuthorization(req, res, next);
        if (authorizationResult.statusCode == 200) {
            let startIndex = req.body.startIndex ? req.body.startIndex : 0;
            let fetchRecords = req.body.fetchRecords ? req.body.fetchRecords : 0;
            let searchString = req.body.searchString ? req.body.searchString : '';
            let serviceId = req.body.serviceId ? req.body.serviceId : 0;
            let fromDate = req.body.fromDate ? new Date(req.body.fromDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.fromDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.fromDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.fromDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.fromDate).getSeconds())).slice(-2) : '';
            let toDate = req.body.toDate ? new Date(req.body.toDate).getFullYear().toString() + '-' + ("0" + (new Date(req.body.toDate).getMonth() + 1)).slice(-2) + '-' + ("0" + new Date(req.body.toDate).getDate()).slice(-2) + ' ' + ("0" + (new Date(req.body.toDate).getHours())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getMinutes())).slice(-2) + ':' + ("0" + (new Date(req.body.toDate).getSeconds())).slice(-2) : '';
            let sql = `CALL adminGetPartnerPayout(` + 0 + `,` + 0 + `,'` + searchString + `')`;
            let result = await query(sql);
            if (result && result.length > 0) {
                if (result[1] && result[1].length > 0) {
                    let ids = [];
                    for (let index = 0; index < result[1].length; index++) {
                        ids.push(result[1][index].partnerId)
                    }
                    let historySql = `CALL adminGetpartnerPayoutHistory('` + ids.toString() + `','` + fromDate + `','` + toDate + `',` + serviceId + `)`;
                    let historyResult = await query(historySql);
                    if (historyResult && historyResult.length > 0) {
                        for (let i = 0; i < result[1].length; i++) {
                            let history = historyResult[0].filter(c => c.partnerId == result[1][i].partnerId)
                            if (history && history.length > 0) {
                                for (let j = 0; j < history.length; j++) {
                                    let commissionSqlResult = await query(`SELECT commission FROM bankloanpartnercommissions WHERE bankId = ` + history[j].bankId + ` AND serviceId = ` + history[j].serviceId + ` AND partnerId = ` + result[1][i].partnerId + ``)
                                    if (commissionSqlResult && commissionSqlResult.length > 0) {
                                        history[j].commissionPercent = commissionSqlResult[0].commission
                                    }
                                }
                            }
                            result[1][i].payoutHistory = history;
                        }
                        result[1] = result[1].filter(c => c.payoutHistory.length > 0)
                        var length = result[1].length;
                        if (startIndex >= 0 && fetchRecords > 0) {
                            if (result[1] && result[1].length > 0) {
                                result[1].slice(startIndex, fetchRecords)
                            }
                        }
                    }
                    let successResult = new ResultSuccess(200, true, 'Get Partner Payout', result[1], length);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
                else if (result[1] && result[1].length == 0) {
                    let successResult = new ResultSuccess(200, true, 'Get Partner Payout', result[1], result[0][0].totalCount);
                    console.log(successResult);
                    return res.status(200).send(successResult);
                }
            } else {
                let errorResult = new ResultError(400, true, "Error While Getting Partner Payout", result, '');
                next(errorResult);
            }
        } else {
            let errorResult = new ResultError(401, true, "Unauthorized request", authorizationResult, '');
            next(errorResult);
        }
        // } else {
        //     let errorResult = new ResultError(validationResult.statusCode, true, validationResult.message, new Error(validationResult.message), '');
        //     next(errorResult);
        // }
    } catch (error) {
        let errorResult = new ResultError(500, true, 'payout.getpartnerPayout() Exception', error, '');
        next(errorResult);
    }
};

const payoutRelease = async (req: Request, res: Response, next: NextFunction) => {
    try {
        logging.info(NAMESPACE, 'Insert Payout Release');
        var requiredFields = ['partnerCommissionId', 'loanDetailId', 'partnerId', 'commission', 'serviceName'];
        var validationResult = header.validateRequiredFields(req, requiredFields);
        if (validationResult && validationResult.statusCode == 200) {
            let authorizationResult = await header.validateAuthorization(req, res, next);
            if (authorizationResult.statusCode == 200) {
                let sql = `CALL adminPayoutRelease(` + authorizationResult.currentUser.id + `,` + req.body.partnerCommissionId + `)`;
                let result = await query(sql);
                if (result && result.affectedRows >= 0) {
                    let lastInvoice;
                    let count = 1;
                    let lastInvoiceNumberSql = `CALL adminGetLastInvoiceNumber()`;
                    let lastInvoiceResult = await query(lastInvoiceNumberSql);
                    if (lastInvoiceResult && lastInvoiceResult[0].length > 0) {
                        lastInvoice = lastInvoiceResult[0][0].invoiceNumber
                        let invoice = lastInvoice.split(new Date().getFullYear() + ("0" + (new Date().getMonth() + 1)).slice(-2) + ("0" + new Date().getDate()).slice(-2));
                        count = parseInt(invoice[1]) + 1;
                    }
                    else {
                        count = 1;
                    }
                    let invoiceData = {
                        "partnerId": req.body.partnerId,
                        "commission": req.body.commission,
                        "loanDetailId": req.body.loanDetailId,
                        "commissionHistoryId": req.body.partnerCommissionId,
                        "userId": authorizationResult.currentUser.id,
                        "serviceName": req.body.serviceName,
                        "count": count
                    }
                    let pdfRes = await printPdf(invoiceData);
                    if (pdfRes && pdfRes.pdfString) {
                        // let buf = Buffer.from(pdfRes.pdfString, 'base64');
                        let contentType;
                        contentType = 'application/pdf';
                        let isErr = false;
                        let keyname = pdfRes.invoiceNumber + new Date().getTime();
                        let params = {
                            Bucket: 'creditapppartnerinvoice',
                            Key: keyname,
                            Body: pdfRes.pdfString,
                            ContentEncoding: 'base64',
                            ContentType: contentType,
                            ACL: 'public-read'
                        };

                        await S3.upload(params, async (error, data) => {
                            if (error) {
                                isErr = true;
                                return error;
                            }
                            try {
                                let sql = "INSERT INTO partnerinvoice(partnerId,url,loanDetailId,partnerCommissionHistoryId,invoiceNumber,createdBy,modifiedBy) VALUES (" + req.body.partnerId + ",'" + data.Location + "'," + req.body.loanDetailId + "," + req.body.partnerCommissionId + "," + pdfRes.invoiceNumber + "," + authorizationResult.currentUser.id + "," + authorizationResult.currentUser.id + ")"
                                let invoiceResult = await query(sql);
                                if (invoiceResult) {
                                    data = {
                                        "invoiceUrl": data.Location
                                    }
                                    let successResult = new ResultSuccess(200, true, 'Insert Payout Release', data, 1);
                                    console.log(successResult);
                                    return res.status(200).send(successResult);
                                }
                            } catch (error) {
                                let errorResult = new ResultError(400, true, "Error While Inserting Partner Payout", result, '');
                                next(errorResult);
                            }
                        });
                    }

                } else {
                    let errorResult = new ResultError(400, true, "Error While Inserting Partner Payout", result, '');
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
        let errorResult = new ResultError(500, true, 'payout.payoutRelease() Exception', error, '');
        next(errorResult);
    }
};

const printPdf = async (req) => {
    try {
        let sql = "SELECT partners.fullName,partners.permanentCode,partners.panCardNo,partners.gstNo,partneraddress.label,partneraddress.addressLine1,partneraddress.addressLine2,partneraddress.cityId,partneraddress.pincode,cities.name as cityName,districts.name as districtName,states.name as stateName,users.email FROM partners ";
        sql += " LEFT JOIN partneraddress ON partneraddress.partnerId = partners.id ";
        sql += " LEFT JOIN cities ON cities.id = partneraddress.cityId";
        sql += " LEFT JOIN districts ON districts.id = cities.districtId";
        sql += " LEFT JOIN states ON states.id = districts.stateId";
        sql += " LEFT JOIN users ON partners.userId = users.id"
        sql += " WHERE partners.id = ?";
        let partnerResult = await query(sql, req.partnerId);
        console.log(partnerResult);

        let adminSql = "SELECT systemflags.name,systemflags.value FROM systemflags WHERE flagGroupId = 2 OR 3";
        let adminResult = await query(adminSql);

        let lastInvoice = new Date().getFullYear() + ("0" + (new Date().getMonth() + 1)).slice(-2) + ("0" + new Date().getDate()).slice(-2) + req.count;
        let invoiceDate = ("0" + new Date().getDate()).slice(-2) + "/" + ("0" + (new Date().getMonth() + 1)).slice(-2) + new Date().getFullYear()
        const today = new Date()
        let month = today.toLocaleString('default', { month: 'short' }) + "/" + new Date().getFullYear()
        let IGST = adminResult.find(c => c.name == 'IGST').value ? (req.commission * adminResult.find(c => c.name == 'IGST').value) / 100 : 0;
        let CGST = adminResult.find(c => c.name == 'CGST').value ? (req.commission * adminResult.find(c => c.name == 'CGST').value) / 100 : 0;
        let SGST = adminResult.find(c => c.name == 'SGST').value ? (req.commission * adminResult.find(c => c.name == 'SGST').value) / 100 : 0;
        let gstNo = partnerResult[0].gstNo ? partnerResult[0].gstNo : '';
        let email = partnerResult[0].email ? partnerResult[0].email : '';
        let addressLine2 = partnerResult[0].addressLine2 ? partnerResult[0].addressLine2 : '';
        let adminGstno = adminResult.find(c => c.name == 'gst').value ? adminResult.find(c => c.name == 'gst').value : '';
        let HsnNo = adminResult.find(c => c.name == 'HSNNo').value ? adminResult.find(c => c.name == 'HSNNo').value : ''
        let adminIGST = adminResult.find(c => c.name == 'IGST').value ? adminResult.find(c => c.name == 'IGST').value : 0
        let adminCGST = adminResult.find(c => c.name == 'CGST').value ? adminResult.find(c => c.name == 'CGST').value : 0
        let adminSGST = adminResult.find(c => c.name == 'SGST').value ? adminResult.find(c => c.name == 'SGST').value : 0

        let total = (req.commission + IGST + CGST + SGST).toFixed(2);
        var words = convertRupeesIntoWords(parseInt(total));
        console.log(words);

        let result;
        var htmlContent = '';
        htmlContent += '<!DOCTYPE html>';
        htmlContent += '<html>';
        htmlContent += '<head>';
        htmlContent += '<style>';
        htmlContent += ' table, th, td {border: 1px solid black;border-collapse: collapse;padding:5px;}'
        htmlContent += 'td:first-child {text-align:center}'
        htmlContent += '    </style>';
        htmlContent += '</head>';
        htmlContent += '<body style="margin:30px;margin-top:0px;">';
        htmlContent += '<p style="text-align:center;font-size: 10px;font-family:arial">Tax Invoice</p>'
        htmlContent += '<div class="row">'
        htmlContent += '<table style="width:100%">'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">Vendor code</td><td style="font-size: 10px;font-family:arial">' + partnerResult[0].permanentCode + '</td><td style="text-align:center;font-size: 10px;font-family:arial">InvoiceNumber</td><td  style="font-size: 10px;font-family:arial">' + lastInvoice + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">Product</td><td style="font-size: 10px;font-family:arial">' + req.serviceName + '</td><td style="text-align:center;font-size: 10px;font-family:arial">InvoiceDate</td><td  style="font-size: 10px;font-family:arial">' + invoiceDate + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">SupplierNo</td><td style="font-size: 10px;font-family:arial">3691 </td><td style="text-align:center;font-size: 10px;font-family:arial">Month of Business</td><td style="font-size: 10px;font-family:arial">' + month + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR NAME </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + partnerResult[0].fullName + ' </td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR ADDRESS </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + partnerResult[0].label + "," + partnerResult[0].addressLine1 + "," + addressLine2 + "," + partnerResult[0].cityName + "," + partnerResult[0].districtName + "," + partnerResult[0].stateName + "," + partnerResult[0].pincode + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">VENDOR Email </td><td colspan="3" style="font-size: 10px;font-family:arial">' + email + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">GST IN </td><td style="font-size: 10px;font-family:arial">' + gstNo + '</td> <td style="font-size: 10px;font-family:arial">PAN OF THE SUPPLIER </td> <td style="font-size: 10px;font-family:arial">' + partnerResult[0].panCardNo + ' </td></tr>'
        htmlContent += '<tr ><td style="font-size: 10px;font-family:arial">STATE NAME  </td><td style="font-size: 10px;font-family:arial">' + partnerResult[0].stateName + '</td> <td style="font-size: 10px;font-family:arial">STATE CODE </td>  <td style="font-size: 10px;font-family:arial">08 </td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">BRANCH NAME </td><td colspan ="3" style="text-align:center;font-size: 10px;font-family:arial">Jaipur  </td></tr>'
        htmlContent += '</table></div>'
        htmlContent += '<div class="row" style="margin-top:10px;width:100%">'
        console.log(adminResult.find(c => c.name == 'name'));

        htmlContent += '<table style="width:100%"><tr ><td style="font-size: 10px;font-family:arial">BUYER </td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'name').value + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">ADDRESS</td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'address').value + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">GSTIN </td><td style="font-size: 10px;font-family:arial">' + adminGstno + '  </td><td style="text-align:center;font-size: 10px;font-family:arial">PAN</td><td style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'panCardNo').value + '</td></tr>'
        htmlContent += '<tr><td style="font-size: 10px;font-family:arial">PLACE OF SUPPLY</td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial">Jaipur </td></tr>'
        console.log("GSTSUCCESS")
        htmlContent += '</table></div>'
        htmlContent += '<div class="row" style="margin-top:10px;">'
        htmlContent += '<table style="width:100%"><thead> <tr> <td style="font-size: 10px;font-family:arial">Sl.No</td> <td colspan="3" style="font-size: 10px;font-family:arial">Description of service</td> <td style="font-size: 10px;font-family:arial">HSN/NAC</td><td style="font-size: 10px;font-family:arial">GST</td> <td style="font-size: 10px;font-family:arial">Rate</td> <td style="font-size: 10px;font-family:arial">Per</td> <td style="font-size: 10px;font-family:arial">Amount</td> </thead>'
        htmlContent += '<tbody><tr><td style="font-size: 10px;font-family:arial">1</td><td colspan="3" style="font-size: 10px;font-family:arial">DSA Sales Commission</td><td style="font-size: 10px;font-family:arial">' + HsnNo + '</td> <td></td> <td></td> <td></td> <td style="font-size: 10px;font-family:arial">' + req.commission + '</td>  </tr>'
        htmlContent += '<tr><td></td><td colspan="3"></td><td></td><td style="font-size: 10px;font-family:arial">IGST</td> <td style="font-size: 10px;font-family:arial">' + adminIGST + '</td> <td></td> <td style="font-size: 10px;font-family:arial">' + IGST + '</td> </tr>'
        htmlContent += '<tr><td></td><td colspan="3"></td> <td></td> <td style="font-size: 10px;font-family:arial">CGST</td>  <td style="font-size: 10px;font-family:arial">' + adminCGST + '</td>  <td></td>  <td style="font-size: 10px;font-family:arial">' + CGST + '</td>  </tr>'
        htmlContent += '<tr><td></td><td colspan="3"></td> <td></td> <td style="font-size: 10px;font-family:arial">SGST</td> <td style="font-size: 10px;font-family:arial">' + adminSGST + '</td> <td></td> <td style="font-size: 10px;font-family:arial">' + SGST + '</td></tr>'
        // htmlContent += '<tr><td></td><td colspan="3"></td><td></td><td>UGST</td><td>0%</td><td></td><td>0</td></tr>'
        htmlContent += '<tr><td colspan="8" style="text-align:right;font-size: 10px;font-family:arial">Total</td><td style="font-size: 10px;font-family:arial">' + total + '</td></tr>'
        htmlContent += '<tr><td colspan="4" style="font-size: 10px;font-family:arial">Amount Chargeable in words</td><td colspan="5" style="font-size: 10px;font-family:arial">' + words + '</td></tr>'
        htmlContent += '<tr><td colspan="9" style="text-align:right;font-size: 10px;font-family:arial">E & OE</td></tr>'
        htmlContent += '<tr><td colspan="9" style="text-align:center;font-size: 10px;font-family:arial">Company Bank Detail</td></tr>'
        htmlContent += '<tr><td colspan="6" style="text-align:center;font-size: 10px;font-family:arial">Bank Name</td><td colspan="3" style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'bankName').value + ' </td></tr>'
        htmlContent += '<tr><td colspan="6" style="text-align:center;font-size: 10px;font-family:arial">Bank Account Number</td><td style="font-size: 10px;font-family:arial">' + adminResult.find(c => c.name == 'bankAccountNumber').value + '</td><td style="font-size: 10px;font-family:arial">Branch & IFSC Code</td><td style="font-size: 10px;font-family:arial"> ' + adminResult.find(c => c.name == 'ifscCode').value + '</td></tr>'
        htmlContent += '<tr><td colspan="6" style="text-align:left;font-size: 10px;font-family:arial"><u>Declaration</u><br><p>We declare that this invoice shows the actual price of the goods & service described and that all particulars are true and correct</p></td><td colspan="3" style="text-align:center;font-size: 10px;font-family:arial"><span style="margin-top:10px">Authorized Signatory</span></td></tr>'
        htmlContent += '</tbody></table></div>'
        htmlContent += '</body>'
        htmlContent += '</html>'
        console.log("SUCCESS")
        // var pdfOptions = {
        // };
        // var createPDF = util.promisify(pdf.create).bind(pdf);
        // var pdfFile = await createPDF(htmlContent, pdfOptions);
        // var pdfString = fs.readFileSync(pdfFile.filename, { encoding: 'base64' });
        // result = pdfString;
        let options = { format: 'A4' };
        let file = { content: htmlContent };
        let buffer;
        await pdf.generatePdf(file, options).then(pdfBuffer => {
            buffer = pdfBuffer
        });
        let data = {
            "pdfString": buffer,
            "invoiceNumber": lastInvoice,
            "partnerId": req.partnerId
        }
        return data;

    } catch (error) {
        return error;
    }
}

export default { getpartnerPayout, payoutRelease }