"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const businessAnnualProfits_1 = __importDefault(require("../../controllers/admin/businessAnnualProfits"));
const router = express_1.default.Router();
// #region /api/admin/businessAnnualProfit/getBusinessAnnualProfits apidoc
/**
 * @api {post} /api/admin/businessAnnualProfit/getBusinessAnnualProfits Get BusinessAnnual Profit
 * @apiVersion 1.0.0
 * @apiName Get BusinessAnnual Profit
 * @apiDescription Get BusinessAnnual Profit
 * @apiGroup BusinessAnnual Profit - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get BusinessAnnual Profit',
 *          recordList: BusinessAnnual Profit,
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
router.post('/getBusinessAnnualProfits', businessAnnualProfits_1.default.getBusinessAnnualProfits);
// #region /api/admin/businessAnnualProfit/insertBusinessAnnualProfit apidoc
/**
 * @api {post} /api/admin/businessAnnualProfit/insertBusinessAnnualProfit insert BusinessAnnual Profit
 * @apiVersion 1.0.0
 * @apiName insert BusinessAnnual Profit
 * @apiDescription insert BusinessAnnual Profit
  * @apiGroup BusinessAnnual Profit - Admin
 * @apiParam  {String}          name                Requires name of BusinessAnnual Profit
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert BusinessAnnual Profit',
 *          recordList: BusinessAnnual Profit,
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
router.post('/insertBusinessAnnualProfit', businessAnnualProfits_1.default.insertBusinessAnnualProfit);
// #region /api/admin/businessAnnualProfit/updateBusinessAnnualProfit apidoc
/**
 * @api {post} /api/admin/businessAnnualProfit/updateBusinessAnnualProfit update BusinessAnnual Profit
 * @apiVersion 1.0.0
 * @apiName UpdateBusinessAnnual Profit
 * @apiDescription Update BusinessAnnual Profit
  * @apiGroup BusinessAnnual Profit - Admin
 * @apiParam  {String}          name                Requires name of BusinessAnnual Profit.
 * @apiParam  {Integer}         id                  Requires BusinessAnnual Profit Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update BusinessAnnual Profit',
 *          recordList: BusinessAnnual Profit,
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
router.post('/updateBusinessAnnualProfit', businessAnnualProfits_1.default.updateBusinessAnnualProfit);
// #region /api/admin/businessAnnualProfit/activeInactiveBusinessAnnualProfit apidoc
/**
 * @api {post} /api/admin/businessAnnualProfit/activeInactiveBusinessAnnualProfit Change BusinessAnnual Profit
 * @apiVersion 1.0.0
 * @apiName Change BusinessAnnual Profit Status
 * @apiDescription Change BusinessAnnual Profit Status
 * @apiGroup BusinessAnnual Profit - Admin
 * @apiParam  {Integer}         id                  Requires BusinessAnnual Profit Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change BusinessAnnual Profit Status',
 *          recordList: BusinessAnnual Profit,
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
router.post('/activeInactiveBusinessAnnualProfit', businessAnnualProfits_1.default.activeInActiveBusinessAnnualProfit);
module.exports = router;
