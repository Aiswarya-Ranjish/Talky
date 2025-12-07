import { AuditTrails } from "../common/AuditLog.types";

export interface ExpenseType {
    expenseTypeId: number;
    expenseTypeName: string;
    expenseTypeCode?: string;
    creditDebitType?:string
    description: string;
    isActive: boolean;
    isDeleted: boolean;
    auditLogs?: AuditTrails[];
}
