
import type { AuditTrails } from "../common/AuditLog.types";

export interface Category{
    error: any;
    isSucess: boolean;
    customMessage: any;
    categoryId:number;
    categoryName:string;
    categoryDescription:string;
    categoryTitle:string;
    categoryCode:string;
    companyName:string;
    companyId:number;
    isDeleted:boolean;
    auditLogs?: AuditTrails[];
  }