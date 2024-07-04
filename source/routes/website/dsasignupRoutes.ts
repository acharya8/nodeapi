import express from 'express';
import controller from '../../controllers/website/dsasignup';
import header from '../../middleware/apiHeader';

const router = express.Router();

// #region /api/web/dsaSignUps/dsaSignup apidoc
/**
 * @api {post} /api/web/dsaSignUps/dsaSignup Partner SignUp
 * @apiVersion 1.0.0
 * @apiName Partner SignUp
 * @apiDescription Partner SignUp
 * @apiGroup Partner SignUp - WebSite
 * @apiParam  {Integer}         roleId                  Requires RoleId.
 * @apiParam  {String}          roleName                Requires Role Name.
 * @apiParam  {String}          fullName                Requires Full Name.
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         cityId                  Requires service City Id.
 * @apiParam  {String}          [email]                 Optional Email Of Customer.
 * @apiParam  {String}          [countryCode]           Optional Country Code.
 * @apiParam  {Integer}         [commitment]            Optional Commitment.
 * @apiParam  {Integer}         [professionTypeId]      Optional Profession Type Id.
 * @apiParam  {Integer}         [workExperience]        Optional Work Experience.
 * @apiParam  {Boolean}         [haveOffice]            Optional haveOffice.
 * @apiParam  {String}          [gender]                Optional Gender.
 * @apiParam  {Integer}         [companyTypeId]         Optional Company Type Id.
 * @apiParam  {String}          [gstNo]                 Optional gstNo.
 * @apiParam  {String}          [udhyamAadharNo]        Optional Udhyam Aadhar No.
 * @apiParam  {String}          [referralCode]          Optional Referral Code.
 * @apiParam  {String}          [companyRegNo]          Optional Company Reg No.
 * @apiParam  {Integer}         [addressTypeId]         Optional Address Type Id.
 * @apiParam  {String}          [label]                 Optional Address Label.
 * @apiParam  {String}          [addressLine1]          Optional Address Line1.
 * @apiParam  {String}          [addressLine2]          Optional Address Line2.
 * @apiParam  {String}          [pincode]               Optional Pincode.
 * @apiParam  {String}          [dsaCode]               Optional dsaCode.
 * @apiParam  {Array}           [documents]             Optional Array OF DSA Signup Uploaded Documetns with documentId,fileData(base64),fileName,contentType.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Partner SignUp',
 *          recordList: Partner SignUp,
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
router.post('/dsaSignup', controller.insertRequestForBecomePartner);

// #region /api/web/dsaSignUps/referPartner apidoc
/**
 * @api {post} /api/web/dsaSignUps/referPartner Partner SignUp
 * @apiVersion 1.0.0
 * @apiName Partner SignUp
 * @apiDescription Partner SignUp
 * @apiGroup Partner SignUp - WebSite
 * @apiParam  {Integer}         roleId                  Requires RoleId.
 * @apiParam  {String}          roleName                Requires Role Name.
 * @apiParam  {String}          fullName                Requires Full Name.
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         cityId                  Requires service City Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Partner SignUp',
 *          recordList: Partner SignUp,
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
router.post('/referPartner', controller.referPartner)

export = router;
