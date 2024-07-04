export class AdminLoanCompleteHistoryResponse {
    isCompleted: boolean;
    completeScreen: number;

    constructor(isCompleted, completeScreen) {
        this.isCompleted = isCompleted;
        this.completeScreen = completeScreen;
    }
}