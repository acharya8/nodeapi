import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";

export class HomeLoanPropertyDetailResponse {
    customerLoanId: number;
    customerLoanPropertyDetailId: number;
    propertyTypeId: number;
    propertyPurchaseValue: number;
    propertyCityId: number;
    loanAmount: number;
    addressLine1: string;
    addressLine2: string;
    pincode: string;

    customerId: number;
    userId: number;
    propertyType: string;
    loanTypeName: string;

    constructor(customerLoanId, customerLoanPropertyDetailId, propertyTypeId, propertyPurchaseValue, propertyCityId, loanAmount, addressLine1, addressLine2, pincode, loanTypeName, customerId?, userId?) {
        this.customerLoanId = customerLoanId;
        this.customerLoanPropertyDetailId = customerLoanPropertyDetailId;
        this.propertyTypeId = propertyTypeId;
        this.propertyPurchaseValue = propertyPurchaseValue;
        this.propertyCityId = propertyCityId;
        this.loanAmount = loanAmount;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.loanTypeName = loanTypeName;
        this.customerId = customerId;
        this.userId = userId;
    }
}