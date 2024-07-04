export class AdminPersonalLoanMoreBasicDetailResponse {
    alternativeContactNo: string;
    gender: string;
    maritalStatusId: number;
    maritalStatus: string;
    spouseName: string;
    spouseContactNo: string;
    fatherName: string;
    motherName: string;
    customerLoanSpouseId: number;
    loanAmountTakenExisting: number
    approxDate: Date
    approxCurrentEMI: number
    bankId: number
    topupAmount: number
    loanType:string
    bank: string

    constructor(alternativeContactNo, gender, maritalStatusId, maritalStatus, spouseName, spouseContactNo, motherName, fatherName, customerLoanSpouseId,loanAmountTakenExisting,approxDate,approxCurrentEMI,bankId,topupAmount,loanType, bank) {
        this.alternativeContactNo = alternativeContactNo;
        this.gender = gender;
        this.maritalStatusId = maritalStatusId;
        this.maritalStatus = maritalStatus;
        this.spouseName = spouseName;
        this.spouseContactNo = spouseContactNo;
        this.motherName = motherName;
        this.fatherName = fatherName;
        this.customerLoanSpouseId = customerLoanSpouseId;
        this.loanAmountTakenExisting = loanAmountTakenExisting
        this.approxDate = approxDate
        this.bankId = bankId
        this.topupAmount = topupAmount
        this.approxCurrentEMI = approxCurrentEMI
        this.loanType = loanType
        this.bank = bank
    }
}