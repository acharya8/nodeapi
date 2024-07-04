export class LoanStatusResponse {
    loanStatusId: number;
    transactionDate: Date;
    loanStatus: string;
    isDataEditable: boolean;
    applyDate: Date;
    displayName: string;
    name: string;//ServiceName

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