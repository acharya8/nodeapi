"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const businessLoan_1 = __importDefault(require("../../controllers/customer/businessLoan"));
const router = express_1.default.Router();
// #region /api/customer/businessLoans/insertUpdateBusinessLoanBasicDetail apidoc
/**
 * @api {post} /api/customer/businessLoans/insertUpdateBusinessLoanBasicDetail Insert/Update Business Loan Basic Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Business Loan Basic Detail
 * @apiDescription Insert/Update Business Loan Basic Detail
 * @apiGroup Business Loan - Customer
 * @apiParam  {Integer}             customerId                              Requires Customer Id.
 * @apiParam  {String}              fullName                                Requires Company Name.
 * @apiParam  {String}              gender                                  Requires Office Pincode.
 * @apiParam  {Integer}             cityId                                  Requires Customer Id.
 * @apiParam  {String}              pincode                                 Requires Office Pincode.
 * @apiParam  {Integer}             loanAmount                              Requires loanAmount.
 * @apiParam  {Integer}             employmentTypeId                        Requires employmentTypeId.
 * @apiParam  {Integer}             serviceId                               Requires Service Id.
 * @apiParam  {Integer}             businessAnnualSale                   Requires businessAnnualSale.
 * @apiParam  {Integer}             businessExperienceId                    Requires Service Id.
 * @apiParam  {String}              email                                   Requires Office Pincode.
 * @apiParam  {Integer}             residentTypeId                          Requires residentTypeId.
 * @apiParam  {Integer}             [customerLoanId]                        Optional CustomerLoan Id.
 * @apiParam  {Integer}             [customerLoanBusinessDetailId]          Optional customerLoanEmployment Id.
 * @apiParam  {Integer}             [customerAddressId]                     Optional customerAddressId.
 * @apiParam  {Integer}             [customerLoanCurrentResidentTypeId]     Optional customerLoanCurrentResidentTypeId.
 * @apiParam  {Integer}             [loanAgainsrCollateralId]               Optional loanAgainsrCollateralId.
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
router.post('/insertUpdateBusinessLoanBasicDetail', businessLoan_1.default.insertUpdateBusinessLoanBasicDetail);
// #region /api/customer/businessLoans/insertUpdateBusinessLoanBusinessDetail apidoc
/**
 * @api {post} /api/customer/businessLoans/insertUpdateBusinessLoanBusinessDetail Insert/Update Business Loan Business Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Business Loan Business Detail
 * @apiDescription Insert/Update Business Loan Business Detail
 * @apiGroup Business Loan - Customer
 * @apiParam  {Integer}             customerLoanBusinessDetailId            Required Customer Loan Business Detail Id.
 * @apiParam  {Integer}             companyTypeId                           Required Customer Type Id.
 * @apiParam  {Integer}             industryTypeId                          Required Industry Type Id.
 * @apiParam  {Integer}             businessNatureId                        Required Business Nature Id.
 * @apiParam  {Integer}             businessAnnualProfitId                  Required Business Annual Profit Id.
 * @apiParam  {Integer}             primaryBankId                           Required Bank Id.
 * @apiParam  {String}              [currentluPayEmi]                       Optional Company Name.
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
router.post('/insertUpdateBusinessLoanBusinessDetail', businessLoan_1.default.insertUpdateBusinessLoanBusinessDetail);
// #region /api/customer/businessLoans/InsertUpdateBusinessLoanMoreBasicDetail apidoc
/**
 * @api {post} /api/customer/businessLoans/InsertUpdateBusinessLoanMoreBasicDetail Insert/Update Business Loan More Basic Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Business Loan More Basic Detail
 * @apiDescription Insert/Update Business Loan More Basic Detail
 * @apiGroup Business Loan - Customer
 * @apiParam  {Integer}             customerLoanBusinessDetailId            Required Customer Loan Business Detail Id.
 * @apiParam  {Integer}             customerAddressId                       Required Customer Address Id.
 * @apiParam  {String}              businessName                            Required Business Name.
 * @apiParam  {String}              businessGstNo                           Required Business Gst No.
 * @apiParam  {String}              [label]                                 Optional Address Label.
 * @apiParam  {String}              [addressLine1]                          Optional Address Line 1.
 * @apiParam  {String}              [addressLine2]                          Optional Address Line 2.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update More Basic Loan Basic Detail',
 *          recordList: Business Loan More Basic Detail,
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
router.post('/InsertUpdateBusinessLoanMoreBasicDetail', businessLoan_1.default.InsertUpdateBusinessLoanMoreBasicDetail);
// #region /api/customer/businessLoans/uploadBusinessLoanDocument apidoc
/**
 * @api {post} /api/customer/businessLoans/uploadBusinessLoanDocument Uploan Business Loan Document
 * @apiVersion 1.0.0
 * @apiName Uploan Business Loan Document
 * @apiDescription Uploan Business Loan Document
 * @apiGroup Business Loan - Customer
 * @apiParam  {Integer}             customerLoanId          Required Customer Id.
 * @apiParam  {Array}               loanDocuments           Required Loan Documents.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update More Basic Loan Basic Detail',
 *          recordList: Business Loan More Basic Detail,
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
router.post('/uploadBusinessLoanDocument', businessLoan_1.default.uploadBusinessLoanDocument);
// #region /api/customer/businessLoans/getIncompleteBusinessLoanDetail apidoc
/**
 * @api {post} /api/customer/businessLoans/getIncompleteBusinessLoanDetail Get Incomplete usiness Loan Detail
 * @apiVersion 1.0.0
 * @apiName Get Incomplete Business Loan Detail
 * @apiDescription Get Incomplete Business Loan Detail
 * @apiGroup Business Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             serviceId               Requires ServiceId Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Incomplete Business Loan Detail',
 *          recordList: Business Loan,
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
router.post('/getIncompleteBusinessLoanDetail', businessLoan_1.default.getIncompleteBusinessLoanDetail);
// #region /api/customer/businessLoans/getCustomerBusinessLoanById apidoc
/**
 * @api {post} /api/customer/businessLoans/getCustomerBusinessLoanById Get Customer Business Loan Detail By Id
 * @apiVersion 1.0.0
 * @apiName Get Customer Business Loan Detail By Id
 * @apiDescription Get Customer Business Loan Detail By Id
 * @apiGroup Business Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             customerLoanId          Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Customer Business Loan Detail By Id',
 *          recordList: Business Loan,
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
router.post('/getCustomerBusinessLoanById', businessLoan_1.default.getCustomerBusinessLoanById);
module.exports = router;
