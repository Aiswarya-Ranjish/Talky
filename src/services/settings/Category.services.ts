import { Category } from "../../types/settings/Category.type";
import HttpService from "../common/HttpService";
import { CustomResponse } from "../../types/common/ApiTypes";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { CompanyLookup } from "../../types/settings/Company.types";

const CategoryService = {
  async getAllCategory(): Promise<Category[]> {
    // Add cache busting parameter to prevent stale data
    const timestamp = new Date().getTime();
    const url = `${API_ENDPOINTS.Category.GET_ALL}?_t=${timestamp}`;
    
    console.log("🌐 Calling API:", url); // Debug
    
    const response = await HttpService.callApi<CustomResponse<Category[]>>(
      url,
      "GET"
    );
    
    console.log("🔍 Service received response:", response); // Debug
    console.log("🔍 Response.value:", response.value); // Debug
    console.log("🔍 Response.value type:", typeof response.value); // Debug
    console.log("🔍 Response.value isArray:", Array.isArray(response.value)); // Debug
    console.log("🔍 Response.value length:", response.value?.length); // Debug
    
    return response.value;
  },
  
  async getCategoryById(id: string): Promise<Category> {
    const response = await HttpService.callApi<CustomResponse<Category>>(
      API_ENDPOINTS.Category.GET_BY_ID(id),
      "GET"
    );
    return response.value;
  },
  
  async addCompany(formData: Category): Promise<Category> {
    return await HttpService.callApi<Category>(
      API_ENDPOINTS.Category.CREATE,
      "POST",
      formData
    );
  },

  async getCompanyIdsFromCategories(): Promise<CompanyLookup[]> {
    const response = await HttpService.callApi<{ value: CompanyLookup[] }>(
      API_ENDPOINTS.Category.GET_CompanyId,
      "GET"
    );

    return response?.value || [];
  },
  
  async updateCategory(id: string, data: Category) {
    console.log("📝 Updating category:", id, data); // Debug
    const response = await HttpService.callApi<Category>(
      API_ENDPOINTS.Category.UPDATE(id), 
      'PUT', 
      data
    );
    console.log("✅ Update response:", response); // Debug
    return response;
  },
  
  async deleteCategoryById(id: string) {
    return await HttpService.callApi(API_ENDPOINTS.Category.DELETE(id), 'DELETE');
  }
};

export default CategoryService;