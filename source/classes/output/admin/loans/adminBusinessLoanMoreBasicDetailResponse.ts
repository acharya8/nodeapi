export class AdminBusinessLoanMoreBasicDetailResponse {
    label: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    district: string;
    loanagainstcollteralName: string
    loanagainstcollteralId: number
    cityId: number
    constructor(label, addressLine1, addressLine2, cityId, city, state, district, loanagainstcollteralName, loanagainstcollteralId) {
        this.label = label
        this.addressLine1 = addressLine1
        this.addressLine2 = addressLine2
        this.city = city
        this.district = district
        this.state = state
        this.loanagainstcollteralName = loanagainstcollteralName
        this.loanagainstcollteralId = loanagainstcollteralId
        this.cityId = cityId
    }
}