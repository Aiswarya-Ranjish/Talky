import React from 'react'
import HttpService from '../common/HttpService';
import { CustomResponse } from '../../types/common/ApiTypes';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
import { purchaseorder } from '../../types/Users/UserRecharge.types';


const PurchaseOrderService =  {
     async getAllPurchaseOrder(): Promise<purchaseorder[]> {
       const response = await HttpService.callApi<CustomResponse<purchaseorder[]>>(API_ENDPOINTS.PURCHASE_ORDER.GET_ALL, 'GET');
           return response.value;
      },
  async getPurchaseOrderById(id: string): Promise<purchaseorder> {
      const response = await HttpService.callApi<CustomResponse<purchaseorder>>(
        API_ENDPOINTS.PURCHASE_ORDER.GET_BY_ID(id),
        "GET"
      );
      return response.value;
    },
      async deleteOrderById(id: string, data: purchaseorder) {
              return await HttpService.callApi<purchaseorder>(API_ENDPOINTS.PURCHASE_ORDER.DELETE(id), 'DELETE', data);
            },
}

export default PurchaseOrderService
