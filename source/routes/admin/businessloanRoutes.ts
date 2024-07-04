import express from 'express';
import controller from '../../controllers/admin/businessloans';

const router = express.Router();

// #region /api/admin/businessLoans/getBusinessLoans apidoc
/**
 * @api {post} /api/admin/businessLoans/getBusinessLoans Get Business Loans 
 * @apiVersion 1.0.0
 * @apiName Get Business Loans 
 * @apiDescription Get Business Loans 
 * @apiGroup Business Loans - Admin
 * @apiParam  {Integer}         serviceId                   Required Service Id
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Business Loans ',
 *          recordList: Business Loans ,
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
router.post('/getBusinessLoans', controller.getBusinessLoans);

// #region /api/admin/businessLoans/getBusinessLoanById apidoc
/**
 * @api {post} /api/admin/businessLoans/getBusinessLoanById Get Business Loans 
 * @apiVersion 1.0.0
 * @apiName Get Business Loans 
 * @apiDescription Get Business Loans 
 * @apiGroup Business Loans - Admin
 * @apiParam  {Integer}         customerLoanId                   Required Id of customerLoans
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Business Loans ',
 *          recordList: Business Loans ,
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
router.post('/getBusinessLoanById', controller.getBusinessLoanById);

// #region /api/admin/businessLoans/insertUpdateBusinessLoanBasicDetail apidoc
/**
 * @api {post} /api/admin/businessLoans/insertUpdateBusinessLoanBasicDetail Insert/Update Business Loan Basic Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Business Loan Basic Detail
 * @apiDescription Insert/Update Business Loan Basic Detail
 * @apiGroup Business Loan - Admin
 * @apiParam  {Integer}             customerId                              Requires Customer Id.
 * @apiParam  {String}              fullName                                Requires Company Name.
 * @apiParam  {String}              gender                                  Requires Office Pincode.
 * @apiParam  {Integer}             cityId                                  Requires Customer Id.
 * @apiParam  {String}              pincode                                 Requires Office Pincode.
 * @apiParam  {Integer}             loanAmount                              Requires Service Id.
 * @apiParam  {Integer}             employmentTypeId                        Requires Service Id.
 * @apiParam  {Integer}             serviceId                               Requires Service Id.
 * @apiParam  {Integer}             businessAnnualSale                    Requires Business Annual Sale.
 * @apiParam  {Integer}             businessExperienceId                    Requires Service Id.
 * @apiParam  {String}              email                                   Requires Office Pincode.
 * @apiParam  {Integer}             residentTypeId                          Requires Service Id.
 * @apiParam  {Integer}             [customerLoanId]                        Optional CustomerLoan Id.
 * @apiParam  {Integer}             [customerLoanBusinessDetailId]          Optional customerLoanEmployment Id.
 * @apiParam  {Integer}             [customerAddressId]                     Optional customerLoanEmployment Id.
 * @apiParam  {Integer}             [customerLoanCurrentResidentTypeId]     Optional customerLoanEmployment Id.
 * @apiParam  {Integer}             [loanAgainsrCollateralId]               Optional customerLoanEmployment Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Business Loan Basic Detail',
 *          recordList: Business Loan Basic Detail,
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
router.post('/insertUpdateBusinessLoanBasicDetail', controller.insertUpdateBusinessLoanBasicDetail);

// #region /api/admin/businessLoans/insertUpdateBusinessLoanBusinessDetail apidoc
/**
 * @api {post} /api/admin/businessLoans/insertUpdateBusinessLoanBusinessDetail Insert/Update Business Loan Business Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Business Loan Business Detail
 * @apiDescription Insert/Update Business Loan Business Detail
 * @apiGroup Business Loan - admin
 * @apiParam  {Integer}             customerLoanBusinessDetailId            Required Customer Loan Business Detail Id. 
 * @apiParam  {Integer}             companyTypeId                           Required Customer Type Id.
 * @apiParam  {Integer}             industryTypeId                          Required Industry Type Id.
 * @apiParam  {Integer}             businessNatureId                        Required Business Nature Id.
 * @apiParam  {Integer}             businessAnnualProfitId                  Required Business Annual Profit Id.
 * @apiParam  {Integer}             primaryBankId                           Required Bank Id.
 * @apiParam  {String}              [currentluPayEmi]                       Optional Company Name.
 * @apiParam  {String}              [businessName]                          Optional business Name.
 * @apiParam  {String}              [gstNumber]                             Optional gst Number.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Business Loan Basic Detail',
 *          recordList: Business Loan Basic Detail,
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
router.post('/insertUpdateBusinessLoanBusinessDetail', controller.insertUpdateBusinessLoanBusinessDetail);
export = router;