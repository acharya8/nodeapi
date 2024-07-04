

import { loanCompleteHistoryResponse } from "../loanCompleteHistoryReponse";
import { LoanStatusResponse } from "../loanStatusResponse";
import { BasicDetailCCResponse } from "./basicDetailCCResponse";
import { ChoosenCreditCardDetailResponse } from "./choosenCreditCardDetailResponse";
import { CreditCardAddressResponse } from "./creditCardAddressResponse";

export class CreditCardResponse {
    basicDetail: BasicDetailCCResponse;
    permanentAddressDetail: CreditCardAddressResponse;
    correspondenceAddressDetail: CreditCardAddressResponse;
    workAddressDetail: CreditCardAddressResponse;

    loanCompleteHistory: loanCompleteHistoryResponse;
    loanStatuses: LoanStatusResponse;
    chooseCreditCardDetail: ChoosenCreditCardDetailResponse;

    constructor(basicDetail, permanentAddressDetail, correspondenceAddressDetail, workAddressDetail, loanCompleteHistory, loanStatuses, chooseCreditCardDetail?) {
        this.basicDetail = basicDetail;
        this.permanentAddressDetail = permanentAddressDetail;
        this.correspondenceAddressDetail = correspondenceAddressDetail;
        this.workAddressDetail = workAddressDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanStatuses = loanStatuses;
        this.chooseCreditCardDetail = chooseCreditCardDetail;
    }
}