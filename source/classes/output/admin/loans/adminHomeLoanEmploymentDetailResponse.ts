import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";
import { NumberList } from "aws-sdk/clients/iot";

export class AdminHomeLoanEmploymentDetailResponse {
    employmentTypeId: number;
    monthlyIncome: number;
    industryTypeId: number;
    employmentNatureId: number;
    employmentServiceTypeId: number;
    addressTypeId: number;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    cityId: number;
    label: string;
    customerloanemploymentdetailId: number;
    companyAddressId: number;
    employmentNature: string
    serviceEmploymentType: string
    industryType: string

    constructor(employmentTypeId, monthlyIncome, label, addressLine1, addressLine2, pincode, cityId, companyAddressId, addressTypeId, customerloanemploymentdetailId, industryTypeId?, employmentNatureId?, employmentServiceTypeId?, serviceEmploymentType?, employmentNature?, industryType?) {
        this.employmentTypeId = employmentTypeId;
        this.monthlyIncome = monthlyIncome;
        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.cityId = cityId;
        this.companyAddressId = companyAddressId;
        this.addressTypeId = addressTypeId;
        this.industryTypeId = industryTypeId;
        this.employmentNatureId = employmentNatureId;
        this.employmentServiceTypeId = employmentServiceTypeId;
        this.customerloanemploymentdetailId = customerloanemploymentdetailId;
        this.serviceEmploymentType = serviceEmploymentType
        this.employmentNature = employmentNature
        this.industryType = industryType
    }
}