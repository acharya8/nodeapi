"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardResponse = void 0;
class CreditCardResponse {
    constructor(basicDetail, permanentAddressDetail, correspondenceAddressDetail, workAddressDetail, loanCompleteHistory, loanStatuses, chooseCreditCardDetail) {
        this.basicDetail = basicDetail;
        this.permanentAddressDetail = permanentAddressDetail;
        this.correspondenceAddressDetail = correspondenceAddressDetail;
        this.workAddressDetail = workAddressDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanStatuses = loanStatuses;
        this.chooseCreditCardDetail = chooseCreditCardDetail;
    }
}
exports.CreditCardResponse = CreditCardResponse;
