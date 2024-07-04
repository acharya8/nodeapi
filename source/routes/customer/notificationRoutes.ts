import express from 'express';
import controller from '../../controllers/customer/notification';

const router = express.Router();

// #region /api/customer/notifications/getNotifications apidoc
/**
 * @api {post} /api/customer/notifications/getNotifications Get Users Notification
 * @apiVersion 1.0.0
 * @apiName Get Users Notification
 * @apiDescription Get Users Notification
 * @apiGroup Users Notification - Customer
 * @apiParam  {Integer}             [startIndex]                Optional Start Index.
 * @apiParam  {Integer}             [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Users Notification',
 *          recordList: Users Notification,
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
router.post('/getNotifications', controller.getNotifications);

export = router;