import React from "react";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import WalletWithdrawalService from "../../../services/Staff/WalletWithdrawal.services";
import { WalletWithdrawal } from "../../../types/Staff/WalletWithdrawal.type";

const columns = [
  { key: "walletWithdrawalRequestId", label: "Request ID", type: "text" as const },
  { key: "appUserId", label: "User ID", type: "text" as const },
  { key: "appUserName", label: "User Name", type: "text" as const },
  { key: "coins", label: "Coins", type: "text" as const },
  { key: "amount", label: "Amount", type: "text" as const },
  { key: "status", label: "Status", type: "status" as const },
  { key: "createdAt", label: "Date", type: "date" as const },
];

const getStatusLabel = (status: number): string => {
  switch (status) {
    case 0:
      return "Pending";
    case 1:
      return "Approved";
    case 2:
      return "Rejected";
    case 3:
      return "Completed";
    default:
      return "Unknown";
  }
};

const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return 'Invalid Date';
  }
};

const WalletWithdrawalList: React.FC = () => {
  const fetchWithdrawalData = async ({
    pageNumber,
    pageSize,
    searchTerm,
    reverseOrder = false,
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    reverseOrder?: boolean;
  }) => {
    try {
      // Fetch data - returns CustomResponse<WalletWithdrawal[]>
      const response = await WalletWithdrawalService.getAllWithdrawals();

      // Check if response is successful
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch withdrawals");
      }

      // Extract the actual data array from response.value
      const allData = response.value || [];

      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      // FILTER OUT DELETED WITHDRAWALS
      let filtered = allData.filter((withdrawal: WalletWithdrawal) => !withdrawal.isDeleted);

      // Transform data with formatted values
      let transformedData = filtered.map((withdrawal: WalletWithdrawal) => ({
        ...withdrawal,
        status: getStatusLabel(withdrawal.status),
        statusValue: withdrawal.status, // Keep original value for filtering
        createdAt: formatDate(withdrawal.createdAt as string)
      }));

      // SEARCH
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        transformedData = transformedData.filter(
          (withdrawal) =>
            withdrawal.appUserName?.toLowerCase().includes(lowerSearch) ||
            withdrawal.appUserId?.toString().includes(searchTerm) ||
            withdrawal.walletWithdrawalRequestId?.toString().includes(searchTerm) ||
            withdrawal.status?.toLowerCase().includes(lowerSearch)
        );
      }

      // REVERSE if reverseOrder is true (BEFORE pagination)
      if (reverseOrder) {
        transformedData = transformedData.reverse();
      }

      const total = transformedData.length;

      // Pagination
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = transformedData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: total,
      };
    } catch (error: any) {
      console.error("Error fetching wallet withdrawals:", error);
      throw new Error("Failed to load wallet withdrawal data");
    }
  };

  return (
    <KiduServerTable
      title="Wallet Withdrawal Requests"
      subtitle="List of all wallet withdrawal requests from staff members"
      columns={columns}
      idKey="walletWithdrawalRequestId"
      addButtonLabel="Add Withdrawal"
      viewRoute="/dashboard/wallet-withdrawal/view"
      fetchData={fetchWithdrawalData}
      rowsPerPage={10}
      showSearch={true}
      showActions={true}
      showAddButton={false}
      showExport={true}
      reverseOrder={true}
    />
  );
};

export default WalletWithdrawalList;