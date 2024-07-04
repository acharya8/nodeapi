import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";

export class AdminBusinessLoanBasicDetailResponse {
    fullName: string;
    birthdate: Date;
    panCardNo: string;
    employmentTypeId: number;
    employmentType: string;
    pincode: string;
    loanAmount: number;
    customerLoanId: number;
    customerId: number;
    userId: number
    //from here
    businessAnnualSale: number;
    businessExperienceId: number;
    email: string;
    gender: string;
    maritalStatusId: number;
    maritalStatus: string;
    residentTypeId: number;
    residentType: string;
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
    currentlyPayEmi: string;
    alternativeContactNo: string;
    partnerCode: string
    status: string
    statusId: number
    rmFullName: string;
    createdBy: string
    contactNo: string;
    customerAdressId: number
    isDelete: boolean
    partnerId: number
    partnerFullName: string
    partnerContactNo: string
    designation: string
    leadId: number
    loanAmountTakenExisting: number
    approxDate: Date
    approxCurrentEMI: number
    bankId: number
    bank: string
    topupAmount: number
    loanType: string
    createdDate: Date
    cibilScore: number

    constructor(fullName, birthdate, contactNo, panCardNo, employmentTypeId, employmentType, pincode, loanAmount, customerLoanId, businessAnnualSale, businessExperienceId, email, gender, maritalStatusId, maritalStatus, residentTypeId, residentType, cityId, companyTypeId, businessNatureId, industryTypeId, businessAnnualProfitId, primaryBankId, customerAddressId, customerLoanBusinessDetailId, customerLoanCurrentResidentTypeId, alternativeContactNo, loanAgainstCollateralId, currentlyPayEmi, customerId, userId, partnerId, partnerCode, partnerFullName, partnerContactNo, rmfullName, status, statusId, createdBy, customeraddressId, isDelete, leadId, loanAmountTakenExisting, approxDate, approxCurrentEMI, bankId, topupAmount, loanType, createdDate, bank, cibilScore) {
        this.fullName = fullName;
        this.birthdate = birthdate;
        this.panCardNo = panCardNo;
        this.employmentTypeId = employmentTypeId;
        this.employmentType = employmentType;
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
        this.maritalStatus = maritalStatus;
        this.residentTypeId = residentTypeId;
        this.residentType = residentType;
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
        this.alternativeContactNo = alternativeContactNo;
        this.rmFullName = rmfullName;
        this.partnerCode = partnerCode;
        this.status = status;
        this.statusId = statusId;
        this.contactNo = contactNo;
        this.createdBy = createdBy;
        this.customerAddressId = customeraddressId;
        this.isDelete = isDelete;
        this.partnerId = partnerId;
        this.partnerFullName = partnerFullName;
        this.partnerContactNo = partnerContactNo;
        this.leadId = leadId;
        this.loanAmountTakenExisting = loanAmountTakenExisting;
        this.approxDate = approxDate;
        this.bankId = bankId;
        this.topupAmount = topupAmount;
        this.approxCurrentEMI = approxCurrentEMI;
        this.loanType = loanType;
        this.createdDate = createdDate;
        this.bank = bank;
        this.cibilScore = cibilScore;
    }
}