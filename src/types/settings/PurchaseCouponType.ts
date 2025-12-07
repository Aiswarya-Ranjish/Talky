import { AuditTrails } from "../common/AuditLog.types";

  export interface Purchascoupon{
   purchaseCouponId?:number;
    coins:number;
    amount:number;
    pastAmount:number;
    isActive:boolean;
    description: string;
    createdAt:string|Date;
    createdAppUserId?:number;
    [key: string]: any;
     auditLogs?: AuditTrails[];
  }