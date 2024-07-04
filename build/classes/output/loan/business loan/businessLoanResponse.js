"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessLoanResponse = void 0;
class BusinessLoanResponse {
    // loanReferences: Array<PersonalLoanReferenceResponse>;
    // loanStatuses: LoanStatusResponse;
    constructor(basicDetail, moreBasicDetail, loanCompleteHistory, loanStatuses, loanDocuments, loanOffer) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanStatuses = loanStatuses;
        this.loanDocuments = loanDocuments;
        this.loanOffer = loanOffer;
        // this.loanReferences = loanReferences;
        // this.loanStatuses = loanStatuses;
    }
}
exports.BusinessLoanResponse = BusinessLoanResponse;
