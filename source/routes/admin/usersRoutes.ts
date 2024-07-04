import express from 'express';
import controller from '../../controllers/admin/users';
import header from '../../middleware/apiHeader';

const router = express.Router();

// #region /api/admin/users/login apidoc
/**
 * @api {post} /api/admin/users/login Admin Login
 * @apiVersion 1.0.0
 * @apiName Admin Login
 * @apiDescription Admin Login
 * @apiGroup Users - Admin
 * @apiParam  {String}          email                   Requires Email Id.
 * @apiParam  {String}          password                Requires base 64 password.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Admin Login',
 *          recordList: Roles,
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
router.post('/login', controller.login);

// #region /api/admin/users/insertUser apidoc
/**
 * @api {post} /api/admin/users/insertUser Admin Insert User
 * @apiVersion 1.0.0
 * @apiName Admin Insert User
 * @apiDescription Admin Insert User
 * @apiGroup Users - Admin
 * @apiParam  {String}          fullName                    Requires Users fullName.
 * @apiParam  {String}          gender                      Requires Gender.
 * @apiParam  {String}          email                       Requires User Email.
 * @apiParam  {String}          password                    Requires Base 64 Password.
 * @apiParam  {String}          [profilePicUrl]             Optional Base64 of ProfilePic.
 * @apiParam  {Integer}         [permissionGroupId]         Optional Permission GroupId.
 * @apiParam  {Integer}         roleId                      Requires RoleId of User.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert User',
 *          recordList: Users,
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
router.post('/insertUser', controller.insertUser);

// #region /api/admin/users/getUser apidoc
/**
 * @api {post} /api/admin/users/getUser Admin Get User
 * @apiVersion 1.0.0
 * @apiName Admin Get User
 * @apiDescription Admin Get User
 * @apiGroup Users - Admin
 * @apiParam  {Integer}         [startIndex]                      Optional Start Index.
 * @apiParam  {Integer}         [fetchRecords]                    Requires Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get User',
 *          recordList: Users,
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
router.post('/getUser', controller.getUser);

// #region /api/admin/users/getRM apidoc
/**
 * @api {post} /api/admin/users/getRM Admin Get User
 * @apiVersion 1.0.0
 * @apiName Admin Get User
 * @apiDescription Admin Get User
 * @apiGroup Users - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get User',
 *          recordList: Users,
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
router.post('/getRM', controller.getRM);

// #region /api/admin/users/updateUser apidoc
/**
 * @api {post} /api/admin/users/updateUser Admin Update User
 * @apiVersion 1.0.0
 * @apiName Admin Update User
 * @apiDescription Admin Update User
 * @apiGroup Users - Admin
 * @apiParam  {String}          fullName                    Requires Users fullName.
 * @apiParam  {String}          gender                      Requires Gender.
 * @apiParam  {String}          email                       Requires User Email.
 * @apiParam  {String}          password                    Requires Base 64 Password.
 * @apiParam  {String}          [profilePicUrl]             Optional Base64 of ProfilePic.
 * @apiParam  {Integer}         roleId                      Requires RoleId of User.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update User',
 *          recordList: Users,
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
router.post('/updateUser', controller.updateUser);

// #region /api/admin/users/removeUser apidoc
/**
 * @api {post} /api/admin/users/removeUser Admin Remove User
 * @apiVersion 1.0.0
 * @apiName Admin Remove User
 * @apiDescription Admin Remove User
 * @apiGroup Users - Admin
 * @apiParam  {Integer}       id                     Requires id of User.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Remove User',
 *          recordList: Users,
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
router.post('/removeUser', controller.removeUser);

// #region /api/admin/users/blockUnBlockUser apidoc
/**
 * @api {post} /api/admin/users/blockUnBlockUser Admin blockUnblock User
 * @apiVersion 1.0.0
 * @apiName Admin blockUnblock User
 * @apiDescription Admin blockUnblock User
 * @apiGroup Users - Admin
 * @apiParam  {Integer}       id                     Requires id of User.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'blockUnblock User',
 *          recordList: Users,
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
router.post('/blockUnBlockUser', controller.blockUnBlockUser);

// #region /api/admin/users/getAdminCommission apidoc
/**
 * @api {post} /api/admin/users/getAdminCommission Admin Get Commission
 * @apiVersion 1.0.0
 * @apiName Admin Get User
 * @apiDescription Admin Get Commission
 * @apiGroup Commission - Admin
 * @apiParam  {Integer}         [startIndex]                      Optional Start Index.
 * @apiParam  {Integer}         [fetchRecords]                    Requires Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Commission',
 *          recordList: Commission,
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
router.post('/getAdminCommission', controller.getAdminCommission);

export = router;