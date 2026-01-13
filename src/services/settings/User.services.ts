// src/services/UserService.ts
import HttpService from '../../services/common/HttpService';
import { User } from '../../types/Users/StaffUser.types';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
import { CustomResponse } from '../../types/common/ApiTypes';

const AppUserService = {
  async getAllUsers(): Promise<User[]> {
    const response = await HttpService.callApi<CustomResponse<User[]>>(
      API_ENDPOINTS.APP_USER.GET_ALL, 
      'GET'
    );
    return response.value;
  },

  async getUserById(id: string): Promise<User> {
    const response = await HttpService.callApi<CustomResponse<User>>(
      API_ENDPOINTS.APP_USER.GET_BY_ID(id), 
      'GET'
    );
    return response.value;
  },

  async editApp(data: User): Promise<User> {
    return await HttpService.callApi<User>(
      API_ENDPOINTS.APP_USER.EDIT, 
      'PUT', 
      data
    );
  },

  async uploadprofilepic(formData: FormData): Promise<User> {
    return await HttpService.callApi<User>(
      API_ENDPOINTS.APP_USER.PROFILEPIC_POST, 
      'POST', 
      formData, 
      false, 
      true
    );
  },
};

export default AppUserService;