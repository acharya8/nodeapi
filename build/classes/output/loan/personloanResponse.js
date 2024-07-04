"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalLoanResponse = void 0;
class PersonalLoanResponse {
    constructor(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReferences, loanStatuses, loanOffer, currentAddressDetail) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.moreEmploymentDetail = moreEmploymentDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanDocuments = loanDocuments;
        this.loanReferences = loanReferences;
        this.loanStatuses = loanStatuses;
        this.loanOffer = loanOffer;
        this.currentAddressDetail = currentAddressDetail;
    }
}
exports.PersonalLoanResponse = PersonalLoanResponse;
