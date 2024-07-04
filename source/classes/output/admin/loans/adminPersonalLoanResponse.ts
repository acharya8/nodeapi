import { LoanStatusResponse } from "../../loan/loanStatusResponse";
import { AdminCustomerResponse } from "./adminCustomerResponse";
import { AdminGroupDetailResponse } from "./adminGroupDetailResponse";
import { AdminLoanCompleteHistoryResponse } from "./adminLoanCompleteHistoryReponse";
import { AdminLoanStatusResponse } from "./adminLoanStatusResponse";
import { AdminPersonalLoanDocumentResponse } from "./adminPersonalloanDocumentsResponse";
import { AdminPersonalLoanMoreBasicDetailResponse } from "./adminPersonalloanMoreBasicDetailResponse";
import { AdminPersonalLoanMoreEmploymentDetailResponse } from "./adminPersonalloanMoreEmploymentDetailResponse";
import { AdminPersonalLoanReferenceResponse } from "./adminPersonalloanReferenceResponse";

export class AdminPersonalLoanResponse {
    basicDetail: AdminCustomerResponse;
    moreBasicDetail: AdminPersonalLoanMoreBasicDetailResponse;
    moreEmploymentDetail: AdminPersonalLoanMoreEmploymentDetailResponse;
    loanCompleteHistory: AdminLoanCompleteHistoryResponse;
    loanDocuments: Array<AdminPersonalLoanDocumentResponse>;
    loanReferences: Array<AdminPersonalLoanReferenceResponse>;
    offers: any;
    disbursedData: any;
    reason: any;
    loanStatusHistory: any;
    loanStatuses: LoanStatusResponse
    groupDetail: AdminGroupDetailResponse;
    constructor(basicDetail, moreBasicDetail, moreEmploymentDetail, loanCompleteHistory, loanDocuments, loanReferences, loanStatuses, offers, disbursedData, reason, loanStatusHistory, groupDetail) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.moreEmploymentDetail = moreEmploymentDetail;
        this.loanCompleteHistory = loanCompleteHistory;
        this.loanDocuments = loanDocuments;
        this.loanReferences = loanReferences;
        this.loanStatuses = loanStatuses;
        this.offers = offers;
        this.disbursedData = disbursedData;
        this.reason = reason;
        this.loanStatusHistory = loanStatusHistory;
        this.groupDetail = groupDetail;
    }
}