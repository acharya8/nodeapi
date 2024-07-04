export class CommissionTypesReponse {
    id: number;
    name: string;
    child: Array<CommissionTypesReponse>;

    constructor(id, name, child) {
        this.id = id;
        this.name = name;
        this.child = child;
    }
}