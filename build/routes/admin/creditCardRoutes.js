"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const creditCard_1 = __importDefault(require("../../controllers/admin/creditCard"));
const router = express_1.default.Router();
// #region /api/admin/creditCard/getCreditCard apidoc
/**
 * @api {post} /api/admin/creditCard/getCreditCard Get CreditCard
 * @apiVersion 1.0.0
 * @apiName Get CreditCard
 * @apiDescription Get CreditCard
 * @apiGroup CreditCard - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get CreditCard',
 *          recordList: CreditCard,
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
router.post('/getCreditCard', creditCard_1.default.getCreditCard);
// #region /api/admin/creditCard/getCreditCardById apidoc
/**
 * @api {post} /api/admin/creditCard/getCreditCardById Get CreditCard ById
 * @apiVersion 1.0.0
 * @apiName Get CreditCard
 * @apiDescription Get CreditCard
 * @apiGroup CreditCard - Admin
 * @apiParam  {String}          [customerId]                Required customerId
 * @apiParam  {String}          [customercreditcardId]              required customerCreditCardId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get CreditCard',
 *          recordList: CreditCard,
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
router.post('/getCreditCardById', creditCard_1.default.getCreditCardById);
// #region /api/admin/creditCard/insertUpdateCreditCard apidoc
/**
 * @api {post} /api/admin/creditCard/insertUpdateCreditCard Insert/Update CreditCard
 * @apiVersion 1.0.0
 * @apiName Insert/Update CreditCard
 * @apiDescription Insert/Update CreditCard
 * @apiGroup Insert/Update CreditCard  - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert CreditCard',
 *          recordList: CreditCard,
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
router.post('/insertUpdateCreditCard', creditCard_1.default.insertUpdateCreditCard);
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
// #region /api/customer/creditCards/changeCreditCardOfferStatus apidoc
/**
 * @api {post} /api/customer/creditCards/changeCreditCardOfferStatus Change Credit Card Offer Status
 * @apiVersion 1.0.0
 * @apiName Change Credit Card Offer Status
 * @apiDescription Change Credit Card Offer Status
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}         customerCreditCardId        Requires Customer Credit card Id.
 * @apiParam  {Integer}         creditCardStatusId          Requires Credit card Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Credit Card Offer Status',
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
router.post('/changeCreditCardOfferStatus', creditCard_1.default.changeCreditCardOfferStatus);
// #region /api/customer/creditCards/inserUpdaterejectCreditCardOffer apidoc
/**
 * @api {post} /api/customer/creditCards/inserUpdaterejectCreditCardOffer insert/Update Reject Credit Card Offer
 * @apiVersion 1.0.0
 * @apiName insert/Update Reject Credit Card Offer
 * @apiDescription insert/Update Reject Credit Card Offer
 * @apiGroup Credit Card - Customer
 * @apiParam  {Integer}         customerCreditCardId            Requires Customer Credit card Id.
 * @apiParam  {Integer}         creditCardStatusId              Requires Credit Card Status Id.
 * @apiParam  {String}          reason                          Requires Customer Credit Card Rejection Id.
 * @apiParam  {Integer}         [id]                            Optional Customer Credit Card Rejection Reason Id.
 * @apiParam  {Array}           [reasons]                       Optional Resons Array.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert/Update Reject Credit Card Offer',
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
router.post('/inserUpdaterejectCreditCardOffer', creditCard_1.default.inserUpdaterejectCreditCardOffer);
// #region /api/customer/creditCards/getCreditCardStatuses apidoc
/**
 * @api {post} /api/customer/creditCards/getCreditCardStatuses get Customer Credit Card Statuses
 * @apiVersion 1.0.0
 * @apiName get Customer Credit Card Statuses
 * @apiDescription get Customer Credit Card Statuses
 * @apiGroup Credit Card - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'get Customer Credit Card Status',
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
router.post('/getCreditCardStatuses', creditCard_1.default.getCreditCardStatuses);
module.exports = router;
