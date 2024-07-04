import express from 'express';
import controller from '../../controllers/partner/loans';

const router = express.Router();

// #region /api/partner/loans/getCustomerLoansByStatusId apidoc
/**
 * @api {post} /api/partner/loans/getCustomerLoansByStatusId Get Customer Loan By Status
 * @apiVersion 1.0.0
 * @apiName Get Customer Loan By Status
 * @apiDescription Get Customer Loan By Status
 * @apiGroup Loan - Customer
 * @apiParam  {Integer}             partnerId              Requires partner Id.
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

// #region /api/partner/loans/getCustomerLoansByStatusIdV2 apidoc
/**
 * @api {post} /api/partner/loans/getCustomerLoansByStatusIdV2 Get Customer Loan By Status
 * @apiVersion 1.0.0
 * @apiName Get Customer Loan By Status
 * @apiDescription Get Customer Loan By Status
 * @apiGroup Loan - Customer
 * @apiParam  {Integer}             partnerId              Requires Customer Id.
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

// #region /api/partner/loans/deleteLoanById apidoc
/**
 * @api {post} /api/partner/loans/deleteLoanById Delete Customer Loan
 * @apiVersion 1.0.0
 * @apiName Delete Customer Loan
 * @apiDescription Delete Customer Loan
 * @apiGroup Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Delete Customer Loan',
 *          recordList: Delete Customer Loan,
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
router.post('/deleteLoanById', controller.deleteLoanById);

export = router;