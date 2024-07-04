"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const coApplicantRelation_1 = __importDefault(require("../../controllers/admin/coApplicantRelation"));
const router = express_1.default.Router();
// #region /api/admin/coApplicantRelation/getCoApplicantRelation apidoc
/**
 * @api {post} /api/admin/coApplicantRelation/getCoApplicantRelation Get CoApplicant Relation
 * @apiVersion 1.0.0
 * @apiName Get CoApplicant Relation
 * @apiDescription Get CoApplicant Relation
 * @apiGroup CoApplicant Relation - Admin
 *  @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get CoApplicant Relation',
 *          recordList: CoApplicant Relation,
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
router.post('/getCoApplicantRelation', coApplicantRelation_1.default.getCoApplicantRelation);
// #region /api/admin/coApplicantRelation/insertCoApplicantRelation apidoc
/**
 * @api {post} /api/admin/coApplicantRelation/insertCoApplicantRelation insert CoApplicant Relation
 * @apiVersion 1.0.0
 * @apiName insert CoApplicant Relation
 * @apiDescription insert CoApplicant Relation
  * @apiGroup CoApplicant Relation - Admin
 * @apiParam  {String}          name                Requires name of CoApplicant Relation
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert CoApplicant Relation',
 *          recordList: CoApplicant Relation,
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
router.post('/insertCoApplicantRelation', coApplicantRelation_1.default.insertCoApplicantRelation);
// #region /api/admin/coApplicantRelation/updateCoApplicantRelation apidoc
/**
 * @api {post} /api/admin/coApplicantRelation/updateCoApplicantRelation update CoApplicant Relation
 * @apiVersion 1.0.0
 * @apiName Update CoApplicant Relation
 * @apiDescription Update CoApplicant Relation
  * @apiGroup CoApplicant Relation - Admin
 * @apiParam  {String}          name                Requires name of CoApplicant Relation.
 * @apiParam  {Integer}         id                  Requires CoApplicant Relation Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update CoApplicant Relation',
 *          recordList: CoApplicant Relation,
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
router.post('/updateCoApplicantRelation', coApplicantRelation_1.default.updateCoApplicantRelation);
// #region /api/admin/coApplicantRelation/activeInactiveCoApplicantRelation apidoc
/**
 * @api {post} /api/admin/coApplicantRelation/activeInactiveCoApplicantRelation Change CoApplicant Relation
 * @apiVersion 1.0.0
 * @apiName Change CoApplicant Relation Status
 * @apiDescription Change CoApplicant Relation Status
 * @apiGroup CoApplicant Relation - Admin
 * @apiParam  {Integer}         id                  Requires CoApplicant Relation Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change CoApplicant Relation Status',
 *          recordList: CoApplicant Relation,
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
router.post('/activeInactiveCoApplicantRelation', coApplicantRelation_1.default.activeInActiveCoApplicantRelation);
module.exports = router;
