"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const bankCreditCardPolicy_1 = __importDefault(require("../../controllers/admin/bankCreditCardPolicy"));
const router = express_1.default.Router();
// #region /api/admin/bankCreditCardPolicy/insertUpdateBankCreditCardPolicy apidoc
/**
 * @api {post} /api/admin/bankCreditCardPolicy/insertUpdateBankCreditCardPolicy Insert Update Bank CreditCard Policy
 * @apiVersion 1.0.0
 * @apiName Insert Update Bank CreditCard Policy
 * @apiDescription Insert Update Bank CreditCard Policy
 * @apiGroup Bank CreditCard Policy - Admin
 * @apiParam  {Number}          bankCreditCardId                    Requires Bank Credit Card Id
 * @apiParam  {Number}          employmentTypeId                    Requires Employment Type Id
 * @apiParam  {Number}          minimumCibilScore                   Requires Minimum Cibil Score
 * @apiParam  {Number}          minAge                              Requires Min Age
 * @apiParam  {Number}          maxAge                              Requires Max Age
 * @apiParam  {Number}          minIncome                           Requires Min Income
 * @apiParam  {Number}          companyCategoryTypeId               Requires Company Category Type Id
 * @apiParam  {Number}          [id]                                Optional Bank Credit Card Policy Id
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Update Bank CreditCard',
 *          recordList: Bank CreditCard,
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
router.post('/insertUpdateBankCreditCardPolicy', bankCreditCardPolicy_1.default.insertUpdateBankCreditCardPolicy);
// #region /api/admin/bankCreditCardPolicy/getBankCreditCardPolicy apidoc
/**
 * @api {post} /api/admin/bankCreditCardPolicy/getBankCreditCardPolicy Get Bank CreditCard Policy
 * @apiVersion 1.0.0
 * @apiName Get Bank CreditCard Policy
 * @apiDescription Get Bank CreditCard Policy
 * @apiGroup Bank CreditCard Policy - Admin
 * @apiParam  {Number}          [startIndex]                Optional startIndex
 * @apiParam  {Number}          [fetchRecords]              Optional FetchRecords
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Bank CreditCard Policy',
 *          recordList: Bank CreditCard Policy,
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
router.post('/getBankCreditCardPolicy', bankCreditCardPolicy_1.default.getBankCreditCardPolicy);
// #region /api/admin/bankCreditCardPolicy/getBankCreditCardPolicy apidoc
/**
 * @api {post} /api/admin/bankCreditCardPolicy/getBankCreditCardPolicy Get Bank CreditCard Policy
 * @apiVersion 1.0.0
 * @apiName Get Bank CreditCard Policy
 * @apiDescription Get Bank CreditCard Policy
 * @apiGroup Bank CreditCard Policy - Admin
 * @apiParam  {Number}          [startIndex]                Optional startIndex
 * @apiParam  {Number}          [fetchRecords]              Optional FetchRecords
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Bank CreditCard Policy',
 *          recordList: Bank CreditCard Policy,
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
router.post('/getCompanyCategoryType', bankCreditCardPolicy_1.default.getCompanyCategoryType);
module.exports = router;
