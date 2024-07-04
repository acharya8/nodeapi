"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const creditCard_1 = __importDefault(require("../../controllers/customer/creditCard"));
const router = express_1.default.Router();
// #region /api/customer/creditCards/insertUpdateCreditCardProfileDetail apidoc
/**
 * @api {post} /api/customer/creditCards/insertUpdateCreditCardProfileDetail Insert/Update Credit Card Profile Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Credit Card Profile Detail
 * @apiDescription Insert/Update Credit Card Profile Detail
 * @apiGroup Credit Card - Customer
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Credit Card Profile Detail',
 *          recordList: Credit Card,
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
router.post('/insertUpdateCreditCardProfileDetail', creditCard_1.default.insertUpdateProfileDetail);
// #region /api/customer/creditCards/insertUpdateCreditCardEmploymentDetail apidoc
/**
 * @api {post} /api/customer/creditCards/insertUpdateCreditCardEmploymentDetail Insert/Update Credit Card Employment Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Credit Card Employment Detail
 * @apiDescription Insert/Update Credit Card Employment Detail
 * @apiGroup Credit Card - Customer
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Credit Card Employment Detail',
 *          recordList: Credit Card,
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
router.post('/insertUpdateCreditCardEmploymentDetail', creditCard_1.default.insertUpdateEmploymentDetail);
// #region /api/customer/creditCards/insertUpdateCustomerAddress apidoc
/**
 * @api {post} /api/customer/creditCards/insertUpdateCustomerAddress Insert/Update Customer Address
 * @apiVersion 1.0.0
 * @apiName Insert/Update Customer Address
 * @apiDescription Insert/Update Customer Address
 * @apiGroup Credit Card - Customer
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Customer Address',
 *          recordList: Credit Card,
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
router.post('/insertUpdateCustomerAddress', creditCard_1.default.insertUpdateCustomerAddress);
// #region /api/customer/creditCards/insertUpdateCustomerWorkAddress apidoc
/**
 * @api {post} /api/customer/creditCards/insertUpdateCustomerWorkAddress Insert/Update Customer Work Address
 * @apiVersion 1.0.0
 * @apiName Insert/Update Customer Work Address
 * @apiDescription Insert/Update Custome Work Address
 * @apiGroup Credit Card - Customer
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Customer Work Address',
 *          recordList: Credit Card,
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
router.post('/insertUpdateCustomerWorkAddress', creditCard_1.default.insertUpdateCustomerWorkAddress);
// #region /api/customer/creditCards/chooseCommunicationAddress apidoc
/**
 * @api {post} /api/customer/creditCards/chooseCommunicationAddress choose Communication Address
 * @apiVersion 1.0.0
 * @apiName choose Communication Address
 * @apiDescription choose Communication Address
 * @apiGroup Credit Card - Customer
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'choose Communication Address',
 *          recordList: Credit Card,
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
router.post('/chooseCommunicationAddress', creditCard_1.default.chooseCommunicationAddress);
// #region /api/customer/creditCards/getIncompleteCreditCardDetail apidoc
/**
 * @api {post} /api/customer/creditCards/getIncompleteCreditCardDetail getIncompleteCreditCardDetail
 * @apiVersion 1.0.0
 * @apiName getIncompleteCreditCardDetail
 * @apiDescription getIncompleteCreditCardDetail
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}             customerId        Requires Customer Id.
 * @apiParam  {Integer}             serviceId         Requires Service Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'getIncompleteCreditCardDetaill',
 *          recordList: Credit Card,
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
router.post('/getIncompleteCreditCardDetail', creditCard_1.default.getIncompleteCreditCardDetail);
// #region /api/customer/creditCards/getCustomerCreditCardById apidoc
/**
 * @api {post} /api/customer/creditCards/getCustomerCreditCardById GetCustomerCreditCardById
 * @apiVersion 1.0.0
 * @apiName getIncompleteCreditCardDetail
 * @apiDescription getIncompleteCreditCardDetail
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}             customerId                  Requires Customer Id.
 * @apiParam  {Integer}          customerCreditCardId        Requires Customer Credit card Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'GetCustomerCreditCardById',
 *          recordList: Credit Card,
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
router.post('/getCustomerCreditCardById', creditCard_1.default.getCustomerCreditCardById);
// #region /api/customer/creditCards/creditCardEligibility apidoc
/**
 * @api {post} /api/customer/creditCards/creditCardEligibility creditCardEligibility
 * @apiVersion 1.0.0
 * @apiName creditCardEligibility
 * @apiDescription creditCardEligibility
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}          customerCreditCardId        Requires Customer Credit card Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'creditCardEligibility',
 *          recordList: Credit Card,
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
router.post('/creditCardEligibility', creditCard_1.default.creditCardEligibility);
// #region /api/customer/creditCards/insertUpdateCustomerCreditCardOffer apidoc
/**
 * @api {post} /api/customer/creditCards/insertUpdateCustomerCreditCardOffer insert/Update Customer CreditCard Offer
 * @apiVersion 1.0.0
 * @apiName insert/Update Customer CreditCard Offer
 * @apiDescription insert/Update Customer CreditCard Offer
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}         customerCreditCardId        Requires Customer Credit card Id.
 * @apiParam  {Integer}         bankCreditCardId            Requires BAnk Credit card Id.
 * @apiParam  {Integer}         [id]                        Optional Customer Credit card Offer Id.
 * @apiParam  {Integer}         [referenceNo]               Optional pass While Update.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert/Update Customer CreditCard Offer',
 *          recordList: Credit Card,
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
router.post('/insertUpdateCustomerCreditCardOffer', creditCard_1.default.insertUpdateCustomerCreditCardOffer);
// #region /api/customer/creditCards/getCustomerCreditCardRejectionReason apidoc
/**
 * @api {post} /api/customer/creditCards/getCustomerCreditCardRejectionReason get Customer Credit Card Rejection Reason
 * @apiVersion 1.0.0
 * @apiName get Customer Credit Card Rejection Reason
 * @apiDescription get Customer Credit Card Rejection Reason
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}         customerCreditCardId            Requires Customer Credit card Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'get Customer Credit Card Rejection Reason',
 *          recordList: Credit Card,
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
router.post('/getCustomerCreditCardRejectionReason', creditCard_1.default.getCustomerCreditCardRejectionReason);
// #region /api/customer/creditCards/getCompletedCreditCards apidoc
/**
 * @api {post} /api/customer/creditCards/getCompletedCreditCards get Customer Credit Card Rejection Reason
 * @apiVersion 1.0.0
 * @apiName get Customer Credit Card Rejection Reason
 * @apiDescription get Customer Credit Card Rejection Reason
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}         customerCreditCardId            Requires Customer Credit card Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'get Customer Credit Card Rejection Reason',
 *          recordList: Credit Card,
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
router.post('/getCompletedCreditCards', creditCard_1.default.getCompletedCreditCards);
// #region /api/customer/creditCards/changeEmploymentType apidoc
/**
 * @api {post} /api/customer/creditCards/changeEmploymentType change employment type for credit card
 * @apiVersion 1.0.0
 * @apiName change employment type for credit card
 * @apiDescription change employment type for credit card
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}         customerCreditCardId            Requires Customer Credit card Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'change employment type for credit card',
 *          recordList: Credit Card,
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
router.post('/changeEmploymentType', creditCard_1.default.changeEmploymentType);
module.exports = router;
