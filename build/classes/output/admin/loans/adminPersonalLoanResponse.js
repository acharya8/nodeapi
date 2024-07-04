"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPersonalLoanResponse = void 0;
class AdminPersonalLoanResponse {
    constructor(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReferences, loanStatuses, offers, disbursedData, reason, loanStatusHistory, groupDetail) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.moreEmploymentDetail = moreEmploymentDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanDocuments = loanDocuments;
        this.loanReferences = loanReferences;
        this.loanStatuses = loanStatuses;
        this.offers = offers;
        this.disbursedData = disbursedData;
        this.reason = reason;
        this.loanStatusHistory = loanStatusHistory;
        this.groupDetail = groupDetail;
    }
}
exports.AdminPersonalLoanResponse = AdminPersonalLoanResponse;
