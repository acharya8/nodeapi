"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const homeLoans_1 = __importDefault(require("../../controllers/customer/homeLoans"));
const router = express_1.default.Router();
// #region /api/customer/homeLoans/insertUpdateCustomerLoanPropertyDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateCustomerLoanPropertyDetail Insert/Update Home Loan Customer Property Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan Customer Property Detail
 * @apiDescription Insert/Update Home Loan Customer Property Detail
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerId                  Requires Customer Loan Id.
 * @apiParam  {Integer}             serviceId                   Requires Customer Id.
 * @apiParam  {Decimal}             loanAmount                  Requires Customer Full Name.
 * @apiParam  {Integer}             propertyTypeId              Requires Customer Birth Date.
 * @apiParam  {Integer}             propertyPurchaseValue       Requires Martial Status Id.
 * @apiParam  {Integer}             propertyCityId              Requires Martial Status Id.
 * @apiParam  {String}              propertyCity                Requires Martial Status Id.
 * @apiParam  {String}              propertyDistrict            Requires Martial Status Id.
 * @apiParam  {String}              propertyState               Requires Martial Status Id.
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
router.post('/insertUpdateCustomerLoanPropertyDetail', homeLoans_1.default.insertUpdateCustomerLoanPropertyDetail);
// #region /api/customer/homeLoans/insertUpdateHomeLoanCustomerDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateHomeLoanCustomerDetail Insert/Update Home Loan Customer Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan Customer Detail
 * @apiDescription Insert/Update Home Loan Customer Detail
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiParam  {Integer}             customerId                  Requires Customer Id.
 * @apiParam  {String}              fullName                    Requires Customer Full Name.
 * @apiParam  {String}              birthdate                   Requires Customer Birth Date.
 * @apiParam  {Integer}             maritalStatusId             Requires Martial Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Home Loan Customer Detail',
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
router.post('/insertUpdateHomeLoanCustomerDetail', homeLoans_1.default.insertUpdateHomeLoanCustomerDetail);
// #region /api/customer/homeLoans/insertUpdateCustomerAddress apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateCustomerAddress Insert/Update Customer Address
 * @apiVersion 1.0.0
 * @apiName Insert/Update Customer Address
 * @apiDescription Insert/Update Customer Address
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerLoanId                  Requires Customer Loan Id.
 * @apiParam  {Object}              customerAddress                 Requires Monthly Income.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Customer Address',
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
router.post('/insertUpdateCustomerAddress', homeLoans_1.default.insertUpdateCustomerAddress);
// #region /api/customer/homeLoans/insertUpdateHomeLoanCustomerEmploymentDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateHomeLoanCustomerEmploymentDetail Insert/Update Home Loan Customer Employment Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan Customer Employment Detail
 * @apiDescription Insert/Update Home Loan Customer Employment Detail
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerLoanId                  Requires Customer Loan Id.
 * @apiParam  {Decimal}             monthlyIncome                   Requires Monthly Income.
 * @apiParam  {Integer}             addressTypeId                   Requires Address Type Id.
 * @apiParam  {String}              label                           Requires address Label.
 * @apiParam  {String}              addressLine1                    Requires Address Line 1.
 * @apiParam  {String}              addressLine2                    Requires Address Line 2.
 * @apiParam  {String}              pincode                         Requires Address Pincode.
 * @apiParam  {Integer}             cityId                          Requires City Id.
 * @apiParam  {String}              officePincode                   Requires Office Pincode.
 * @apiParam  {Integer}             employmentNatureId              Requires Employment Nature Id.
 * @apiParam  {Integer}             employmentServiceTypeId         Requires Employment Service Type Id.
 * @apiParam  {Integer}             employmentTypeId                Requires Employment Type Id.
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
router.post('/insertUpdateHomeLoanCustomerEmploymentDetail', homeLoans_1.default.insertUpdateHomeLoanCustomerEmploymentDetail);
// #region /api/customer/homeLoans/insertUpdateHomeLoanCoApplicantEmploymentDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateHomeLoanCoApplicantEmploymentDetail Insert/Update Home Loan CoApplicant Employment Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan CoApplicant Employment Detail
 * @apiDescription Insert/Update Home Loan CoApplicant Employment Detail
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerLoanCoApplicantId       Requires Customer Loan CoApplicant Id.
 * @apiParam  {Integer}             customerLoanId                  Requires Customer Loan Id.
 * @apiParam  {Decimal}             monthlyIncome                   Requires Monthly Income.
 * @apiParam  {Integer}             addressTypeId                   Requires Address Type Id.
 * @apiParam  {String}              label                           Requires address Label.
 * @apiParam  {String}              addressLine1                    Requires Address Line 1.
 * @apiParam  {String}              addressLine2                    Requires Address Line 2.
 * @apiParam  {String}              pincode                         Requires Address Pincode.
 * @apiParam  {Integer}             cityId                          Requires City Id.
 * @apiParam  {String}              officePincode                   Requires Office Pincode.
 * @apiParam  {Integer}             employmentNatureId              Requires Employment Nature Id.
 * @apiParam  {Integer}             employmentServiceTypeId         Requires Employment Service Type Id.
 * @apiParam  {Integer}             employmentTypeId                Requires Employment Type Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Home Loan CoApplicant Employment Detail',
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
router.post('/insertUpdateHomeLoanCoApplicantEmploymentDetail', homeLoans_1.default.insertUpdateHomeLoanCoApplicantEmploymentDetail);
// #region /api/customer/homeLoans/insertUpdateHomeLoanCurrentResidentDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateHomeLoanCurrentResidentDetail Insert/Update Home Loan Current Resident Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Home Loan Current Resident Detail
 * @apiDescription Insert/Update Home Loan Current Resident Detail
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiParam  {Integer}             residentTypeId              Requires Resident Type Id.
 * @apiParam  {Decimal}             rentAmount                  Requires Rent Amount.
 * @apiParam  {Decimal}             valueOfProperty             Requires Value Of Property.
 * @apiParam  {Decimal}             monthlyHouseHold            Requires Monthly Household.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Home Loan Current Resident Detail',
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
router.post('/insertUpdateHomeLoanCurrentResidentDetail', homeLoans_1.default.insertUpdateHomeLoanCurrentResidentDetail);
// #region /api/customer/homeLoans/uploadHomeLoanDocument apidoc
/**
 * @api {post} /api/customer/homeLoans/uploadHomeLoanDocument Upload Loan Document
 * @apiVersion 1.0.0
 * @apiName Upload Loan Document
 * @apiDescription Upload Loan Document
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiParam  {Array}               loanDocuments               Requires Uploaded Documents Array {documentData,isPdf,documentName,loanDocumentId(Required Id Update),documentId,serviceTypeDocumentId}.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Upload Loan Document',
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
router.post('/uploadHomeLoanDocument', homeLoans_1.default.uploadHomeLoanDocument);
// #region /api/customer/homeLoans/getIncompleteHomeLoanDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/getIncompleteHomeLoanDetail Get Incomplete Home Loan Detail
 * @apiVersion 1.0.0
 * @apiName Get Incomplete Home Loan Detail
 * @apiDescription Get Incomplete Home Loan Detail
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             serviceId               Requires ServiceId Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Incomplete Home Loan Detail',
 *          recordList: Update Home Loan Employment Detail,
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
router.post('/getIncompleteHomeLoanDetail', homeLoans_1.default.getIncompleteHomeLoanDetail);
// #region /api/customer/homeLoans/getCustomerHomeLoanById apidoc
/**
 * @api {post} /api/customer/homeLoans/getCustomerHomeLoanById Get Customer Home Loan Detail By Id
 * @apiVersion 1.0.0
 * @apiName Get Customer Home Loan Detail By Id
 * @apiDescription Get Customer Home Loan Detail By Id
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             customerLoanId          Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Customer Home Detail Loan By Id',
 *          recordList: Home Loan Detail,
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
router.post('/getCustomerHomeLoanById', homeLoans_1.default.getCustomerHomeLoanById);
// #region /api/customer/homeLoans/insertUpdateCustomerLoanTransferPropertyDetail apidoc
/**
 * @api {post} /api/customer/homeLoans/insertUpdateCustomerLoanTransferPropertyDetail Get Customer Home Loan Detail By Id
 * @apiVersion 1.0.0
 * @apiName Insert Update Customer Loan Transfer Property Detail
 * @apiDescription Insert Update Customer Loan Transfer Property Detail
 * @apiGroup Home Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             customerLoanId          Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Update Customer Loan Transfer Property Detail',
 *          recordList: Home Loan Detail,
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
router.post('/insertUpdateCustomerLoanTransferPropertyDetail', homeLoans_1.default.insertUpdateCustomerLoanTransferPropertyDetail);
module.exports = router;
