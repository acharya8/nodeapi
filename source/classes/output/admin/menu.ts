export class Menu {
    id: number
    path?: string;
    title?: string;
    icon?: string;
    type?: string;
    isActive?: boolean;
    isDelete?: boolean;
    active: boolean;
    name?: string;
    parentId?: number;
    children?: Menu[];
    readPermission: boolean = false;
    writePermission: boolean = false;
    editPermission: boolean = false;
    deletePermission: boolean = false;

    constructor() {
    }
}