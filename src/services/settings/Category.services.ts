import React from "react";
import { Category } from "../../types/settings/Category.type";
import HttpService from "../common/HttpService";
import { CustomResponse } from "../../types/common/ApiTypes";
import { API_ENDPOINTS } from "../../constants/API_ENDPOINTS";
import { CompanyLookup } from "../../types/settings/CompanyLookup";
//import HttpService from "./HttpService";
//import { Category } from "types/Category";
//import { API_ENDPOINTS } from "constants/API_ENDPOINTS";
//import { CustomResponse } from "types/ApiTypes";
//import { CompanyLookup } from "types/CompanyLookup";

const CategoryService = {
  async getAllCategory(): Promise<Category[]> {
    const response = await HttpService.callApi<CustomResponse<Category[]>>(
      API_ENDPOINTS.Category.GET_ALL,
      "GET"
    );
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
 async updateCategory(id: string, data:Category) {
  return await HttpService.callApi<Category>(API_ENDPOINTS.Category.UPDATE(id), 'PUT', data);
},
 async deleteCategoryById(id: string, data: Category) {
    return await HttpService.callApi<Category>(API_ENDPOINTS.Category.DELETE(id), 'DELETE', data);
  },

};
export default CategoryService;
