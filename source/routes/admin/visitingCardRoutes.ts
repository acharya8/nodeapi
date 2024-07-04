import express from 'express';
import controller from '../../controllers/admin/visitingCards';

const router = express.Router();

// #region /api/admin/visitingCards/insertVisitingCard apidoc
/**
 * @api {post} /api/admin/visitingCards/insertVisitingCard Insert Visiting Card
 * @apiVersion 1.0.0
 * @apiName Insert Visiting Card
 * @apiDescription Insert Visiting Card
 * @apiGroup Visiting Card - Admin
 * @apiParam  {string}         roleIds                      Required roleIds.
 * @apiParam  {string}         template                  Required template.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Visiting Card',
 *          recordList: Visiting Card,
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
router.post('/insertVisitingCard', controller.insertVisitingCard);

// #region /api/admin/visitingCards/updateVisitingCard apidoc
/**
 * @api {post} /api/admin/visitingCards/updateVisitingCard Update Visiting Card
 * @apiVersion 1.0.0
 * @apiName Update Visiting Card
 * @apiDescription Update Visiting Card
 * @apiGroup Visiting Card - Admin
 * @apiParam  {string}         id                      Required id of visitin card.
 * @apiParam  {string}         roleIds                      Required roleIds.
 * @apiParam  {string}         template                  Required template.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Visiting Card',
 *          recordList: Visiting Card,
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
router.post('/updateVisitingCard', controller.updateVisitingCard);

// #region /api/admin/visitingCards/getVisitingCards apidoc
/**
 * @api {post} /api/admin/visitingCards/getVisitingCards Get Visiting Card
 * @apiVersion 1.0.0
 * @apiName Get Visiting Card
 * @apiDescription Get Visiting Card
 * @apiGroup Visiting Card - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Visiting Card',
 *          recordList: Visiting Card,
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
router.post('/getVisitingCards', controller.getVisitingCards);

// #region /api/admin/visitingCards/activeInactiveVisitingCard apidoc
/**
 * @api {post} /api/admin/visitingCards/activeInactiveVisitingCard  Visiting Card Status Change
 * @apiVersion 1.0.0
 * @apiName Change Visiting Card Status
 * @apiDescription Change Visiting Card Status
 * @apiGroup Visiting Card - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Change Visiting Card Status',
 *          recordList: Visiting Card,
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
router.post('/activeInactiveVisitingCard', controller.activeInactiveVisitingCard);
export = router;