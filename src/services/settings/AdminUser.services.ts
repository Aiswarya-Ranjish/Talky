// src/services/settings/AdminUser.services.ts

import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { CustomResponse } from "../../types/common/ApiTypes";
import { User } from "../../types/settings/AdminUser.types";
import HttpService from "../common/HttpService";

class AdminUserService {
  static async getAll(): Promise<CustomResponse<User[]>> {
    return HttpService.callApi(API_ENDPOINTS.ADMIN_USER.GET_ALL, "GET");
  }

  static async getById(id: number): Promise<CustomResponse<User>> {
    return HttpService.callApi(API_ENDPOINTS.ADMIN_USER.GET_BY_ID(id), "GET");
  }

  static async create(data: Partial<User>): Promise<CustomResponse<User>> {
    // Based on Swagger, send data directly at root level
    return HttpService.callApi(API_ENDPOINTS.ADMIN_USER.CREATE, "POST", data);
  }

  static async update(id: number, data: Partial<User>): Promise<CustomResponse<User>> {
    // Based on Swagger example, API expects data directly (not wrapped)
    // The userId in data must match the id in URL
    return HttpService.callApi(API_ENDPOINTS.ADMIN_USER.UPDATE(id), "PUT", data);
  }

  static async delete(id: number): Promise<CustomResponse<null>> {
    return HttpService.callApi(API_ENDPOINTS.ADMIN_USER.DELETE(id), "DELETE");
  }

  static async changePassword(data: {
    userId: number;
    oldPassword: string;
    newPassword: string;
  }): Promise<CustomResponse<string>> {
    return HttpService.callApi(API_ENDPOINTS.ADMIN_USER.CHANGE_PASSWORD, "POST", data);
  }

  static async uploadProfilePic(userId: number, file: File): Promise<CustomResponse<string>> {
    const formData = new FormData();
    formData.append("UserId", userId.toString());
    formData.append("ProfilePic", file);

    return HttpService.callApi(
      API_ENDPOINTS.ADMIN_USER.UPLOAD_PROFILE_PIC,
      "POST",
      formData,
      false,
      true
    );
  }
}

export default AdminUserService;