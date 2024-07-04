"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const orders_1 = __importDefault(require("../../controllers/customer/orders"));
const router = express_1.default.Router();
// #region /api/customer/orders/insertUpdateOrders apidoc
/**
 * @api {post} /api/customer/orders/insertUpdateOrders Insert Update Orders
 * @apiVersion 1.0.0
 * @apiName Insert Update Orders
 * @apiDescription Insert Update Orders
 * @apiGroup Orders - Customer
 * @apiParam  {Integer}         [id]                    Optional Order Id.
 * @apiParam  {Integer}         productId               Required Start Index.
 * @apiParam  {Integer}         quantity                Required Fetch Records.
 * @apiParam  {Integer}         unitCoin                Required Product Search String.
 * @apiParam  {Integer}         addressTypeId           Required address Type Id.
 * @apiParam  {String}          label                   Required address Label.
 * @apiParam  {String}          addressLine1            Required address line 1.
 * @apiParam  {String}          addressLine2            Required address line 1.
 * @apiParam  {String}          pincode                 Required address pincode.
 * @apiParam  {Integer}         cityId                  Required cityId.
 * @apiParam  {String}          city                    Required city.
 * @apiParam  {String}          district                Required district.
 * @apiParam  {String}          state                   Required state.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Update Orders',
 *          recordList: Orders,
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
router.post('/insertUpdateOrders', orders_1.default.insertUpdateOrders);
// #region /api/customer/orders/getOrders apidoc
/**
 * @api {post} /api/customer/orders/getOrders Get Orders
 * @apiVersion 1.0.0
 * @apiName Get Orders
 * @apiDescription Get Orders
 * @apiGroup Orders - Customer
 * @apiParam  {String}          [startIndex]                Optional Start Index.
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiParam  {String}          [fromDate]                  Optional From Date.
 * @apiParam  {String}          [toDate]                    Optional To Date.
 * @apiParam  {Array}           [statusIds]                 Optional Array of Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Orders',
 *          recordList: Orders,
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
router.post('/getOrders', orders_1.default.getOrders);
module.exports = router;
