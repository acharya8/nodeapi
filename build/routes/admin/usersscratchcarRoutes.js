"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const usersscratchcards_1 = __importDefault(require("../../controllers/admin/usersscratchcards"));
const router = express_1.default.Router();
// #region /api/admin/scratchCards/getScratchCard apidoc
/**
 * @api {post} /api/admin/scratchCards/getScratchCard Get Users Scratch Cards
 * @apiVersion 1.0.0
 * @apiName Get Users Scratch Cards
 * @apiDescription Get Users Scratch Cards
 * @apiGroup Scratch Cards - admin
 * @apiParam  {Integer}             [startIndex]                Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]              Optional Fetch Records.
 * @apiParam  {Integer}             [rewardTypeId]              Optional rewardTypeId.
 * @apiParam  {Integer}             [roleId]              Optional roleId.
 * @apiParam  {string}             [searchString]              Optional SearchString.
 * @apiParam  {Date}             [fromDate]              Optional fromDate.
 * @apiParam  {Integer}             [toDate]              Optional toDate.
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
router.post('/getScratchCard', usersscratchcards_1.default.getUsersScratchCard);
module.exports = router;
