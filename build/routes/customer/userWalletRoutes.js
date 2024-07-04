"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const userWallet_1 = __importDefault(require("../../controllers/customer/userWallet"));
const router = express_1.default.Router();
// #region /api/customer/userWallets/getUsersWallet apidoc
/**
 * @api {post} /api/customer/userWallets/getUsersWallet Get User Wallet
 * @apiVersion 1.0.0
 * @apiName Get User Wallet
 * @apiDescription Get User Wallet
 * @apiGroup User Wallet - Customer
 * @apiParam  {Integer}             [startIndex]                Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get User Wallet',
 *          recordList: Get User Wallet,
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
router.post('/getUsersWallet', userWallet_1.default.getUsersWallet);
// #region /api/customer/userWallets/getUsersWalletHistory apidoc
/**
 * @api {post} /api/customer/userWallets/getUsersWalletHistory Get User Wallet History
 * @apiVersion 1.0.0
 * @apiName Get User Wallet History
 * @apiDescription Get User Wallet History
 * @apiGroup User Wallet - Customer
 * @apiParam  {Integer}             userWalletId                Required User Wallet Id.
 * @apiParam  {Integer}             [startIndex]                Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get User Wallet History',
 *          recordList: Get User Wallet History,
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
router.post('/getUsersWalletHistory', userWallet_1.default.getUsersWalletHistory);
module.exports = router;
