export class BusinessLoanMoreBasicDetailResponse {
    addressLine1: String;
    addressLine2: String;
    businessName: String;
    businessGstNo: String;
    contactNo: number;


    constructor(addressLine1, addressLine2, businessName, businessGstNo, contactNo?) {
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.businessName = businessName;
        this.businessGstNo = businessGstNo;
        this.contactNo = contactNo;
    }
}