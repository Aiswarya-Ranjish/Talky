import { AuditTrails } from "../common/AuditLog.types";


export interface AppNotification{
    error: any;
    customMessage: any;
    isSucess: boolean;
    appNotificationId:number;
    notificationType:string;
    notificationTitle:string;
    notificationImage:string;
    isActive:boolean;
    notificationLink:string;
    createdAt:string;
    category: string;
    auditLogs?: AuditTrails[];
}