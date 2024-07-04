import { CustomerResponse } from "./customerResponse";
import { loanCompleteHistoryResponse } from "./loanCompleteHistoryReponse";
import { LoanOfferResponse } from "./loanOfferResponse";
import { LoanStatusResponse } from "./loanStatusResponse";
import { PersonalloanCurrentAddressDetailResponse } from "./personalloanCurrentAddressDetailResponse";
import { PersonalLoanDocumentResponse } from "./personalloanDocumentsResponse";
import { PersonalLoanMoreBasicDetailResponse } from "./personalloanMoreBasicDetailResponse";
import { PersonalLoanMoreEmploymentDetailResponse } from "./personalloanMoreEmploymentDetailResponse";
import { PersonalLoanReferenceResponse } from "./personalloanReferenceResponse";

export class PersonalLoanResponse {
    basicDetail: CustomerResponse;
    moreBasicDetail: PersonalLoanMoreBasicDetailResponse;
    moreEmploymentDetail: PersonalLoanMoreEmploymentDetailResponse;
    loanCompleteHistory: loanCompleteHistoryResponse;
    loanDocuments: Array<PersonalLoanDocumentResponse>;
    loanReferences: Array<PersonalLoanReferenceResponse>;
    loanStatuses: LoanStatusResponse;
    loanOffer: LoanOfferResponse;
    currentAddressDetail: PersonalloanCurrentAddressDetailResponse;

    constructor(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReferences, loanStatuses, loanOffer, currentAddressDetail) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.moreEmploymentDetail = moreEmploymentDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanDocuments = loanDocuments;
        this.loanReferences = loanReferences;
        this.loanStatuses = loanStatuses;
        this.loanOffer = loanOffer
        this.currentAddressDetail = currentAddressDetail;
    }
}