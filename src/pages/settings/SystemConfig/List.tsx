import React from "react";
import type { systemconfig } from "../../../types/settings/SystemConfig";
import systemconfigService from "../../../services/settings/SystemConfig.services";
import KiduServerTable from "../../../components/Trip/KiduServerTable";

// Table Columns
const columns = [
  { key: "appMasterSettingId", label: "Setting ID" },
  { key: "intCurrentFinancialYear", label: "Financial Year" },
  { key: "isActive", label: "Active Status" },
  { key: "rewardCoins", label: "Reward Coins" },
  { key: "staff_To_User_Rate_Per_Second", label: "Staff to User coins" },
  { key: "one_paisa_to_coin_rate", label: "Coin Rate" },
];

const SystemConfigList: React.FC = () => {
  
  // ✅ Added reverseOrder parameter
  const fetchData = async (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    reverseOrder?: boolean;
  }) => {
    try {
      const response = await systemconfigService.getAppmasterSetting();

      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch system config data");
      }

      const allData = response.value || [];

      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      let filteredData = allData;

      // Apply Search
      if (params.searchTerm) {
        const s = params.searchTerm.toLowerCase();
        filteredData = allData.filter((item: systemconfig) => {
          // Convert all values to strings safely
          const companyId = String(item.currentCompanyId || "").toLowerCase();
          const financialYear = String(item.intCurrentFinancialYear || "").toLowerCase();
          const settingId = String(item.appMasterSettingId || "");
          const staffRate = String(item.staff_To_User_Rate_Per_Second || "");
          const coinRate = String(item.one_paisa_to_coin_rate || "");
          const rewardCoins = String(item.rewardCoins || "");
          
          return (
            companyId.includes(s) ||
            financialYear.includes(s) ||
            settingId.includes(params.searchTerm) ||
            staffRate.includes(params.searchTerm) ||
            coinRate.includes(params.searchTerm) ||
            rewardCoins.includes(params.searchTerm)
          );
        });
      }

      // ✅ Apply reverse order if requested (show latest configs first)
      if (params.reverseOrder) {
        filteredData = [...filteredData].reverse();
      }

      // Pagination
      const start = (params.pageNumber - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return {
        data: paginatedData,
        total: filteredData.length,
      };
    } catch (error: any) {
      console.error("Error fetching system config:", error);
      throw new Error(`Failed to fetch system configuration details: ${error.message}`);
    }
  };

  return (
    <KiduServerTable
      title="System Configuration"
      subtitle="List of all Application Master Settings"
      columns={columns}
      idKey="appMasterSettingId"
      addButtonLabel="Add System Config"
      addRoute="/dashboard/settings/create-systemConfig"
      editRoute="/dashboard/settings/edit-systemconfig"
      viewRoute="/dashboard/settings/view-systemconfig"
      fetchData={fetchData}
      showSearch={true}
      showActions={true}
      showExport={true}
      showAddButton={true}
      rowsPerPage={10}
      reverseOrder={true}  // ✅ Added this prop
    />
  );
};

export default SystemConfigList;