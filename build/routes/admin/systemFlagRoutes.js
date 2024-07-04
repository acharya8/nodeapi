"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const systemFlag_1 = __importDefault(require("../../controllers/admin/systemFlag"));
const router = express_1.default.Router();
// #region /api/admin/systemflags/getAdminSystemFlag apidoc
/**
 * @api {post} /api/admin/systemflags/getAdminSystemFlag Get System Flag
 * @apiVersion 1.0.0
 * @apiName Get  System Flag
 * @apiDescription Get  System Flag
 * @apiGroup  System Flag - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get  System Flag',
 *          recordList:  System Flag,
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
router.post('/getAdminSystemFlag', systemFlag_1.default.getAdminSystemFlag);
// #region /api/admin/systemflags/updateSystemFlagByName apidoc
/**
 * @api {post} /api/admin/systemflags/updateSystemFlagByName Update System Flag List
 * @apiVersion 1.0.0
 * @apiName Update System Flag List
 * @apiDescription Update System Flag List
 * @apiGroup System Flag - Admin
 * @apiParam  {Array}          valueList                Requires Array List of value.
 * @apiParam  {Array}          nameList                 Requires Array List of System Flag Name.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update System Flag List',
 *          recordList: System Flag,
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
router.post('/updateSystemFlagByName', systemFlag_1.default.updateSystemFlagByName);
module.exports = router;
