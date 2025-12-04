//import HttpService from "./HttpService";
//import { AppNotification } from "types/AppNotification";
//import { API_ENDPOINTS } from "constants/API_ENDPOINTS";
//import { CustomResponse } from "types/ApiTypes";

import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { AppNotification, CustomResponse } from "../../types/settings/AppNotification";
import HttpService from "../common/HttpService";

const AppNotificationService = {
  async getAllNotification(): Promise<AppNotification[]> {
    const response = await HttpService.callApi<
      CustomResponse<AppNotification[]>
    >(API_ENDPOINTS.AppNotification.GET_ALL, "GET");
    return response.value;
  },
  async addNotification(formData: AppNotification): Promise<AppNotification> {
    return await HttpService.callApi<AppNotification>(
      API_ENDPOINTS.AppNotification.CREATE,
      "POST",
      formData
    );
  },
  async getNotificationById(id: string): Promise<AppNotification> {
    const response = await HttpService.callApi<CustomResponse<AppNotification>>(
      API_ENDPOINTS.AppNotification.GET_BY_ID(id),
      "GET"
    );
    return response.value;
  },
  async updateNotification(id: string, data:AppNotification) {
          return await HttpService.callApi<AppNotification>(API_ENDPOINTS.AppNotification.UPDATE(id), 'PUT', data);
        },

         async deleteNotificationById(id: string, data: AppNotification) {
                  return await HttpService.callApi<AppNotification>(API_ENDPOINTS.AppNotification.DELETE(id), 'DELETE', data);
                },
};

export default AppNotificationService;
