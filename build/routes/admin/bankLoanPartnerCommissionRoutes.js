"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const bankLoanPartnerCommission_1 = __importDefault(require("../../controllers/admin/bankLoanPartnerCommission"));
const router = express_1.default.Router();
// #region /api/admin/partnerCommission/insertUpdatePartnerCommission apidoc
/**
 * @api {post} /api/admin/partnerCommission/insertUpdatePartnerCommission Insert/Update Bank Loan Partner Commission
 * @apiVersion 1.0.0
 * @apiName Insert/Update Bank Loan Partner Commission
 * @apiDescription Insert/Update Bank Loan Partner Commission
 * @apiGroup Bank Loan Partner Commission - Admin
 * @apiParam  {Integer}         bankId                      Required Bank Id.
 * @apiParam  {Integer}         serviceId                   Required Service Id.
 * @apiParam  {Integer}         commissionTypeId            Required Commission Type Id.
 * @apiParam  {Integer}         commission                  Required Commission.
 * @apiParam  {string}          partnerIds                  Required partnerIds.
 * @apiParam  {Integer}         [commissionTemplateId]      Optional Commission Template Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Bank Loan Partner Commission',
 *          recordList: Bank Loan Partner Commission,
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
router.post('/insertUpdatePartnerCommission', bankLoanPartnerCommission_1.default.insertUpdatePartnerCommision);
// #region /api/admin/partnerCommission/getBankLoanPartnerCommission apidoc
/**
 * @api {post} /api/admin/partnerCommission/getBankLoanPartnerCommission Get Bank Loan Partner Commission
 * @apiVersion 1.0.0
 * @apiName Get Bank Loan Partner Commission
 * @apiDescription Get Bank Loan Partner Commission
 * @apiGroup Bank Loan Partner Commission - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Bank Loan Partner Commission',
 *          recordList: Bank Loan Partner Commission,
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
router.post('/getBankLoanPartnerCommission', bankLoanPartnerCommission_1.default.getBankLoanPartnerCommission);
module.exports = router;
