import React from "react";
import FinancialYearService from "../../../services/settings/financial.services";
import { FinancialYear } from "../../../types/settings/Financial.type";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
//import KiduServerTable from "../../components/Trip/KiduServerTable";
////import FinancialYearService from "../../services/FinancialYearService";
//import { FinancialYear } from "../../types/FinancialYear";

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
  const fetchFinancialYearData = async ({
    pageNumber,
    pageSize,
    searchTerm
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    try {
      const response: FinancialYear[] = await FinancialYearService.getAllFinacialYear();

      if (!response || response.length === 0) {
        return { data: [], total: 0 };
      }

      // SEARCH
      let filtered = response;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filtered = response.filter(
          (item) =>
            item.finacialYearCode?.toLowerCase().includes(s) ||
            item.financialYearId?.toString().includes(searchTerm)
        );
      }

      // Format start & end dates
      const formattedData = filtered.map((fy) => ({
        ...fy,
        startDate: formatDate(fy.startDate??""),
        endDate: formatDate(fy.endDate??"")
      }));

      const total = formattedData.length;

      // Pagination
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = formattedData.slice(startIndex, endIndex);

      return { data: paginatedData, total };
    } catch (err) {
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
    />
  );
};

export default FinancialYearList;
