export class PersonalLoanMoreBasicDetailResponse {
    alternativeContactNo: string;
    gender: string;
    maritalStatusId: number;
    spouseName: string;
    spouseContactNo: string;
    motherName: string;
    fatherContactNo: string;
    customerLoanSpouseId: number;
    fatherName: string;
    loanAmountTakenExisting: number
    approxDate: Date
    approxCurrentEMI: number
    bankId: number
    topupAmount: number
    loanTypeName:string

    constructor(alternativeContactNo, gender, maritalStatusId, spouseName, spouseContactNo, motherName, fatherContactNo, customerLoanSpouseId, fatherName,loanAmountTakenExisting,approxDate,approxCurrentEMI,bankId,topupAmount,loanType) {
        this.alternativeContactNo = alternativeContactNo;
        this.gender = gender;
        this.maritalStatusId = maritalStatusId;
        this.spouseName = spouseName;
        this.spouseContactNo = spouseContactNo;
        this.motherName = motherName;
        this.fatherContactNo = fatherContactNo;
        this.customerLoanSpouseId = customerLoanSpouseId;
        this.fatherName = fatherName;
        this.loanAmountTakenExisting = loanAmountTakenExisting
        this.approxDate = approxDate
        this.bankId = bankId
        this.topupAmount = topupAmount
        this.approxCurrentEMI = approxCurrentEMI
        this.loanTypeName = loanType
    }
}