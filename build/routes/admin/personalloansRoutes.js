"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const personalloans_1 = __importDefault(require("../../controllers/admin/personalloans"));
const router = express_1.default.Router();
// #region /api/admin/personalLoans/getTenure apidoc
/**
 * @api {post} /api/admin/personalLoans/getTenure Get Tenure
 * @apiName Get Tenure
 * @apiDescription Get Tenure
 * @apiGroup Tenure - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Tenure',
 *          recordList: Tenure,
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
router.post('/getTenure', personalloans_1.default.getTenure);
// #region /api/admin/personalLoans/getPersonalLoan apidoc
/**
 * @api {post} /api/admin/personalLoans/getPersonalLoan Get Personal Loans
 * @apiVersion 1.0.0
 * @apiName Get Personal Loans
 * @apiDescription Get Personal Loans
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}         serviceId                   Required Service Id
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Personal Loans ',
 *          recordList: Personal Loans ,
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
router.post('/getPersonalLoan', personalloans_1.default.getPersonalLoan);
// #region /api/admin/personalLoans/getPersonalLoanById apidoc
/**
 * @api {post} /api/admin/personalLoans/getPersonalLoanById Get Personal Loan By Id
 * @apiVersion 1.0.0
 * @apiName Get Personal Loan By Id
 * @apiDescription Get Personal Loan By Id
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}         customerLoanId              Required customerLoan Id
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Personal Loan By Id',
 *          recordList: Personal Loans ,
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
router.post('/getPersonalLoanById', personalloans_1.default.getPersonalLoanById);
// #region /api/admin/personalLoans/assignToRM apidoc
/**
 * @api {post} /api/admin/personalLoans/assignToRM Get Personal Loan By Id
 * @apiVersion 1.0.0
 * @apiName Get Personal Loan By Id
 * @apiDescription Get Personal Loan By Id
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}         customerLoanId              Required customerLoan Id
 * @apiParam  {Integer}         userId              Required RM User Id
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Personal Loan By Id',
 *          recordList: Personal Loans ,
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
router.post('/assignToRM', personalloans_1.default.assignToRM);
// #region /api/admin/personalLoans/changeDocumentStatus apidoc
/**
 * @api {post} /api/admin/personalLoans/changeDocumentStatus Change Document Status
 * @apiVersion 1.0.0
 * @apiName Change Document Status
 * @apiDescription Change Document Status
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          id             Required Id of customerLoanDocument
 * @apiParam  {String}          status            Required status for customerLoanDocument
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Document Status ',
 *          recordList: CustomerLoan Document ,
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
router.post('/changeDocumentStatus', personalloans_1.default.changeDocumentStatus);
// #region /api/admin/personalLoans/getOffer apidoc
/**
 * @api {post} /api/admin/personalLoans/getOffer Get CustomerLoan Offer
 * @apiVersion 1.0.0
 * @apiName Get CustomerLoan Offer
 * @apiDescription Get CustomerLoan Offer
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          serviceId            Required Id of services
 * @apiParam  {Integer}          employmentTypeId            Required id of employmentType
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get CustomerLoan Offer ',
 *          recordList: Get CustomerLoan Offer ,
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
router.post('/getOffer', personalloans_1.default.getOffer);
// #region /api/admin/personalLoans/insertSelectedOffer apidoc
/**
 * @api {post} /api/admin/personalLoans/insertSelectedOffer Insert CustomerLoan Selected Offer
 * @apiVersion 1.0.0
 * @apiName Insert CustomerLoan Offer
 * @apiDescription Insert CustomerLoan Offer
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          customerLoanId            Required Id of customerLoan
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert CustomerLoan Offer ',
 *          recordList: Insert CustomerLoan Offer ,
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
router.post('/insertSelectedOffer', personalloans_1.default.insertSelectedOffer);
// #region /api/admin/personalLoans/insertUpdateLoanRejectionReason apidoc
/**
 * @api {post} /api/admin/personalLoans/insertUpdateLoanRejectionReason InsertUpdate CustomerLoan RejectionReason
 * @apiVersion 1.0.0
 * @apiName InsertUpdate CustomerLoan RejectionReason
 * @apiDescription InsertUpdate CustomerLoan RejectionReason
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          customerLoanId            Required Id of customerLoan
 * @apiParam  {String}          reason            Required reason for customerLoan Rejection
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'InsertUpdate CustomerLoan RejectionReason ',
 *          recordList: InsertUpdate CustomerLoan RejectionReason ,
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
router.post('/insertUpdateLoanRejectionReason', personalloans_1.default.insertUpdateCustomerLoanRejectionReason);
// #region /api/admin/personalLoans/insertUpdatePersonalLoanBasicDetail apidoc
/**
 * @api {post} /api/admin/personalLoans/insertUpdatePersonalLoanBasicDetail InsertUpdate CustomerLoan Basic Detail
 * @apiVersion 1.0.0
 * @apiName InsertUpdate CustomerLoan Basic Detail
 * @apiDescription InsertUpdate CustomerLoan Basic Detail
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}             customerId                      Requires Customer Id.
 * @apiParam  {String}              alternativeContactNo            Requires Customer Alternate Contact No.
 * @apiParam  {String}              gender                          Requires Customer Gender.
 * @apiParam  {Integer}             maritalStatusId                 Requires Customer Marital Status.
 * @apiParam  {String}              motherName                      Requires Customer Mother Name.
 * @apiParam  {String}              fatherContactNo                 Requires Customer Father Contact No.
 * @apiParam  {Integer}             [customerLoanSpouseId]          Optional Customer Loan Spouse Id.
 * @apiParam  {String}              [spouseName]                    Optional Customer Loan Spouse Name.
 * @apiParam  {String}              [spouseContactNo]               Optional Customer Loan Spouse ContactNo.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'InsertUpdate CustomerLoan BasicDetail',
 *          recordList: InsertUpdate CustomerLoan BasicDetail ,
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
router.post('/insertUpdatePersonalLoanBasicDetail', personalloans_1.default.insertUpdatePersonalLoanBasicDetail);
// #region /api/admin/personalLoans/insertUpdatePersonalLoanEmploymentDetail apidoc
/**
 * @api {post} /api/admin/personalLoans/insertUpdatePersonalLoanEmploymentDetail InsertUpdate CustomerLoan Employment Detail
 * @apiVersion 1.0.0
 * @apiName InsertUpdate CustomerLoan Employment Detail
 * @apiDescription InsertUpdate CustomerLoan Employment Detail
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}             employmentTypeId                Requires Employment Type Id.
 * @apiParam  {Integer}             monthlyIncome                   Requires Monthly Income.
 * @apiParam  {String}              companyName                     Requires Company Name.
 * @apiParam  {String}              officePincode                   Requires Office Pincode.
 * @apiParam  {Integer}             customerId                      Requires Customer Id.
 * @apiParam  {Integer}             serviceId                       Requires Service Id.
 * @apiParam  {Integer}             [customerLoanId]                Optional CustomerLoan Id.
 * @apiParam  {Integer}             customerLoanEmploymentId            Requires Customer Loan Employmentdetail Id.
 * @apiParam  {Integer}             customerLoanId                      Requires Customer Loan Id.
 * @apiParam  {String}              emailId                             Requires Customer Email Id.
 * @apiParam  {Integer}             companyTypeId                       Requires Company TypeId.
 * @apiParam  {String}              label                               Requires Company Address Label.
 * @apiParam  {String}              addressLine1                        Requires Company AddressLine 1.
 * @apiParam  {String}              addressLine2                        Requires Company AddressLine 2.
 * @apiParam  {String}              pincode                             Requires Company Address Pincode.
 * @apiParam  {Integer}             cityId                              Requires Company Address CityId.
 * @apiParam  {String}              city                                Requires Company Address City.
 * @apiParam  {String}              district                            Requires Company Address District.
 * @apiParam  {String}              state                               Requires Company Address State.
 * @apiParam  {String}              designation                         Requires Designation.
 * @apiParam  {String}              currentCompanyExperience            Requires Current company Experience.
 * @apiParam  {Integer}             [companyAddressId]                  Optional Company Address Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'InsertUpdate CustomerLoan Employment Detail',
 *          recordList: InsertUpdate CustomerLoan Employment Detail ,
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
router.post('/insertUpdatePersonalLoanEmploymentDetail', personalloans_1.default.insertUpdatePersonalLoanEmploymentDetail);
// #region /api/customer/personalLoans/updatePersonalLoanAmount apidoc
/**
 * @api {post} /api/admin/personalLoans/updatePersonalLoanAmount Update Loan Amount
 * @apiVersion 1.0.0
 * @apiName Update Loan Amount
 * @apiDescription Update Loan Amount
 * @apiGroup Personal Loan - Admin
 * @apiParam  {Integer}             loanAmount                      Requires Loan Amount.
 * @apiParam  {Integer}             customerLoanId                  Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Loan Amount Updated',
 *          recordList: Customer Loan,
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
router.post('/updatePersonalLoanAmount', personalloans_1.default.updatePersonalLoanAmount);
// #region /api/admin/personalLoans/insertOffer apidoc
/**
 * @api {post} /api/admin/personalLoans/insertOffer Insert CustomerLoan  Offer
 * @apiVersion 1.0.0
 * @apiName Insert CustomerLoan Offer
 * @apiDescription Insert CustomerLoan Offer
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          customerLoanId            Required Id of customerLoan
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert CustomerLoan Offer ',
 *          recordList: Insert CustomerLoan Offer ,
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
router.post('/insertOffer', personalloans_1.default.insertOffer);
// #region /api/admin/personalLoans/getLoanOffer apidoc
/**
 * @api {post} /api/admin/personalLoans/getLoanOffer Get CustomerLoan  Offer
 * @apiVersion 1.0.0
 * @apiName Get CustomerLoan Offer
 * @apiDescription Get CustomerLoan Offer
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          customerLoanId            Required Id of customerLoan
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get CustomerLoan Offer ',
 *          recordList: Get CustomerLoan Offer ,
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
router.post('/getLoanOffer', personalloans_1.default.getLoanOffer);
// #region /api/admin/personalLoans/deleteLoanById apidoc
/**
 * @api {post} /api/admin/personalLoans/deleteLoanById Delete Customer Loan
 * @apiVersion 1.0.0
 * @apiName Delete Customer Loan
 * @apiDescription Delete Customer Loan
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          customerLoanId            Required Id of customerLoan
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Delete Customer Loan',
 *          recordList: Delete Customer Loan ,
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
router.post('/deleteLoanById', personalloans_1.default.deleteLoanById);
// #region /api/customer/personalLoans/uploadPersonalLoanDocumentAndReference apidoc
/**
 * @api {post} /api/customer/personalLoans/uploadPersonalLoanDocumentAndReference Upload Loan Document and Reference
 * @apiVersion 1.0.0
 * @apiName Upload Loan Document and Reference
 * @apiDescription Upload Loan Document and Reference
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiParam  {Array}               loanDocuments               Requires Uploaded Documents Array {documentData,isPdf,documentName,loanDocumentId(Required Id Update),documentId,serviceTypeDocumentId}.
 * @apiParam  {Array}               loanReferences              Requires References Array {loanReferenceId(isUpdated),name,contactNo}.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Upload Loan Document and Reference',
 *          recordList: Personal Loan,
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
router.post('/uploadPersonalLoanDocumentAndReference', personalloans_1.default.uploadPersonalLoanDocumentAndReference);
// #region /api/admin/personalLoans/acceptLoanOffer apidoc
/**
 * @api {post} /api/admin/personalLoans/acceptLoanOffer Accept CustomerLoan Offer
 * @apiVersion 1.0.0
 * @apiName Accept CustomerLoan Offer
 * @apiDescription Accept CustomerLoan Offer
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          bankOfferId            Required Id of bankOffer
 * @apiParam  {Integer}          isAccept            Required status of offer
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Accept CustomerLoan Offer ',
 *          recordList: Accept CustomerLoan Offer ,
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
router.post('/acceptLoanOffer', personalloans_1.default.acceptLoanOffer);
// #region /api/admin/personalLoans/disbursedApplication apidoc
/**
 * @api {post} /api/admin/personalLoans/disbursedApplication Accept CustomerLoan Offer
 * @apiVersion 1.0.0
 * @apiName Accept CustomerLoan Offer
 * @apiDescription Accept CustomerLoan Offer
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          bankOfferId            Required Id of bankOffer
 * @apiParam  {Integer}          isAccept            Required status of offer
  * @apiParam  {Integer}          customerLoanId            Required id of customerLoan
  * @apiParam  {Integer}               serviceId       Required id of service
  *@apiParam  {Integer}          bankId            Required id of bank
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Accept CustomerLoan Offer ',
 *          recordList: Accept CustomerLoan Offer ,
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
router.post('/disbursedApplication', personalloans_1.default.disbursedApplication);
// #region /api/admin/personalLoans/insertLoanDetail apidoc
/**
 * @api {post} /api/admin/personalLoans/insertLoanDetail Insert Loan detail
 * @apiVersion 1.0.0
 * @apiName Insert Loan detail
 * @apiDescription Insert Loan detail
 * @apiGroup Personal Loans - Admin
 * @apiParam  {Integer}          bankId            Required Id of bank
 * @apiParam  {Integer}          amountDisbursed            Required amountDisbursed
  * @apiParam  {Integer}          customerLoanId            Required id of customerLoan
  * @apiParam  {Integer}               ROI       Required ROI
  *@apiParam  {Integer}          tenure            Required tenure
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Accept CustomerLoan Offer ',
 *          recordList: Accept CustomerLoan Offer ,
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
router.post('/insertLoanDetail', personalloans_1.default.insertLoanDetail);
module.exports = router;
