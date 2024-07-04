export class Roles {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    isDelete: boolean;
    createdDate: Date;
    modifiedDate: Date;

    constructor(id, name, description, isActive, isDelete, createdDate, modifiedDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.isDelete = isDelete;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
    }
}
