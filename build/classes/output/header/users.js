"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Users = void 0;
class Users {
    constructor(id, fullName, gender, email, contactNo, password, profilePicUrl, isBlocked, isPasswordSet, isEmailVerified, isDisabled, isActive, sessionToken, roleId, roles) {
        this.id = id;
        this.fullName = fullName;
        this.gender = gender;
        this.email = email;
        this.contactNo = contactNo;
        this.password = password;
        this.profilePicUrl = profilePicUrl;
        this.isBlocked = isBlocked;
        this.isPasswordSet = isPasswordSet;
        this.isEmailVerified = isEmailVerified;
        this.isDisabled = isDisabled;
        this.isActive = isActive;
        this.sessionToken = sessionToken;
        this.roleId = roleId;
        this.roles = roles;
    }
}
exports.Users = Users;
