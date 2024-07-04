"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreditCardAddressResponse = void 0;
class CreditCardAddressResponse {
    constructor(label, addressLine1, addressLine2, pincode, cityId, addressTypeId, customerAddressId) {
        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.cityId = cityId;
        this.addressTypeId = addressTypeId;
        this.customerAddressId = customerAddressId;
    }
}
exports.CreditCardAddressResponse = CreditCardAddressResponse;
