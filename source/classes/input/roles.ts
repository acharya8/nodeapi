export class Roles {
    name: string;
    description: string;
    isActive: boolean;
    isDelete: boolean;
    createdDate: Date;
    modifiedDate: Date;

    constructor(name, description, isActive, isDelete, createdDate?, modifiedDate?) {
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.isDelete = isDelete;
        if (createdDate) this.createdDate = createdDate;
        if (modifiedDate) this.modifiedDate = modifiedDate;
    }
}
