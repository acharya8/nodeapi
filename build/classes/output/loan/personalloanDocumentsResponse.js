"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalLoanDocumentResponse = void 0;
class PersonalLoanDocumentResponse {
    constructor(loanDocumentId, documentId, documentUrl, documentName, isPdf, serviceTypeDocumentId, documentStatus) {
        this.loanDocumentId = loanDocumentId;
        this.documentId = documentId;
        this.documentUrl = documentUrl;
        this.documentName = documentName;
        this.isPdf = isPdf;
        this.serviceTypeDocumentId = serviceTypeDocumentId;
        this.documentStatus = documentStatus;
    }
}
exports.PersonalLoanDocumentResponse = PersonalLoanDocumentResponse;
