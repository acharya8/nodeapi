import express from 'express';
import controller from '../../controllers/admin/orders';

const router = express.Router();

// #region /api/admin/orders/getOrders apidoc
/**
 * @api {post} /api/admin/orders/getOrders Get Orders
 * @apiVersion 1.0.0
 * @apiName Get Orders
 * @apiDescription Get Orders
 * @apiGroup Orders - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index.
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiParam  {String}          [searchString]              Optional Search String.
 * @apiParam  {String}          [fromDate]                  Optional From Date.
 * @apiParam  {String}          [toDate]                    Optional To Date.
 * @apiParam  {Array}           [statusIds]                 Optional Array of Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Orders',
 *          recordList: Orders,
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
router.post('/getOrders', controller.getOrders);

// #region /api/admin/orders/changeOrderStatus apidoc
/**
 * @api {post} /api/admin/orders/changeOrderStatus Change Order Status
 * @apiVersion 1.0.0
 * @apiName Change Order Status
 * @apiDescription Change Order Status
 * @apiGroup Orders - Admin
 * @apiParam  {Integer}          [orderId]                Required Order Id.
 * @apiParam  {Integer}          [statusId]               Required Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Order Status',
 *          recordList: Orders,
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
router.post('/changeOrderStatus', controller.changeOrderStatus);

// #region /api/admin/orders/getOrderStatus apidoc
/**
 * @api {post} /api/admin/orders/getOrderStatus Get Order Status
 * @apiVersion 1.0.0
 * @apiName Get Order Status
 * @apiDescription Get Order Status
 * @apiGroup Orders - Admin
 * @apiParam  {Integer}          [orderId]                Required Order Id.
 * @apiParam  {Integer}          [statusId]               Required Status Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Order Status',
 *          recordList: Orders,
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
router.post('/getOrderStatus', controller.getOrderStatus);

export = router;