import express from 'express';
import controller from '../../controllers/admin/permissionGroup';

const router = express.Router();

// #region /api/admin/permissionGroup/getPermissionGroup apidoc
/**
 * @api {post} /api/admin/permissionGroup/getPermissionGroup Get Permission Group
 * @apiVersion 1.0.0
 * @apiName Get Permission Group
 * @apiDescription Get Permission Group
 * @apiGroup PermissionGroup - Admin
 * @apiParam  {Integer}         [startIndex]                    Optional Fetch Records.
 * @apiParam  {Integer}         [fetchRecords]                  Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Permission Group',
 *          recordList: PermissionGroup,
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
router.post('/getPermissionGroup', controller.getPermissionGroup);

// #region /api/admin/permissionGroup/insertPermissionGroup apidoc
/**
 * @api {post} /api/admin/permissionGroup/insertPermissionGroup Insert Permission Group
 * @apiVersion 1.0.0
 * @apiName Insert Permission Group
 * @apiDescription Insert Permission Group
 * @apiGroup PermissionGroup - Admin
 * @apiParam  {String}          name                        Required Name.
 * @apiParam  {Array}           pagePermissions             Required Page Permissions Array.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Permission Group',
 *          recordList: PermissionGroup,
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
router.post('/insertPermissionGroup', controller.insertPermissionGroup);

// #region /api/admin/permissionGroup/updatePermissionGroup apidoc
/**
 * @api {post} /api/admin/permissionGroup/updatePermissionGroup Update Permission Group
 * @apiVersion 1.0.0
 * @apiName Update Permission Group
 * @apiDescription Update Permission Group
 * @apiGroup PermissionGroup - Admin
 * @apiParam  {Integer}         id                          Required id.
 * @apiParam  {String}          name                        Required Name.
 * @apiParam  {Array}           pagePermissions             Required Page Permissions Array.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Permission Group',
 *          recordList: PermissionGroup,
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
router.post('/updatePermissionGroup', controller.updatePermissionGroup);

export = router;