import express from 'express';
import controller from '../../controllers/partner/visitingCards';
import header from '../../middleware/apiHeader';

const router = express.Router();

// #region /api/partner/visitingCards/getVisitingCards apidoc
/**
 * @api {post} /api/partner/visitingCards/getVisitingCards Get VisitingCards
 * @apiVersion 1.0.0
 * @apiName Get VisitingCards
 * @apiDescription Get VisitingCards
 * @apiGroup VisitingCards - Partner
 * @apiParam  {Integer}         roleId                  Requires RoleId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get VisitingCards',
 *          recordList: VisitingCards,
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


// #region /api/partner/visitingCards/insertVisitingCard apidoc
/**
 * @api {post} /api/partner/visitingCards/insertVisitingCard Get VisitingCards
 * @apiVersion 1.0.0
 * @apiName Get VisitingCards
 * @apiDescription Get VisitingCards
 * @apiGroup VisitingCards - Partner
 * @apiParam  {Integer}         roleId                  Requires RoleId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get VisitingCards',
 *          recordList: VisitingCards,
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



// #region /api/partner/visitingCards/getCompletedVisitingCard apidoc
/**
 * @api {post} /api/partner/visitingCards/getCompletedVisitingCard Get VisitingCards
 * @apiVersion 1.0.0
 * @apiName Get VisitingCards
 * @apiDescription Get VisitingCards
 * @apiGroup VisitingCards - Partner
 * @apiParam  {Integer}         roleId                  Requires RoleId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get VisitingCards',
 *          recordList: VisitingCards,
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
router.post('/getCompletedVisitingCard', controller.getCompletedVisitingCard);


// #region /api/partner/visitingCards/updateVisitingCard apidoc
/**
 * @api {post} /api/partner/visitingCards/updateVisitingCard Get VisitingCards
 * @apiVersion 1.0.0
 * @apiName Get VisitingCards
 * @apiDescription Get VisitingCards
 * @apiGroup VisitingCards - Partner
 * @apiParam  {Integer}         roleId                  Requires RoleId.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get VisitingCards',
 *          recordList: VisitingCards,
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

export = router;