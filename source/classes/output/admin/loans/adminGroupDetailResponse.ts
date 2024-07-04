export class AdminGroupDetailResponse {
    id: number
    fullName: string
    contactNo: number
    permanentCode: string
    roleName: string
    gender: boolean
    parentPartnerId: number
    parentParentPartnerId:number
    parentPartnerName : string
    parentParentPartnerName : string


    constructor(id, permanentCode?, fullName?, contactNo?, roleName?, gender?, parentPartnerId?,parentParentPartnerId?,parentParentPartnerName?,parentPartnerName?) {
        this.id = id;
        this.fullName = fullName;
        this.contactNo = contactNo;
        this.permanentCode = permanentCode;
        this.roleName = roleName;
        this.gender = gender;
        this.parentPartnerId = parentPartnerId
        this.parentParentPartnerId = parentParentPartnerId
        this.parentParentPartnerName = parentParentPartnerName
        this.parentPartnerName = parentPartnerName
    }

}