"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminHomeLoanPropertyResponse = void 0;
class AdminHomeLoanPropertyResponse {
    constructor(customerLoanPropertyDetailId, propertyTypeId, propertyPurchaseValue, propertyCityId, loanAmount, addressLine1, addressLine2, pincode, customerId, propertyType, propertyCity, propertyDistrict, propertyState, loanType) {
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
        this.propertyDistrict = propertyDistrict;
        this.propertyState = propertyState;
        this.loanType = loanType;
    }
}
exports.AdminHomeLoanPropertyResponse = AdminHomeLoanPropertyResponse;
