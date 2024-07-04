export class AdminPersonalLoanReferenceResponse {
    loanReferenceId: number;
    fullName: string;
    contactNo: string;
    label: string;
    addressLine1: string;
    addressLine2: string;
    pincode: number;
    city: string;
    cityId: number;
    district: string;
    state: string;

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