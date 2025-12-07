import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { CustomResponse } from "../../types/common/ApiTypes";
import type { Company } from "../../types/settings/Company.types";
import HttpService from "../common/HttpService";

const CompanyService = {
  async getAllCompany(): Promise<Company[]> {
     const response = await HttpService.callApi<CustomResponse<Company[]>>(API_ENDPOINTS.COMPANY.GET_ALL, 'GET');
     return response.value;
  },  
  
  async getCompanyById(id: string): Promise<Company> {
    const response = await HttpService.callApi<CustomResponse<Company>>(API_ENDPOINTS.COMPANY.GET_BY_ID(id), 'GET');
    return response.value; 
  },
  
  async updateCompany(id: string, data: Company) {
    return await HttpService.callApi<Company>(API_ENDPOINTS.COMPANY.UPDATE(id), 'PUT', data);
  },

  // ✅ FIX: Returns Company directly, not CustomResponse<Company>
  async addCompany(formData: Company): Promise<Company> {
    return await HttpService.callApi<Company>(API_ENDPOINTS.COMPANY.CREATE, 'POST', formData);
  },
      
  async deleteCompanyById(id: string, data: Company) {
    return await HttpService.callApi<Company>(API_ENDPOINTS.COMPANY.DELETE(id), 'DELETE', data);
  },
}

export default CompanyService;