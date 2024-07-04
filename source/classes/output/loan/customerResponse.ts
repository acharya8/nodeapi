export class CustomerResponse {
    fullName: string;
    birthdate: Date;
    panCardNo: string;
    employmentTypeId: number;
    monthlyIncome: number;
    companyName: string;
    officePincode: string;
    loanAmount: number;
    customerLoanId: number;
    customerLoanEmploymentId: number;
    customerId: number;
    userId: number;
    contactNo: number;
    tenureId: number;


    constructor(fullName, birthdate, panCardNo, employmentTypeId, monthlyIncome, companyName, officePincode, loanAmount, tenureId, customerLoanId, customerLoanEmploymentId, contactNo, customerId?, userId?,) {
        this.fullName = fullName;
        this.birthdate = birthdate;
        this.panCardNo = panCardNo;
        this.employmentTypeId = employmentTypeId;
        this.monthlyIncome = monthlyIncome;
        this.companyName = companyName;
        this.officePincode = officePincode;
        this.loanAmount = loanAmount;
        this.tenureId = tenureId;
        this.customerLoanId = customerLoanId;
        this.customerLoanEmploymentId = customerLoanEmploymentId;
        this.customerId = customerId;
        this.userId = userId;
        this.contactNo = contactNo;
    }
}