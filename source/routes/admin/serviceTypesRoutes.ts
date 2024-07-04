import express from 'express';
import controller from '../../controllers/admin/serviceTypes';

const router = express.Router();

// #region /api/admin/serviceTypes/getServiceTypes apidoc
/**
 * @api {post} /api/admin/serviceTypes/getServiceTypes Get Service Types
 * @apiVersion 1.0.0
 * @apiName Get Service Types
 * @apiDescription Get Service Types
 * @apiGroup Service Types - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Service Types',
 *          recordList: Service Types,
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
router.post('/getServiceTypes', controller.getServiceTypes);

// #region /api/admin/serviceTypes/insertServiceTypes apidoc
/**
 * @api {post} /api/admin/serviceTypes/insertServiceTypes insert Service Types
 * @apiVersion 1.0.0
 * @apiName insert Service Types
 * @apiDescription insert Service Types
 * @apiGroup Service Types - Admin
 * @apiParam  {String}          name                Requires Service Type Name.
 * @apiParam  {String}          displayName         Requires Service Type Display Name.
 * @apiParam  {String}          [description]       Optional Service Type Description.
 * @apiParam  {String}          iconUrl             Requires Service Type Icon Url.
 * @apiParam  {String}          colorCode           Requires Service Type Color Code.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Service Types',
 *          recordList: Service Types,
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
router.post('/insertServiceTypes', controller.insertServiceTypes);

// #region /api/admin/serviceTypes/updateServiceTypes apidoc
/**
 * @api {post} /api/admin/serviceTypes/updateServiceTypes update Service Types
 * @apiVersion 1.0.0
 * @apiName update Service Types
 * @apiDescription update Service Types
 * @apiGroup Service Types - Admin
 * @apiParam  {number}          id                Requires id of Service Type .
 * @apiParam  {String}          name                Requires Service Type Name.
 * @apiParam  {String}          displayName         Requires Service Type Display Name.
 * @apiParam  {String}          [description]       Optional Service Type Description.
 * @apiParam  {String}          iconUrl             Requires Service Type Icon Url.
 * @apiParam  {String}          colorCode           Requires Service Type Color Code.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Service Types',
 *          recordList: Service Types,
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
router.post('/updateServiceTypes', controller.updateServiceTypes);

// #region /api/admin/serviceTypes/activeInactiveServiceTypes apidoc
/**
 * @api {post} /api/admin/serviceTypes/activeInactiveServiceTypes Change Service Types Status
 * @apiVersion 1.0.0
 * @apiName Change Service Types Status
 * @apiDescription Change Service Types Status
 * @apiGroup Service Types - Admin
 * @apiParam  {Integer}         id                  Requires Service Type Id.
 * @apiParam  {Boolean}         isActive            Requires Status.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Service Types Status',
 *          recordList: Service Types,
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
router.post('/activeInactiveServiceTypes', controller.activeInactiveServiceTypes);

export = router;