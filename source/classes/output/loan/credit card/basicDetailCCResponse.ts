import { NumberList } from "aws-sdk/clients/iot";
import { bool } from "aws-sdk/clients/signer";

export class BasicDetailCCResponse {
    fullName: string;
    birthdate: Date;
    panCardNo: string;
    gender: string;
    maritalStatusId: number;
    email: string;
    creditCardId: number;
    otherCreditCardBankId: number;
    maxCreditLimit: number;
    availableCreditLimit: number;
    employmentTypeId: number;
    bankId: number;
    bankAccountNo: string;
    lastItr: string;
    educationTypeId: number;
    officeContactNo: string;
    creditCardEmploymentDetailId: number;
    companyName: string;
    professionName: string;
    isAlreadyCreditCard: bool;
    communicationAddressId: number;
    customerId: number;
    userId: number;
    contactNo: number;

    constructor(fullName, birthdate, panCardNo, gender, maritalStatusId, email, creditCardId, otherCreditCardBankId, maxCreditLimit, availableCreditLimit, isAlreadyCreditCard, employmentTypeId, bankId, bankAccountNo, lastItr, educationTypeId, officeContactNo, creditCardEmploymentDetailId, companyName, professionName, communicationAddressId?, customerId?, userId?, contactNo?) {
        this.fullName = fullName;
        this.birthdate = birthdate;
        this.panCardNo = panCardNo;
        this.gender = gender;
        this.maritalStatusId = maritalStatusId;
        this.email = email;
        this.creditCardId = creditCardId;
        this.otherCreditCardBankId = otherCreditCardBankId;
        this.maxCreditLimit = maxCreditLimit;
        this.availableCreditLimit = availableCreditLimit;
        this.isAlreadyCreditCard = isAlreadyCreditCard;
        this.employmentTypeId = employmentTypeId;
        this.bankId = bankId;
        this.bankAccountNo = bankAccountNo;
        this.lastItr = lastItr;
        this.educationTypeId = educationTypeId;
        this.officeContactNo = officeContactNo;
        this.creditCardEmploymentDetailId = creditCardEmploymentDetailId;
        this.companyName = companyName;
        this.professionName = professionName;
        this.customerId = customerId;
        this.userId = userId;
        this.communicationAddressId = communicationAddressId;
        this.contactNo = contactNo;
    }
}