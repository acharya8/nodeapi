"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultSuccess = void 0;
class ResultSuccess {
    constructor(status, isDisplayMessage, message, recordList, totalRecords) {
        this.status = status;
        this.isDisplayMessage = isDisplayMessage;
        this.message = message;
        this.recordList = recordList;
        this.totalRecords = totalRecords;
    }
}
exports.ResultSuccess = ResultSuccess;
