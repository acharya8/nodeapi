export class BusinessLoanDocumentResponse {
    loanDocumentId: number;
    documentId: number;
    documentUrl: string;
    documentName: string;
    isPdf: boolean;
    serviceTypeDocumentId: number
    documentStatus: String;

    constructor(loanDocumentId, documentId, documentUrl, documentName, isPdf, serviceTypeDocumentId, documentStatus?) {
        this.loanDocumentId = loanDocumentId;
        this.documentId = documentId;
        this.documentUrl = documentUrl;
        this.documentName = documentName;
        this.isPdf = isPdf;
        this.serviceTypeDocumentId = serviceTypeDocumentId;
        this.documentStatus = documentStatus;
    }
}