"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPersonalLoanDocumentResponse = void 0;
class AdminPersonalLoanDocumentResponse {
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
exports.AdminPersonalLoanDocumentResponse = AdminPersonalLoanDocumentResponse;
