"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const employmentType_1 = __importDefault(require("../../controllers/admin/employmentType"));
const router = express_1.default.Router();
// #region /api/admin/employmentTypes/getEmploymentTypes apidoc
/**
 * @api {post} /api/admin/employmentTypes/getEmploymentTypes Get Employment Types
 * @apiVersion 1.0.0
 * @apiName Get Employment Types
 * @apiDescription Get Employment Types
 * @apiGroup Employment Types - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Employment Types',
 *          recordList: Employment Types,
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
router.post('/getEmploymentTypes', employmentType_1.default.getEmploymentTypes);
// #region /api/admin/employmentTypes/insertEmploymentType apidoc
/**
 * @api {post} /api/admin/employmentTypes/insertEmploymentType insert Employment Types
 * @apiVersion 1.0.0
 * @apiName insert Employment Types
 * @apiDescription insert Employment Types
 * @apiGroup Employment Types - Admin
 * @apiParam  {String}          name                Requires Employment Type Name.
 * @apiParam  {number}          parentId            Optional id of employmentType.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Employment Types',
 *          recordList: Employment Types,
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
router.post('/insertEmploymentType', employmentType_1.default.insertEmploymentType);
// #region /api/admin/employmentTypes/updateEmploymentType apidoc
/**
 * @api {post} /api/admin/serviceTypes/updateServiceType update Service Types
 * @apiVersion 1.0.0
 * @apiName update Employment Types
 * @apiDescription update Employment Types
 * @apiGroup Employment Types - Admin
 * @apiParam  {number}          id                Requires id of Employment Type .
 * @apiParam  {String}          name              Requires Employment Type Name.
 * @apiParam  {number}          parentId          Optional id of Employment Type.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Employment Types',
 *          recordList: Employment Types,
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
router.post('/updateEmploymentType', employmentType_1.default.updateEmploymentType);
// #region /api/admin/employmentTypes/activeInactiveEmploymentType apidoc
/**
 * @api {post} /api/admin/employmentTypes/activeInactiveEmploymentType Change Employment Types Status
 * @apiVersion 1.0.0
 * @apiName Change Employment Types Status
 * @apiDescription Change Employment Types Status
 * @apiGroup Employment Types - Admin
 * @apiParam  {Integer}         id                  Requires Employment Type Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Employment Types Status',
 *          recordList: Employment Types,
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
router.post('/activeInactiveEmploymentType', employmentType_1.default.activeInactiveEmploymentType);
module.exports = router;
