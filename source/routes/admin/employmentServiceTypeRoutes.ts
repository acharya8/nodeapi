import express from 'express';
import controller from '../../controllers/admin/employmentServiceType';

const router = express.Router();

// #region /api/admin/employmentServiceType/getEmploymentServiceType apidoc
/**
 * @api {post} /api/admin/employmentServiceType/getEmploymentServiceType Get Employment ServiceType
 * @apiVersion 1.0.0
 * @apiName Get Employment ServiceType
 * @apiDescription Get Employment ServiceType
 * @apiGroup Employment ServiceType - Admin
 *  @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Employment ServiceType',
 *          recordList: Employment ServiceType,
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
router.post('/getEmploymentServiceType', controller.getEmploymentServiceType);

// #region /api/admin/employmentServiceType/insertEmploymentServiceType apidoc
/**
 * @api {post} /api/admin/employmentServiceType/insertEmploymentServiceType insert Employment ServiceType
 * @apiVersion 1.0.0
 * @apiName insert Employment ServiceType
 * @apiDescription insertEmployment ServiceType
  * @apiGroup Employment ServiceType - Admin
 * @apiParam  {String}          name                Requires name of Employment ServiceType
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Employment ServiceType',
 *          recordList: Employment ServiceType,
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
router.post('/insertEmploymentServiceType', controller.insertEmploymentServiceType);

// #region /api/admin/employmentServiceType/updateEmploymentServiceType apidoc
/**
 * @api {post} /api/admin/employmentServiceType/updateEmploymentServiceType update Employment ServiceType
 * @apiVersion 1.0.0
 * @apiName Update Employment ServiceType
 * @apiDescription Update Employment ServiceType
  * @apiGroup Employment ServiceType - Admin
 * @apiParam  {String}          name                Requires name of Employment ServiceType.
 * @apiParam  {Integer}         id                  Requires Employment ServiceType Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Employment ServiceType',
 *          recordList: Employment ServiceType,
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
router.post('/updateEmploymentServiceType', controller.updateEmploymentServiceType);

// #region /api/admin/employmentServiceType/activeInactiveEmploymentServiceType apidoc
/**
 * @api {post} /api/admin/employmentServiceType/activeInactiveEmploymentServiceType Change Employment ServiceType Status
 * @apiVersion 1.0.0
 * @apiName Change Employment ServiceType Status
 * @apiDescription Change Employment ServiceType Status
 * @apiGroup Employment ServiceType - Admin
 * @apiParam  {Integer}         id                  Requires Employment ServiceType Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'ChangeEmployment ServiceType Status',
 *          recordList: Employment ServiceType,
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
router.post('/activeInactiveEmploymentServiceType', controller.activeInactiveEmploymentServiceType);

export = router;