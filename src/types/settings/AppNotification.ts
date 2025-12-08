import { AuditTrails } from "../common/AuditLog.types";


export interface AppNotification{
    appNotificationId:number;
    notificationType:string;
    notificationTitle:string;
    notificationImage:string;
    isActive:boolean;
    notificationLink:string;
    createdAt:string;
    auditLogs?: AuditTrails[];
}