// import { BusinessLoanBasicDetailResponse } from "./businessLoanBasicDetailResponse";
// import { loanCompleteHistoryResponse } from "../loanCompleteHistoryReponse";
// import { LoanStatusResponse } from "../loanStatusResponse";
// import { BusinessLoanDocumentResponse } from "./businessLoanDocumentResponse";
// import { BusinessLoanMoreBasicDetailResponse } from "./businessLoanMoreBasicDetailResponse";

import { loanCompleteHistoryResponse } from "../loanCompleteHistoryReponse";
import { LoanOfferResponse } from "../loanOfferResponse";
import { LoanStatusResponse } from "../loanStatusResponse";
import { HomeLoanCorrespondenceAddressDetailResponse } from "./homeLoanCorrespondenceResponse";
import { HomeLoanCurrentResidenseResponse } from "./homeLoanCurrentResidenceResponse";
import { HomeLoanDocumentResponse } from "./homeLoanDocumentResponse";
import { HomeLoanEmploymentDetailResponse } from "./homeLoanEmploymentDetailResponse";
import { HomeLoanPermanentAddressDetailResponse } from "./homeLoanPermanentAddressDetailResponse";
import { HomeLoanProfileDetailResponse } from "./homeLoanProfileDetailResponse";
import { HomeLoanPropertyDetailResponse } from "./homeLoanPropertyDetailResponse";
import { HomeLoanTransferPropertyDetailResponse } from "./homeLoanTransferPropertyDetailResponse";

export class HomeLoanResponse {

    propertyDetail: HomeLoanPropertyDetailResponse;
    profileDetail: HomeLoanProfileDetailResponse;
    residenceDetail: HomeLoanCurrentResidenseResponse;
    employmentDetail: HomeLoanEmploymentDetailResponse;
    permanentAddressDetail: HomeLoanPermanentAddressDetailResponse;
    loanCompleteHistory: loanCompleteHistoryResponse;
    loanStatuses: LoanStatusResponse;
    correspondenceAddressDetail: HomeLoanCorrespondenceAddressDetailResponse;

    loanDocuments: Array<HomeLoanDocumentResponse>;
    loanOffer: LoanOfferResponse;
    transferPropertyDetail: HomeLoanTransferPropertyDetailResponse;


    constructor(propertyDetail, profileDetail, residenceDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatuses, loanDocuments?, loanOffer?, transferPropertyDetail?) {
        this.propertyDetail = propertyDetail;
        this.profileDetail = profileDetail;
        this.residenceDetail = residenceDetail;
        this.employmentDetail = employmentDetail;
        this.permanentAddressDetail = permanentAddressDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanStatuses = loanStatuses;
        this.correspondenceAddressDetail = correspondenceAddressDetail;
        this.loanDocuments = loanDocuments;
        this.loanOffer = loanOffer
        this.transferPropertyDetail = transferPropertyDetail
    }
}