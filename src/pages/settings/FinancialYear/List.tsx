import React from "react";
import FinancialYearService from "../../../services/settings/financial.services";
import { FinancialYear } from "../../../types/settings/Financial.type";
import KiduServerTable from "../../../components/Trip/KiduServerTable";

const columns = [
  { key: "financialYearId", label: "ID" },
  { key: "finacialYearCode", label: "Code" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "isCurrent", label: "Is Current" },
  { key: "isClosed", label: "Is Closed" }
];

// Format date (dd-Month-yyyy)
const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

const FinancialYearList: React.FC = () => {
  // ✅ Added reverseOrder parameter
  const fetchFinancialYearData = async ({
    pageNumber,
    pageSize,
    searchTerm,
    reverseOrder
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    reverseOrder?: boolean;
  }) => {
    try {
      // Fetch data - now returns CustomResponse<FinancialYear[]>
      const response = await FinancialYearService.getAllFinacialYear();

      // Check if response is successful
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch financial years");
      }

      // Extract the actual data array from response.value
      const allData = response.value || [];

      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      // SEARCH
      let filtered = allData;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filtered = allData.filter(
          (item) =>
            item.finacialYearCode?.toLowerCase().includes(s) ||
            item.financialYearId?.toString().includes(searchTerm)
        );
      }

      // Format start & end dates
      let formattedData = filtered.map((fy) => ({
        ...fy,
        startDate: formatDate(fy.startDate ?? ""),
        endDate: formatDate(fy.endDate ?? "")
      }));

      // ✅ Apply reverse order if requested (show latest financial years first)
      if (reverseOrder) {
        formattedData = [...formattedData].reverse();
      }

      const total = formattedData.length;

      // Pagination
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = formattedData.slice(startIndex, endIndex);

      return { data: paginatedData, total };
    } catch (err: any) {
      console.error("Error fetching financial years:", err);
      throw new Error("Failed to fetch financial year details.");
    }
  };

  return (
    <KiduServerTable
      title="Financial Years"
      subtitle="List of all financial years with quick edit & view"
      columns={columns}
      idKey="financialYearId"
      addButtonLabel="Add New Financial Year"
      addRoute="/dashboard/settings/create-financialYear"
      editRoute="/dashboard/settings/edit-financialYear"
      viewRoute="/dashboard/settings/view-financialYear"
      fetchData={fetchFinancialYearData}
      rowsPerPage={15}
      showSearch={true}
      showActions={true}
      showAddButton={true}
      showExport={true}
      reverseOrder={true}  // ✅ Added this prop
    />
  );
};

export default FinancialYearList;