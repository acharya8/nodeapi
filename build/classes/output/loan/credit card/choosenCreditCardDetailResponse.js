"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChoosenCreditCardDetailResponse = void 0;
class ChoosenCreditCardDetailResponse {
    constructor(selectedBankId, selectedBankCreditCardId, referenceNumber, choosenCreditCardOfferId, selectedBankName) {
        this.selectedBankId = selectedBankId;
        this.selectedBankCreditCardId = selectedBankCreditCardId;
        this.referenceNumber = referenceNumber;
        this.choosenCreditCardOfferId = choosenCreditCardOfferId;
        this.selectedBankName = selectedBankName;
    }
}
exports.ChoosenCreditCardDetailResponse = ChoosenCreditCardDetailResponse;
