import express from 'express';
import controller from '../../controllers/partner/users';
import header from '../../middleware/apiHeader';

const router = express.Router();

// #region /api/partner/users/signup apidoc
/**
 * @api {post} /api/partner/users/signup Partner SignUp
 * @apiVersion 1.0.0
 * @apiName Partner SignUp
 * @apiDescription Partner SignUp
 * @apiGroup User - Partner
 * @apiParam  {Integer}         roleId                  Requires RoleId.
 * @apiParam  {String}          roleName                Requires Role Name.
 * @apiParam  {String}          fullName                Requires Full Name.
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         cityId                  Requires service City Id.
 * @apiParam  {String}          [email]                 Optional Email Of Customer.
 * @apiParam  {String}          [countryCode]           Optional Country Code.
 * @apiParam  {String}          [aadhaarCardNo]          Optional Aadhar Card No.
 * @apiParam  {String}          [panCardNo]             Optional PAN Card No.
 * @apiParam  {string}          [companyName]           Optional Company Name.
 * @apiParam  {Integer}         [professionTypeId]      Optional Profession Type Id.
 * @apiParam  {Integer}         [workExperience]        Optional Work Experience.
 * @apiParam  {Boolean}         [haveOffice]            Optional haveOffice.
 * @apiParam  {String}          [gender]                Optional Gender.
 * @apiParam  {String}          [businessName]          Optional Business Name.
 * @apiParam  {String}          [businessAddress]       Optional Business Address.
 * @apiParam  {String}          [gstNo]                 Optional gstNo.
 * @apiParam  {String}          [referralCode]          Optional Referral Code.
 * @apiParam  {Integer}         [commitment]            Optional Commitment.
 * @apiParam  {String}          [dsaCode]               Optional dsaCode.
 * @apiParam  {Integer}         [addressTypeId]         Optional Address Type Id.
 * @apiParam  {String}          [label]                 Optional Address Label.
 * @apiParam  {String}          [addressLine1]          Optional Address Line1.
 * @apiParam  {String}          [addressLine2]          Optional Address Line2.
 * @apiParam  {String}          [pincode]               Optional Pincode.
 * @apiParam  {Integer}         [designationId]         Optional Designation Id.
 * @apiParam  {Integer}         [educationTypeId]       Optional Education Type Id.
 * @apiParam  {String}          [instituteName]         Optional Institute Name.
 * @apiParam  {Integer}         [passingYear]           Optional Passing Year.
 * @apiParam  {string}          [resume]                Optional Resume Base 64.
 * @apiParam  {string}          [contentType]           Optional File Type.
 * @apiParam  {string}          [otherDetail]           Optional OtherDetail.
 * @apiParam  {Array}           [documents]             Optional Array OF DSA Signup Uploaded Documetns with documentId,fileData(base64),fileName,contentType.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Partner SignUp',
 *          recordList: User,
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
router.post('/signup', controller.signup);

// #region /api/partner/users/login apidoc
/**
 * @api {post} /api/partner/users/login Partner Login
 * @apiVersion 1.0.0
 * @apiName Partner Login
 * @apiDescription Partner Login
 * @apiGroup User - Partner
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Partner SignUp',
 *          recordList: User,
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
router.post('/login', controller.login);

// #region /api/partner/users/validateSessionToken apidoc
/**
 * @api {post} /api/partner/users/validateSessionToken Validate User By Session Token
 * @apiVersion 1.0.0
 * @apiName Validate User By Session Token
 * @apiDescription Validate User By Session Token
 * @apiGroup User - Partner
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Validate User By Session Token',
 *          recordList: User,
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
router.post('/validateSessionToken', controller.validateSessionToken);

// #region /api/partner/users/checkContactNoExist apidoc
/**
 * @api {post} /api/partner/users/checkContactNoExist Check ContactNo Exist
 * @apiVersion 1.0.0
 * @apiName Check ContactNo Exist
 * @apiDescription Check ContactNo Exist
 * @apiGroup User - Partner
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Check ContactNo Exist',
 *          recordList: User,
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
router.post('/checkContactNoExist', controller.checkContactNoExist);
export = router;