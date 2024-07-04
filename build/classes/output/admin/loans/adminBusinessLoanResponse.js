"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminBusinessLoanResponse = void 0;
class AdminBusinessLoanResponse {
    constructor(basicDetail, moreBasicDetail, businessDetail, loanDocuments, loanStatuses, offers, disbursedData, reason, loanStatusHistory, groupDetail) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.businessDetail = businessDetail;
        this.loanDocuments = loanDocuments;
        this.loanStatuses = loanStatuses;
        this.offers = offers;
        this.disbursedData = disbursedData;
        this.reason = reason;
        this.loanStatusHistory = loanStatusHistory;
        this.groupDetail = groupDetail;
    }
}
exports.AdminBusinessLoanResponse = AdminBusinessLoanResponse;
