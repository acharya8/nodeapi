export class RoleResponse {
    roleId: number;
    roleName: string;

    constructor(roleId, roleName) {
        this.roleId = roleId;
        this.roleName = roleName;
    }
}