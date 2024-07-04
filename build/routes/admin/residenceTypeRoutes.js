"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const residenttypes_1 = __importDefault(require("../../controllers/admin/residenttypes"));
const router = express_1.default.Router();
// #region /api/admin/residentTypes/getResidentTypes apidoc
/**
 * @api {post} /api/admin/residentTypes/getResidentTypes Get Resident Type
 * @apiVersion 1.0.0
 * @apiName Get Resident Type
 * @apiDescription Get Resident Type
 * @apiGroup Resident Type - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Resident Type',
 *          recordList: Resident Type,
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
router.post('/getResidentTypes', residenttypes_1.default.getResidentTypes);
// #region /api/admin/residentTypes/insertResidentType apidoc
/**
 * @api {post} /api/admin/residentTypes/insertResidentType insert Resident Type
 * @apiVersion 1.0.0
 * @apiName insert/Update Resident Type
 * @apiDescription insert Resident Type
  * @apiGroup Resident Type - Admin
 * @apiParam  {String}          name                Requires name of Resident Type.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Resident Type',
 *          recordList: Resident Type,
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
router.post('/insertResidentType', residenttypes_1.default.insertResidentType);
// #region /api/admin/residentTypes/updateResidentType apidoc
/**
 * @api {post} /api/admin/residentTypes/updateResidentType update Resident Type
 * @apiVersion 1.0.0
 * @apiName insert/Update Marital Statuses
 * @apiDescription insert/Update Marital Statuses
  * @apiGroup Marital Status - Admin
 * @apiParam  {String}          status                Requires status of marital Status.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Resident Type',
 *          recordList: Resident Type,
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
router.post('/updateResidentType', residenttypes_1.default.updateResidentType);
// #region /api/admin/residentTypes/activeInactiveResidentType apidoc
/**
 * @api {post} /api/admin/residentTypes/activeInactiveResidentType Change Resident Type Status
 * @apiVersion 1.0.0
 * @apiName Change Resident Typel Status
 * @apiDescription Change Resident Type Status
 * @apiGroup Resident Type - Admin
 * @apiParam  {Integer}         id                  Requires Resident Type Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Resident Type',
 *          recordList: Resident Type,
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
router.post('/activeInactiveResidentType', residenttypes_1.default.activeInactiveResidentType);
module.exports = router;
