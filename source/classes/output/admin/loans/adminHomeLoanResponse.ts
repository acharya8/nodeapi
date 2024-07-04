// import { BusinessLoanBasicDetailResponse } from "./businessLoanBasicDetailResponse";
// import { loanCompleteHistoryResponse } from "../loanCompleteHistoryReponse";
// import { LoanStatusResponse } from "../loanStatusResponse";
// import { BusinessLoanDocumentResponse } from "./businessLoanDocumentResponse";
// import { BusinessLoanMoreBasicDetailResponse } from "./businessLoanMoreBasicDetailResponse";

import { HomeLoanCoapplicantResponse } from "../../loan/home loan/homeLoanCoapplicantResponse";
import { HomeLoanCorrespondenceAddressDetailResponse } from "../../loan/home loan/homeLoanCorrespondenceResponse";
import { HomeLoanCurrentResidenseResponse } from "../../loan/home loan/homeLoanCurrentResidenceResponse";
import { HomeLoanDocumentResponse } from "../../loan/home loan/homeLoanDocumentResponse";
import { HomeLoanEmploymentDetailResponse } from "../../loan/home loan/homeLoanEmploymentDetailResponse";
import { HomeLoanPermanentAddressDetailResponse } from "../../loan/home loan/homeLoanPermanentAddressDetailResponse";
import { HomeLoanProfileDetailResponse } from "../../loan/home loan/homeLoanProfileDetailResponse";
import { HomeLoanPropertyDetailResponse } from "../../loan/home loan/homeLoanPropertyDetailResponse";
import { HomeLoanTransferPropertyDetailResponse } from "../../loan/home loan/homeLoanTransferPropertyDetailResponse";
import { loanCompleteHistoryResponse } from "../../loan/loanCompleteHistoryReponse";
import { LoanOfferResponse } from "../../loan/loanOfferResponse";
import { LoanStatusResponse } from "../../loan/loanStatusResponse";
import { AdminCustomerResponse } from "./adminCustomerResponse";
import { AdminGroupDetailResponse } from "./adminGroupDetailResponse";

export class AdminHomeLoanResponse {

    propertyDetail: HomeLoanPropertyDetailResponse;
    profileDetail: HomeLoanProfileDetailResponse;
    residenceDetail: HomeLoanCurrentResidenseResponse;
    employmentDetail: HomeLoanEmploymentDetailResponse;
    permanentAddressDetail: HomeLoanPermanentAddressDetailResponse;
    loanCompleteHistory: loanCompleteHistoryResponse;
    loanStatuses: LoanStatusResponse;
    correspondenceAddressDetail: HomeLoanCorrespondenceAddressDetailResponse;
    coapplicants: Array<HomeLoanCoapplicantResponse>;
    loanDocuments: Array<HomeLoanDocumentResponse>;
    loanOffer: LoanOfferResponse;
    basicDetail: AdminCustomerResponse
    disbursedData: any;
    reason: any;
    loanStatusHistory: any;
    transferPropertyDetail: HomeLoanTransferPropertyDetailResponse;
    groupDetail: AdminGroupDetailResponse;
    constructor(basicDetail, coApplicantDetail, propertyDetail, residenceDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatuses, loanDocuments, loanOffer, disbursedData, reason, loanStatusHistory, transferPropertyDetail, groupDetail) {
        this.basicDetail = basicDetail
        this.propertyDetail = propertyDetail;
        this.residenceDetail = residenceDetail;
        this.employmentDetail = employmentDetail;
        this.permanentAddressDetail = permanentAddressDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanStatuses = loanStatuses;
        this.correspondenceAddressDetail = correspondenceAddressDetail;
        this.loanDocuments = loanDocuments;
        this.loanOffer = loanOffer;
        this.coapplicants = coApplicantDetail;
        this.disbursedData = disbursedData
        this.reason = reason
        this.loanStatusHistory = loanStatusHistory
        this.transferPropertyDetail = transferPropertyDetail
        this.groupDetail = groupDetail;
    }
}