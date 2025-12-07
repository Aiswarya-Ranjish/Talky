import { AuditTrails } from "../common/AuditLog.types";

 
  export interface Wallettransaction  {
    id?: string;
    transactionType:string;
    coins:number;
    amount:number;
    description:string;
    paymentGateWaySerialNumber:string;
    isSuccess:boolean;
    createdAt:Date|string;
    auditLogs?: AuditTrails[];
  } 
  