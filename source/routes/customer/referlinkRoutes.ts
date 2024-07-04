import express from 'express';
import controller from '../../controllers/customer/referlink';

const router = express.Router();

// #region /api/customer/referLink/insertReferLink apidoc
/**
 * @api {post} /api/customer/referLink/insertReferLink Insert Refer Link
 * @apiVersion 1.0.0
 * @apiName Insert Refer Link
 * @apiDescription Insert Refer Link
 * @apiGroup Refer Link - Customer
 * @apiParam  {Integer}             roleId                Requires Role Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Refer Link',
 *          recordList: Refer Link Detail,
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
router.post('/insertReferLink', controller.insertReferLink);

export = router;