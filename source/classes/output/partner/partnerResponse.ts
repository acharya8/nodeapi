export class partnerResponse {
    partnerid: number;
    parentPartnerId: number;
    userId: number;
    temporaryCode: string;
    permanentCode: string;
    fullName: string;
    gender: string;
    contactNo: string;
    aadhaarCardNo: string;
    panCardNo: string;
    cityId: number;
    companyName: string;
    companyTypeId: number;
    udhyamAadhaarNo: string;
    companyRegNo: string;
    professionTypeId: number;
    workExperience: number;
    haveOffice: boolean;
    businessName: string;
    businessAddress: string;
    gstNo: string;
    commitment: number;
    designationId: number;
    referralCode: string;
    isActive: boolean;
    isDelete: boolean;
    createdDate: Date;
    modifiedDate: Date;
    createdBy: number;
    modifiedBy: number;
    profilePicUrl: String;
    badgeId: number;
    badgeName: string

    constructor(partnerid, parentPartnerId, userId, temporaryCode, permanentCode, fullName, gender, contactNo, aadhaarCardNo, panCardNo, cityId, companyName, companyTypeId, udhyamAadhaarNo, companyRegNo, professionTypeId, workExperience, haveOffice, businessName, businessAddress, gstNo, commitment, designationId, referralCode, isActive, isDelete, createdDate, modifiedDate, createdBy, modifiedBy, profilePicUrl?) {
        this.partnerid = partnerid;
        this.parentPartnerId = parentPartnerId;
        this.userId = userId;
        this.temporaryCode = temporaryCode;
        this.permanentCode = permanentCode;
        this.fullName = fullName;
        this.gender = gender;
        this.contactNo = contactNo;
        this.aadhaarCardNo = aadhaarCardNo;
        this.panCardNo = panCardNo;
        this.cityId = cityId;
        this.companyName = companyName;
        this.companyTypeId = companyTypeId
        this.udhyamAadhaarNo = udhyamAadhaarNo
        this.companyRegNo = companyRegNo
        this.professionTypeId = professionTypeId
        this.workExperience = workExperience
        this.haveOffice = haveOffice
        this.businessName = businessName
        this.businessAddress = businessAddress
        this.gstNo = gstNo
        this.commitment = commitment
        this.designationId = designationId
        this.referralCode = referralCode
        this.isActive = isActive
        this.isDelete = isDelete
        this.createdDate = createdDate
        this.modifiedDate = modifiedDate
        this.createdBy = createdBy
        this.modifiedBy = modifiedBy
        this.profilePicUrl = profilePicUrl
    }
}