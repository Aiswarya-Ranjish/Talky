import React from 'react';
import {  Purchascoupon } from '../types/settings/PurchaseCouponType';
import HttpService from './common/HttpService';
import { API_ENDPOINTS } from '../constants/API_ENDPOINTS';
import { CustomResponse } from '../types/common/ApiTypes';



const PurchaseCouponService = {
  async getAllCoupons(): Promise<Purchascoupon[]> {
   const response = await HttpService.callApi<CustomResponse<Purchascoupon[]>>(API_ENDPOINTS.PURCHASE_COUPON.GET_ALL, 'GET');
       return response.value;
  },
  async addCoupon(formData: Purchascoupon): Promise<Purchascoupon> {
    return await HttpService.callApi<Purchascoupon>(API_ENDPOINTS.PURCHASE_COUPON.CREATE, 'POST', formData);
  },
  async getCouponsById(id: string): Promise<Purchascoupon> {
  const response= await HttpService.callApi<CustomResponse<Purchascoupon>>(API_ENDPOINTS.PURCHASE_COUPON.GET_BY_ID(id), 'GET');
  return response.value; 
},
  async editCouponById(id: string, data: Purchascoupon) {
    return await HttpService.callApi<Purchascoupon>(API_ENDPOINTS.PURCHASE_COUPON.UPDATE(id), 'PUT', data);
  },
  async deleteCouponById(id: string, data: Purchascoupon) {
    return await HttpService.callApi<Purchascoupon>(API_ENDPOINTS.PURCHASE_COUPON.DELETE(id), 'DELETE', data);
  },
};

export default PurchaseCouponService;
