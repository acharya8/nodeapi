"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const homeLoan_1 = __importDefault(require("../../controllers/admin/homeLoan"));
const router = express_1.default.Router();
// #region /api/admin/homeLoan/getHomeLoan apidoc
/**
 * @api {post} /api/admin/homeLoan/getHomeLoan Get Home Loans
 * @apiVersion 1.0.0
 * @apiName Get Home Loans
 * @apiDescription Get Home Loans
 * @apiGroup Home Loans  - Admin
 * @apiParam  {Integer}         serviceId                   Required Service Id
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Home Loans  ',
 *          recordList: Home Loans  ,
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
router.post('/getHomeLoan', homeLoan_1.default.getHomeLoan);
// #region /api/admin/homeLoan/getHomeLoanById apidoc
/**
 * @api {post} /api/admin/homeLoan/getHomeLoanById Get Home Loan By Id
 * @apiVersion 1.0.0
 * @apiName Get Home Loan By Id
 * @apiDescription Get Home Loan By Id
 * @apiGroup Home Loans - Admin
 * @apiParam  {Integer}         customerLoanId              Required customerLoan Id
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Home By Id',
 *          recordList: Home Loan ,
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
router.post('/getHomeLoanById', homeLoan_1.default.getHomeLoanById);
// #region /api/customer/homeLoans/insertUpdateHomeLoanBasicDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateHomeLoanBasicDetail Insert/Update Home Loan Basic Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan Customer Detail
 * @apiDescription Insert/Update Home Loan Customer Detail
 * @apiGroup Home Loan - Admin
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiParam  {Integer}             customerId                  Requires Customer Id.
 * @apiParam  {String}              fullName                    Requires Customer Full Name.
 * @apiParam  {String}              birthdate                   Requires Customer Birth Date.
 * @apiParam  {Integer}             maritalStatusId             Requires Martial Status Id.
 * @apiParam  {Integer}             loanAmount                  Requires Loan Amount.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Home Loan Basic Detail',
 *          recordList: Home Loan,
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
router.post('/insertUpdateHomeLoanBasicDetail', homeLoan_1.default.insertUpdateHomeLoanBasicDetail);
// #region /api/admin/homeLoans/insertUpdateHomeLoanPropertyDetail apidoc
/**
 * @api {post} /api/admin/homeLoans/insertUpdateHomeLoanPropertyDetail Insert/Update Home Loan Customer Property Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan Customer Property Detail
 * @apiDescription Insert/Update Home Loan Customer Property Detail
 * @apiGroup Home Loan - Admin
 * @apiParam  {Integer}             customerId                  Requires Customer Id.
 * @apiParam  {Integer}             serviceId                   Requires Service Id.
 * @apiParam  {Decimal}             loanAmount                  Requires Loan AMount.
 * @apiParam  {Integer}             propertyTypeId              Requires Propert TypeId.
 * @apiParam  {Integer}             propertyPurchaseValue       Requires Property Purchase Value.
 * @apiParam  {Integer}             propertyCityId              Requires Property City Id.
 * @apiParam  {String}              propertyCity                Requires Property City.
 * @apiParam  {String}              propertyDistrict            Requires Property District.
 * @apiParam  {String}              propertyState               Requires Property State.
 *  * @apiParam  {Object}              customerAddress                 Requires CustomerAddresses.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Home Loan Customer Property Detail',
 *          recordList: Home Loan,
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
router.post('/insertUpdateHomeLoanPropertyDetail', homeLoan_1.default.insertUpdateHomeLoanPropertyDetail);
// #region /api/admin/homeLoans/insertUpdateHomeLoanCustomerEmploymentDetail apidoc
/**
 * @api {post} /api/admin/homeLoans/insertUpdateHomeLoanCustomerEmploymentDetail Insert/Update Home Loan Customer Employment Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan Customer Employment Detail
 * @apiDescription Insert/Update Home Loan Customer Employment Detail
 * @apiGroup Home Loan - admin
 * @apiParam  {Integer}             customerLoanId                  Requires Customer Loan Id.
 * @apiParam  {Decimal}             monthlyIncome                   Requires Monthly Income.
 * @apiParam  {Integer}             addressTypeId                   Requires Address Type Id.
 * @apiParam  {String}              label                           Requires address Label.
 * @apiParam  {String}              addressLine1                    Requires Address Line 1.
 * @apiParam  {String}              addressLine2                    Requires Address Line 2.
 * @apiParam  {String}              pincode                         Requires Address Pincode.
 * @apiParam  {Integer}             cityId                          Requires City Id.
 * @apiParam  {String}              officePincode                   Optional Office Pincode.
 * @apiParam  {Integer}             employmentNatureId              Requires Employment Nature Id.
 * @apiParam  {Integer}             employmentServiceTypeId         Requires Employment Service Type Id.
 * @apiParam  {Integer}             employmentTypeId                Requires Employment Type Id.
 *  @apiParam  {Integer}             customerLoanCoApplicantEmploymentDetails                RequirescustomerLoanCoApplicantEmploymentDetails.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Home Loan Customer Employment Detail',
 *          recordList: Home Loan,
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
router.post('/insertUpdateHomeLoanCustomerEmploymentDetail', homeLoan_1.default.insertUpdateHomeLoanEmploymentDetail);
module.exports = router;
