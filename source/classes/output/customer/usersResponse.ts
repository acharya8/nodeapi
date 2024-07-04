import { RoleResponse } from "./roleResponse";

export class userResponse {
    userId: number
    email: string;
    countryCode: string;
    password: string;
    profilePicUrl: string;
    isDisabled: boolean;
    roleId: number;
    customerId: number
    temporaryCode: string;
    permanentCode: string;
    fullName: string;
    birthdate: Date;
    gender: string;
    contactNo: string;
    alternativeContactNo: string;
    groupId: number;
    partnerId: number;
    panCardNo: string;
    aadhaarCardNo: string;
    isActive: boolean;
    isDelete: boolean;
    createdDate: Date;
    modifiedDate: Date;
    createdBy: number;
    modifiedBy: number;
    sessionToken: string;
    userRole: RoleResponse;
    addressId: number;
    addressTypeId: number;
    label: string;
    addressLine1: string;
    addressLine2: string;
    pincode: string;
    cityId: number;

    constructor(userId, email, countryCode, password, profilePicUrl, isDisabled, roleId, customerId, temporaryCode, permanentCode, fullName, birthdate, gender, contactNo
        , alternativeContactNo, groupId, partnerId, panCardNo, aadhaarCardNo, isActive, isDelete, createdDate, modifiedDate, createdBy, modifiedBy, sessionToken, userRole
        , addressId, addressTypeId, label, addressLine1, addressLine2, pincode, cityId) {
        this.userId = userId;
        this.email = email;
        this.countryCode = countryCode;
        this.password = password;
        this.profilePicUrl = profilePicUrl;
        this.isDisabled = isDisabled;
        this.roleId = roleId;
        this.customerId = customerId;
        this.temporaryCode = temporaryCode;
        this.permanentCode = permanentCode;
        this.fullName = fullName;
        this.birthdate = birthdate;
        this.gender = gender;
        this.contactNo = contactNo;
        this.alternativeContactNo = alternativeContactNo;
        this.groupId = groupId;
        this.partnerId = partnerId;
        this.panCardNo = panCardNo;
        this.aadhaarCardNo = aadhaarCardNo;
        this.isActive = isActive;
        this.isDelete = isDelete;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
        this.createdBy = createdBy;
        this.modifiedBy = modifiedBy;
        this.sessionToken = sessionToken;
        this.userRole = userRole;
        this.addressId = addressId;
        this.addressTypeId = addressTypeId;
        this.label = label;
        this.addressLine1 = addressLine1;
        this.addressLine2 = addressLine2;
        this.pincode = pincode;
        this.cityId = cityId;
    }
}