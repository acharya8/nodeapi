import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";

export class AdminBusinessLoanBusinessDetailResponse {
    customerLoanId: number
    companyTypeId: number
    industryTypeId: number
    businessAnnualSale: number
    businessExperienceId: number
    businessNatureId: number
    businessAnnualProfitId: number
    primaryBankId: number
    currentlyPayEmi: number
    businessGstNo: string
    businessName: string
    companyName: string
    address: string
    countryId: number
    stateId: number
    cityId: number
    companyType: string
    industryTypes: string
    businessExperience: string
    businessNatures: string
    businessAnnualProfits: string
    banks: string
    constructor(customerLoanId, companyTypeId, industryTypeId, businessAnnualSale, businessExperienceId, businessNatureId, businessAnnualProfitId, primaryBankId, currentlyPayEmi, businessGstNo, businessName, companyName, address, countryId, stateId, cityId, companyType, industryTypes, businessExperience, businessNatures, businessAnnualProfits, banks) {
        this.customerLoanId = customerLoanId
        this.companyTypeId = companyTypeId
        this.industryTypeId = industryTypeId
        this.businessAnnualSale = businessAnnualSale
        this.businessExperienceId = businessExperienceId
        this.businessNatureId = businessNatureId
        this.businessAnnualProfitId = businessAnnualProfitId
        this.primaryBankId = primaryBankId
        this.currentlyPayEmi = currentlyPayEmi
        this.businessGstNo = businessGstNo
        this.businessName = businessName
        this.companyName = companyName
        this.address = address
        this.countryId = countryId
        this.stateId = stateId
        this.cityId = cityId
        this.companyType = companyType
        this.industryTypes = industryTypes
        this.businessExperience = businessExperience
        this.businessNatures = businessNatures
        this.businessAnnualProfits = businessAnnualProfits
        this.banks = banks
    }
}