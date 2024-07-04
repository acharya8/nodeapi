"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const logging_1 = __importDefault(require("./config/logging"));
const config_1 = __importDefault(require("./config/config"));
const stack_trace_1 = __importDefault(require("stack-trace"));
const sample_1 = __importDefault(require("./routes/sample"));
//#region Admin
const rolesRoute_1 = __importDefault(require("./routes/admin/rolesRoute"));
const usersRoutes_1 = __importDefault(require("./routes/admin/usersRoutes"));
const serviceTypesRoutes_1 = __importDefault(require("./routes/admin/serviceTypesRoutes"));
const servicesRoutes_1 = __importDefault(require("./routes/admin/servicesRoutes"));
const documentMasterRoutes_1 = __importDefault(require("./routes/admin/documentMasterRoutes"));
const serviceDocumentRoutes_1 = __importDefault(require("./routes/admin/serviceDocumentRoutes"));
const personalloansRoutes_1 = __importDefault(require("./routes/admin/personalloansRoutes"));
const loanStatusRoutes_1 = __importDefault(require("./routes/admin/loanStatusRoutes"));
const partnerRoutes_1 = __importDefault(require("./routes/admin/partnerRoutes"));
const bankLoanCommissionRoutes_1 = __importDefault(require("./routes/admin/bankLoanCommissionRoutes"));
const dsaRoutes_1 = __importDefault(require("./routes/admin/dsaRoutes"));
const trainingCategoryRoutes_1 = __importDefault(require("./routes/admin/trainingCategoryRoutes"));
const trainingRoutes_1 = __importDefault(require("./routes/admin/trainingRoutes"));
const businessloanRoutes_1 = __importDefault(require("./routes/admin/businessloanRoutes"));
const employmentTypeRoutes_1 = __importDefault(require("./routes/admin/employmentTypeRoutes"));
const serviceEmploymentTypeRoutes_1 = __importDefault(require("./routes/admin/serviceEmploymentTypeRoutes"));
const maritalStatusRoutes_1 = __importDefault(require("./routes/admin/maritalStatusRoutes"));
const itrRoutes_1 = __importDefault(require("./routes/admin/itrRoutes"));
const residenceTypeRoutes_1 = __importDefault(require("./routes/admin/residenceTypeRoutes"));
const loanAgainstCollteralRoutes_1 = __importDefault(require("./routes/admin/loanAgainstCollteralRoutes"));
const businessAnnualProfitRoutes_1 = __importDefault(require("./routes/admin/businessAnnualProfitRoutes"));
const businessAnnualSaleRoutes_1 = __importDefault(require("./routes/admin/businessAnnualSaleRoutes"));
const businessExperienceRoute_1 = __importDefault(require("./routes/admin/businessExperienceRoute"));
const bankRoutes_1 = __importDefault(require("./routes/admin/bankRoutes"));
const industrytypeRoutes_1 = __importDefault(require("./routes/admin/industrytypeRoutes"));
const businessNatureRoutes_1 = __importDefault(require("./routes/admin/businessNatureRoutes"));
const propertyTypeRoutes_1 = __importDefault(require("./routes/admin/propertyTypeRoutes"));
const employmentServiceTypeRoutes_1 = __importDefault(require("./routes/admin/employmentServiceTypeRoutes"));
const employmentNatureRoutes_1 = __importDefault(require("./routes/admin/employmentNatureRoutes"));
const coApplicantRelationRoutes_1 = __importDefault(require("./routes/admin/coApplicantRelationRoutes"));
const addressTypeRoutes_1 = __importDefault(require("./routes/admin/addressTypeRoutes"));
const badgeRoutes_1 = __importDefault(require("./routes/admin/badgeRoutes"));
const commissionTypeRoutes_1 = __importDefault(require("./routes/admin/commissionTypeRoutes"));
const userPageRoutes_1 = __importDefault(require("./routes/admin/userPageRoutes"));
const bankLoanPartnerCommissionRoutes_1 = __importDefault(require("./routes/admin/bankLoanPartnerCommissionRoutes"));
const visitingCardRoutes_1 = __importDefault(require("./routes/admin/visitingCardRoutes"));
const bankPolicyRoutes_1 = __importDefault(require("./routes/admin/bankPolicyRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/admin/customerRoutes"));
const bankLoanRoutes_1 = __importDefault(require("./routes/admin/bankLoanRoutes"));
const homeLoanRoutes_1 = __importDefault(require("./routes/admin/homeLoanRoutes"));
const leadRoutes_1 = __importDefault(require("./routes/admin/leadRoutes"));
const rewardCoinRoutes_1 = __importDefault(require("./routes/admin/rewardCoinRoutes"));
const faqsRoutes_1 = __importDefault(require("./routes/admin/faqsRoutes"));
const commissionTemplateRoutes_1 = __importDefault(require("./routes/admin/commissionTemplateRoutes"));
const otherLoanRoutes_1 = __importDefault(require("./routes/admin/otherLoanRoutes"));
const bannerRoutes_1 = __importDefault(require("./routes/admin/bannerRoutes"));
const bankCreditCardRoutes_1 = __importDefault(require("./routes/admin/bankCreditCardRoutes"));
const bankCreditCardPolicyRoutes_1 = __importDefault(require("./routes/admin/bankCreditCardPolicyRoutes"));
const creditCardRoutes_1 = __importDefault(require("./routes/admin/creditCardRoutes"));
const usersscratchcarRoutes_1 = __importDefault(require("./routes/admin/usersscratchcarRoutes"));
const systemFlagRoutes_1 = __importDefault(require("./routes/admin/systemFlagRoutes"));
const companyTypeRoutes_1 = __importDefault(require("./routes/admin/companyTypeRoutes"));
const productsRoutes_1 = __importDefault(require("./routes/admin/productsRoutes"));
const ordersRoutes_1 = __importDefault(require("./routes/admin/ordersRoutes"));
const newslettersubscriptionRoutes_1 = __importDefault(require("./routes/admin/newslettersubscriptionRoutes"));
const payoutRoutes_1 = __importDefault(require("./routes/admin/payoutRoutes"));
const dashboardRoutes_1 = __importDefault(require("./routes/admin/dashboardRoutes"));
const permissionGroupRoutes_1 = __importDefault(require("./routes/admin/permissionGroupRoutes"));
const contactRoutes_1 = __importDefault(require("./routes/admin/contactRoutes"));
//#endregion Admin
//#region Website
const userRoutes_1 = __importDefault(require("./routes/website/userRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/website/serviceRoutes"));
const leadRoutes_2 = __importDefault(require("./routes/website/leadRoutes"));
const citiesRoutes_1 = __importDefault(require("./routes/website/citiesRoutes"));
const degreeRoutes_1 = __importDefault(require("./routes/website/degreeRoutes"));
const courseRoutes_1 = __importDefault(require("./routes/website/courseRoutes"));
const contactusRoutes_1 = __importDefault(require("./routes/website/contactusRoutes"));
const roleRoutes_1 = __importDefault(require("./routes/website/roleRoutes"));
const dsasignupRoutes_1 = __importDefault(require("./routes/website/dsasignupRoutes"));
const documentRoutes_1 = __importDefault(require("./routes/website/documentRoutes"));
const employmenttypeRoutes_1 = __importDefault(require("./routes/website/employmenttypeRoutes"));
const countriesRoutes_1 = __importDefault(require("./routes/website/countriesRoutes"));
const bankRoutes_2 = __importDefault(require("./routes/website/bankRoutes"));
const professionTypeRoutes_1 = __importDefault(require("./routes/website/professionTypeRoutes"));
const companyTypeRoutes_2 = __importDefault(require("./routes/website/companyTypeRoutes"));
const townRoutes_1 = __importDefault(require("./routes/website/townRoutes"));
const referlinkRoutes_1 = __importDefault(require("./routes/website/referlinkRoutes"));
//#endregion Website
//#region Partner
const rolesRoutes_1 = __importDefault(require("./routes/partner/rolesRoutes"));
const documentsRoutes_1 = __importDefault(require("./routes/partner/documentsRoutes"));
const educationTypeRoutes_1 = __importDefault(require("./routes/partner/educationTypeRoutes"));
const designationRoutes_1 = __importDefault(require("./routes/partner/designationRoutes"));
const usersRoutes_2 = __importDefault(require("./routes/partner/usersRoutes"));
const personalLoanRoutes_1 = __importDefault(require("./routes/partner/personalLoanRoutes"));
const loanRoutes_1 = __importDefault(require("./routes/partner/loanRoutes"));
const professionsRoutes_1 = __importDefault(require("./routes/partner/professionsRoutes"));
const bankRoutes_3 = __importDefault(require("./routes/partner/bankRoutes"));
const commissionTypesRoutes_1 = __importDefault(require("./routes/partner/commissionTypesRoutes"));
const partnercommissionRoutes_1 = __importDefault(require("./routes/partner/partnercommissionRoutes"));
const partnerRoutes_2 = __importDefault(require("./routes/partner/partnerRoutes"));
const trainingRoutes_2 = __importDefault(require("./routes/partner/trainingRoutes"));
const businessLoanRoutes_1 = __importDefault(require("./routes/partner/businessLoanRoutes"));
const employmentTypeRoutes_2 = __importDefault(require("./routes/partner/employmentTypeRoutes"));
const visitingCardRoutes_2 = __importDefault(require("./routes/partner/visitingCardRoutes"));
const homeLoanRoutes_2 = __importDefault(require("./routes/partner/homeLoanRoutes"));
const creditCardRoutes_2 = __importDefault(require("./routes/partner/creditCardRoutes"));
const faqsRoutes_2 = __importDefault(require("./routes/partner/faqsRoutes"));
//#endregion Partner
//#region Customer
const usersRoutes_3 = __importDefault(require("./routes/customer/usersRoutes"));
const servicesRoutes_2 = __importDefault(require("./routes/customer/servicesRoutes"));
const employmentTypesRoutes_1 = __importDefault(require("./routes/customer/employmentTypesRoutes"));
const maritalStatusesRoutes_1 = __importDefault(require("./routes/customer/maritalStatusesRoutes"));
const serviceDocumentsRoutes_1 = __importDefault(require("./routes/customer/serviceDocumentsRoutes"));
const serviceMasterDataRoutes_1 = __importDefault(require("./routes/customer/serviceMasterDataRoutes"));
const personalLoanRoutes_2 = __importDefault(require("./routes/customer/personalLoanRoutes"));
const loanStatusRoutes_2 = __importDefault(require("./routes/customer/loanStatusRoutes"));
const loanRoutes_2 = __importDefault(require("./routes/customer/loanRoutes"));
const citiesRoutes_2 = __importDefault(require("./routes/customer/citiesRoutes"));
const businessLoanRoutes_2 = __importDefault(require("./routes/customer/businessLoanRoutes"));
const leadRoutes_3 = __importDefault(require("./routes/customer/leadRoutes"));
const homeLoanRoutes_3 = __importDefault(require("./routes/customer/homeLoanRoutes"));
const creditCardRoutes_3 = __importDefault(require("./routes/customer/creditCardRoutes"));
const otherLoanRoutes_2 = __importDefault(require("./routes/customer/otherLoanRoutes"));
const faqsRoutes_3 = __importDefault(require("./routes/customer/faqsRoutes"));
const referlinkRoutes_2 = __importDefault(require("./routes/customer/referlinkRoutes"));
const scratchCardRoutes_1 = __importDefault(require("./routes/customer/scratchCardRoutes"));
const userWalletRoutes_1 = __importDefault(require("./routes/customer/userWalletRoutes"));
const bannerRoutes_2 = __importDefault(require("./routes/customer/bannerRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/customer/notificationRoutes"));
const productsRoutes_2 = __importDefault(require("./routes/customer/productsRoutes"));
const ordersRoutes_2 = __importDefault(require("./routes/customer/ordersRoutes"));
//#endregion Customer
const NAMESPACE = 'Server';
const router = (0, express_1.default)();
/** Log the request */
router.use((req, res, next) => {
    /** Log the req */
    logging_1.default.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
    res.on('finish', () => {
        /** Log the res */
        logging_1.default.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });
    next();
});
/** Parse the body of the request */
router.use(body_parser_1.default.urlencoded({ extended: true }));
router.use(body_parser_1.default.json({
    limit: "50mb"
}));
/** Rules of our API */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});
/** Routes go here */
router.use('/', express_1.default.static('apidoc'));
router.use('/content', express_1.default.static('content'));
router.use('/api/sample', sample_1.default);
//#region Admin
router.use('/api/admin/roles', rolesRoute_1.default);
router.use('/api/admin/users', usersRoutes_1.default);
router.use('/api/admin/serviceTypes', serviceTypesRoutes_1.default);
router.use('/api/admin/services', servicesRoutes_1.default);
router.use('/api/admin/documentMasters', documentMasterRoutes_1.default);
router.use('/api/admin/serviceDocuments', serviceDocumentRoutes_1.default);
router.use('/api/admin/personalLoans', personalloansRoutes_1.default);
router.use('/api/admin/loanStatus', loanStatusRoutes_1.default);
router.use('/api/admin/partners', partnerRoutes_1.default);
router.use('/api/admin/bankLoanCommission', bankLoanCommissionRoutes_1.default);
router.use('/api/admin/dsa', dsaRoutes_1.default);
router.use('/api/admin/trainingCategory', trainingCategoryRoutes_1.default);
router.use('/api/admin/training', trainingRoutes_1.default);
router.use('/api/admin/businessLoans', businessloanRoutes_1.default);
router.use('/api/admin/employmentType', employmentTypeRoutes_1.default);
router.use('/api/admin/serviceEmploymentTypes', serviceEmploymentTypeRoutes_1.default);
router.use('/api/admin/maritalStatuses', maritalStatusRoutes_1.default);
router.use('/api/admin/itr', itrRoutes_1.default);
router.use('/api/admin/residentTypes', residenceTypeRoutes_1.default);
router.use('/api/admin/loanAgainstCollteral', loanAgainstCollteralRoutes_1.default);
router.use('/api/admin/businessAnnualProfit', businessAnnualProfitRoutes_1.default);
router.use('/api/admin/businessAnnualSale', businessAnnualSaleRoutes_1.default);
router.use('/api/admin/businessExperience', businessExperienceRoute_1.default);
router.use('/api/admin/banks', bankRoutes_1.default);
router.use('/api/admin/industryTypes', industrytypeRoutes_1.default);
router.use('/api/admin/businessNature', businessNatureRoutes_1.default);
router.use('/api/admin/propertyType', propertyTypeRoutes_1.default);
router.use('/api/admin/employmentServiceType', employmentServiceTypeRoutes_1.default);
router.use('/api/admin/employmentNature', employmentNatureRoutes_1.default);
router.use('/api/admin/coApplicantRelation', coApplicantRelationRoutes_1.default);
router.use('/api/admin/addressType', addressTypeRoutes_1.default);
router.use('/api/admin/badges', badgeRoutes_1.default);
router.use('/api/admin/commissionTypes', commissionTypeRoutes_1.default);
router.use('/api/admin/userPages', userPageRoutes_1.default);
router.use('/api/admin/partnerCommission', bankLoanPartnerCommissionRoutes_1.default);
router.use('/api/admin/visitingCards', visitingCardRoutes_1.default);
router.use('/api/admin/leads', leadRoutes_1.default);
router.use('/api/admin/bankPolicies', bankPolicyRoutes_1.default);
router.use('/api/admin/bankLoans', bankLoanRoutes_1.default);
router.use('/api/admin/customers', customerRoutes_1.default);
router.use('/api/admin/homeLoan', homeLoanRoutes_1.default);
router.use('/api/admin/rewardCoin', rewardCoinRoutes_1.default);
router.use('/api/admin/faqs', faqsRoutes_1.default);
router.use('/api/admin/otherLoan', otherLoanRoutes_1.default);
router.use('/api/admin/commissionTemplates', commissionTemplateRoutes_1.default);
router.use('/api/admin/banner', bannerRoutes_1.default);
router.use('/api/admin/bankCreditCard', bankCreditCardRoutes_1.default);
router.use('/api/admin/bankCreditCardPolicy', bankCreditCardPolicyRoutes_1.default);
router.use('/api/admin/creditCard', creditCardRoutes_1.default);
router.use('/api/admin/scratchCard', usersscratchcarRoutes_1.default);
router.use('/api/admin/systemflags', systemFlagRoutes_1.default);
router.use('/api/admin/companyTypes', companyTypeRoutes_1.default);
router.use('/api/admin/products', productsRoutes_1.default);
router.use('/api/admin/orders', ordersRoutes_1.default);
router.use('/api/admin/newslettersubscription', newslettersubscriptionRoutes_1.default);
router.use('/api/admin/payout', payoutRoutes_1.default);
router.use('/api/admin/dashboard', dashboardRoutes_1.default);
router.use('/api/admin/permissionGroup', permissionGroupRoutes_1.default);
router.use('/api/admin/contactRequest', contactRoutes_1.default);
//#endregion Admin
//#region Web
router.use('/api/web/users', userRoutes_1.default);
router.use('/api/web/services', serviceRoutes_1.default);
router.use('/api/web/leads', leadRoutes_2.default);
router.use('/api/web/cities', citiesRoutes_1.default);
router.use('/api/web/degrees', degreeRoutes_1.default);
router.use('/api/web/courses', courseRoutes_1.default);
router.use('/api/web/contactUs', contactusRoutes_1.default);
router.use('/api/web/roles', roleRoutes_1.default);
router.use('/api/web/dsaSignUps', dsasignupRoutes_1.default);
router.use('/api/web/documents', documentRoutes_1.default);
router.use('/api/web/employmentTypes', employmenttypeRoutes_1.default);
router.use('/api/web/countries', countriesRoutes_1.default);
router.use('/api/web/banks', bankRoutes_2.default);
router.use('/api/web/professionTypes', professionTypeRoutes_1.default);
router.use('/api/web/companyTypes', companyTypeRoutes_2.default);
router.use('/api/web/towns', townRoutes_1.default);
router.use('/api/web/referLink', referlinkRoutes_1.default);
//#endregion Web
//#region Partner
router.use('/api/partner/roles', rolesRoutes_1.default);
router.use('/api/partner/documents', documentsRoutes_1.default);
router.use('/api/partner/educationTypes', educationTypeRoutes_1.default);
router.use('/api/partner/designations', designationRoutes_1.default);
router.use('/api/partner/users', usersRoutes_2.default);
router.use('/api/partner/personalLoans', personalLoanRoutes_1.default);
router.use('/api/partner/loans', loanRoutes_1.default);
router.use('/api/partner/professions', professionsRoutes_1.default);
router.use('/api/partner/banks', bankRoutes_3.default);
router.use('/api/partner/commissionTypes', commissionTypesRoutes_1.default);
router.use('/api/partner/partnerCommissions', partnercommissionRoutes_1.default);
router.use('/api/partner/partners', partnerRoutes_2.default);
router.use('/api/partner/trainings', trainingRoutes_2.default);
router.use('/api/partner/businessLoans', businessLoanRoutes_1.default);
router.use('/api/partner/employmentTypes', employmentTypeRoutes_2.default);
router.use('/api/partner/visitingCards', visitingCardRoutes_2.default);
router.use('/api/partner/homeLoans', homeLoanRoutes_2.default);
router.use('/api/partner/creditCards', creditCardRoutes_2.default);
router.use('/api/partner/faqs', faqsRoutes_2.default);
//#endregion Partner
//#region Customer
router.use('/api/customer/users', usersRoutes_3.default);
router.use('/api/customer/services', servicesRoutes_2.default);
router.use('/api/customer/employmentTypes', employmentTypesRoutes_1.default);
router.use('/api/customer/maritalStatuses', maritalStatusesRoutes_1.default);
router.use('/api/customer/serviceDocuments', serviceDocumentsRoutes_1.default);
router.use('/api/customer/serviceMasterData', serviceMasterDataRoutes_1.default);
router.use('/api/customer/personalLoans', personalLoanRoutes_2.default);
router.use('/api/customer/loanStatus', loanStatusRoutes_2.default);
router.use('/api/customer/loans', loanRoutes_2.default);
router.use('/api/customer/cities', citiesRoutes_2.default);
router.use('/api/customer/businessLoans', businessLoanRoutes_2.default);
router.use('/api/customer/leads', leadRoutes_3.default);
router.use('/api/customer/homeLoans', homeLoanRoutes_3.default);
router.use('/api/customer/creditCards', creditCardRoutes_3.default);
router.use('/api/customer/otherLoans', otherLoanRoutes_2.default);
router.use('/api/customer/faqs', faqsRoutes_3.default);
router.use('/api/customer/referLink', referlinkRoutes_2.default);
router.use('/api/customer/scratchCards', scratchCardRoutes_1.default);
router.use('/api/customer/userWallets', userWalletRoutes_1.default);
router.use('/api/customer/banner', bannerRoutes_2.default);
router.use('/api/customer/notifications', notificationRoutes_1.default);
router.use('/api/customer/products', productsRoutes_2.default);
router.use('/api/customer/orders', ordersRoutes_2.default);
//#endregion Customer
/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');
    res.status(404).json({
        message: error.message
    });
});
router.use((result, req, res, next) => {
    if (result.status == 200) {
        res.json({
            status: result.status,
            isDisplayMessage: result.isDisplayMessage,
            message: result.message,
            recordList: result.recordList,
            totalRecords: result.totalRecords
        });
    }
    else {
        var error = result;
        var trace = null;
        res.status(error.status || 500);
        if (error.error != null) {
            trace = stack_trace_1.default.parse(error.error);
        }
        var errorResult = {
            status: error.status,
            isDisplayMessage: error.isDisplayMessage,
            message: error.error != undefined && error.error != null ? error.error.message : 'Error object is not available',
            value: error.value,
            error: error === null || error === void 0 ? void 0 : error.error
        };
        res.json(errorResult);
    }
});
const httpServer = http_1.default.createServer(router);
httpServer.listen(config_1.default.server.port, () => logging_1.default.info(NAMESPACE, `Server is running ${config_1.default.server.hostname}:${config_1.default.server.port}`));
