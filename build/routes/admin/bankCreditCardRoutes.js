"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const bankCreditCard_1 = __importDefault(require("../../controllers/admin/bankCreditCard"));
const router = express_1.default.Router();
// #region /api/admin/bankCreditCard/insertUpdateBankCreditCard apidoc
/**
 * @api {post} /api/admin/bankCreditCard/insertUpdateBankCreditCard Insert Update Bank CreditCard
 * @apiVersion 1.0.0
 * @apiName Insert Update Bank CreditCard
 * @apiDescription Insert Update Bank CreditCard
 * @apiGroup Bank CreditCard - Admin
 * @apiParam  {Number}          bankId                      Requires bankId
 * @apiParam  {String}          creditCardName              Requires Credit Card Name
 * @apiParam  {String}          benifitDescription          Requires Benifit Description
 * @apiParam  {String}          keyFeatures                 Requires Key Features
 * @apiParam  {Number}          [id]                        Optional Bank Credit Id
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
router.post('/insertUpdateBankCreditCard', bankCreditCard_1.default.insertUpdateBankCreditCard);
// #region /api/admin/bankCreditCard/getBankCreditCard apidoc
/**
 * @api {post} /api/admin/bankCreditCard/getBankCreditCard Get Bank CreditCard
 * @apiVersion 1.0.0
 * @apiName Get Bank CreditCard
 * @apiDescription Get Bank CreditCard
 * @apiGroup Bank CreditCard - Admin
 * @apiParam  {Number}          [bankId]                    Optional bankId
 * @apiParam  {Number}          [startIndex]                Optional startIndex
 * @apiParam  {Number}          [fetchRecords]              Optional FetchRecords
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Bank CreditCard',
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
router.post('/getBankCreditCard', bankCreditCard_1.default.getBankCreditCard);
module.exports = router;
