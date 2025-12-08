// Debug version of AppNotificationService
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { CustomResponse } from "../../types/common/ApiTypes";
import { AppNotification } from "../../types/settings/AppNotification";
import HttpService from "../common/HttpService";

class AppNotificationService {
  static async getAllNotification(): Promise<CustomResponse<AppNotification[]>> {
    try {
      console.log("Calling API endpoint:", API_ENDPOINTS.AppNotification.GET_ALL);
      const response = await HttpService.callApi<CustomResponse<AppNotification[]>>(
        API_ENDPOINTS.AppNotification.GET_ALL,
        "GET"
      );
      console.log("Service response:", response);
      return response;
    } catch (error) {
      console.error("Service error:", error);
      throw error;
    }
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
}

export default AppNotificationService;