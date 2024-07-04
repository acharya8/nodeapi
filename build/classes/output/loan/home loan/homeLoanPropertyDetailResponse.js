"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeLoanPropertyDetailResponse = void 0;
class HomeLoanPropertyDetailResponse {
    constructor(customerLoanId, customerLoanPropertyDetailId, propertyTypeId, propertyPurchaseValue, propertyCityId, loanAmount, addressLine1, addressLine2, pincode, loanTypeName, customerId, userId) {
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
exports.HomeLoanPropertyDetailResponse = HomeLoanPropertyDetailResponse;
