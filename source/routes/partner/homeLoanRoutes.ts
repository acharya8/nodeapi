import express from 'express';
import controller from '../../controllers/partner/homeLoan';
import header from '../../middleware/apiHeader';

const router = express.Router();

// #region /api/partner/homeLoans/getIncompleteHomeLoanDetail apidoc
/**
 * @api {post} /api/partner/homeLoans/getIncompleteHomeLoanDetail Get Incomplete Home Loan Detail
 * @apiVersion 1.0.0
 * @apiName Get Incomplete Home Loan Detail
 * @apiDescription Get Incomplete Home Loan Detail
 * @apiGroup Home Loan - partner
 * @apiParam  {Integer}             partnerId              Requires partner Id.
 * @apiParam  {Integer}             serviceId               Requires ServiceId Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Incomplete Home Loan Detail',
 *          recordList: Update Home Loan Employment Detail,
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
router.post('/getIncompleteHomeLoanDetail', controller.getIncompleteHomeLoanDetail);




export = router;