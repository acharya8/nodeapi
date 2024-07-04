import express from 'express';
import controller from '../../controllers/partner/partners';
import header from '../../middleware/apiHeader';

const router = express.Router();

// #region /api/partner/partners/insertPartner apidoc
/**
 * @api {post} /api/partner/partners/insertPartner Insert Partner
 * @apiVersion 1.0.0
 * @apiName Insert Partner
 * @apiDescription Insert Partner
 * @apiGroup Partner - Partner
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
router.post('/insertPartner', controller.insertPartner);

// #region /api/partner/partners/getNetworkandTeamPartnerListByRoleId apidoc
/**
 * @api {post} /api/partner/partners/getNetworkandTeamPartnerListByRoleId Get Partner List
 * @apiVersion 1.0.0
 * @apiName Get Partner List
 * @apiDescription Get Partner List
 * @apiGroup Partner - Partner
 * @apiParam  {Array}           roleIds                 Requires RoleIds.
 * @apiParam  {Integer}         partnerId               Requires Partner Id.
 * @apiParam  {Integer}         [startIndex]            Optional startIndex.
 * @apiParam  {Integer}         [fetchRecords]        Optional fetchRecords.
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
router.post('/getNetworkandTeamPartnerListByRoleId', controller.getNetworkandTeamPartnerListByRoleId);

// #region /api/partner/partners/getPartnerDetailByPartnerId apidoc
/**
 * @api {post} /api/partner/partners/getPartnerDetailByPartnerId Get Partner Detail By partnerId
 * @apiVersion 1.0.0
 * @apiName Get Partner Detail By partnerId
 * @apiDescription Get Partner Detail By partnerId
 * @apiGroup Partner - Partner
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
router.post('/getPartnerDetailByPartnerId', controller.getPartnerDetailByPartnerId);

// #region /api/partner/partners/verifyPartner apidoc
/**
 * @api {post} /api/partner/partners/verifyPartner Verifying Partner
 * @apiVersion 1.0.0
 * @apiName Verifying Partner
 * @apiDescription Verifying Partner
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         userId               Requires User Id.
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
router.post('/verifyPartner', controller.verifyPartner);

// #region /api/partner/partners/updatePartnerProfile apidoc
/**
 * @api {post} /api/partner/partners/updatePartnerProfile Update Partner Profile
 * @apiVersion 1.0.0
 * @apiName Update Partner Profile
 * @apiDescription Update Partner Profile
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         userId                      Requires User Id.
 * @apiParam  {Integer}         partnerId                   Requires Partner Id.
 * @apiParam  {String}          fullName                    Requires Partner Full Name.
 * @apiParam  {String}          panCardNo                   Requires Pan Card No.
 * @apiParam  {String}          aadhaarCardNo               Requires AadharCard No.
 * @apiParam  {String}          contactNo                   Requires Contact No.
 * @apiParam  {string}          [companyName]               Optional Company Name.
 * @apiParam  {Integer}         [professionTypeId]          Optional Profession Type Id.
 * @apiParam  {Integer}         [workExperience]            Optional Work Experience.
 * @apiParam  {Boolean}         [haveOffice]                Optional haveOffice.
 * @apiParam  {String}          [gender]                    Optional Gender.
 * @apiParam  {String}          [businessName]              Optional Business Name.
 * @apiParam  {String}          [businessAddress]           Optional Business Address.
 * @apiParam  {String}          [gstNo]                     Optional gstNo.
 * @apiParam  {Integer}         [commitment]                Optional Commitment.
 * @apiParam  {Integer}         [addressTypeId]             Optional Address Type Id.
 * @apiParam  {String}          [label]                     Optional Address Label.
 * @apiParam  {String}          [addressLine1]              Optional Address Line1.
 * @apiParam  {String}          [addressLine2]              Optional Address Line2.
 * @apiParam  {String}          [pincode]                   Optional Pincode.
 * @apiParam  {String}          [profilePicUrl]             Optional Profile Pic.
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
router.post('/updatePartnerProfile', controller.updatePartnerProfile);

// #region /api/partner/partners/getCommisionListByPartnerId apidoc
/**
 * @api {post} /api/partner/partners/getCommisionListByPartnerId Get Partner Commission List
 * @apiVersion 1.0.0
 * @apiName Get Partner Commission List
 * @apiDescription Get Partner Commission List
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         partnerId                   Requires Partner Id.
 * @apiParam  {Integer}         [startIndex]                Optional Start Index.
 * @apiParam  {Integer}         [fetchRecords]              Optional Fetch Records.
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
router.post('/getCommisionListByPartnerId', controller.getCommisionListByPartnerId);


// #region /api/partner/partners/insertUpdatePartnerBankDetail apidoc
/**
 * @api {post} /api/partner/partners/insertUpdatePartnerBankDetail Insert/Update Partner Bank Detail
 * @apiVersion 1.0.0
 * @apiName Insert/Update Partner Bank Detail
 * @apiDescription Insert/Update Partner Bank Detail
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         partnerId                   Requires Partner Id.
 * @apiParam  {Integer}         bankId                      Requires Bank Id.
 * @apiParam  {String}          accountHolderName           Requires Account HolderName.
 * @apiParam  {String}          accountNo                   Requires Account No.
 * @apiParam  {String}          ifscCode                    Requires IFSC Code.
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
router.post('/insertUpdatePartnerBankDetail', controller.insertUpdatePartnerBankDetail);

// #region /api/partner/partners/getBankDetailByPartnerId apidoc
/**
 * @api {post} /api/partner/partners/getBankDetailByPartnerId Get Partner Bank Detail
 * @apiVersion 1.0.0
 * @apiName Get Partner Bank Detail
 * @apiDescription Get Partner Bank Detail
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         partnerId                   Requires Partner Id.
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
router.post('/getBankDetailByPartnerId', controller.getBankDetailByPartnerId);

// #region /api/partner/partners/updatePartner apidoc
/**
 * @api {post} /api/partner/partners/updatePartner Update Partner
 * @apiVersion 1.0.0
 * @apiName Update Partner
 * @apiDescription Update Partner
 * @apiGroup Partner - Partner
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
router.post('/updatePartner', controller.updatePartner);


// #region /api/partner/partners/checkContactNoExistWithServiceId apidoc
/**
 * @api {post} /api/partner/partners/checkContactNoExistWithServiceId Get Partner Bank Detail
 * @apiVersion 1.0.0
 * @apiName Get Partner Bank Detail
 * @apiDescription Get Partner Bank Detail
 * @apiGroup Partner - Partner
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         serviceId               Requires Service Id.
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
router.post('/checkContactNoExistWithServiceId', controller.checkContactNoExistWithServiceId);

// #region /api/partner/partners/checkContactNoExistWithServiceIdFroOtherLoansAndServices apidoc
/**
 * @api {post} /api/partner/partners/checkContactNoExistWithServiceIdFroOtherLoansAndServices Get Partner Bank Detail
 * @apiVersion 1.0.0
 * @apiName Get Partner Bank Detail
 * @apiDescription Get Partner Bank Detail
 * @apiGroup Partner - Partner
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         serviceId               Requires Service Id.
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
router.post('/checkContactNoExistWithServiceIdFroOtherLoansAndServices', controller.checkContactNoExistWithServiceIdFroOtherLoansAndServices);

// #region /api/partner/partners/checkContactNoExistForCreditCard apidoc
/**
 * @api {post} /api/partner/partners/checkContactNoExistForCreditCard Check contact number exist for credit card
 * @apiVersion 1.0.0
 * @apiName Check contact number exist for credit card
 * @apiDescription Check contact number exist for credit card
 * @apiGroup Partner - Partner
 * @apiParam  {String}          contactNo               Requires ContactNo.
 * @apiParam  {Integer}         serviceId               Requires Service Id.
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
router.post('/checkContactNoExistForCreditCard', controller.checkContactNoExistForCreditCard);


// #region /api/partner/partners/getNetworkandTeamPartnerListByParentPartnerId apidoc
/**
 * @api {post} /api/partner/partners/getNetworkandTeamPartnerListByParentPartnerId Get Partner List
 * @apiVersion 1.0.0
 * @apiName Get Partner List
 * @apiDescription Get Partner List
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         partnerId               Requires Partner Id.
 * @apiParam  {Integer}         [startIndex]            Optional startIndex.
 * @apiParam  {Integer}         [fetchRecords]        Optional fetchRecords.
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
router.post('/getNetworkandTeamPartnerListByParentPartnerId', controller.getNetworkandTeamPartnerListByParentPartnerId);

// #region /api/partner/partners/getPartnerGroupCustomers apidoc
/**
 * @api {post} /api/partner/partners/getPartnerGroupCustomers Get Partners Customer List
 * @apiVersion 1.0.0
 * @apiName Get Partners Customer List
 * @apiDescription Get Partners Customer List
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         partnerId               Requires Partner Id.
 * @apiParam  {Integer}         [startIndex]            Optional startIndex.
 * @apiParam  {Integer}         [fetchRecords]          Optional fetchRecords.
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
router.post('/getPartnerGroupCustomers', controller.getPartnerGroupCustomers);

// #region /api/partner/partners/deletePartnerByPartnerId apidoc
/**
 * @api {post} /api/partner/partners/deletePartnerByPartnerId Delete Partner By Partner Id
 * @apiVersion 1.0.0
 * @apiName Delete Partner By Partner Id
 * @apiDescription Delete Partner By Partner Id
 * @apiGroup Partner - Partner
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
router.post('/deletePartnerByPartnerId', controller.deletePartnerByPartnerId);

// #region /api/partner/partners/getNetworkandTeamPartnerHierarchyListByRoleId apidoc
/**
 * @api {post} /api/partner/partners/getNetworkandTeamPartnerHierarchyListByRoleId Get Partner List
 * @apiVersion 1.0.0
 * @apiName Get Partner List
 * @apiDescription Get Partner List
 * @apiGroup Partner - Partner
 * @apiParam  {Integer}         partnerId               Requires Partner Id.
 * @apiParam  {Integer}         [startIndex]            Optional startIndex.
 * @apiParam  {Integer}         [fetchRecords]        Optional fetchRecords.
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
router.post('/getNetworkandTeamPartnerHierarchyListByRoleId', controller.getNetworkandTeamPartnerHierarchyListByRoleId);

export = router;