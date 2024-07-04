"use strict";
// import { BusinessLoanBasicDetailResponse } from "./businessLoanBasicDetailResponse";
// import { loanCompleteHistoryResponse } from "../loanCompleteHistoryReponse";
// import { LoanStatusResponse } from "../loanStatusResponse";
// import { BusinessLoanDocumentResponse } from "./businessLoanDocumentResponse";
// import { BusinessLoanMoreBasicDetailResponse } from "./businessLoanMoreBasicDetailResponse";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminHomeLoanResponse = void 0;
class AdminHomeLoanResponse {
    constructor(basicDetail, coApplicantDetail, propertyDetail, residenceDetail, employmentDetail, permanentAddressDetail, correspondenceAddressDetail, loanCompleteHistory, loanStatuses, loanDocuments, loanOffer, disbursedData, reason, loanStatusHistory, transferPropertyDetail, groupDetail) {
        this.basicDetail = basicDetail;
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
        this.disbursedData = disbursedData;
        this.reason = reason;
        this.loanStatusHistory = loanStatusHistory;
        this.transferPropertyDetail = transferPropertyDetail;
        this.groupDetail = groupDetail;
    }
}
exports.AdminHomeLoanResponse = AdminHomeLoanResponse;
