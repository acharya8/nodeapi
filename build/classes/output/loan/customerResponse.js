"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerResponse = void 0;
class CustomerResponse {
    constructor(fullName, birthdate, panCardNo, employmentTypeId, monthlyIncome, companyName, officePincode, loanAmount, tenureId, customerLoanId, customerLoanEmploymentId, contactNo, customerId, userId) {
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
exports.CustomerResponse = CustomerResponse;
