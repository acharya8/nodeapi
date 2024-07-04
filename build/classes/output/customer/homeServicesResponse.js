"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeServicesResponse = void 0;
class HomeServicesResponse {
    constructor(id, name, displayName, description, iconUrl, colorCode, isServiceType) {
        this.id = id;
        this.name = name;
        this.displayName = displayName;
        this.description = description;
        this.iconUrl = iconUrl;
        this.colorCode = colorCode;
        this.isServiceType = isServiceType;
    }
}
exports.HomeServicesResponse = HomeServicesResponse;
