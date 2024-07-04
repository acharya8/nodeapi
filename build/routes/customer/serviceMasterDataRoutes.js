"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const serviceMasterData_1 = __importDefault(require("../../controllers/customer/serviceMasterData"));
const router = express_1.default.Router();
// #region /api/customer/serviceMasterData/getMasterDataByServiceId apidoc
/**
 * @api {post} /api/customer/serviceMasterData/getMasterDataByServiceId Get Master Data By ServiceId
 * @apiVersion 1.0.0
 * @apiName Get Master Data By ServiceId
 * @apiDescription Get Master Data By ServiceId
 * @apiGroup Master Data - Customer
 * @apiParam  {Integer}             serviceId               Requires Service Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Master Data By ServiceId',
 *          recordList: Master Data,
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
router.post('/getMasterDataByServiceId', serviceMasterData_1.default.getMasterDataByServiceId);
// #region /api/customer/serviceMasterData/getCompanyCategories apidoc
/**
 * @api {post} /api/customer/serviceMasterData/getCompanyCategories Get Master Data By ServiceId
 * @apiVersion 1.0.0
 * @apiName Get Master Data By ServiceId
 * @apiDescription Get Master Data By ServiceId
 * @apiGroup Master Data - Customer
 * @apiParam  {Integer}             serviceId               Requires Service Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Master Data By ServiceId',
 *          recordList: Master Data,
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
router.post('/getCompanyCategories', serviceMasterData_1.default.getCompanyCategories);
module.exports = router;
