"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("../../controllers/customer/users"));
const router = express_1.default.Router();
// #region /api/customer/users/clientVerifyContact apidoc
/**
 * @api {post} /api/customer/users/clientVerifyContact client Verify Contact
 * @apiVersion 1.0.0
 * @apiName Customer Verify Contact No
 * @apiDescription Customer Verify Contact No
 * @apiGroup User - Customer
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {String}          [countryCode]           Requires Countery Code.
 * @apiParam  {String}          [email]                 Requires Email.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Customer Verify Contact No',
 *          recordList: User,
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
router.post('/clientVerifyContact', users_1.default.clientVerifyContact);
// #region /api/customer/users/checkContactNoExist apidoc
/**
 * @api {post} /api/customer/users/checkContactNoExist Check Contact No Exist
 * @apiVersion 1.0.0
 * @apiName Check Contact No Exist
 * @apiDescription Check Contact No Exist
 * @apiGroup User - Customer
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Check Contact No Exist',
 *          recordList: User,
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
router.post('/checkContactNoExist', users_1.default.checkContactNoExist);
// #region /api/customer/users/validateSessionToken apidoc
/**
 * @api {post} /api/customer/users/validateSessionToken Validate User By Session Token
 * @apiVersion 1.0.0
 * @apiName Validate User By Session Token
 * @apiDescription Validate User By Session Token
 * @apiGroup User - Customer
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Validate User By Session Token',
 *          recordList: User,
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
router.post('/validateSessionToken', users_1.default.validateSessionToken);
// #region /api/customer/users/updateCustomerDetail apidoc
/**
 * @api {post} /api/customer/users/updateCustomerDetail Update Customer Detail
 * @apiVersion 1.0.0
 * @apiName Update Customer Detail
 * @apiDescription Update Customer Detail
 * @apiGroup User - Customer
 * @apiParam  {Integer}         userId                      Requires User Id.
 * @apiParam  {Integer}         customerId                  Requires Customer Id.
 * @apiParam  {String}          [fullName]                  Optional Customer Full Name.
 * @apiParam  {Date}            [birthdate]                 Optional Customer Birth Date.
 * @apiParam  {String}          [panCardNo]                 Optional Pan Card No.
 * @apiParam  {String}          [alternativeContactNo]      Optional Alternative Contact No.
 * @apiParam  {String}          [gender]                    Optional Gender.
 * @apiParam  {Integer}         [maritalStatusId]           Optional Customer Marital Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Customer Detail',
 *          recordList: User,
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
router.post('/updateCustomerDetail', users_1.default.updateCustomerDetail);
// #region /api/customer/users/updateCustomerProfile apidoc
/**
 * @api {post} /api/customer/users/updateCustomerProfile Update Customer Detail
 * @apiVersion 1.0.0
 * @apiName Update Customer Detail
 * @apiDescription Update Customer Detail
 * @apiGroup User - Customer
 * @apiParam  {Integer}         userId                      Requires User Id.
 * @apiParam  {Integer}         customerId                  Requires Customer Id.
 * @apiParam  {String}          fullName                    Requires Customer Full Name.
 * @apiParam  {Date}            birthdate                   Requires Customer Birth Date.
 * @apiParam  {String}          panCardNo                   Requires Pan Card No.
 * @apiParam  {String}          aadhaarCardNo               Requires AadharCard No.
 * @apiParam  {String}          contactNo                   Requires Contact No.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Customer Detail',
 *          recordList: User,
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
router.post('/updateCustomerProfile', users_1.default.updateCustomerProfile);
// #region /api/customer/users/insertRequestForBecomePartner apidoc
/**
 * @api {post} /api/customer/users/insertRequestForBecomePartner Insert request for become a partner
 * @apiVersion 1.0.0
 * @apiName Insert request for become a partner
 * @apiDescription Insert request for become a partner
 * @apiGroup User - Customer
 * @apiParam  {Integer}         userId                      Requires User Id.
 * @apiParam  {Integer}         customerId                  Requires Customer Id.
 * @apiParam  {String}          fullName                    Requires Customer Full Name.
 * @apiParam  {Date}            birthdate                   Requires Customer Birth Date.
 * @apiParam  {String}          panCardNo                   Requires Pan Card No.
 * @apiParam  {String}          aadhaarCardNo               Requires AadharCard No.
 * @apiParam  {String}          contactNo                   Requires Contact No.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert request for become a partner',
 *          recordList: User,
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
router.post('/insertRequestForBecomePartner', users_1.default.insertRequestForBecomePartner);
// #region /api/customer/users/checkStatusForBecomeapartner apidoc
/**
 * @api {post} /api/customer/users/checkStatusForBecomeapartner Check Status for become a partner
 * @apiVersion 1.0.0
 * @apiName Check Status for become a partner
 * @apiDescription Insert Check Status for become a partner
 * @apiGroup User - Customer

 * @apiParam  {Integer}         customerId                  Requires Customer Id.

 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Check Status for become a partner',
 *          recordList: User,
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
router.post('/checkStatusForBecomeapartner', users_1.default.checkStatusForBecomeapartner);
module.exports = router;
