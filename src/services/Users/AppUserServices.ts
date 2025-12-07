// src/services/UserService.ts
//import HttpService from './HttpService';
import HttpService from '../common/HttpService';
import { User } from '../../types/Users/User.types';
//import { API_ENDPOINTS } from 'constants/API_ENDPOINTS';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
import { Import } from 'lucide-react';
import { CustomResponse } from '../../types/common/ApiTypes';
//import{CustomResponse} from 'types/ApiTypes';



const AppUserService = {
  async getAllUsers(): Promise<User[]> {
    const response = await HttpService.callApi<CustomResponse<User[]>>(API_ENDPOINTS.APP_USER.GET_ALL, 'GET');
       return response.value;
  },
  async getUserById(id: string): Promise<User> {
    const response= await HttpService.callApi<CustomResponse<User>>(API_ENDPOINTS.APP_USER.GET_BY_ID(id), 'GET');
    return response.value;
  },
  async editApp( data: User ): Promise<User> {
    return await HttpService.callApi<User>(API_ENDPOINTS.APP_USER.EDIT, 'PUT', data);
  },
 uploadprofilepic: async(formData: FormData): Promise<User>=> {
  
 return await HttpService.callApi<User>(API_ENDPOINTS.APP_USER.PROFILEPIC_POST, 'POST',formData,false,true);
},
////  async enrollStaff(appUserId: number, data: Partial<User>): Promise<User> {
    //const payload = { appUserId, ...data }; 
    //const response = await HttpService.callApi<CustomResponse<User>>(
      //API_ENDPOINTS.APP_USER.ENROLLSTAFF,'PATCH',payload );
    //return response.value;
 // },
  
 // async updateGender(id: string, data: Partial<User>): Promise<User> {
 //   const response = await HttpService.callApi<CustomResponse<User>>(API_ENDPOINTS.APP_USER.EDITGENDER(id),'PATCH', { id, ...data });
  //  return response.value;
 // },

};

export default AppUserService;
