"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const serviceDocuments_1 = __importDefault(require("../../controllers/admin/serviceDocuments"));
const router = express_1.default.Router();
// #region /api/admin/serviceDocuments/getServiceDocuments apidoc
/**
 * @api {post} /api/admin/serviceDocuments/getServiceDocuments Get Service Documents
 * @apiVersion 1.0.0
 * @apiName Get Service Documents
 * @apiDescription Get Service Documents
 * @apiGroup Service Documents - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Service Documents',
 *          recordList: Service Documents,
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
router.post('/getServiceDocuments', serviceDocuments_1.default.getServiceDocuments);
// #region /api/admin/serviceDocuments/insertServiceDocuments apidoc
/**
 * @api {post} /api/admin/serviceDocuments/insertServiceDocuments insert Service Documents
 * @apiVersion 1.0.0
 * @apiName insert Service Documents
 * @apiDescription insert Service Documents
 * @apiGroup Service Documents - Admin
 * @apiParam  {Integer}         serviceId           Requires Service Type Id.
 * @apiParam  {Integet}         documentId          Requires Document Master Id.
 * @apiParam  {String}          documentName        Requires Document Master Name.
 * @apiParam  {String}          displayName         Requires Service Document Display Name.
 * @apiParam  {Integer}         documentCount       Requires No of particulat type of document necessory for this service.
 * @apiParam  {Boolean}         isRequired          Requires this document is required or not.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Service Documents',
 *          recordList: Service Documents,
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
router.post('/insertServiceDocuments', serviceDocuments_1.default.insertServiceDocuments);
// #region /api/admin/serviceDocuments/updateServiceDocuments apidoc
/**
 * @api {post} /api/admin/serviceDocuments/updateServiceDocuments Update Service Documents
 * @apiVersion 1.0.0
 * @apiName Update Service Documents
 * @apiDescription Update Service Documents
 * @apiGroup Service Documents - Admin
 * @apiParam  {Integer}         id                  Requires Service Document Id.
 * @apiParam  {Integer}         serviceId           Requires Service Type Id.
 * @apiParam  {Integet}         documentId          Requires Document Master Id.
 * @apiParam  {String}          documentName        Requires Document Master Name.
 * @apiParam  {String}          displayName         Requires Service Document Display Name.
 * @apiParam  {Integer}         documentCount       Requires No of particulat type of document necessory for this service.
 * @apiParam  {Boolean}         isRequired          Requires this document is required or not.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Service Documents',
 *          recordList: Service Documents,
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
router.post('/updateServiceDocuments', serviceDocuments_1.default.updateServiceDocuments);
// #region /api/admin/serviceDocuments/activeInactiveServiceDocuments apidoc
/**
 * @api {post} /api/admin/serviceDocuments/activeInactiveServiceDocuments Change Service Documents Status
 * @apiVersion 1.0.0
 * @apiName Change Service Documents Status
 * @apiDescription Change Service Documents Status
 * @apiGroup Service Documents - Admin
 * @apiParam  {Integer}         id                  Requires Service Document Id.
 * @apiParam  {Boolean}         isActive            Requires Status.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Service Documents Status',
 *          recordList: Service Documents,
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
router.post('/activeInactiveServiceDocuments', serviceDocuments_1.default.activeInactiveServiceDocuments);
module.exports = router;
