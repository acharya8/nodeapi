export class LoanCompareResponse {       
 

    bankName: string;//ServiceName
    emi: number;
    interestRate: number;
    interestAmount: number;
    netPayableAmount: number; 

    constructor( bankName, emi, interestRate, interestAmount, netPayableAmount) {
      
  
        this.bankName = bankName;
        this.emi = emi;
        this.interestRate = interestRate;
        this.interestAmount = interestAmount;
        this.netPayableAmount = netPayableAmount;
    }
}