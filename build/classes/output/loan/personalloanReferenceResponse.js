"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalLoanReferenceResponse = void 0;
class PersonalLoanReferenceResponse {
    constructor(loanReferenceId, fullName, contactNo, label, addressLine1, addressLine2, pincode, city, cityId, state, district) {
        this.loanReferenceId = loanReferenceId;
        this.fullName = fullName;
        this.contactNo = contactNo;
        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.city = city;
        this.cityId = cityId;
        this.state = state;
        this.district = district;
    }
}
exports.PersonalLoanReferenceResponse = PersonalLoanReferenceResponse;
