import { StaffModel } from '../../types/Staff/StaffType';
import HttpService from '../common/HttpService';
import { CustomResponse } from '../../types/common/ApiTypes';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
import { User } from '../../types/Users/AppUser.types';

class StaffService {
  static async getAllStaff(): Promise<CustomResponse<StaffModel[]>> {
    return HttpService.callApi<CustomResponse<StaffModel[]>>(
      API_ENDPOINTS.STAFF.GET_ALL,
      'GET'
    );
  }

  static async getStaffById(id: string): Promise<CustomResponse<StaffModel>> {
    return HttpService.callApi<CustomResponse<StaffModel>>(
      API_ENDPOINTS.STAFF.GET_BY_ID(id),
      'GET'
    );
  }

  static async editStaffById(id: string, data: StaffModel): Promise<CustomResponse<StaffModel>> {
    return HttpService.callApi<CustomResponse<StaffModel>>(
      API_ENDPOINTS.STAFF.EDIT(id),
      'PUT',
      data
    );
  }

  static async deleteStaffById(id: string): Promise<CustomResponse<null>> {
    return HttpService.callApi<CustomResponse<null>>(
      API_ENDPOINTS.STAFF.DELETE(id),
      'DELETE'
    );
  }

  static async uploadprofilepic(formData: FormData): Promise<{ data: User }> {
    return HttpService.callApi<{ data: User }>(
      API_ENDPOINTS.APP_USER.PROFILEPIC_POST,
      'POST',
      formData,
      false,
      true
    );
  }
}

export default StaffService;