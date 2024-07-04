"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const employmentTypes_1 = __importDefault(require("../../controllers/customer/employmentTypes"));
const router = express_1.default.Router();
// #region /api/customer/employmentTypes/getEmploymentTypesByServiceId apidoc
/**
 * @api {post} /api/customer/employmentTypes/getEmploymentTypesByServiceId Get Employment Types By ServiceId
 * @apiVersion 1.0.0
 * @apiName Get Employment Types By ServiceId
 * @apiDescription Get Employment Types By ServiceId
 * @apiGroup Employment Types - Customer
 * @apiParam  {Integer}             serviceId               Requires Service Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Employment Types By ServiceId',
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
router.post('/getEmploymentTypesByServiceId', employmentTypes_1.default.getEmploymentTypesByServiceId);
module.exports = router;
