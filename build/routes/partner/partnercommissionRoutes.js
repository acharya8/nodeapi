"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const partnerCommission_1 = __importDefault(require("../../controllers/partner/partnerCommission"));
const router = express_1.default.Router();
// #region /api/partner/partnerCommissions/insertUpdatePartnerCommision apidoc
/**
 * @api {post} /api/partner/partnerCommissions/insertUpdatePartnerCommision Insert/Update Partner Commission
 * @apiVersion 1.0.0
 * @apiName Insert/Update Partner Commission
 * @apiDescription Insert/Update Partner Commission
 * @apiGroup Partner Commission - Partner
 * @apiParam  {Integer}             bankId                  Requires Bank Id.
 * @apiParam  {Integer}             serviceId               Requires Service Id.
 * @apiParam  {Integer}             commissionTypeId        Requires Commission Type Id.
 * @apiParam  {Integer}             partnerId               Requires partner Id.
 * @apiParam  {Integer}             commission              Requires Commission in Percentage.
 * @apiParam  {Integer}             [id]                    Optional partner Commission Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert/Update Partner Commission',
 *          recordList: Partner Commission,
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
router.post('/insertUpdatePartnerCommision', partnerCommission_1.default.insertUpdatePartnerCommision);
// #region /api/partner/partnerCommissions/getPartnerCommission apidoc
/**
 * @api {post} /api/partner/partnerCommissions/getPartnerCommission Getting Partner Commission
 * @apiVersion 1.0.0
 * @apiName Getting Partner Commission
 * @apiDescription Getting Partner Commission
 * @apiGroup Partner Commission - Partner
 * @apiParam  {Array}               partnerIds                  Requires Array of PartnerId.
 * @apiParam  {String}              [startIndex]                Optional Start Index
 * @apiParam  {String}              [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Getting Partner Commission',
 *          recordList: Partner Commission,
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
router.post('/getPartnerCommission', partnerCommission_1.default.getPartnerCommission);
// #region /api/partner/partnerCommissions/getNetworkAndTeamCommissionByDsa apidoc
/**
 * @api {post} /api/partner/partnerCommissions/getNetworkAndTeamCommissionByDsa Getting Partner Commission
 * @apiVersion 1.0.0
 * @apiName Getting Partner Commission
 * @apiDescription Getting Partner Commission
 * @apiGroup Partner Commission - Partner
 * @apiParam  {Array}               partnerIds                  Requires Array of PartnerId.
 * @apiParam  {String}              [startIndex]                Optional Start Index
 * @apiParam  {String}              [fetchRecords]              Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Getting Partner Commission',
 *          recordList: Partner Commission,
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
router.post('/getNetworkAndTeamCommissionByDsa', partnerCommission_1.default.getNetworkAndTeamCommissionByDsa);
module.exports = router;
