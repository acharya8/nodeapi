"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const lead_1 = __importDefault(require("../../controllers/website/lead"));
const router = express_1.default.Router();
// #region /api/web/leads/getLeadsByContactNoAndServiceId apidoc
/**
 * @api {post} /api/web/leads/getLeadsByContactNoAndServiceId Get Leads By ContactNo And ServiceId
 * @apiVersion 1.0.0
 * @apiName Get Leads By ContactNo And ServiceId
 * @apiDescription Get Leads By ContactNo And ServiceId
 * @apiGroup Leads - WebSite
 * @apiParam  {String}          contactNo               Requires contactNo.
 * @apiParam  {Integer}         serviceId               Requires service Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Leads By ContactNo And ServiceId',
 *          recordList: Leads,
 *          totalRecords: TotalRecords
 *     }
 * @apiError (500) {JSON} Result message, apiName, apiType, fileName, functionName, lineNumber, typeName, stack.
 * @apiErrorExample {json} Error-500-Response:
 *     HTTP/1.1 500 ERROR
 *     {
 *          status: <error status code>,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: <error message>,
 *          error: {
 *              apiName: <api name>,
 *              apiType: <api type>,
 *              fileName: <file name>,
 *              functionName: <function name>,
 *              lineNumber: <line number>,
 *              typeName: <type name>,
 *              stack: <stack>
 *          },
 *          value: <value if any>
 *     }
 */
// #endregion
router.post('/getLeadsByContactNoAndServiceId', lead_1.default.getLeadsByContactNoAndServiceId);
// #region /api/web/leads/insertLeads apidoc
/**
 * @api {post} /api/web/leads/insertLeads Insert Lead
 * @apiVersion 1.0.0
 * @apiName Insert Lead
 * @apiDescription Insert Lead
 * @apiGroup Leads - WebSite
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         serviceId               Requires Service Id.
 * @apiParam  {Decinal}         loanAmount              Requires Loan Amount.
 * @apiParam  {String}          customerFullName        Requires Customer Full Name.
 * @apiParam  {Integer}         cityId                  Requires service City Id.
 * @apiParam  {String}          email                   Requires Email Of Customer.
 * @apiParam  {Integer}         [userId]                Optional User Id.
 * @apiParam  {Integer}         [addressTypeId]         Optional Address Type Id.
 * @apiParam  {String}          [panCardNo]             Optional PAN Card No.
 * @apiParam  {String}          [aadhaarCardNo]         Optional Aadhar Card No.
 * @apiParam  {Integer}         [primaryBankId]         Optional Bank Id.
 * @apiParam  {Integer}         [employmentTypeId]      Optional Employment Type Id.
 * @apiParam  {String}          [loanPurpose]           Optional Loan Purpose.
 * @apiParam  {Integer}         [degreeId]              Optional Degree Id.
 * @apiParam  {Integer}         [courseId]              Optional Course Id.
 * @apiParam  {Integer}         [studiedCountryId]      Optional Studied Country Id.
 * @apiParam  {String}          [countryCode]           Optional Country Code.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Lead',
 *          recordList: Leads,
 *          totalRecords: TotalRecords
 *     }
 * @apiError (500) {JSON} Result message, apiName, apiType, fileName, functionName, lineNumber, typeName, stack.
 * @apiErrorExample {json} Error-500-Response:
 *     HTTP/1.1 500 ERROR
 *     {
 *          status: <error status code>,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: <error message>,
 *          error: {
 *              apiName: <api name>,
 *              apiType: <api type>,
 *              fileName: <file name>,
 *              functionName: <function name>,
 *              lineNumber: <line number>,
 *              typeName: <type name>,
 *              stack: <stack>
 *          },
 *          value: <value if any>
 *     }
 */
// #endregion
router.post('/insertLeads', lead_1.default.insertLeads);
// #region /api/web/leads/updateLeads apidoc
/**
 * @api {post} /api/web/leads/updateLeads Update Lead
 * @apiVersion 1.0.0
 * @apiName Update Lead
 * @apiDescription Update Lead
 * @apiGroup Leads - WebSite
 * @apiParam  {Integer}         id                      Requires Lead Id.
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         serviceId               Requires Service Id.
 * @apiParam  {Decinal}         loanAmount              Requires Loan Amount.
 * @apiParam  {String}          customerFullName        Requires Customer Full Name.
 * @apiParam  {Integer}         cityId                  Requires service City Id.
 * @apiParam  {String}          email                   Requires Email Of Customer.
 * @apiParam  {Integer}         [userId]                Optional User Id.
 * @apiParam  {String}          [panCardNo]             Optional PAN Card No.
 * @apiParam  {String}          [aadhaarCardNo]         Optional Aadhar Card No.
 * @apiParam  {Integer}         [primaryBankId]         Optional Bank Id.
 * @apiParam  {Integer}         [employmentTypeId]      Optional Employment Type Id.
 * @apiParam  {String}          [loanPurpose]           Optional Loan Purpose.
 * @apiParam  {Integer}         [degreeId]              Optional Degree Id.
 * @apiParam  {Integer}         [courseId]              Optional Course Id.
 * @apiParam  {Integer}         [studiedCountryId]      Optional Studied Country Id.
 * @apiParam  {Integer}         [experiance]            Optional Address Type Id.
 * @apiParam  {Integer}         [annualIncome]          Optional Address Type Id.
 * @apiParam  {Integer}         [monthlyIncome]         Optional Address Type Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Lead',
 *          recordList: Leads,
 *          totalRecords: TotalRecords
 *     }
 * @apiError (500) {JSON} Result message, apiName, apiType, fileName, functionName, lineNumber, typeName, stack.
 * @apiErrorExample {json} Error-500-Response:
 *     HTTP/1.1 500 ERROR
 *     {
 *          status: <error status code>,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: <error message>,
 *          error: {
 *              apiName: <api name>,
 *              apiType: <api type>,
 *              fileName: <file name>,
 *              functionName: <function name>,
 *              lineNumber: <line number>,
 *              typeName: <type name>,
 *              stack: <stack>
 *          },
 *          value: <value if any>
 *     }
 */
// #endregion
router.post('/updateLeads', lead_1.default.updateLeads);
module.exports = router;
