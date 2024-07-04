"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const bankPolicies_1 = __importDefault(require("../../controllers/admin/bankPolicies"));
const router = express_1.default.Router();
// #region /api/admin/bankPolicies/insertUpdateBankPolicy apidoc
/**
 * @api {post} /api/admin/bankPolicies/insertUpdateBankPolicy insert/Update Bank Loan Policy
 * @apiVersion 1.0.0
 * @apiName insert/Update Bank Loan Policy
 * @apiDescription insert/Update Bank Loan Policy
 * @apiGroup Bank Policy - Admin
 * @apiParam  {Integer}         bankId                      Requires Bank Id
 * @apiParam  {Integer}         serviceId                   Requires Service Id
 * @apiParam  {Integer}         banklLoanId                 Requires Bank Loan Id
 * @apiParam  {Integer}         minAge                      Requires Min Age
 * @apiParam  {Integer}         maxAge                      Requires Max Age
 * @apiParam  {Integer}         [bankLoanPolicyId]          Optional Bank Loan Policy Id
 * @apiParam  {Integer}         [employmentTypeId]          Optional Employment Type Id
 * @apiParam  {Integer}         [minimumCibilScore]         Optional Minimum Cibil Score
 * @apiParam  {Integer}         [minIncome]                 Optional Minimum Income
 * @apiParam  {Integer}         [workExpInCurrentCompany]   Optional Work Experince In Corrent Compny In Month
 * @apiParam  {Integer}         [vintage]                   Optional Vintage
 * @apiParam  {Integer}         [minTurnOver]               Optional Minimum Turn Over
 * @apiParam  {Integer}         [maxTurnOver]               Optional Maximum Turn Over
 * @apiParam  {String}          [tenure]                    Optional Tenure
 * @apiParam  {Integer}         [minROI]                    Optional Minimum Rate Of interest
 * @apiParam  {Integer}         [maxROI]                    Optional Maximum Rate Of Interest
 * @apiParam  {Integer}         [loanAmount]                Optional Loan Amount
 * @apiParam  {Integer}         [loanValue]                 Optional Loan Value In Percentage
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert/Update Bank Loan Policy',
 *          recordList: Bank Policy,
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
router.post('/insertUpdateBankPolicy', bankPolicies_1.default.insertUpdateBankPolicy);
// #region /api/admin/bankPolicies/getBankPolicy apidoc
/**
 * @api {post} /api/admin/bankPolicies/getBankPolicy Get Bank Loan Policy
 * @apiVersion 1.0.0
 * @apiName Get Bank Loan Policy
 * @apiDescription Get Bank Loan Policy
 * @apiGroup Bank Policy - Admin
 * @apiParam  {Integer}         [bankId]                    Optional Bank Id
 * @apiParam  {Integer}         [serviceId]                 Optional Service Id
 * @apiParam  {Integer}         [age]                       Optional Min Age
 * @apiParam  {Integer}         [employmentTypeId]          Optional Employment Type Id
 * @apiParam  {Integer}         [cibilScore]                Optional Cibil Score
 * @apiParam  {Integer}         [income]                    Optional Income
 * @apiParam  {Integer}         [workExpInCurrentCompany]   Optional Work Experience in Current Company In Month
 * @apiParam  {Integer}         [vintage]                   Optional Vintage
 * @apiParam  {Integer}         [turnOver]                  Optional TurnOver
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert/Update Bank Loan Policy',
 *          recordList: Bank Policy,
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
router.post('/getBankPolicy', bankPolicies_1.default.getBankPolicy);
module.exports = router;
