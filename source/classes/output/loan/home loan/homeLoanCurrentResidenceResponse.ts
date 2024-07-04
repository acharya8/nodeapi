import { NumOpenReactiveInsights } from "aws-sdk/clients/devopsguru";
import { NumberList } from "aws-sdk/clients/iot";

export class HomeLoanCurrentResidenseResponse {
    residentTypeId: number;
    rentAmount: number;
    valueOfProperty: number;
    customerloancurrentresidentdetailId: number;
    residentType: string;

    constructor(residentTypeId, customerloancurrentresidentdetailId, rentAmount?, valueOfProperty?, residentType?) {
        this.residentTypeId = residentTypeId;
        this.customerloancurrentresidentdetailId = customerloancurrentresidentdetailId;
        this.rentAmount = rentAmount;
        this.valueOfProperty = valueOfProperty;
        this.residentType = residentType

    }
}