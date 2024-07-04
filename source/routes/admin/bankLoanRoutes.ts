import express from 'express';
import controller from '../../controllers/admin/bankLoans';

const router = express.Router();

// #region /api/admin/bankLoans/getBankLoans apidoc
/**
 * @api {post} /api/admin/bankLoans/getBankLoans Get BankLoan
 * @apiName Get BankLoan
 * @apiDescription Get BankLoan
 * @apiGroup BankLoan - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiParam  {String}          [bankIds]              Optional bankIds.
 * @apiParam  {String}          [servieIds]              Optional ServiceIds.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get BankLoan',
 *          recordList: BankLoan,
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
router.post('/getBankLoans', controller.getBankLoans);

// #region /api/admin/bankLoans/insertBankLoan apidoc
/**
 * @api {post} /api/admin/bankLoans/insertBankLoan insert BankLoan
 * @apiVersion 1.0.0
 * @apiName insert BankLoan
 * @apiDescription insert BankLoan
 * @apiGroup BankLoan - Admin
 * @apiParam  {String}          loanName                    Optional name of Bank Loan
 * @apiParam  {Integer}          bankId                Required id of Bank
 * @apiParam  {Integer}          serviecId               Option id of Service
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert BankLoan',
 *          recordList: BankLoan,
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
router.post('/insertBankLoan', controller.insertBankLoan);

// #region /api/admin/bankLoans/updateBankLoan apidoc
/**
 * @api {post} /api/admin/bankLoans/updateBankLoan update BankLoan
 * @apiVersion 1.0.0
 * @apiName Update BankLoan
 * @apiDescription Update BankLoan
  * @apiGroup BankLoan - Admin
 * @apiParam  {String}          loanName                    Optional name of Bank Loan
 * @apiParam  {Integer}          bankId                Required id of Bank
 * @apiParam  {Integer}          serviecId               Option id of Service
 * @apiParam  {Integer}         id                         Requires Bank Loan Id
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update BankLoan',
 *          recordList: BankLoan,
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
router.post('/updateBankLoan', controller.updateBankLoan);

// #region /api/admin/bankLoans/activeInactiveBankLoan apidoc
/**
 * @api {post} /api/admin/bankLoans/activeInactiveBankLoan Change BankLoan status
 * @apiVersion 1.0.0
 * @apiName Change BankLoan Status
 * @apiDescription Change BankLoan Status
 * @apiGroup BankLoan - Admin
 * @apiParam  {Integer}         id                  Requires Bank Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change BankLoan Status',
 *          recordList: BankLoan,
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
router.post('/activeInactiveBankLoan', controller.activeInActiveBankLoan);

export = router;