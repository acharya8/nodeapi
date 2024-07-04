export class HomeServicesResponse {
    id: number;
    name: string;
    displayName: string;
    description: string;
    iconUrl: string;
    colorCode: string;
    isServiceType: boolean;

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