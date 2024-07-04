import express from 'express';
import controller from '../../controllers/website/companyTypes';
import header from '../../middleware/apiHeader';

const router = express.Router();

// #region /api/web/companyTypes/getCompanyTypes apidoc
/**
 * @api {post} /api/web/companyTypes/getCompanyTypes Get Company Types
 * @apiVersion 1.0.0
 * @apiName Get Company Types
 * @apiDescription Get Company Types
 * @apiGroup Company Types - WebSite
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Company Types',
 *          recordList: Company Types,
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
router.post('/getCompanyTypes', controller.getCompanyTypes);

export = router;