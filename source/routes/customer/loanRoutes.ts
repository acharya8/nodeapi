import express from 'express';
import controller from '../../controllers/customer/loans';

const router = express.Router();

// #region /api/customer/loans/getCustomerLoansByStatusId apidoc
/**
 * @api {post} /api/customer/loans/getCustomerLoansByStatusId Get Customer Loan By Status
 * @apiVersion 1.0.0
 * @apiName Get Customer Loan By Status
 * @apiDescription Get Customer Loan By Status
 * @apiGroup Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             statusId                Requires Loan Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Customer Loan By Status Detail',
 *          recordList: Update Personal Loan Employment Detail,
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
router.post('/getCustomerLoansByStatusId', controller.getCustomerLoansByStatusId);

// #region /api/customer/loans/getCustomerLoansByStatusIdV2 apidoc
/**
 * @api {post} /api/customer/loans/getCustomerLoansByStatusIdV2 Get Customer Loan By Status
 * @apiVersion 1.0.0
 * @apiName Get Customer Loan By Status
 * @apiDescription Get Customer Loan By Status
 * @apiGroup Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             statusId                Requires Loan Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Customer Loan By Status Detail',
 *          recordList: Update Personal Loan Employment Detail,
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
router.post('/getCustomerLoansByStatusIdV2', controller.getCustomerLoansByStatusIdV2);

// #region /api/customer/loans/getLoanCompareData apidoc
/**
 * @api {post} /api/customer/loans/getLoanCompareData Get Loan Compare Data By serviceId Id
 * @apiVersion 1.0.0
 * @apiName Get Loan Compare Data By serviceId Id
 * @apiDescription Get Loan Compare Data By serviceId Id
 * @apiGroup Loan - Customer
 * @apiParam  {Integer}             serviceId              Requires service Id.
 * @apiParam  {Integer}             loanAmount             Requires loanAmount.
 * @apiParam  {Integer}             tenure                 Requires tenure.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Loan Compare Data By serviceId Id',
 *          recordList: Update Personal Loan Employment Detail,
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
router.post('/getLoanCompareData', controller.getLoanCompareData);

export = router;