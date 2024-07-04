"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const training_1 = __importDefault(require("../../controllers/partner/training"));
const router = express_1.default.Router();
// #region /api/partner/trainings/getAssignTrainingsByPartnerId apidoc
/**
 * @api {post} /api/partner/trainings/getAssignTrainingsByPartnerId Get Assign Training of Partner
 * @apiVersion 1.0.0
 * @apiName Get Assign Training of Partner
 * @apiDescription Get Assign Training of Partner
 * @apiGroup Training - Partner
 * @apiParam  {Integer}             partnerId               Requires Partner Id.
 * @apiParam  {Integer}             [startIndex]            Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]          Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Assign Training of Partner',
 *          recordList: Training,
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
router.post('/getAssignTrainingsByPartnerId', training_1.default.getAssignTrainingsByPartnerId);
// #region /api/partner/trainings/completePartnerTraining apidoc
/**
 * @api {post} /api/partner/trainings/completePartnerTraining Complete Partner Training
 * @apiVersion 1.0.0
 * @apiName Complete Partner Training
 * @apiDescription Complete Partner Training
 * @apiGroup Training - Partner
 * @apiParam  {Integer}             assignUserTrainingId                Requires Assign User Training Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Complete Partner Training',
 *          recordList: Training,
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
router.post('/completePartnerTraining', training_1.default.completePartnerTraining);
module.exports = router;
