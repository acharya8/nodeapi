"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const users_1 = __importDefault(require("../../controllers/website/users"));
const router = express_1.default.Router();
// #region /api/web/users/verifyContactNo apidoc
/**
 * @api {post} /api/web/users/verifyContactNo Verify ContactNo
 * @apiVersion 1.0.0
 * @apiName Verify ContactNo
 * @apiDescription Verify ContactNo
 * @apiGroup Users - WebSite
 * @apiParam  {String}          countryCode             Requires country Code.
 * @apiParam  {String}          contactNo               Requires contactNo.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Verify ContactNo',
 *          recordList: Users,
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
router.post('/verifyContactNo', users_1.default.websiteVerifyContactNo);
module.exports = router;
