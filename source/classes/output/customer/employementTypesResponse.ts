export class employmentTypesReponse {
    id: number;
    name: string;
    child: Array<employmentTypesReponse>;

    constructor(id, name, child) {
        this.id = id;
        this.name = name;
        this.child = child;
    }
}