import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";
import { HomeLoanCoapplicantResponse } from "./homeLoanCoapplicantResponse";

export class HomeLoanProfileDetailResponse {
    fullName: string;
    birthDate: Date;
    maritalStatusId: number;
    panCardNo: string;
    motherName: string;
    fatherContactNo: string;
    coapplicants: Array<HomeLoanCoapplicantResponse>;
    contactNo: number;





    constructor(fullName, birthDate, maritalStatusId, panCardNo, motherName, fatherContactNo, coapplicants, contactNo) {
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.maritalStatusId = maritalStatusId;
        this.panCardNo = panCardNo;
        this.coapplicants = coapplicants;
        this.motherName = motherName;
        this.fatherContactNo = fatherContactNo;
        this.contactNo = contactNo;
    }
}