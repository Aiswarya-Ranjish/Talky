import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { CustomResponse } from "../../types/common/ApiTypes";
import { AppNotification } from "../../types/settings/AppNotification";
import HttpService from "../common/HttpService";

class AppNotificationService {

  static async getAllNotification(): Promise<CustomResponse<AppNotification[]>> {
    return HttpService.callApi<CustomResponse<AppNotification[]>>(
      API_ENDPOINTS.AppNotification.GET_ALL,
      "GET"
    );
  }

  static async getNotificationById(id: string): Promise<CustomResponse<AppNotification>> {
    return HttpService.callApi<CustomResponse<AppNotification>>(
      API_ENDPOINTS.AppNotification.GET_BY_ID(id),
      "GET"
    );
  }

  static async createNotification(data: AppNotification): Promise<CustomResponse<AppNotification>> {
    return HttpService.callApi<CustomResponse<AppNotification>>(
      API_ENDPOINTS.AppNotification.CREATE,
      "POST",
      data
    );
  }

  static async updateNotification(id: string, data: AppNotification): Promise<CustomResponse<AppNotification>> {
    return HttpService.callApi<CustomResponse<AppNotification>>(
      API_ENDPOINTS.AppNotification.UPDATE(id),
      "PUT",
      data
    );
  }

  static async deleteNotificationById(id: string): Promise<CustomResponse<null>> {
    return HttpService.callApi<CustomResponse<null>>(
      API_ENDPOINTS.AppNotification.DELETE(id),
      "DELETE"
    );
  }
  static async sendTargetedNotification(data: {
    notificationType: string;
    notificationTitle: string;
    notificationBody: string;
    notificationLink: string;
    notificationImage?: string;
    targetCriteria: string;
    balanceThreshold?: number;
    daysWithoutActivity?: number;
    customUserIds?: number[];
    additionalData?: Record<string, string>;
  }): Promise<CustomResponse<any>> {
    return HttpService.callApi<CustomResponse<any>>(
      API_ENDPOINTS.AppNotification.SEND_TARGETED,
      "POST",
      data
    );
  }


  // ✅ NEW: Upload notification image
  static async uploadNotificationImage(
    notificationId: number,
    file: File
  ): Promise<CustomResponse<string>> {
    const formData = new FormData();
    formData.append("NotificationId", notificationId.toString());
    formData.append("NotificationImage", file);

    console.log("📤 Uploading notification image:", {
      notificationId,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    });

    return HttpService.callApi<CustomResponse<string>>(
      API_ENDPOINTS.AppNotification.UPLOAD_IMAGE,
      "POST",
      formData,
      false,
      true
    );
  }
}

export default AppNotificationService;