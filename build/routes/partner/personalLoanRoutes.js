"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const personalLoan_1 = __importDefault(require("../../controllers/partner/personalLoan"));
const router = express_1.default.Router();
// #region /api/partner/personalLoans/getIncompletePersonalLoanDetail apidoc
/**
 * @api {post} /api/partner/personalLoans/getIncompletePersonalLoanDetail Get Incomplete Personal Loan Detail
 * @apiVersion 1.0.0
 * @apiName Get Incomplete Personal Loan Detail
 * @apiDescription Get Incomplete Personal Loan Detail
 * @apiGroup Personal Loan - partner
 * @apiParam  {Integer}             partnerId              Requires partner Id.
 * @apiParam  {Integer}             serviceId               Requires ServiceId Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Incomplete Personal Loan Detail',
 *          recordList: Update Personal Loan Employment Detail,
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
router.post('/getIncompletePersonalLoanDetail', personalLoan_1.default.getIncompletePersonalLoanDetail);
// #region /api/partner/personalLoans/updateMoreEmploymentDetail apidoc
/**
 * @api {post} /api/partner/personalLoans/updateMoreEmploymentDetail Update Personal Loan Employment Detail
 * @apiVersion 1.0.0
 * @apiName Update Personal Loan Employment Detail
 * @apiDescription Update Personal Loan Employment Detail
 * @apiGroup Personal Loan - Partner
 * @apiParam  {Integer}             customerLoanEmploymentId            Requires Customer Loan Employmentdetail Id.
 * @apiParam  {Integer}             customerLoanId                      Requires Customer Loan Id.
 * @apiParam  {String}              emailId                             Requires Customer Email Id.
 * @apiParam  {Integer}             companyTypeId                       Requires Company TypeId.
 * @apiParam  {String}              label                               Requires Company Address Label.
 * @apiParam  {String}              addressLine1                        Requires Company AddressLine 1.
 * @apiParam  {String}              addressLine2                        Requires Company AddressLine 2.
 * @apiParam  {String}              pincode                             Requires Company Address Pincode.
 * @apiParam  {Integer}             cityId                              Requires Company Address CityId.
 * @apiParam  {String}              city                                Requires Company Address City.
 * @apiParam  {String}              district                            Requires Company Address District.
 * @apiParam  {String}              state                               Requires Company Address State.
 * @apiParam  {String}              designation                         Requires Designation.
 * @apiParam  {String}              currentCompanyExperience            Requires Current company Experience.
 * @apiParam  {Integer}             [companyAddressId]                  Optional Company Address Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Update Personal Loan Employment Detail',
 *          recordList: Update Personal Loan Employment Detail,
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
router.post('/updateMoreEmploymentDetail', personalLoan_1.default.updateMoreEmploymentDetail);
module.exports = router;
