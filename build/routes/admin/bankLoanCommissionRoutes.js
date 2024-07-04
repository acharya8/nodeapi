"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const bankLoanCommissions_1 = __importDefault(require("../../controllers/admin/bankLoanCommissions"));
const router = express_1.default.Router();
// #region /api/admin/bankLoanCommission/getBankLoanCommission apidoc
/**
 * @api {post} /api/admin/bankLoanCommission/getBankLoanCommission Get Bank Loan Commission
 * @apiVersion 1.0.0
 * @apiName Get Bank Loan Commission
 * @apiDescription Get Bank Loan Commission
 * @apiGroup Bank Loan Commission - Admin
 * @apiParam  {String}          [bankIds]                       Optional Bank Ids.
 * @apiParam  {String}          [serviceId]                     Optional Service Ids.
 * @apiParam  {String}          [commissionTypeId]              Optional Commission Type Ids.
 * @apiParam  {Integer}         [startIndex]                    Optional Start Index.
 * @apiParam  {Integer}         [fetchRecords]                  Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Bank Loan Commission',
 *          recordList: Bank Loan Commission,
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
router.post('/getBankLoanCommission', bankLoanCommissions_1.default.getBankLoanCommission);
// #region /api/admin/bankLoanCommission/insertUpdateBankLoanCommission apidoc
/**
 * @api {post} /api/admin/bankLoanCommission/insertUpdateBankLoanCommission Insert/Update Bank Loan Commission
 * @apiVersion 1.0.0
 * @apiName Insert/Update Bank Loan Commission
 * @apiDescription Insert/Update Bank Loan Commission
 * @apiGroup Bank Loan Commission - Admin
 * @apiParam  {Integer}         bankId                      Required Bank Id.
 * @apiParam  {Integer}         serviceId                   Required Service Id.
 * @apiParam  {Integer}         commissionTypeId            Required Commission Type Id.
 * @apiParam  {Integer}         commission                  Required Commission.
 * @apiParam  {Integer}         [id]                        Required Bank Loan Commission Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Bank Loan Commission',
 *          recordList: Bank Loan Commission,
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
router.post('/insertUpdateBankLoanCommission', bankLoanCommissions_1.default.insertUpdateBankLoanCommission);
module.exports = router;
