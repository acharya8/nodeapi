import { DateTime } from "aws-sdk/clients/devicefarm";
import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";

export class HomeLoanTransferPropertyDetailResponse {
    customerLoanId: number;
    loanAmountTakenExisting: number;
    approxDate: DateTime;
    topupAmount: number;
    approxCurrentEMI: number;
    bankId: number;
    customerLoanTransferPropertyDetailId: number;

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