import express from 'express';
import controller from '../../controllers/customer/otherLoan';
const router = express.Router();

// #region /api/customer/otherLoans/insertCustomerOtherLoanDetail apidoc
/**
 * @api {post} /api/customer/otherLoans/insertCustomerOtherLoanDetail Insert other loan Detail
 * @apiVersion 1.0.0
 * @apiName Insert other loan Detail
 * @apiDescription Insert other loan Detail
 * @apiGroup customer - customer
 * @apiParam  {Integer}         serviceId                   Requires Service Id.
 * @apiParam  {String}          fullName                    Requires fullName. 
 * @apiParam  {DateTime}        birthdate                   Requires Birthdate.
 * @apiParam  {String}          panCardNo                   Requires PanCardNo.
 * @apiParam  {String}          aadhaarCardNo               Requires aadhaarCardNo.
 * @apiParam  {String}          contactNo                   Requires contactNo.
 * @apiParam  {String}          email                       Requires email.
 * @apiParam  {String}          employmentTypeId            Requires employmentTypeId.
 * @apiParam  {String}          monthlyincome               Requires monthlyincome.
 * @apiParam  {String}          pincode                     Requires pincode.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Other loan Commission',
 *          recordList: Other Loan,
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
router.post('/insertCustomerOtherLoanDetail', controller.insertCustomerOtherLoanDetail);

// #region /api/customer/otherLoans/getOtherLoanDetailByUserId apidoc
/**
 * @api {post} /api/customer/otherLoans/getOtherLoanDetailByUserId Get Partner Bank Detail
 * @apiVersion 1.0.0
 * @apiName Get Other Loan Customers
 * @apiDescription Get Other Loan Customers
 * @apiGroup Customer - Customer
 * @apiParam  {Integer}         userId              Requires User Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Other Loan Customers',
 *          recordList: Other Loan Customers,
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
router.post('/getOtherLoanDetailByUserId', controller.getOtherLoanDetailByUserId);



export = router;