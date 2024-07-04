export class ResultSuccess {
    status: number;
    isDisplayMessage: boolean;
    message: string;
    recordList: any[];
    totalRecords: number;

    constructor(status, isDisplayMessage, message, recordList, totalRecords) {
        this.status = status;
        this.isDisplayMessage = isDisplayMessage;
        this.message = message;
        this.recordList = recordList;
        this.totalRecords = totalRecords;
    }
}
