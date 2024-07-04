"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const otherLoan_1 = __importDefault(require("../../controllers/admin/otherLoan"));
const router = express_1.default.Router();
// #region /api/admin/otherLoan/getOtherLoan apidoc
/**
 * @api {post} /api/admin/otherLoan/getOtherLoan Get Other Loan
 * @apiVersion 1.0.0
 * @apiName Get Other Loan
 * @apiDescription Get Other Loan
 * @apiGroup Other Loan - Admin
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Other Loan ',
 *          recordList: Other Loan ,
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
router.post('/getOtherLoan', otherLoan_1.default.getOtherLoan);
// #region /api/admin/otherLoan/insertUpdateOtherLoanDetail apidoc
/**
 * @api {post} /api/admin/otherLoan/insertUpdateOtherLoanDetail insert Other Loan
 * @apiVersion 1.0.0
 * @apiName insert/Update Other Loan
 * @apiDescription insert Other Loan
 * @apiGroup Other Loan - Admin
 * @apiParam  {Integer}             rewardTypeId                Requires Reward Type Id.
 * @apiParam  {String}              name                        Requires Reward Coin.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Other Loan',
 *          recordList: Other Loan,
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
router.post('/insertUpdateOtherLoanDetail', otherLoan_1.default.insertUpdateOtherLoanDetail);
module.exports = router;
