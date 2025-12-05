
export interface purchaseorder {
    purchaseOrderId: number;
    purchaseCouponId: number;
    appUserId: number;
    amount: number; 
    description: string; 
    isSucsess: boolean;
    isdeleted:boolean;
    createdAt:Date|string;
    createdAppUserId:number;
    requestText:string;
    responseText:string;
  }