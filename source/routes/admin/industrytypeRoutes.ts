import express from 'express';
import controller from '../../controllers/admin/industryTypes';

const router = express.Router();

// #region /api/admin/industryTypes/getIndustryTypes apidoc
/**
 * @api {post} /api/admin/industryTypes/getIndustryTypes Get Industry Types
 * @apiVersion 1.0.0
 * @apiName Get Industry Type
 * @apiDescription Get Industry Type
 * @apiGroup Industry Type - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Industry Type',
 *          recordList: Industry Type,
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
router.post('/getIndustryTypes', controller.getIndustryTypes);

// #region /api/admin/industryTypes/insertIndustryType apidoc
/**
 * @api {post} /api/admin/industryTypes/insertIndustryType insert Industry Type
 * @apiVersion 1.0.0
 * @apiName insert Industry Type
 * @apiDescription insert Industry Type
 * @apiGroup Industry Type - Admin
 * @apiParam  {String}          name                Requires name of Industry Type
 * @apiParam  {Integer}         parentId                  Optional parentId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Industry Type',
 *          recordList: Industry Type,
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
router.post('/insertIndustryType', controller.insertIndustryType);

// #region /api/admin/industryTypes/updateIndustryType apidoc
/**
 * @api {post} /api/admin/industryTypes/updateIndustryType update Industry Type
 * @apiVersion 1.0.0
 * @apiName Update Industry Type
 * @apiDescription Update Industry Type
  * @apiGroup Industry Type - Admin
 * @apiParam  {String}          name                Requires name of Industry Type.
 * @apiParam  {Integer}         id                  Requires Industry Type Id.
 * @apiParam  {Integer}         parentId                  Optional parentId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Industry Type',
 *          recordList: Industry Type,
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
router.post('/updateIndustryType', controller.updateIndustryType);

// #region /api/admin/industryTypes/activeInactiveIndustryType apidoc
/**
 * @api {post} /api/admin/industryTypes/activeInactiveIndustryType Change Industry Type Status
 * @apiVersion 1.0.0
 * @apiName Change Industry Type Status
 * @apiDescription Change Industry Type Status
 * @apiGroup Industry Type - Admin
 * @apiParam  {Integer}         id                  Requires Industry Type Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Industry Type Status',
 *          recordList: Industry Type,
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
router.post('/activeInactiveIndustryType', controller.activeInactiveIndustryType);

export = router;