import express from 'express';
import controller from '../../controllers/website/referlink';

const router = express.Router();

// #region /api/web/referLink/validateReferLink apidoc
/**
 * @api {post} /api/web/referLink/validateReferLink Validate Refer Link
 * @apiVersion 1.0.0
 * @apiName Validate Refer Link
 * @apiDescription Validate Refer Link
 * @apiGroup Refer Link - Website
 * @apiParam  {String}             linkKey                Requires Refer.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Validate Refer Link',
 *          recordList: Refer Link Detail,
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
router.post('/validateReferLink', controller.validateReferLink);

// #region /api/web/referLink/insertReferCustomer apidoc
/**
 * @api {post} /api/web/referLink/insertReferCustomer Insert Refer Customer
 * @apiVersion 1.0.0
 * @apiName Insert Refer Customer
 * @apiDescription Insert Refer Customer
 * @apiGroup Refer Link - Website
 * @apiParam  {String}             contactNo                Requires contactNo.
 * @apiParam  {String}             fullName                 Requires Full Name.
 * @apiParam  {String}             panCardNo                Requires PAN Card No.
 * @apiParam  {String}             pincode                  Requires PinCode.
 * @apiParam  {Integer}            cityId                   Requires CityId.
 * @apiParam  {String}             city                     Requires City Name.
 * @apiParam  {String}             district                 Requires District Name.
 * @apiParam  {String}             state                    Requires State NAme.
 * @apiParam  {Integer}            referenceUserId          Requires Reference UserId.
 * @apiParam  {Integer}            referLinkId              Requires Refer Link Id.
 * @apiParam  {String}             [countryCode]            Optional Country Code.
 * @apiParam  {Integer}            [addressTypeId]          Optional Address Type Id.
 * @apiParam  {String}             [label]                  Optional Address Label.
 * @apiParam  {String}             [addressLine1]           Optional AddressLine 1.
 * @apiParam  {String}             [addressLine2]           Optional AddressLine 2.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Insert Refer Customer',
 *          recordList: Insert Refer Customer,
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
router.post('/insertReferCustomer', controller.insertReferCustomer);

export = router;