import express from 'express';
import controller from '../../controllers/admin/loanstatuses';

const router = express.Router();

// #region /api/admin/loanStatus/getLoanStatus apidoc
/**
 * @api {post} /api/admin/loanStatus/getLoanStatus Get Loan Status
 * @apiVersion 1.0.0
 * @apiName Get Loan Status
 * @apiDescription Get Loan Status
 * @apiGroup Loan Status - Admin
 * 
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Loan Status',
 *          recordList: Loan Status,
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
router.post('/getLoanStatus', controller.getLoanStatuses);

// #region /api/admin/loanStatus/insertLoanStatus apidoc
/**
 * @api {post} /api/admin/loanStatus/insertLoanStatus insert Loan Status
 * @apiVersion 1.0.0
 * @apiName insert Loan Status
 * @apiDescription insert Loan Status
 * @apiGroup Loan Status - Admin
 * @apiParam  {String}          status                Required status of Loan Status
 * @apiParam  {Integer}         isDataEditable        Required isDataEditable of LoanStatus.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Loan Status',
 *          recordList: Loan Status,
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
router.post('/insertLoanStatus', controller.insertLoanStatus);

// #region /api/admin/loanStatus/updateLoanStatus apidoc
/**
 * @api {post} /api/admin/loanStatus/updateLoanStatus update Loan Status
 * @apiVersion 1.0.0
 * @apiName Update Loan Status
 * @apiDescription Update Loan Status
  * @apiGroup Loan Status - Admin
 * @apiParam  {Integer}         id                  Requires Loan Status Id.
 * @apiParam  {String}          status                Required status of Loan Status
 * @apiParam  {Integer}         isDataEditable        Required isDataEditable of LoanStatus.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Loan Status',
 *          recordList: Loan Status,
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
router.post('/updateLoanStatus', controller.updateLoanStatus);

// #region /api/admin/loanStatus/activeInactiveLoanStatus apidoc
/**
 * @api {post} /api/admin/loanStatus/activeInactiveLoanStatus Change Loan Status
 * @apiVersion 1.0.0
 * @apiName Change Loan Status
 * @apiDescription Change Loan Status
 * @apiGroup Loan Status - Admin
 * @apiParam  {Integer}         id                  Requires Loan Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Loan Status',
 *          recordList: Loan Status,
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
router.post('/activeInactiveLoanStatus', controller.activeInactiveLoanStatus);

// #region /api/admin/loanStatus/changeLoanStatus apidoc
/**
 * @api {post} /api/admin/loanStatus/changeLoanStatus Change Loan Status
 * @apiVersion 1.0.0
 * @apiName Change Loan Status
 * @apiDescription Change Loan Status
 * @apiGroup Loan Status - Admin
 * @apiParam  {Integer}         id                  Requires Loan Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Loan Status',
 *          recordList: Loan Status,
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
router.post('/changeLoanStatus', controller.changeLoanStatus);

export = router;