"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminLoanStatusResponse = void 0;
class AdminLoanStatusResponse {
    constructor(loanStatusId, transactionDate, loanStatus, isDataEditable, applyDate, displayName) {
        this.loanStatusId = loanStatusId;
        this.transactionDate = transactionDate;
        this.loanStatus = loanStatus;
        this.isDataEditable = isDataEditable;
        this.applyDate = applyDate;
        this.displayName = displayName;
    }
}
exports.AdminLoanStatusResponse = AdminLoanStatusResponse;
