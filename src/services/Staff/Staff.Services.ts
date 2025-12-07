import React from 'react'
import { StaffModel } from '../../types/Staff/StaffType';
import HttpService from '../common/HttpService';
import { CustomResponse } from '../../types/common/ApiTypes';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
import { User } from '../../types/Users/User.types';



const StaffService = {
  async getAllStaff(): Promise<StaffModel[]> {
    const response = await HttpService.callApi<CustomResponse<StaffModel[]>>(API_ENDPOINTS.STAFF.GET_ALL, 'GET');
    return response.value;
  },
  async getStaffById(id: string): Promise<StaffModel> {
    const response= await HttpService.callApi<CustomResponse<StaffModel>>(API_ENDPOINTS.STAFF.GET_BY_ID(id), 'GET');
    return response.value;
  },
  async editStaffById(id: string, data: StaffModel) {
     return await HttpService.callApi<StaffModel>(API_ENDPOINTS.STAFF.EDIT(id), 'PUT', data);
   },
   async deleteStaffById(id: string, data: StaffModel) {
    
    return await HttpService.callApi<StaffModel>(API_ENDPOINTS.STAFF.EDIT(id), 'PUT', data);
  },
  uploadprofilepic: async (formData: FormData): Promise<{ data: User }> => {
    return await HttpService.callApi<{ data: User }>(
      API_ENDPOINTS.APP_USER.PROFILEPIC_POST,
      'POST',
      formData,
      false,
      true
    );
  },
  
};

export default StaffService
