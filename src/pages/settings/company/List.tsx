import React from "react";
import type { Company } from "../../../types/settings/Company.types";
import CompanyService from "../../../services/settings/Company.services";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import defaultCompanyLogo from "../../../assets/Images/company.png";

const columns = [
  { key: "companyId", label: "Company ID" },
  { 
    key: "companyLogo", 
    label: "Logo",
    type: "image" as const  
  },
  { key: "comapanyName", label: "Company Name" },
  { key: "email", label: "Email" },
  { key: "contactNumber", label: "Contact" },
  { key: "city", label: "City" },
];

const CompanyPage: React.FC = () => {
  const fetchData = async (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    try {
      const response = await CompanyService.getAllCompany();
      
      // Check if response is successful
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch companies");
      }

      // Extract data from response.value
      const allData = response.value || [];
      
      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      // ✅ Transform company logo paths to full URLs
      const transformedData = allData.map((company: Company) => ({
        ...company,
        companyLogo: company.companyLogo 
          ? getFullImageUrl(company.companyLogo) 
          : defaultCompanyLogo // ✅ Use default company logo if none exists
      }));

      let filteredData = transformedData;

      // Apply search filter if searchTerm exists
      if (params.searchTerm) {
        const s = params.searchTerm.toLowerCase();
        filteredData = transformedData.filter(company =>
          (company.comapanyName || "").toLowerCase().includes(s) ||
          (company.email || "").toLowerCase().includes(s) ||
          (company.city || "").toLowerCase().includes(s) ||
          (company.contactNumber || "").toLowerCase().includes(s) ||
          (company.companyId?.toString() || "").includes(params.searchTerm)
        );
      }

      // Apply pagination
      const start = (params.pageNumber - 1) * params.pageSize;
      const end = start + params.pageSize;
      const paginatedData = filteredData.slice(start, end);

      return { 
        data: paginatedData, 
        total: filteredData.length 
      };
    } catch (error: any) {
      console.error("Error fetching companies:", error);
      throw new Error(`Failed to fetch company details: ${error.message}`);
    }
  };

  return (
    <KiduServerTable
      title="Company Details"
      subtitle="List of all companies with Edit & View options"
      columns={columns}
      idKey="companyId"
      addButtonLabel="Add New Company"
      addRoute="/dashboard/settings/create-company"
      editRoute="/dashboard/settings/edit-company"
      viewRoute="/dashboard/settings/view-company"
      fetchData={fetchData}
      showSearch={true}
      showActions={true}
      showExport={true}
      showAddButton={true}
      rowsPerPage={10}
    />
  );
};

export default CompanyPage;