import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";

export class AdminHomeLoanPropertyResponse {
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
    propertyType: string
    propertyCity: string
    propertyState: string
    propertyDistrict: string
    loanType:string

    constructor(customerLoanPropertyDetailId, propertyTypeId, propertyPurchaseValue, propertyCityId, loanAmount, addressLine1, addressLine2, pincode, customerId?, propertyType?, propertyCity?, propertyDistrict?, propertyState?,loanType?) {
        this.customerLoanPropertyDetailId = customerLoanPropertyDetailId;
        this.propertyTypeId = propertyTypeId;
        this.propertyPurchaseValue = propertyPurchaseValue;
        this.propertyCityId = propertyCityId;
        this.loanAmount = loanAmount;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.customerId = customerId;
        this.propertyType = propertyType;
        this.propertyCity = propertyCity;
        this.propertyDistrict = propertyDistrict
        this.propertyState = propertyState
        this.loanType = loanType
    }
}