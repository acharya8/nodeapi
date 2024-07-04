import http from 'http';
import bodyParser from 'body-parser';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import stackTrace from 'stack-trace';
import sampleRoutes from './routes/sample';

//#region Admin
import rolesRoutes from './routes/admin/rolesRoute';
import usersRoutes from './routes/admin/usersRoutes';
import serviceTypesRoutes from './routes/admin/serviceTypesRoutes';
import servicesRoutes from './routes/admin/servicesRoutes';
import documentMasterRoutes from './routes/admin/documentMasterRoutes';
import serviceDocumentRoutes from './routes/admin/serviceDocumentRoutes';
import personalLoanRoutes from './routes/admin/personalloansRoutes';
import loanStatusesRoutes from './routes/admin/loanStatusRoutes';
import partnerRoutes from './routes/admin/partnerRoutes';
import bankLoanCommissionRoutes from './routes/admin/bankLoanCommissionRoutes';
import dsaRoutes from './routes/admin/dsaRoutes';
import TrainingCategroyRoutes from './routes/admin/trainingCategoryRoutes';
import TrainingRoutes from './routes/admin/trainingRoutes';
import businessLoanRoutes from './routes/admin/businessloanRoutes';
import employmentTypeRoutes from './routes/admin/employmentTypeRoutes';
import serviceEmploymentTypes from './routes/admin/serviceEmploymentTypeRoutes';
import maritalStatusRoutes from './routes/admin/maritalStatusRoutes';
import itrRoutes from './routes/admin/itrRoutes';
import residentTypeRoutes from './routes/admin/residenceTypeRoutes';
import loanAgainstCollteralRoutes from './routes/admin/loanAgainstCollteralRoutes';
import businessAnnualProfitRoutes from './routes/admin/businessAnnualProfitRoutes';
import businessAnnualSaleRoutes from './routes/admin/businessAnnualSaleRoutes';
import businessExperienceRoutes from './routes/admin/businessExperienceRoute';
import bankRoutes from './routes/admin/bankRoutes';
import industryTypes from './routes/admin/industrytypeRoutes';
import businessNature from './routes/admin/businessNatureRoutes';
import propertType from './routes/admin/propertyTypeRoutes';
import employmentServiceType from './routes/admin/employmentServiceTypeRoutes';
import employmentNature from './routes/admin/employmentNatureRoutes';
import coApplicantRelation from './routes/admin/coApplicantRelationRoutes';
import AddressTypeRoutes from './routes/admin/addressTypeRoutes';
import BadgeRoutes from './routes/admin/badgeRoutes';
import adminCommissionTypeRoutes from './routes/admin/commissionTypeRoutes';
import adminUserPageRoutes from './routes/admin/userPageRoutes';
import bankLoanPartnerCommission from './routes/admin/bankLoanPartnerCommissionRoutes';
import visitingCardRoutes from './routes/admin/visitingCardRoutes';
import adminBankLoanPolicyRoutes from './routes/admin/bankPolicyRoutes';
import customerRoutes from './routes/admin/customerRoutes';
import bankLoanRoutes from './routes/admin/bankLoanRoutes';
import homeLoanRoutes from './routes/admin/homeLoanRoutes';
import leadRoutes from './routes/admin/leadRoutes';
import rewardCoinRoutes from './routes/admin/rewardCoinRoutes';
import faqsRoutes from './routes/admin/faqsRoutes';
import commissionTemplateRoutes from './routes/admin/commissionTemplateRoutes';
import otherLoanRoutes from './routes/admin/otherLoanRoutes';
import bannerRoutes from './routes/admin/bannerRoutes';
import bankCreditCardRoutes from './routes/admin/bankCreditCardRoutes';
import bankCreditCardPolicyRoutes from './routes/admin/bankCreditCardPolicyRoutes';
import creditCardRoutes from './routes/admin/creditCardRoutes';
import scratchCardRoutes from './routes/admin/usersscratchcarRoutes';
import systemFlagRoutes from './routes/admin/systemFlagRoutes';
import companyTypeRoutes from './routes/admin/companyTypeRoutes';
import productsRoutes from './routes/admin/productsRoutes';
import ordersRoutes from './routes/admin/ordersRoutes';
import newslettersubscriptionRoutes from './routes/admin/newslettersubscriptionRoutes';
import payoutRoutes from './routes/admin/payoutRoutes';
import dashboardRoutes from './routes/admin/dashboardRoutes';
import permissionGroupRoutes from './routes/admin/permissionGroupRoutes';
import ContactRequest from './routes/admin/contactRoutes';
//#endregion Admin

//#region Website
import webUsersRoutes from './routes/website/userRoutes';
import webServiceRoutes from './routes/website/serviceRoutes';
import webLeadsRoutes from './routes/website/leadRoutes';
import webCitiesRoutes from './routes/website/citiesRoutes';
import webDegreesRoutes from './routes/website/degreeRoutes';
import webCoursesRoutes from './routes/website/courseRoutes';
import webContactRoutesRoutes from './routes/website/contactusRoutes';
import webRoleRoutes from './routes/website/roleRoutes';
import webDsaSignupRoutes from './routes/website/dsasignupRoutes';
import webDocumentRoutes from './routes/website/documentRoutes';
import webEmploymentTypesRoutes from './routes/website/employmenttypeRoutes';
import webCountriesRoutes from './routes/website/countriesRoutes';
import webBanksRoutes from './routes/website/bankRoutes';
import webProfessionTypesRoutes from './routes/website/professionTypeRoutes';
import webCompanyTypesRoutes from './routes/website/companyTypeRoutes';
import webTownRoutes from './routes/website/townRoutes';
import webReferLinkRoutes from './routes/website/referlinkRoutes';
//#endregion Website

//#region Partner
import partnerRoleRoutes from './routes/partner/rolesRoutes';
import partnerDocumentsRoutes from './routes/partner/documentsRoutes';
import partnerEducationTypesRoutes from './routes/partner/educationTypeRoutes';
import partnerDesignationRoutes from './routes/partner/designationRoutes';
import partnerUsersRoutes from './routes/partner/usersRoutes';
import partnerPersonalLoanRoutes from './routes/partner/personalLoanRoutes';
import partnerLoansRoutes from './routes/partner/loanRoutes';
import partnerProfessionRoutes from './routes/partner/professionsRoutes';
import partnerBankRoutes from './routes/partner/bankRoutes';
import commissionTypeRoutes from './routes/partner/commissionTypesRoutes';
import partnerCommissionRoutes from './routes/partner/partnercommissionRoutes';
import partnerPartnerRoutes from './routes/partner/partnerRoutes';
import partnerTrainingRoutes from './routes/partner/trainingRoutes';
import partnerBusinessLoanRoutes from './routes/partner/businessLoanRoutes';
import partnerEmploymentRoutes from './routes/partner/employmentTypeRoutes';
import partnerVisitingCards from './routes/partner/visitingCardRoutes';
import partnerHomeLoanRoutes from './routes/partner/homeLoanRoutes';
import partnerCreditCardRoutes from './routes/partner/creditCardRoutes';
import partnerFaqsRoutes from './routes/partner/faqsRoutes';
//#endregion Partner

//#region Customer
import customerUsersRoutes from './routes/customer/usersRoutes';
import customerServicesRoutes from './routes/customer/servicesRoutes';
import customerEmploymentTypesRoutes from './routes/customer/employmentTypesRoutes';
import customerMaritalStatusesRoutes from './routes/customer/maritalStatusesRoutes';
import customerServiceDocumentsRoutes from './routes/customer/serviceDocumentsRoutes';
import customerServiceMasterDataRoutes from './routes/customer/serviceMasterDataRoutes';
import customerPersonalLoanRoutes from './routes/customer/personalLoanRoutes';
import customerLoanStatusRoutes from './routes/customer/loanStatusRoutes';
import customerLoansRoutes from './routes/customer/loanRoutes';
import customerCitiesRoutes from './routes/customer/citiesRoutes';
import customerBusinessLoanRoutes from './routes/customer/businessLoanRoutes';
import customerLeadRoutes from './routes/customer/leadRoutes';
import customerHomeLoanRoutes from './routes/customer/homeLoanRoutes';
import customerCreditCardRoutes from './routes/customer/creditCardRoutes';
import customerOtherLoanRoutes from './routes/customer/otherLoanRoutes';
import customerFaqsRoutes from './routes/customer/faqsRoutes';
import customerReferLinkRoutes from './routes/customer/referlinkRoutes';
import customerScratchCardRoutes from './routes/customer/scratchCardRoutes';
import customerWalletRoutes from './routes/customer/userWalletRoutes';
import customerBannerRoutes from './routes/customer/bannerRoutes';
import notificationRoutes from './routes/customer/notificationRoutes';
import customerProductsRoutes from './routes/customer/productsRoutes';
import customerOrderRoutes from './routes/customer/ordersRoutes';

//#endregion Customer

const NAMESPACE = 'Server';
const router = express();

/** Log the request */
router.use((req, res, next) => {
    /** Log the req */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log the res */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Parse the body of the request */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({
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
router.use('/', express.static('apidoc'));
router.use('/content', express.static('content'));
router.use('/api/sample', sampleRoutes);

//#region Admin
router.use('/api/admin/roles', rolesRoutes);
router.use('/api/admin/users', usersRoutes);
router.use('/api/admin/serviceTypes', serviceTypesRoutes);
router.use('/api/admin/services', servicesRoutes);
router.use('/api/admin/documentMasters', documentMasterRoutes);
router.use('/api/admin/serviceDocuments', serviceDocumentRoutes);
router.use('/api/admin/personalLoans', personalLoanRoutes);
router.use('/api/admin/loanStatus', loanStatusesRoutes);
router.use('/api/admin/partners', partnerRoutes);
router.use('/api/admin/bankLoanCommission', bankLoanCommissionRoutes);
router.use('/api/admin/dsa', dsaRoutes);
router.use('/api/admin/trainingCategory', TrainingCategroyRoutes);
router.use('/api/admin/training', TrainingRoutes);
router.use('/api/admin/businessLoans', businessLoanRoutes);
router.use('/api/admin/employmentType', employmentTypeRoutes);
router.use('/api/admin/serviceEmploymentTypes', serviceEmploymentTypes);
router.use('/api/admin/maritalStatuses', maritalStatusRoutes);
router.use('/api/admin/itr', itrRoutes);
router.use('/api/admin/residentTypes', residentTypeRoutes);
router.use('/api/admin/loanAgainstCollteral', loanAgainstCollteralRoutes);
router.use('/api/admin/businessAnnualProfit', businessAnnualProfitRoutes);
router.use('/api/admin/businessAnnualSale', businessAnnualSaleRoutes);
router.use('/api/admin/businessExperience', businessExperienceRoutes);
router.use('/api/admin/banks', bankRoutes);
router.use('/api/admin/industryTypes', industryTypes);
router.use('/api/admin/businessNature', businessNature);
router.use('/api/admin/propertyType', propertType);
router.use('/api/admin/employmentServiceType', employmentServiceType);
router.use('/api/admin/employmentNature', employmentNature);
router.use('/api/admin/coApplicantRelation', coApplicantRelation);
router.use('/api/admin/addressType', AddressTypeRoutes);
router.use('/api/admin/badges', BadgeRoutes);
router.use('/api/admin/commissionTypes', adminCommissionTypeRoutes);
router.use('/api/admin/userPages', adminUserPageRoutes);
router.use('/api/admin/partnerCommission', bankLoanPartnerCommission);
router.use('/api/admin/visitingCards', visitingCardRoutes);
router.use('/api/admin/leads', leadRoutes);
router.use('/api/admin/bankPolicies', adminBankLoanPolicyRoutes);
router.use('/api/admin/bankLoans', bankLoanRoutes);
router.use('/api/admin/customers', customerRoutes);
router.use('/api/admin/homeLoan', homeLoanRoutes);
router.use('/api/admin/rewardCoin', rewardCoinRoutes);
router.use('/api/admin/faqs', faqsRoutes);
router.use('/api/admin/otherLoan', otherLoanRoutes);
router.use('/api/admin/commissionTemplates', commissionTemplateRoutes);
router.use('/api/admin/banner', bannerRoutes);
router.use('/api/admin/bankCreditCard', bankCreditCardRoutes);
router.use('/api/admin/bankCreditCardPolicy', bankCreditCardPolicyRoutes);
router.use('/api/admin/creditCard', creditCardRoutes);
router.use('/api/admin/scratchCard', scratchCardRoutes);
router.use('/api/admin/systemflags', systemFlagRoutes);
router.use('/api/admin/companyTypes', companyTypeRoutes);
router.use('/api/admin/products', productsRoutes);
router.use('/api/admin/orders', ordersRoutes);
router.use('/api/admin/newslettersubscription', newslettersubscriptionRoutes);
router.use('/api/admin/payout', payoutRoutes);
router.use('/api/admin/dashboard', dashboardRoutes);
router.use('/api/admin/permissionGroup', permissionGroupRoutes);
router.use('/api/admin/contactRequest', ContactRequest);
//#endregion Admin

//#region Web
router.use('/api/web/users', webUsersRoutes);
router.use('/api/web/services', webServiceRoutes);
router.use('/api/web/leads', webLeadsRoutes);
router.use('/api/web/cities', webCitiesRoutes);
router.use('/api/web/degrees', webDegreesRoutes);
router.use('/api/web/courses', webCoursesRoutes);
router.use('/api/web/contactUs', webContactRoutesRoutes);
router.use('/api/web/roles', webRoleRoutes);
router.use('/api/web/dsaSignUps', webDsaSignupRoutes);
router.use('/api/web/documents', webDocumentRoutes);
router.use('/api/web/employmentTypes', webEmploymentTypesRoutes);
router.use('/api/web/countries', webCountriesRoutes);
router.use('/api/web/banks', webBanksRoutes);
router.use('/api/web/professionTypes', webProfessionTypesRoutes);
router.use('/api/web/companyTypes', webCompanyTypesRoutes);
router.use('/api/web/towns', webTownRoutes);
router.use('/api/web/referLink', webReferLinkRoutes);
//#endregion Web

//#region Partner
router.use('/api/partner/roles', partnerRoleRoutes);
router.use('/api/partner/documents', partnerDocumentsRoutes);
router.use('/api/partner/educationTypes', partnerEducationTypesRoutes);
router.use('/api/partner/designations', partnerDesignationRoutes);
router.use('/api/partner/users', partnerUsersRoutes);
router.use('/api/partner/personalLoans', partnerPersonalLoanRoutes);
router.use('/api/partner/loans', partnerLoansRoutes);
router.use('/api/partner/professions', partnerProfessionRoutes);
router.use('/api/partner/banks', partnerBankRoutes);
router.use('/api/partner/commissionTypes', commissionTypeRoutes);
router.use('/api/partner/partnerCommissions', partnerCommissionRoutes);
router.use('/api/partner/partners', partnerPartnerRoutes);
router.use('/api/partner/trainings', partnerTrainingRoutes);
router.use('/api/partner/businessLoans', partnerBusinessLoanRoutes);
router.use('/api/partner/employmentTypes', partnerEmploymentRoutes);
router.use('/api/partner/visitingCards', partnerVisitingCards);
router.use('/api/partner/homeLoans', partnerHomeLoanRoutes);
router.use('/api/partner/creditCards', partnerCreditCardRoutes);
router.use('/api/partner/faqs', partnerFaqsRoutes);
//#endregion Partner

//#region Customer
router.use('/api/customer/users', customerUsersRoutes);
router.use('/api/customer/services', customerServicesRoutes);
router.use('/api/customer/employmentTypes', customerEmploymentTypesRoutes);
router.use('/api/customer/maritalStatuses', customerMaritalStatusesRoutes);
router.use('/api/customer/serviceDocuments', customerServiceDocumentsRoutes);
router.use('/api/customer/serviceMasterData', customerServiceMasterDataRoutes);
router.use('/api/customer/personalLoans', customerPersonalLoanRoutes);
router.use('/api/customer/loanStatus', customerLoanStatusRoutes);
router.use('/api/customer/loans', customerLoansRoutes);
router.use('/api/customer/cities', customerCitiesRoutes);
router.use('/api/customer/businessLoans', customerBusinessLoanRoutes);
router.use('/api/customer/leads', customerLeadRoutes);
router.use('/api/customer/homeLoans', customerHomeLoanRoutes);
router.use('/api/customer/creditCards', customerCreditCardRoutes);
router.use('/api/customer/otherLoans', customerOtherLoanRoutes);
router.use('/api/customer/faqs', customerFaqsRoutes);
router.use('/api/customer/referLink', customerReferLinkRoutes);
router.use('/api/customer/scratchCards', customerScratchCardRoutes);
router.use('/api/customer/userWallets', customerWalletRoutes);
router.use('/api/customer/banner', customerBannerRoutes);
router.use('/api/customer/notifications', notificationRoutes);
router.use('/api/customer/products', customerProductsRoutes);
router.use('/api/customer/orders', customerOrderRoutes);

//#endregion Customer

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

router.use((result: any, req: any, res: any, next: any) => {
    if (result.status == 200) {
        res.json({
            status: result.status,
            isDisplayMessage: result.isDisplayMessage,
            message: result.message,
            recordList: result.recordList,
            totalRecords: result.totalRecords
        });
    } else {
        var error = result;
        var trace = null;
        res.status(error.status || 500);
        if (error.error != null) {
            trace = stackTrace.parse(error.error);
        }
        var errorResult = {
            status: error.status,
            isDisplayMessage: error.isDisplayMessage,
            message: error.error != undefined && error.error != null ? error.error.message : 'Error object is not available',
            value: error.value,
            error: error?.error
        };
        res.json(errorResult);

    }
});

const httpServer = http.createServer(router);

httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running ${config.server.hostname}:${config.server.port}`));
