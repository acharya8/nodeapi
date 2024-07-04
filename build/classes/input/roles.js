"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
class Roles {
    constructor(name, description, isActive, isDelete, createdDate, modifiedDate) {
        this.name = name;
        this.description = description;
        this.isActive = isActive;
        this.isDelete = isDelete;
        if (createdDate)
            this.createdDate = createdDate;
        if (modifiedDate)
            this.modifiedDate = modifiedDate;
    }
}
exports.Roles = Roles;
