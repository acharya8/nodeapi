"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponse = void 0;
class UserResponse {
    constructor(userId, fullName, gender, email, countryCode, contactNo, password, profilePicUrl, isBlocked, isPasswordSet, isEmailVerified, isDisabled, isActive, isDelete, createdDate, modifiedDate, createdBy, modifiedBy, sessionToken, roleId, userRole) {
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
exports.UserResponse = UserResponse;
