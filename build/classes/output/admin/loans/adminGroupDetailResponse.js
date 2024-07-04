"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminGroupDetailResponse = void 0;
class AdminGroupDetailResponse {
    constructor(id, permanentCode, fullName, contactNo, roleName, gender, parentPartnerId, parentParentPartnerId, parentParentPartnerName, parentPartnerName) {
        this.id = id;
        this.fullName = fullName;
        this.contactNo = contactNo;
        this.permanentCode = permanentCode;
        this.roleName = roleName;
        this.gender = gender;
        this.parentPartnerId = parentPartnerId;
        this.parentParentPartnerId = parentParentPartnerId;
        this.parentParentPartnerName = parentParentPartnerName;
        this.parentPartnerName = parentPartnerName;
    }
}
exports.AdminGroupDetailResponse = AdminGroupDetailResponse;
