export class AdminPersonalLoanMoreEmploymentDetailResponse {
    emailId: string;
    designation: string;
    companyTypeId: number;
    companyType: string;
    currentCompanyExperience: string;
    label: string;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    cityId: number;
    city: string;
    district: string;
    state: string;
    companyAddressId: number

    constructor(emailId, designation, companyTypeId, companyType, currentCompanyExperience, label, addressLine1, addressLine2, pincode, cityId, city, district, state, companyAddressId) {
        this.emailId = emailId;
        this.designation = designation;
        this.companyTypeId = companyTypeId;
        this.companyType = companyType;
        this.currentCompanyExperience = currentCompanyExperience;
        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.cityId = cityId;
        this.city = city;
        this.district = district;
        this.state = state;
        this.companyAddressId = companyAddressId;
    }
}