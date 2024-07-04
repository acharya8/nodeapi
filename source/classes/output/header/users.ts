import { Roles } from '../roles';

export class Users {
    id: number;
    fullName: string;
    gender: string;
    email: string;
    contactNo: string;
    password: string;
    profilePicUrl: string;
    isBlocked: boolean;
    isPasswordSet: boolean;
    isEmailVerified: boolean;
    isDisabled: boolean;
    isActive: boolean;
    sessionToken: string;
    roleId: number;
    roles: Roles;

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
