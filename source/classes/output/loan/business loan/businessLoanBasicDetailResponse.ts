import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";

export class BusinessLoanBasicDetailResponse {
    fullName: string;
    birthdate: Date;
    panCardNo: string;
    employmentTypeId: number;
    pincode: string;
    loanAmount: number;
    customerLoanId: number;

    customerId: number;
    userId: number
    //from here
    businessAnnualSale: number;
    businessExperienceId: number;
    email: String;
    gender: String;
    maritalStatusId: number;
    residentTypeId: number;
    loanAgainstCollateralId: number;
    cityId: number;
    companyTypeId: number;
    businessNatureId: number;
    industryTypeId: number;
    businessAnnualProfitId: NumOpenReactiveInsights;
    primaryBankId: number;
    customerAddressId: number;
    customerLoanBusinessDetailId: number;
    customerLoanCurrentResidentTypeId: number;
    currentlyPayEmi: String;
    loanAmountTakenExisting: number
    approxDate: Date
    approxCurrentEMI: number
    bankId: number
    topupAmount: number
    loanTypeName: string

    constructor(fullName, birthdate, panCardNo, employmentTypeId, pincode, loanAmount, customerLoanId, businessAnnualSale, businessExperienceId, email, gender, maritalStatusId, residentTypeId, cityId, companyTypeId, businessNatureId, industryTypeId, businessAnnualProfitId, primaryBankId, customerAddressId, customerLoanBusinessDetailId, customerLoanCurrentResidentTypeId, loanAgainstCollateralId, currentlyPayEmi, customerId, userId,loanAmountTakenExisting,approxDate,approxCurrentEMI,bankId,topupAmount,loanType) {
        this.fullName = fullName;
        this.birthdate = birthdate;
        this.panCardNo = panCardNo;
        this.employmentTypeId = employmentTypeId;
        this.pincode = pincode;
        this.loanAmount = loanAmount;
        this.customerLoanId = customerLoanId;
        this.customerId = customerId;
        this.userId = userId;
        this.businessAnnualSale = businessAnnualSale;
        this.businessExperienceId = businessExperienceId;
        this.email = email;
        this.gender = gender;
        this.maritalStatusId = maritalStatusId;
        this.residentTypeId = residentTypeId;
        this.loanAgainstCollateralId = loanAgainstCollateralId;
        this.cityId = cityId;
        this.companyTypeId = companyTypeId;
        this.businessNatureId = businessNatureId;
        this.industryTypeId = industryTypeId;
        this.businessAnnualProfitId = businessAnnualProfitId;
        this.primaryBankId = primaryBankId;
        this.customerAddressId = customerAddressId;
        this.customerLoanBusinessDetailId = customerLoanBusinessDetailId;
        this.customerLoanCurrentResidentTypeId = customerLoanCurrentResidentTypeId;
        this.currentlyPayEmi = currentlyPayEmi;
        this.loanAmountTakenExisting = loanAmountTakenExisting
        this.approxDate = approxDate
        this.bankId = bankId
        this.topupAmount = topupAmount
        this.approxCurrentEMI = approxCurrentEMI
        this.loanTypeName = loanType
    }
}