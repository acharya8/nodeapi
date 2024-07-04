import express from 'express';
import controller from '../../controllers/admin/products';

const router = express.Router();

// #region /api/admin/products/getProducts apidoc
/**
 * @api {post} /api/admin/products/getProducts Get Products
 * @apiVersion 1.0.0
 * @apiName Get Products
 * @apiDescription Get Products
 * @apiGroup Products - Admin
 * @apiParam  {String}          [startIndex]                Optional Start Index.
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiParam  {String}          [searchString]              Optional Product Search String.
 * @apiParam  {String}          [minCoin]                   Optional min Coin.
 * @apiParam  {String}          [maxCoin]                   Optional max Coin.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Products',
 *          recordList: Products,
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
router.post('/getProducts', controller.getProducts);

// #region /api/admin/products/inserUpdateProducts apidoc
/**
 * @api {post} /api/admin/products/inserUpdateProducts Insert/Update Products
 * @apiVersion 1.0.0
 * @apiName Insert/Update Products
 * @apiDescription Insert/Update Products
 * @apiGroup Products - Admin
 * @apiParam  {String}          [id]                Optional Product Id.
 * @apiParam  {String}          name                Requires Product Name.
 * @apiParam  {String}          description         Requires Product Description.
 * @apiParam  {String}          imageUrl            Requires Image Base64/ Url.
 * @apiParam  {String}          coin                Requires Product Coin.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Products',
 *          recordList: Products,
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
router.post('/inserUpdateProducts', controller.inserUpdateProducts);

// #region /api/admin/products/activeInactiveProducts apidoc
/**
 * @api {post} /api/admin/products/activeInactiveProducts Active/Inactive Products
 * @apiVersion 1.0.0
 * @apiName Active/Inactive Products
 * @apiDescription Active/Inactive Products
 * @apiGroup Products - Admin
 * @apiParam  {String}          id                  Requires Product Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Active/Inactive Products',
 *          recordList: Products,
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
router.post('/activeInactiveProducts', controller.activeInactiveProducts);

export = router;