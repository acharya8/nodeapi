import express from 'express';
import controller from '../../controllers/admin/maritalStatus';

const router = express.Router();

// #region /api/admin/maritalStatuses/getMaritalStatuses apidoc
/**
 * @api {post} /api/admin/maritalStatuses/getMaritalStatuses Get Marital Status
 * @apiVersion 1.0.0
 * @apiName Get Marital Status
 * @apiDescription Get Marital Statusr
 * @apiGroup Marital Status - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Marital Status',
 *          recordList: Marital Status,
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
router.post('/getMaritalStatuses', controller.getMaritalStatus);

// #region /api/admin/maritalStatuses/insertUpdateMaritalStatuses apidoc
/**
 * @api {post} /api/admin/maritalStatuses/insertUpdateMaritalStatuses insert Marital Statuses
 * @apiVersion 1.0.0
 * @apiName insert Marital Statuses
 * @apiDescription insert Marital Statuses
  * @apiGroup Marital Status - Admin
 * @apiParam  {String}          status                Requires status of marital Status.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Marital Status',
 *          recordList: Marital Status,
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
router.post('/insertMaritalStatus', controller.insertMaritalStatus);

// #region /api/admin/maritalStatuses/updateUpdateMaritalStatus apidoc
/**
 * @api {post} /api/admin/maritalStatuses/updateUpdateMaritalStatus update Marital Statuses
 * @apiVersion 1.0.0
 * @apiName Update Marital Statuses
 * @apiDescription Update Marital Statuses
  * @apiGroup Marital Status - Admin
 * @apiParam  {String}          status                Requires status of marital Status.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Marital Status',
 *          recordList: Marital Status,
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
router.post('/updateMaritalStatus', controller.updateMaritalStatus);

// #region /api/admin/maritalStatuses/activeInactiveMaritalStatus apidoc
/**
 * @api {post} /api/admin/maritalStatuses/activeInactiveMaritalStatus Change Marital Status
 * @apiVersion 1.0.0
 * @apiName Change Marital Status
 * @apiDescription Change Marital Status
 * @apiGroup Marital Status - Admin
 * @apiParam  {Integer}         id                  Requires Marital Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Marital Status',
 *          recordList: Marital Status,
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
router.post('/activeInactiveMaritalStatus', controller.activeIanctiveMaritalStatus);

export = router;