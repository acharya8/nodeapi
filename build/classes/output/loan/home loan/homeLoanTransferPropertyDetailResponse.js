"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeLoanTransferPropertyDetailResponse = void 0;
class HomeLoanTransferPropertyDetailResponse {
    constructor(customerLoanId, loanAmountTakenExisting, approxDate, topupAmount, approxCurrentEMI, bankId, customerLoanTransferPropertyDetailId) {
        this.customerLoanId = customerLoanId;
        this.loanAmountTakenExisting = loanAmountTakenExisting;
        this.approxDate = approxDate;
        this.topupAmount = topupAmount;
        this.approxCurrentEMI = approxCurrentEMI;
        this.bankId = bankId;
        this.customerLoanTransferPropertyDetailId = customerLoanTransferPropertyDetailId;
    }
}
exports.HomeLoanTransferPropertyDetailResponse = HomeLoanTransferPropertyDetailResponse;
