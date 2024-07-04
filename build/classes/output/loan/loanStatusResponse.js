"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanStatusResponse = void 0;
class LoanStatusResponse {
    constructor(loanStatusId, transactionDate, loanStatus, isDataEditable, applyDate, displayName, name) {
        this.loanStatusId = loanStatusId;
        this.transactionDate = transactionDate;
        this.loanStatus = loanStatus;
        this.isDataEditable = isDataEditable;
        this.applyDate = applyDate;
        this.displayName = displayName;
        this.name = name;
    }
}
exports.LoanStatusResponse = LoanStatusResponse;
