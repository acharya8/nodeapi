import { BusinessLoanDocumentResponse } from "../../loan/business loan/businessLoanDocumentResponse";
import { BusinessLoanMoreBasicDetailResponse } from "../../loan/business loan/businessLoanMoreBasicDetailResponse";
import { loanCompleteHistoryResponse } from "../../loan/loanCompleteHistoryReponse";
import { LoanStatusResponse } from "../../loan/loanStatusResponse";
import { AdminBusinessLoanBasicDetailResponse } from "./adminBusinessLoanBasicDetailResponse";
import { AdminBusinessLoanBusinessDetailResponse } from "./adminBusinessLoanBusinessDetailResponse";
import { AdminGroupDetailResponse } from "./adminGroupDetailResponse";

export class AdminBusinessLoanResponse {
    basicDetail: AdminBusinessLoanBasicDetailResponse;
    moreBasicDetail: BusinessLoanMoreBasicDetailResponse;
    businessDetail: AdminBusinessLoanBusinessDetailResponse;
    // moreEmploymentDetail: PersonalLoanMoreEmploymentDetailResponse;
    loanCompleteHistory: loanCompleteHistoryResponse;
    loanStatuses: LoanStatusResponse
    loanDocuments: Array<BusinessLoanDocumentResponse>;
    offers: any;
    disbursedData: any;
    reason: any;
    loanStatusHistory: any;
    groupDetail: AdminGroupDetailResponse;
    constructor(basicDetail, moreBasicDetail, businessDetail, loanDocuments, loanStatuses, offers, disbursedData, reason, loanStatusHistory, groupDetail) {
        this.basicDetail = basicDetail;
        this.moreBasicDetail = moreBasicDetail;
        this.businessDetail = businessDetail;
        this.loanDocuments = loanDocuments;
        this.loanStatuses = loanStatuses;
        this.offers = offers;
        this.disbursedData = disbursedData;
        this.reason = reason;
        this.loanStatusHistory = loanStatusHistory;
        this.groupDetail = groupDetail;
    }
}