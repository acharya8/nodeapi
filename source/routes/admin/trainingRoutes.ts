import express from 'express';
import controller from '../../controllers/admin/training';

const router = express.Router();

// #region /api/admin/training/getTraining apidoc
/**
 * @api {post} /api/admin/training/getTraining Get Training
 * @apiVersion 1.0.0
 * @apiName Get Training 
 * @apiDescription Get Training 
 * @apiGroup Training - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Training',
 *          recordList: Training,
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
router.post('/getTraining', controller.getTrainings);

// #region /api/admin/training/insertTraining apidoc
/**
 * @api {post} /api/admin/training/insertTraining insert Training
 * @apiVersion 1.0.0
 * @apiName insert Training
 * @apiDescription insert Training 
 * @apiGroup Training - Admin
 * @apiParam  {String}          title                         Requires Training Title.
 * @apiParam  {String}          assignRoleId                  Optional AssignRoleId.
 * @apiParam  {String}          url                           Requires Training url.
 * @apiParam  {String}          fileName                  Requires Training fileName.
 * @apiParam  {Integer}          trainingCategoryId           Requires Training CategoryId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Training',
 *          recordList: Training,
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
router.post('/insertTraining', controller.insertTraining);

// #region /api/admin/training/updateTraining apidoc
/**
 * @api {post} /api/admin/training/updateTraining update Training
 * @apiVersion 1.0.0
 * @apiName update Training 
 * @apiDescription update Training
 * @apiGroup Training - Admin
 * @apiParam  {Integer}         id                       Requires Training Id.
*  @apiParam  {String}          title                     Requires Training Title.
 * @apiParam  {String}          assignRoleId             Optional AssignRoleId.
 * @apiParam  {String}          url                      Requires Training url.
 * @apiParam  {String}          fileName                  Requires Training fileName.
 * @apiParam  {Integer}          trainingCategoryId      Requires Training CategoryId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update Training',
 *          recordList: Training,
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
router.post('/updateTraining', controller.updateTraining);

// #region /api/admin/training/activeInactiveTraining apidoc
/**
 * @api {post} /api/admin/training/activeInactiveTraining Change Training Status
 * @apiVersion 1.0.0
 * @apiName Change Training Status
 * @apiDescription Change Training Status
 * @apiGroup Training - Admin
 * @apiParam  {Integer}         id                  Requires Training Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Training Status',
 *          recordList: Training,
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
router.post('/activeInactiveTraining', controller.activeInactiveTraining);

// #region /api/admin/training/removeTraining apidoc
/**
 * @api {post} /api/admin/training/removeTraining Remove Training
 * @apiVersion 1.0.0
 * @apiName Remove Training
 * @apiDescription Remove Training
 * @apiGroup Training - Admin
 * @apiParam  {Integer}         id                  Requires Training Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Remove Training ',
 *          recordList: Training,
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
router.post('/removeTraining', controller.removeTraining);


// #region /api/admin/training/insertAssignTrainingUsers apidoc
/**
 * @api {post} /api/admin/training/insertAssignTrainingUsers insert Training Assign Users
 * @apiVersion 1.0.0 
 * @apiName insert Training Assign Users
 * @apiDescription insert Training Assign Users
 * @apiGroup Training - Admin
 * @apiParam  {Integer}          trainingId           Requires Training Id.
 * @apiParam  {Integer}          assignUserIds           Requires AssignUser Ids.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert Training Assign Users',
 *          recordList: Training,
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
router.post('/insertAssignTraining', controller.insertAssignTraining);

// #region /api/admin/training/getAssignTrainingUsers apidoc
/**
 * @api {post} /api/admin/training/getAssignTrainingUsers get Training Assign Users
 * @apiVersion 1.0.0 
 * @apiName get Training Assign Users
 * @apiDescription get Training Assign Users
 * @apiGroup Training - Admin
 * @apiParam  {Integer}          trainingId           Requires Training Id.
 * @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'get Training Assign Users',
 *          recordList: Training AssingUsers,
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
router.post('/getAssignTrainingUsers', controller.getAssignTrainingUsers);
export = router;