// src/services/Staff/WalletWithdrawal.services.ts

import HttpService from '../common/HttpService';
import { CustomResponse } from '../../types/common/ApiTypes';
import { WalletWithdrawal } from '../../types/Staff/WalletWithdrawal.type';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';

class WalletWithdrawalService {
  static async getAllWithdrawals(): Promise<CustomResponse<WalletWithdrawal[]>> {
    try {
      console.log("Fetching all withdrawals from:", API_ENDPOINTS.WALLET_WITHDRAWAL.GET_ALL);
      const response = await HttpService.callApi<CustomResponse<WalletWithdrawal[]>>(
        API_ENDPOINTS.WALLET_WITHDRAWAL.GET_ALL,
        'GET'
      );
      console.log("Get all withdrawals response:", response);
      return response;
    } catch (error) {
      console.error("Error in getAllWithdrawals:", error);
      throw error;
    }
  }

  static async getWithdrawalById(id: string): Promise<CustomResponse<WalletWithdrawal>> {
    try {
      // WORKAROUND: The API endpoint filters by appUserId, not walletWithdrawalRequestId
      // So we fetch all withdrawals and filter on the frontend
      console.log("Fetching all withdrawals to find ID:", id);
      const allResponse = await this.getAllWithdrawals();
      
      if (!allResponse || !allResponse.isSucess) {
        throw new Error(allResponse?.customMessage || allResponse?.error || "Failed to fetch withdrawals");
      }
      
      // Find the withdrawal request by walletWithdrawalRequestId
      const withdrawal = allResponse.value?.find(
        w => w.walletWithdrawalRequestId.toString() === id
      );
      
      if (withdrawal) {
        console.log("Found withdrawal:", withdrawal);
        return {
          statusCode: 200,
          error: null,
          customMessage: null,
          isSucess: true,
          value: withdrawal
        } as CustomResponse<WalletWithdrawal>;
      }
      
      // If not found, return error
      console.log("Withdrawal not found with ID:", id);
      return {
        statusCode: 404,
        error: "Withdrawal request not found",
        customMessage: `No withdrawal request found with ID ${id}`,
        isSucess: false,
        value: null as any
      } as CustomResponse<WalletWithdrawal>;
    } catch (error) {
      console.error("Error in getWithdrawalById:", error);
      throw error;
    }
  }

  static async updateWithdrawalStatus(id: string, data: WalletWithdrawal): Promise<CustomResponse<WalletWithdrawal>> {
    try {
      // First, get the withdrawal to find its appUserId (if API needs it)
      const withdrawal = await this.getWithdrawalById(id);
      
      if (!withdrawal || !withdrawal.isSucess || !withdrawal.value) {
        throw new Error("Withdrawal request not found");
      }

      const url = API_ENDPOINTS.WALLET_WITHDRAWAL.UPDATE(id);
      console.log("Updating withdrawal status at:", url, "with data:", data);
      const response = await HttpService.callApi<CustomResponse<WalletWithdrawal>>(
        url,
        'PUT',
        data
      );
      console.log("Update withdrawal status response:", response);
      return response;
    } catch (error) {
      console.error("Error in updateWithdrawalStatus:", error);
      throw error;
    }
  }

  static async deleteWithdrawal(id: string): Promise<CustomResponse<null>> {
    try {
      // First, verify the withdrawal exists
      const withdrawal = await this.getWithdrawalById(id);
      
      if (!withdrawal || !withdrawal.isSucess || !withdrawal.value) {
        throw new Error("Withdrawal request not found");
      }

      const url = API_ENDPOINTS.WALLET_WITHDRAWAL.DELETE(id);
      console.log("Deleting withdrawal at:", url);
      const response = await HttpService.callApi<CustomResponse<null>>(
        url,
        'DELETE'
      );
      console.log("Delete withdrawal response:", response);
      return response;
    } catch (error) {
      console.error("Error in deleteWithdrawal:", error);
      throw error;
    }
  }
}

export default WalletWithdrawalService;