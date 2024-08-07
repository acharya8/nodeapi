"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const leads_1 = __importDefault(require("../../controllers/customer/leads"));
const router = express_1.default.Router();
// #region /api/customer/leads/insertUpdateLeads apidoc
/**
 * @api {post} /api/customer/leads/insertUpdateLeads Insert/Update Leads
 * @apiVersion 1.0.0
 * @apiName Insert/Update Leads
 * @apiDescription Insert/Update Leads
 * @apiGroup Leads - Customer
 * @apiParam  {Integer}             [leadId]                                Optional Lead Id.
 * @apiParam  {String}              contactNo                               Requires Contact No.
 * @apiParam  {String}              customerFullName                        Requires Customer Name.
 * @apiParam  {String}              email                                   Requires Customer Email Id.
 * @apiParam  {Integer}             serviceId                               Requires Service Id. Ex 1 For Personal Loan
 * @apiParam  {Integer}             loanAmount                              Requires Loan Amount.
 * @apiParam  {Integer}             employmentTypeId                        Requires Employment Id.
 * @apiParam  {Integer}             cityId                                  Requires cityId.
 * @apiParam  {String}              pincode                                 Requires pincode.
 * @apiParam  {String}              aadhaarCardNo                           Requires Aadhaar Card No.
 * @apiParam  {String}              panCardNo                               Requires PAN Card No.
 * @apiParam  {Integer}             [customerAddressId]                     Optional customer Address Id.
 * @apiParam  {Integer}             [label]                                 Optional Address Label.
 * @apiParam  {Integer}             [addressLine1]                          Optional Address Line 1.
 * @apiParam  {Integer}             [addressLine2]                          Optional Address Line 2.
 * @apiParam  {Integer}             [city]                                  Optional City Name.
 * @apiParam  {Integer}             [district]                              Optional District Name.
 * @apiParam  {Integer}             [state]                                 Optional State Name.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Leads',
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
router.post('/insertUpdateLeads', leads_1.default.insertUpdateLeads);
// #region /api/customer/leads/getLeadGeneratedByUserId apidoc
/**
 * @api {post} /api/customer/leads/getLeadGeneratedByUserId Getting Leads Generated By Users
 * @apiVersion 1.0.0
 * @apiName Getting Leads Generated By Users
 * @apiDescription Getting Leads Generated By Users
 * @apiGroup Leads - Customer
 * @apiParam  {Array}               userIds                                 Requires Array Of UserId.
 * @apiParam  {Integer}             [startIndex]                            Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]                          Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Getting Leads Generated By Users',
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
router.post('/getLeadGeneratedByUserId', leads_1.default.getLeadGeneratedByUserId);
// #region /api/customer/leads/getLeadGeneratedByNetworkAndTeamUsers apidoc
/**
 * @api {post} /api/customer/leads/getLeadGeneratedByNetworkAndTeamUsers Getting Leads Generated By Users
 * @apiVersion 1.0.0
 * @apiName Getting Leads Generated By Users
 * @apiDescription Getting Leads Generated By Users
 * @apiGroup Leads - Customer
 * @apiParam  {Array}               partnerId                               Requires Array Of UserId.
 * @apiParam  {Integer}             [startIndex]                            Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]                          Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Getting Leads Generated By Users',
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
router.post('/getLeadGeneratedByNetworkAndTeamUsers', leads_1.default.getLeadGeneratedByNetworkAndTeamUsers);
// #region /api/customer/leads/getLeadAssignByPartnerId apidoc
/**
 * @api {post} /api/customer/leads/getLeadAssignByPartnerId Getting Leads Generated By Users
 * @apiVersion 1.0.0
 * @apiName Getting Leads Generated By Users
 * @apiDescription Getting Leads Generated By Users
 * @apiGroup Leads - Customer
 * @apiParam  {Array}               partnerId                               Requires Array Of UserId.
 * @apiParam  {Integer}             [startIndex]                            Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]                          Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Getting Leads Generated By Users',
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
router.post('/getLeadAssignByPartnerId', leads_1.default.getLeadAssignByPartnerId);
// #region /api/customer/leads/assignToPartner apidoc
/**
 * @api {post} /api/customer/leads/assignToPartner Assign To Partner
 * @apiVersion 1.0.0
 * @apiName Assign To Partner Leads
 * @apiDescription Assign To Partner Leads
 * @apiGroup Leads - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Assign To Partner Leads',
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
router.post('/assignToPartner', leads_1.default.assignToPartner);
// #region /api/customer/leads/getLeadListAssignByPartnerToNetwork apidoc
/**
 * @api {post} /api/customer/leads/getLeadListAssignByPartnerToNetwork Assign To Partner
 * @apiVersion 1.0.0
 * @apiName Assign To Partner Leads
 * @apiDescription Assign To Partner Leads
 * @apiGroup Leads - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Assign To Partner Leads',
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
router.post('/getLeadListAssignByPartnerToNetwork', leads_1.default.getLeadListAssignByPartnerToNetwork);
// #region /api/customer/leads/getAssignedLeadListOfNetwork apidoc
/**
 * @api {post} /api/customer/leads/getAssignedLeadListOfNetwork Getting Leads Generated By Users
 * @apiVersion 1.0.0
 * @apiName Getting Leads Generated By Users
 * @apiDescription Getting Leads Generated By Users
 * @apiGroup Leads - Customer
 * @apiParam  {Array}               partnerId                               Requires Array Of UserId.
 * @apiParam  {Integer}             [startIndex]                            Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]                          Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Getting Leads Generated By Users',
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
router.post('/getAssignedLeadListOfNetwork', leads_1.default.getAssignedLeadListOfNetwork);
// #region /api/customer/leads/deletelead apidoc
/**
 * @api {post} /api/customer/leads/deletelead Assign To Partner
 * @apiVersion 1.0.0
 * @apiName Delete Leads
 * @apiDescription Partner Delete Leads
 * @apiGroup Leads - Admin
 * @apiParam  {Integer}               leadId                               Requires leadId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Assign To Partner Leads',
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
router.post('/deletelead', leads_1.default.deletelead);
module.exports = router;
