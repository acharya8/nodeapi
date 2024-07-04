"use strict";
// import { BusinessLoanBasicDetailResponse } from "./businessLoanBasicDetailResponse";
// import { loanCompleteHistoryResponse } from "../loanCompleteHistoryReponse";
// import { LoanStatusResponse } from "../loanStatusResponse";
// import { BusinessLoanDocumentResponse } from "./businessLoanDocumentResponse";
// import { BusinessLoanMoreBasicDetailResponse } from "./businessLoanMoreBasicDetailResponse";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeLoanResponse = void 0;
class HomeLoanResponse {
    constructor(propertyDetail, profileDetail, residenceDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatuses, loanDocuments, loanOffer, transferPropertyDetail) {
        this.propertyDetail = propertyDetail;
        this.profileDetail = profileDetail;
        this.residenceDetail = residenceDetail;
        this.employmentDetail = employmentDetail;
        this.permanentAddressDetail = permanentAddressDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanStatuses = loanStatuses;
        this.correspondenceAddressDetail = correspondenceAddressDetail;
        this.loanDocuments = loanDocuments;
        this.loanOffer = loanOffer;
        this.transferPropertyDetail = transferPropertyDetail;
    }
}
exports.HomeLoanResponse = HomeLoanResponse;
