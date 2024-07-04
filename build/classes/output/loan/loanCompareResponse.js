"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanCompareResponse = void 0;
class LoanCompareResponse {
    constructor(bankName, emi, interestRate, interestAmount, netPayableAmount) {
        this.bankName = bankName;
        this.emi = emi;
        this.interestRate = interestRate;
        this.interestAmount = interestAmount;
        this.netPayableAmount = netPayableAmount;
    }
}
exports.LoanCompareResponse = LoanCompareResponse;
