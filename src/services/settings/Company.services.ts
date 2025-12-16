import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import type { CustomResponse } from "../../types/common/ApiTypes";
import type { Company } from "../../types/settings/Company.types";
import HttpService from "../common/HttpService";

const CompanyService = {
  async getAllCompany(): Promise<CustomResponse<Company[]>> {
    return await HttpService.callApi<CustomResponse<Company[]>>(
      API_ENDPOINTS.COMPANY.GET_ALL, 
      'GET'
    );
  },  
  
  async getCompanyById(id: string): Promise<CustomResponse<Company>> {
    return await HttpService.callApi<CustomResponse<Company>>(
      API_ENDPOINTS.COMPANY.GET_BY_ID(id), 
      'GET'
    );
  },
  
  async updateCompany(id: string, data: Company): Promise<CustomResponse<Company>> {
    return await HttpService.callApi<CustomResponse<Company>>(
      API_ENDPOINTS.COMPANY.UPDATE(id), 
      'PUT', 
      data
    );
  },

  async addCompany(formData: Company): Promise<CustomResponse<Company>> {
    return await HttpService.callApi<CustomResponse<Company>>(
      API_ENDPOINTS.COMPANY.CREATE, 
      'POST', 
      formData
    );
  },
      
  async deleteCompanyById(id: string): Promise<CustomResponse<null>> {
    return await HttpService.callApi<CustomResponse<null>>(
      API_ENDPOINTS.COMPANY.DELETE(id), 
      'DELETE'
    );
  },

  /**
   * Upload company logo using HttpService with FormData
   * Following the same pattern as Driver.services.ts
   */
  async uploadCompanyLogo(
    companyId: number,
    file: File
  ): Promise<CustomResponse<string>> {
    const formData = new FormData();
    
    // ✅ Backend expects "CompanyId" and "CompanyLogo" (case-sensitive!)
    formData.append("CompanyId", companyId.toString());
    formData.append("CompanyLogo", file);
    
    console.log("📤 Uploading company logo:", {
      companyId,
      fileName: file.name,
      fileSize: `${(file.size / 1024).toFixed(2)} KB`,
      fileType: file.type
    });

    return HttpService.callApi<CustomResponse<string>>(
      API_ENDPOINTS.COMPANY.COMPANYLOGO_POST,
      "POST",
      formData,
      false,  // isPublic: false (requires auth)
      true    // isFormData: true (this is FormData)
    );
  },
}

export default CompanyService;