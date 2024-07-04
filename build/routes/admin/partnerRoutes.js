"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const partners_1 = __importDefault(require("../../controllers/admin/partners"));
const router = express_1.default.Router();
// #region /api/admin/partners/getPartnerUsersByRoleId apidoc
/**
 * @api {post} /api/admin/partners/getPartnerUsersByRoleId Admin Get Partners By RoleId
 * @apiVersion 1.0.0
 * @apiName Admin Get Partners By RoleId
 * @apiDescription Admin Get Partners By RoleId
 * @apiGroup Users - Admin
 * @apiParam  {Integer}         roleId                          Required Role Id.
 * @apiParam  {Integer}         [startIndex]                    Optional Fetch Records.
 * @apiParam  {Integer}         [fetchRecords]                  Optional Fetch Records.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Partners By RoleId',
 *          recordList: Users,
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
router.post('/getPartnerUsersByRoleId', partners_1.default.getPartnerUsersByRoleId);
// #region /api/admin/partners/getPartnerList apidoc
/**
 * @api {post} /api/admin/partners/getPartnerList Admin Get Partners List
 * @apiVersion 1.0.0
 * @apiName Admin Get Partners List
 * @apiDescription Admin Get Partners List
 * @apiGroup Users - Admin
 * @apiParam  {Integer}         roleId                          Required Role Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Get Partners By RoleId',
 *          recordList: Users,
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
router.post('/getPartnerList', partners_1.default.getPartnerList);
// #region /api/admin/partners/deletePartnerByPartnerId apidoc
/**
 * @api {post} /api/admin/partners/deletePartnerByPartnerId Delete Partner By Partner Id
 * @apiVersion 1.0.0
 * @apiName Delete Partner By Partner Id
 * @apiDescription Delete Partner By Partner Id
 * @apiGroup Users - Admin
 * @apiParam  {Integer}         partnerId                          Required Partner Id.
 * @apiSuccess (200) {JSON} Result status, message, recordList, totalRecords.
 * @apiSuccessExample {json} Success-200-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          status: 200,
 *          isDisplayMessage: <true/false>, // if the value is true then display message on screen
 *          message: 'Delete Partner By Partner Id',
 *          recordList: Users,
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
router.post('/deletePartnerByPartnerId', partners_1.default.deletePartnerByPartnerId);
// #region /api/admin/partners/insertPartner apidoc
/**
 * @api {post} /api/admin/partners/insertPartner Insert Partner
 * @apiVersion 1.0.0
 * @apiName Insert Partner
 * @apiDescription Insert Partner
 * @apiGroup Partner - admin
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
 * @apiParam  {string}          [accountHolderName]           Optional AccountHolderName.
 * @apiParam  {Integer}          [bankId]           Optional BankId.
 * @apiParam  {string}          [accountNumber]           Optional AccountNumber.
 * @apiParam  {string}          [ifscCode]           Optional ifscCode.
 * @apiParam  {Array}           [documents]             Optional Array OF DSA Signup Uploaded Documetns with documentId,fileData(base64),fileName,contentType.
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
router.post('/insertPartner', partners_1.default.insertPartner);
// #region /api/admin/partners/updatePartner apidoc
/**
 * @api {post} /api/admin/partners/updatePartner Update Partner
 * @apiVersion 1.0.0
 * @apiName Update Partner
 * @apiDescription Update Partner
 * @apiGroup Partner - admin
 * @apiParam  {Integer}         partnerId               Requires Partner Id.
 * @apiParam  {Integer}         userId                  Requires Partner User Id.
 * @apiParam  {Integer}         parentParnerId          Requires Parent Partner Id.
 * @apiParam  {String}          fullName                Requires Full Name.
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         cityId                  Requires service City Id.
 * @apiParam  {Integer}         partnerAddressId        Requires Partner Address Id.
 * @apiParam  {Integer}         partnerEducationId      Requires Partner Education Id.
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
 * @apiParam  {string}          [accountHolderName]           Optional AccountHolderName.
 * @apiParam  {Integer}          [bankId]           Optional BankId.
 * @apiParam  {string}          [accountNumber]           Optional AccountNumber.
 * @apiParam  {string}          [ifscCode]           Optional ifscCode.
 * @apiParam  {Array}           [documents]             Optional Array OF DSA Signup Uploaded Documetns with documentId,fileData(base64),fileName,contentType.
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
router.post('/updatePartner', partners_1.default.updatePartner);
// #region /api/admin/partners/getPartnerDetailByPartnerId apidoc
/**
 * @api {post} /api/admin/partners/getPartnerDetailByPartnerId Get Partner Detail By partnerId
 * @apiVersion 1.0.0
 * @apiName Get Partner Detail By partnerId
 * @apiDescription Get Partner Detail By partnerId
 * @apiGroup Partner - admin
 * @apiParam  {Integer}         partnerId               Requires Partner Id.
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
router.post('/getPartnerDetailByPartnerId', partners_1.default.getPartnerDetailByPartnerId);
module.exports = router;
