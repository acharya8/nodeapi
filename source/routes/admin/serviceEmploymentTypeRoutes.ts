import express from 'express';
import controller from '../../controllers/admin/serviceEmploymentType';

const router = express.Router();

// #region /api/admin/serviceEmploymentType/getServiceEmploymentTypes apidoc
/**
 * @api {post} /api/admin/serviceEmploymentType/getServiceEmploymentTypes Get Service Employment Types
 * @apiVersion 1.0.0
 * @apiName Get Service Employment Types
 * @apiDescription Get Service Employment Types
 * @apiGroup Service Employment Types - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Service Employment Types',
 *          recordList: Service Employment Types,
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
router.post('/getServiceEmploymentTypes', controller.getServiceEmploymentTypes);

// #region /api/admin/serviceEmploymentType/insertServiceEmploymentType apidoc
/**
 * @api {post} /api/admin/serviceEmploymentType/insertServiceEmploymentType insert Service Employment Types
 * @apiVersion 1.0.0
 * @apiName insert Employment Types
 * @apiDescription insert Service Employment Types
 * @apiGroup Servcie Employment Types - Admin
 * @apiParam  {number}          serviceId                Requires is of service.
 * @apiParam  {number}          employmentTypeIds            Required id of employmentTypes.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Service Employment Types',
 *          recordList:Service Employment Types,
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
router.post('/insertServiceEmploymentType', controller.insertServiceEmploymentType);

// #region /api/admin/serviceEmploymentTypes/updateServiceEmploymentType apidoc
/**
 * @api {post} /api/admin/serviceTypes/updateServiceEmploymentType update Service Employment Types
 * @apiVersion 1.0.0
 * @apiName update Service Employment Types
 * @apiDescription update Service Employment Types
 * @apiGroup Service Employment Types - Admin
 * @apiParam  {number}          id                Requires id of Employment Type .
 * @apiParam  {String}          serviceId              Requires id of serviceId.
 * @apiParam  {number}          employmentTypeIds          Required id of Employment Types.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Service Employment Types',
 *          recordList: Service Employment Types,
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
router.post('/updateServiceEmploymentType', controller.updateServiceEmploymentType);

// #region /api/admin/serviceEmploymentTypes/activeInactiveServiceEmploymentType apidoc
/**
 * @api {post} /api/admin/serviceEmploymentTypes/activeInactiveServiceEmploymentType Change Service Employment Types Status
 * @apiVersion 1.0.0
 * @apiName Change Service Employment Types Status
 * @apiDescription Change Service Employment Types Status
 * @apiGroup Service Employment Types - Admin
 * @apiParam  {Integer}         id                  Requires Service Employment Type Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Service Employment Types Status',
 *          recordList: Service Employment Types,
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
router.post('/activeInactiveServiceEmploymentType', controller.activeInactiveServiceEmploymentType);

export = router;