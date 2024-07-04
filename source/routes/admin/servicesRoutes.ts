import express from 'express';
import controller from '../../controllers/admin/services';

const router = express.Router();

// #region /api/admin/services/getServices apidoc
/**
 * @api {post} /api/admin/services/getServices Get Services
 * @apiVersion 1.0.0
 * @apiName Get Services
 * @apiDescription Get Services
 * @apiGroup Services - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Services',
 *          recordList: Service,
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
router.post('/getServices', controller.getServices);

// #region /api/admin/services/insertServices apidoc
/**
 * @api {post} /api/admin/services/insertServices insert Service
 * @apiVersion 1.0.0
 * @apiName insert Service
 * @apiDescription insert Service
 * @apiGroup Services - Admin
 * @apiParam  {String}          name                Requires Service Name.
 * @apiParam  {String}          serviceTypeId       Requires Service Type Id.
 * @apiParam  {String}          displayName         Requires Service Display Name.
 * @apiParam  {String}          [description]       Optional Service Description.
 * @apiParam  {String}          iconUrl             Requires Service Icon Url.
 * @apiParam  {String}          colorCode           Requires Service Color Code.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Service',
 *          recordList: Service,
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
router.post('/insertServices', controller.insertServices);

// #region /api/admin/services/updateServices apidoc
/**
 * @api {post} /api/admin/services/updateServices Update Service
 * @apiVersion 1.0.0
 * @apiName Update Service
 * @apiDescription Update Service
 * @apiGroup Service - Admin
 * @apiParam  {Integer}         id                  Requires Service Id.
 * @apiParam  {Integer}         serviceTypeId       Requires Service Type Id.
 * @apiParam  {String}          name                Requires Service Name.
 * @apiParam  {String}          displayName         Requires Service Display Name.
 * @apiParam  {String}          [description]       Optional Service Description.
 * @apiParam  {String}          iconUrl             Requires Service Icon Url.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Service',
 *          recordList: Service,
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
router.post('/updateServices', controller.updateServices);

// #region /api/admin/services/activeInactiveServices apidoc
/**
 * @api {post} /api/admin/services/activeInactiveServices Change Service Status
 * @apiVersion 1.0.0
 * @apiName Change Service Status
 * @apiDescription Change Service Status
 * @apiGroup Service - Admin
 * @apiParam  {Integer}         id                  Requires Service Id.
 * @apiParam  {Boolean}         isActive            Requires Status.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Service Status',
 *          recordList: Service,
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
router.post('/activeInactiveServices', controller.activeInactiveServices);

export = router;