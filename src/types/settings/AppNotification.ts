export interface CustomResponse<T> {
    statusCode: number;
    error: string | null;
    customMessage: string;
    isSucess: boolean;
    value: T;
  }
export interface AppNotification{
    appNotificationId:number;
    notificationType:string;
    notificationTitle:string;
    notificationImage:string;
    isActive:boolean;
    notificationLink:string;
    createdAt:string;
    category: string;
}