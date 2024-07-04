import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";
import { NumberList } from "aws-sdk/clients/iot";

export class HomeLoanCoapplicantResponse {
    fullName: string;
    birthDate: Date;
    maritalStatusId: number;
    customerLoanCoApplicantId: number;
    customerloancoapplicantemploymentdetailId: number;
    monthlyIncome: number;
    companyAddressId: number;
    addressTypeId: number;
    label: string;
    addressLine1: string;
    addressLine2: string;
    pincode: String;
    cityId: number;
    employmentTypeId: number;
    employmentNatureId: number;
    employmentServiceTypeId: number;
    industryTypeId: number;
    coApplicantRelationId: number
    constructor(fullName, birthDate, maritalStatusId, customerLoanCoApplicantId, coApplicantRelationId, customerloancoapplicantemploymentdetailId?, monthlyIncome?, companyAddressId?, addressTypeId?, label?, addressLine1?, addressLine2?, pincode?, cityId?, employmentTypeId?, employmentNatureId?, employmentServiceTypeId?, industryTypeId?) {
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.maritalStatusId = maritalStatusId;
        this.customerLoanCoApplicantId = customerLoanCoApplicantId;
        this.customerloancoapplicantemploymentdetailId = customerloancoapplicantemploymentdetailId;
        this.monthlyIncome = monthlyIncome;
        this.companyAddressId = companyAddressId;
        this.addressTypeId = addressTypeId;
        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.cityId = cityId;
        this.employmentTypeId = employmentTypeId;
        this.employmentNatureId = employmentNatureId;
        this.employmentServiceTypeId = employmentServiceTypeId;
        this.industryTypeId = industryTypeId;
        this.coApplicantRelationId = coApplicantRelationId;

    }
}