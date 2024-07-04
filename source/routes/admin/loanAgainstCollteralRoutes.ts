import express from 'express';
import controller from '../../controllers/admin/loanAginstCollteral';

const router = express.Router();

// #region /api/admin/loanAgainstCollteral/getLoanAginstCollteral apidoc
/**
 * @api {post} /api/admin/loanAgainstCollteral/getLoanAginstCollteral Get LoanAgainstColletral
 * @apiVersion 1.0.0
 * @apiName Get LoanAgainstColletral
 * @apiDescription Get LoanAgainstColletral
 * @apiGroup LoanAgainstColletral - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get LoanAgainstColletral',
 *          recordList: LoanAgainstColletral,
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
router.post('/getLoanAginstCollteral', controller.getLoanAgianstCollteral);

// #region /api/admin/loanAgainstCollteral/insertLoanAgainstCollteral apidoc
/**
 * @api {post} /api/admin/loanAgainstCollteral/insertLoanAgainstCollteral insert LoanAgainstColletral
 * @apiVersion 1.0.0
 * @apiName insert/Update LoanAgainstColletral
 * @apiDescription insert/Update LoanAgainstColletral
  * @apiGroup LoanAgainstColletral - Admin
 * @apiParam  {String}          name                Requires name of LoanAgainstColletral.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert LoanAgainstColletral',
 *          recordList: LoanAgainstColletral,
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
router.post('/insertLoanAgainstCollteral', controller.insertLoanAgainstCollteral);

// #region /api/admin/loanAgainstCollteral/updateLoanAgainstCollteral apidoc
/**
 * @api {post} /api/admin/loanAgainstCollteral/updateLoanAgainstCollteral Update LoanAgainstColletral
 * @apiVersion 1.0.0
 * @apiName Update LoanAgainstColletral
 * @apiDescription Update LoanAgainstColletral
  * @apiGroup LoanAgainstColletral - Admin
  * @apiParam  {String}          id                Requires id of LoanAgainstColletral.
 * @apiParam  {String}          name                Requires name of LoanAgainstColletral.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update LoanAgainstColletral',
 *          recordList: LoanAgainstColletral,
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
router.post('/updateLoanAgainstCollteral', controller.updateLoanAgainstCollteral);

// #region /api/admin/loanAgainstCollteral/activeInactiveLoanAgainstCollteral apidoc
/**
 * @api {post} /api/admin/loanAgainstCollteral/activeInactiveLoanAgainstCollteral Change LoanAgainstColletral Status
 * @apiVersion 1.0.0
 * @apiName Change LoanAgainstColletral
 * @apiDescription Change LoanAgainstColletral
 * @apiGroup LoanAgainstColletral - Admin
 * @apiParam  {Integer}         id                  Requires LoanAgainstColletral Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change LoanAgainstColletral Status',
 *          recordList: LoanAgainstColletral Status,
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
router.post('/activeInactiveLoanAgainstCollteral', controller.activeInactiveLoanAgainstCollteral);

export = router;