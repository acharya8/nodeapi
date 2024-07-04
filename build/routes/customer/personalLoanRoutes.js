"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const personalLoan_1 = __importDefault(require("../../controllers/customer/personalLoan"));
const router = express_1.default.Router();
// #region /api/customer/personalLoans/insertUpdateEmploymentDetail apidoc
/**
 * @api {post} /api/customer/personalLoans/insertUpdateEmploymentDetail Insert/Update Employment Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Employment Detail
 * @apiDescription Insert/Update Employment Detail
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             employmentTypeId                Requires Employment Type Id.
 * @apiParam  {Integer}             monthlyIncome                   Requires Monthly Income.
 * @apiParam  {String}              companyName                     Requires Company Name.
 * @apiParam  {String}              officePincode                   Requires Office Pincode.
 * @apiParam  {Integer}             customerId                      Requires Customer Id.
 * @apiParam  {Integer}             serviceId                       Requires Service Id.
 * @apiParam  {Integer}             [customerLoanId]                Optional CustomerLoan Id.
 * @apiParam  {Integer}             [customerLoanEmploymentId]      Optional customerLoanEmployment Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Employment Detail',
 *          recordList: Personal Loan Employment Detail,
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
router.post('/insertUpdateEmploymentDetail', personalLoan_1.default.insertUpdateEmploymentDetail);
// #region /api/customer/personalLoans/updatePersonalLoanAmount apidoc
/**
 * @api {post} /api/customer/personalLoans/updatePersonalLoanAmount Update Loan Amount
 * @apiVersion 1.0.0
 * @apiName Update Loan Amount
 * @apiDescription Update Loan Amount
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             loanAmount                      Requires Loan Amount.
 * @apiParam  {Integer}             customerLoanId                  Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Loan Amount Updated',
 *          recordList: Personal Loan Employment Detail,
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
router.post('/updatePersonalLoanAmount', personalLoan_1.default.updatePersonalLoanAmount);
// #region /api/customer/personalLoans/insertUpdateMoreBasicDetail apidoc
/**
 * @api {post} /api/customer/personalLoans/insertUpdateMoreBasicDetail Update Personal Loan Basic Detail
 * @apiVersion 1.0.0
 * @apiName Update Personal Loan Basic Detail
 * @apiDescription Update Personal Loan Basic Detail
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerId                      Requires Customer Id.
 * @apiParam  {Integer}             customerLoanId                  Requires Customer Loan Id.
 * @apiParam  {String}              alternativeContactNo            Requires Customer Alternate Contact No.
 * @apiParam  {String}              gender                          Requires Customer Gender.
 * @apiParam  {Integer}             maritalStatusId                 Requires Customer Marital Status.
 * @apiParam  {String}              motherName                      Requires Customer Mother Name.
 * @apiParam  {String}              fatherContactNo                 Requires Customer Father Contact No.
 * @apiParam  {Integer}             [customerLoanSpouseId]          Optional Customer Loan Spouse Id.
 * @apiParam  {String}              [spouseName]                    Optional Customer Father Contact No.
 * @apiParam  {String}              [spouseContactNo]               Optional Customer Father Contact No.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Personal Loan Basic Detail',
 *          recordList: Update Personal Loan Basic Detail,
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
router.post('/insertUpdateMoreBasicDetail', personalLoan_1.default.insertUpdateMoreBasicDetail);
// #region /api/customer/personalLoans/updateMoreEmploymentDetail apidoc
/**
 * @api {post} /api/customer/personalLoans/updateMoreEmploymentDetail Update Personal Loan Employment Detail
 * @apiVersion 1.0.0
 * @apiName Update Personal Loan Employment Detail
 * @apiDescription Update Personal Loan Employment Detail
 * @apiGroup Personal Loan - Customer
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
 *          message: 'Update Personal Loan Employment Detail',
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
router.post('/updateMoreEmploymentDetail', personalLoan_1.default.updateMoreEmploymentDetail);
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
router.post('/uploadPersonalLoanDocumentAndReference', personalLoan_1.default.uploadPersonalLoanDocumentAndReference);
// #region /api/customer/personalLoans/getIncompletePersonalLoanDetail apidoc
/**
 * @api {post} /api/customer/personalLoans/getIncompletePersonalLoanDetail Get Incomplete Personal Loan Detail
 * @apiVersion 1.0.0
 * @apiName Get Incomplete Personal Loan Detail
 * @apiDescription Get Incomplete Personal Loan Detail
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             serviceId               Requires ServiceId Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Incomplete Personal Loan Detail',
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
router.post('/getIncompletePersonalLoanDetail', personalLoan_1.default.getIncompletePersonalLoanDetail);
// #region /api/customer/personalLoans/getCustomerPersonalById apidoc
/**
 * @api {post} /api/customer/personalLoans/getCustomerPersonalById Get Customer Personal Detail Loan By Id
 * @apiVersion 1.0.0
 * @apiName Get Customer Personal Detail Loan By Id
 * @apiDescription Get Customer Personal Detail Loan By Id
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerId              Requires Customer Id.
 * @apiParam  {Integer}             customerLoanId          Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Customer Personal Detail Loan By Id',
 *          recordList: Personal Loan Detail,
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
router.post('/getCustomerPersonalById', personalLoan_1.default.getCustomerPersonalById);
// #region /api/customer/personalLoans/acceptLoanOffer apidoc
/**
 * @api {post} /api/customer/personalLoans/acceptLoanOffer Accept Loan Offer
 * @apiVersion 1.0.0
 * @apiName Accept Loan Offer
 * @apiDescription Accept Loan Offer
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiParam  {Integer}             id              Requires id of OFfer.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Accept Loan Offer',
 *          recordList: Loan Offer,
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
router.post('/acceptLoanOffer', personalLoan_1.default.customerAcceptOffer);
// #region /api/customer/personalLoans/getGeneratedOffer apidoc
/**
 * @api {post} /api/customer/personalLoans/getGeneratedOffer Get Generated Offer
 * @apiVersion 1.0.0
 * @apiName Get Generated Offer
 * @apiDescription Get Generated Offer
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Generated Offer',
 *          recordList: Offer,
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
router.post('/getGeneratedOffer', personalLoan_1.default.getOffer);
// #region /api/customer/personalLoans/checkEligibility apidoc
/**
 * @api {post} /api/customer/personalLoans/checkEligibility Get Generated Offer
 * @apiVersion 1.0.0
 * @apiName Get Generated Offer
 * @apiDescription Get Generated Offer
 * @apiGroup Personal Loan - Customer
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Generated Offer',
 *          recordList: Offer,
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
router.post('/checkEligibility', personalLoan_1.default.checkEligibility);
// #region /api/customer/personalLoans/getLoanRejectionReason apidoc
/**
 * @api {post} /api/customer/personalLoans/getLoanRejectionReason Get Loan Rejection Reason
 * @apiVersion 1.0.0
 * @apiName Get Loan Rejection Reason
 * @apiDescription Get Loan Rejection Reason
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Loan Rejection Reason',
 *          recordList: Loan Rejection Reason,
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
router.post('/getLoanRejectionReason', personalLoan_1.default.getCustomerLoanRejectionReason);
// #region /api/customer/personalLoans/getLoanDetail apidoc
/**
 * @api {post} /api/customer/personalLoans/getLoanDetail Get Loan Detail
 * @apiVersion 1.0.0
 * @apiName Get Loan Detail
 * @apiDescription Get Loan Detail
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Loan Detail',
 *          recordList: Loan Detail,
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
router.post('/getLoanDetail', personalLoan_1.default.getCustomerLoanDetail);
// #region /api/customer/personalLoans/changeEmploymentType apidoc
/**
 * @api {post} /api/customer/personalLoans/changeEmploymentType Change EmploymentType
 * @apiVersion 1.0.0
 * @apiName Change EmploymentType
 * @apiDescription Change EmploymentType
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change EmploymentType',
 *          recordList: CustomeLoans,
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
router.post('/changeEmploymentType', personalLoan_1.default.changeEmploymentType);
// #region /api/customer/personalLoans/newToTransfer apidoc
/**
 * @api {post} /api/customer/personalLoans/newToTransfer Transfer Loan
 * @apiVersion 1.0.0
 * @apiName Transfer Loan
 * @apiDescription Transfer Loan
 * @apiGroup Personal Loan - Customer
 * @apiParam  {Integer}             customerLoanId              Requires Customer Loan Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Transfer Loan',
 *          recordList: CustomeLoans,
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
router.post('/newToTransfer', personalLoan_1.default.newToTransfer);
module.exports = router;
