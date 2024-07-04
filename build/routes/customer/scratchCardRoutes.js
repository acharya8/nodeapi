"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const scratchCard_1 = __importDefault(require("../../controllers/customer/scratchCard"));
const router = express_1.default.Router();
// #region /api/customer/scratchCards/getScratchCard apidoc
/**
 * @api {post} /api/customer/scratchCards/getScratchCard Get Users Scratch Cards
 * @apiVersion 1.0.0
 * @apiName Get Users Scratch Cards
 * @apiDescription Get Users Scratch Cards
 * @apiGroup Scratch Cards - Customer
 * @apiParam  {Integer}             [startIndex]                Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Users Scratch Cards',
 *          recordList: Get Users Scratch Cards,
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
router.post('/getScratchCard', scratchCard_1.default.getScratchCard);
// #region /api/customer/scratchCards/updateScratchCardStatus apidoc
/**
 * @api {post} /api/customer/scratchCards/updateScratchCardStatus Update Scratch Card Status
 * @apiVersion 1.0.0
 * @apiName Update Scratch Card Status
 * @apiDescription Update Scratch Card Status
 * @apiGroup Scratch Cards - Customer
 * @apiParam  {Integer}             userScratchCardId               Requires Users Scratch Card Id.
 * @apiParam  {Integer}             value                           Requires Coin Value.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Scratch Card Status',
 *          recordList: Update Scratch Card Status,
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
router.post('/updateScratchCardStatus', scratchCard_1.default.updateScratchCardStatus);
module.exports = router;
