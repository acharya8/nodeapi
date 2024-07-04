import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";
import { NumberList } from "aws-sdk/clients/iot";

export class ChoosenCreditCardDetailResponse {
    selectedBankId: number;
    selectedBankCreditCardId: number;
    referenceNumber: string;
    choosenCreditCardOfferId: number;
    selectedBankName: string;



    constructor(selectedBankId, selectedBankCreditCardId, referenceNumber, choosenCreditCardOfferId, selectedBankName) {

        this.selectedBankId = selectedBankId;
        this.selectedBankCreditCardId = selectedBankCreditCardId;
        this.referenceNumber = referenceNumber;
        this.choosenCreditCardOfferId = choosenCreditCardOfferId;
        this.selectedBankName = selectedBankName;
    }
}