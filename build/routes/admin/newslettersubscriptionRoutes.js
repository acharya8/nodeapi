"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const newslettersubscription_1 = __importDefault(require("../../controllers/admin/newslettersubscription"));
const router = express_1.default.Router();
// #region /api/admin/newslettersubscription/getNewsLetterSubscription apidoc
/**
 * @api {post} /api/admin/newslettersubscription/getNewsLetterSubscription Get News Letter Subscription
 * @apiVersion 1.0.0
 * @apiName Get News Letter Subscription
 * @apiDescription Get News LetterS ubscription
 * @apiGroup News Letter Subscription - Admin
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Itr',
 *          recordList: Itr,
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
router.post('/getNewsLetterSubscription', newslettersubscription_1.default.getNewsLetterSubscription);
module.exports = router;