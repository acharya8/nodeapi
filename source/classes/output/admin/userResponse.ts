import { RoleResponse } from "./roleResponse";

export class UserResponse {
    userId: number
    fullName: string;
    gender: string;
    email: string;
    countryCode: string;
    contactNo: string;
    password: string;
    profilePicUrl: string;
    isBlocked: boolean;
    isPasswordSet: boolean;
    isEmailVerified: boolean;
    isDisabled: boolean;
    isActive: boolean;
    isDelete: boolean;
    createdDate: Date;
    modifiedDate: Date;
    createdBy: number;
    modifiedBy: number;
    sessionToken: string;
    roleId: number;
    userRole: RoleResponse;

    constructor(userId, fullName, gender, email, countryCode, contactNo, password, profilePicUrl, isBlocked, isPasswordSet, isEmailVerified, isDisabled, isActive
        , isDelete, createdDate, modifiedDate, createdBy, modifiedBy, sessionToken, roleId, userRole) {
        this.userId = userId;
        this.fullName = fullName;
        this.gender = gender;
        this.email = email;
        this.countryCode = countryCode;
        this.contactNo = contactNo;
        this.password = password;
        this.profilePicUrl = profilePicUrl;
        this.isBlocked = isBlocked;
        this.isPasswordSet = isPasswordSet;
        this.isEmailVerified = isEmailVerified;
        this.isDisabled = isDisabled;
        this.isActive = isActive;
        this.isDelete = isDelete;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
        this.createdBy = createdBy;
        this.modifiedBy = modifiedBy;
        this.sessionToken = sessionToken;
        this.roleId = roleId;
        this.userRole = userRole;
    }
}