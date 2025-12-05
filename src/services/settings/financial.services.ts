import React from 'react';
import { FinancialYear } from '../../types/settings/Financial.type';
import { CustomResponse } from '../../types/common/ApiTypes';
import HttpService from '../common/HttpService';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
//import HttpService from './HttpService';

//import { API_ENDPOINTS } from 'constants/API_ENDPOINTS';
//import { CustomResponse } from 'types/ApiTypes';
//import { FinancialYear } from 'types/FinancialYear';

const FinancialYearService={
     async getAllFinacialYear(): Promise<FinancialYear[]> {
         const response = await HttpService.callApi<CustomResponse<FinancialYear[]>>(API_ENDPOINTS.FinacialYear.GET_ALL, 'GET');
             return response.value;
        },
         async addFinancialYear(formData: FinancialYear): Promise<FinancialYear> {
            return await HttpService.callApi<FinancialYear>(API_ENDPOINTS.FinacialYear.CREATE, 'POST', formData);
          }, 

           async getFinancialYearById(id: string): Promise<FinancialYear> {
                const response= await HttpService.callApi<CustomResponse<FinancialYear>>(API_ENDPOINTS.FinacialYear.GET_BY_ID(id), 'GET');
                return response.value; 
              },
      async editFinanceById(id: string, data: FinancialYear) {
     return await HttpService.callApi<FinancialYear>(API_ENDPOINTS.FinacialYear.UPDATE(id), 'PUT', data);
   },

   async deleteFinanceById(id: string, data: FinancialYear) {
             return await HttpService.callApi<FinancialYear>(API_ENDPOINTS.FinacialYear.DELETE(id), 'DELETE', data);
           },
}

export default FinancialYearService;
