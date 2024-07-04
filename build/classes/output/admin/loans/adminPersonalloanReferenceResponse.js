"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPersonalLoanReferenceResponse = void 0;
class AdminPersonalLoanReferenceResponse {
    constructor(loanReferenceId, fullName, contactNo, label, addressLine1, addressLine2, pincode, city, cityId, district, state) {
        this.loanReferenceId = loanReferenceId;
        this.fullName = fullName;
        this.contactNo = contactNo;
        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.city = city;
        this.cityId = cityId;
        this.district = district;
        this.state = state;
    }
}
exports.AdminPersonalLoanReferenceResponse = AdminPersonalLoanReferenceResponse;
