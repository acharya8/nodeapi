export class AdminLoanStatusResponse {
    loanStatusId: number;
    transactionDate: Date;
    loanStatus: string;
    isDataEditable: boolean;
    applyDate: Date;
    displayName: string;
    loanStatuses: AdminLoanStatusResponse;
    offers: any;
    disbursedData: any;
    reason: any;
    loanStatusHistory: any;
    constructor(loanStatusId, transactionDate, loanStatus, isDataEditable, applyDate, displayName) {
        this.loanStatusId = loanStatusId;
        this.transactionDate = transactionDate;
        this.loanStatus = loanStatus;
        this.isDataEditable = isDataEditable;
        this.applyDate = applyDate;
        this.displayName = displayName;
        
    }
}