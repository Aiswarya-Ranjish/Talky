export interface FinancialYear{
    isSucess: boolean;
    error: any;
    customMessage: any;
    financialYearId?:number;
    finacialYearCode:string;
    startDate?: string;
    endDate?: string;
    isCurrent:boolean;
    isClosed:boolean;
  }