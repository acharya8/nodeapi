export class AdminCustomerResponse {
    fullName: string;
    birthdate: Date;
    contactNo: string;
    panCardNo: string;
    employmentTypeId: number;
    employmentType: string;
    monthlyIncome: number;
    companyName: string;
    officePincode: string;
    loanAmount: number;
    customerLoanId: number;
    customerLoanEmploymentId: number;
    dsaCode: string;
    rmFullName: string;
    status: string;
    createdBy: string;
    maritalStatus: string
    motherName: string
    fatherContactNo: string
    maritalStatusId: number
    isDelete:boolean
    email:string
    customerId:number
    tenureId:number
    label: string;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    cityId: number;
    city: string;
    district: string;
    state: string;
    currentAddressId: number
    tenure: number
    partnerFullName: string
    partnerContactNo: number
    partnerId:number
    leadId:number
    statusId:number
    createdDate:Date
    serviceId:number
    cibilScore:number
    gender:string
    loanType:string

    constructor(fullName, birthdate, contactNo, panCardNo, employmentTypeId, employmentType, monthlyIncome, companyName, officePincode, loanAmount, customerLoanId, customerLoanEmploymentId, partnerId,dsaCode, partnerFullName, partnerContactNo, rmFullName, status, createdBy, maritalStatusId, maritalStatus?, motherName?, fatherContactNo?, isDelete?, email?, customerId?,tenureId?, tenure?, label?, addressLine1?, addressLine2?, pincode?, cityId?, city?, district?, state?, id?,leadId?,statusId?,createdDate?,serviceId?,cibilScore?,gender?,loanType?) {
        this.fullName = fullName;
        this.birthdate = birthdate;
        this.contactNo = contactNo;
        this.panCardNo = panCardNo;
        this.employmentTypeId = employmentTypeId;
        this.employmentType = employmentType;
        this.monthlyIncome = monthlyIncome;
        this.companyName = companyName;
        this.officePincode = officePincode;
        this.loanAmount = loanAmount;
        this.tenureId = tenureId
        this.customerLoanId = customerLoanId;
        this.customerLoanEmploymentId = customerLoanEmploymentId;
        this.dsaCode = dsaCode;
        this.rmFullName = rmFullName;
        this.status = status;
        this.createdBy = createdBy;
        this.maritalStatus = maritalStatus
        this.motherName = motherName
        this.fatherContactNo = fatherContactNo;
        this.maritalStatusId = maritalStatusId
        this.isDelete = isDelete
        this.email = email
        this.customerId = customerId
        this.tenureId = tenureId
        this.label = label
        this.addressLine1 = addressLine1
        this.addressLine2 = addressLine2
        this.pincode = pincode
        this.cityId = cityId
        this.city = city
        this.district = district
        this.state = state
        this.currentAddressId = id
        this.tenure = tenure
        this.partnerFullName = partnerFullName
        this.partnerContactNo = partnerContactNo
        this.partnerId = partnerId
        this.leadId = leadId;
        this.statusId  = statusId;
        this.createdDate = createdDate;
        this.serviceId = serviceId;
        this.cibilScore = cibilScore;
        this.gender = gender
        this.loanType = loanType
    }
}