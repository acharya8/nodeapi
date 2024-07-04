import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";
import { NumberList } from "aws-sdk/clients/iot";

export class PersonalloanCurrentAddressDetailResponse {
    addressTypeId: number;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    cityId: number;
    label: string;
    customerAddressId: number;
    city: string;
    state: string;
    district: string;

    constructor(label, addressLine1, addressLine2, pincode, cityId, addressTypeId, customerAddressId, city, state, district) {

        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.cityId = cityId;
        this.addressTypeId = addressTypeId;
        this.customerAddressId = customerAddressId;
        this.city = city;
        this.state = state;
        this.district = district;
    }
}