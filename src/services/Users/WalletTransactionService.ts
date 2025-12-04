
import HttpService from '../common/HttpService';
import { CustomResponse } from '../../types/common/ApiTypes';
import { API_ENDPOINTS } from '../../constants/API_ENDPOINTS';
import { Wallettransaction } from '../../types/Users/WalletTransaction.types';

const WalletTransactionServices = {
    async getUserById(id: string): Promise<Wallettransaction[]> {
        const response= await HttpService.callApi<CustomResponse<Wallettransaction[]>>( API_ENDPOINTS.WALLET_TRANSACTION.GET_ALL(id), 'GET');
        return response.value;
      },
    }
export default WalletTransactionServices;
