import express from 'express';
import controller from '../../controllers/admin/businessAnnualSales';

const router = express.Router();

// #region /api/admin/businessAnnualSale/getBusinessAnnualSales apidoc
/**
 * @api {post} /api/admin/businessAnnualSale/getBusinessAnnualSales Get BusinessAnnual Sales
 * @apiVersion 1.0.0
 * @apiName Get BusinessAnnual Sale
 * @apiDescription Get BusinessAnnual Sale
 * @apiGroup BusinessAnnual Sale - Admin
 *  @apiParam  {String}          [startIndex]                Optional Start Index
 * @apiParam  {String}          [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get BusinessAnnual Sale',
 *          recordList: BusinessAnnual Sale,
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
router.post('/getBusinessAnnualSales', controller.getBusinessAnnualSales);

// #region /api/admin/businessAnnualSale/insertBusinessAnnualSale apidoc
/**
 * @api {post} /api/admin/businessAnnualSale/insertBusinessAnnualSale insert BusinessAnnual Sale
 * @apiVersion 1.0.0
 * @apiName insert BusinessAnnual Sale
 * @apiDescription insert BusinessAnnual Sale
  * @apiGroup BusinessAnnual Sale - Admin
 * @apiParam  {String}          name                Requires name of BusinessAnnual Sale
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'insert BusinessAnnual Sale',
 *          recordList: BusinessAnnual Sale,
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

router.post('/insertBusinessAnnualSale', controller.insertBusinessAnnualSale);
// #region /api/admin/businessAnnualSale/updateBusinessAnnualSale apidoc
/**
 * @api {post} /api/admin/businessAnnualSale/updateBusinessAnnualSale update BusinessAnnual Sale
 * @apiVersion 1.0.0
 * @apiName Update BusinessAnnual Sale
 * @apiDescription Update BusinessAnnual Sale
  * @apiGroup BusinessAnnual Sale - Admin
 * @apiParam  {String}          name                Requires name of BusinessAnnual Sale.
 * @apiParam  {Integer}         id                  Requires BusinessAnnual Sale Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'update BusinessAnnual Sale',
 *          recordList: BusinessAnnual Sale,
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
router.post('/updateBusinessAnnualSale', controller.updateBusinessAnnualSale);

// #region /api/admin/businessAnnualSale/activeInactiveBusinessAnnualSale apidoc
/**
 * @api {post} /api/admin/businessAnnualSale/activeInactiveBusinessAnnualSale Change BusinessAnnual Sale
 * @apiVersion 1.0.0
 * @apiName Change BusinessAnnual Sale Status
 * @apiDescription Change BBusinessAnnual Sale Status
 * @apiGroup BusinessAnnual Sale - Admin
 * @apiParam  {Integer}         id                  Requires BusinessAnnual Sale Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change BusinessAnnual Sale Status',
 *          recordList: BusinessAnnual Sale,
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
router.post('/activeInactiveBusinessAnnualSale', controller.activeInActiveBusinessAnnualSale);

export = router;