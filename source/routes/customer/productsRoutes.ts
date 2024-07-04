import express from 'express';
import controller from '../../controllers/customer/products';

const router = express.Router();

// #region /api/customer/products/getProducts apidoc
/**
 * @api {post} /api/customer/products/getProducts get Products
 * @apiVersion 1.0.0
 * @apiName get Products
 * @apiDescription get Products
 * @apiGroup Products - Customer
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
 *          message: 'get Products',
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

export = router;