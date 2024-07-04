"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeLoanProfileDetailResponse = void 0;
class HomeLoanProfileDetailResponse {
    constructor(fullName, birthDate, maritalStatusId, panCardNo, motherName, fatherContactNo, coapplicants, contactNo) {
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.maritalStatusId = maritalStatusId;
        this.panCardNo = panCardNo;
        this.coapplicants = coapplicants;
        this.motherName = motherName;
        this.fatherContactNo = fatherContactNo;
        this.contactNo = contactNo;
    }
}
exports.HomeLoanProfileDetailResponse = HomeLoanProfileDetailResponse;
