import { BusinessLoanBasicDetailResponse } from "./businessLoanBasicDetailResponse";
import { loanCompleteHistoryResponse } from "../loanCompleteHistoryReponse";
import { LoanStatusResponse } from "../loanStatusResponse";
import { BusinessLoanDocumentResponse } from "./businessLoanDocumentResponse";
import { BusinessLoanMoreBasicDetailResponse } from "./businessLoanMoreBasicDetailResponse";
import { LoanOfferResponse } from "../loanOfferResponse";

export class BusinessLoanResponse {
    basicDetail: BusinessLoanBasicDetailResponse;
    moreBasicDetail: BusinessLoanMoreBasicDetailResponse;
    // moreEmploymentDetail: PersonalLoanMoreEmploymentDetailResponse;
    loanCompleteHistory: loanCompleteHistoryResponse;
    loanStatuses: LoanStatusResponse
    loanDocuments: Array<BusinessLoanDocumentResponse>;
    loanOffer: LoanOfferResponse;
    // loanReferences: Array<PersonalLoanReferenceResponse>;
    // loanStatuses: LoanStatusResponse;


    constructor(basicDetail, moreBasicDetail, loanCompleteHistory, loanStatuses, loanDocuments?, loanOffer?) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanStatuses = loanStatuses
        this.loanDocuments = loanDocuments;
        this.loanOffer = loanOffer;
        // this.loanReferences = loanReferences;
        // this.loanStatuses = loanStatuses;
    }
}