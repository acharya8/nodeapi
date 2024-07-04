"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = void 0;
class Roles {
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
exports.Roles = Roles;
