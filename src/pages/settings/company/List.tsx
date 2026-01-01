import React from "react";
import CompanyService from "../../../services/settings/Company.services";
import { Company } from "../../../types/settings/Company.types";
import KiduServerTable from "../../../components/Trip/KiduServerTable";

const columns = [
  { key: "companyId", label: "Company ID" },
  { key: "comapanyName", label: "Company Name" },
  { key: "email", label: "Email" },
  { key: "contactNumber", label: "Contact Number" },
  { key: "website", label: "Website" },
  { key: "taxNumber", label: "Tax Number" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
  { key: "isActive", label: "Active" }
];

const formatValue = (value: any) => {
  return value !== null && value !== undefined && value !== ""
    ? value
    : "-";
};

const CompanyList: React.FC = () => {
  // ✅ Added reverseOrder parameter
  const fetchCompanyData = async ({
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
      // Fetch companies
      const response = await CompanyService.getAllCompany();

      if (!response || !response.isSucess) {
        throw new Error(
          response?.customMessage || response?.error || "Failed to fetch companies"
        );
      }

      const allData: Company[] = response.value || [];

      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      // FILTER OUT DELETED COMPANIES
      let filtered = allData.filter((c) => !c.isDeleted);

      // SEARCH
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.comapanyName?.toLowerCase().includes(s) ||
            c.email?.toLowerCase().includes(s) ||
            c.contactNumber?.toLowerCase().includes(s) ||
            c.taxNumber?.toLowerCase().includes(s) ||
            c.companyId?.toString().includes(searchTerm)
        );
      }

      // FORMAT DATA
      let formattedData = filtered.map((item) => ({
        ...item,
        comapanyName: formatValue(item.comapanyName),
        email: formatValue(item.email),
        contactNumber: formatValue(item.contactNumber),
        website: formatValue(item.website),
        taxNumber: formatValue(item.taxNumber),
        city: formatValue(item.city),
        country: formatValue(item.country),
        isActive: item.isActive ? "Yes" : "No"
      }));

      // ✅ Apply reverse order if requested (show latest companies first)
      if (reverseOrder) {
        formattedData = [...formattedData].reverse();
      }

      const total = formattedData.length;

      // PAGINATION
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = formattedData.slice(startIndex, endIndex);

      return { data: paginatedData, total };
    } catch (err: any) {
      console.error("Error fetching companies:", err);
      throw new Error("Failed to fetch company details.");
    }
  };

  return (
    <KiduServerTable
      title="Company List"
      subtitle="List of all companies with quick edit & view"
      columns={columns}
      idKey="companyId"
      addButtonLabel="Add New Company"
      addRoute="/dashboard/settings/create-company"
      editRoute="/dashboard/settings/edit-company"
      viewRoute="/dashboard/settings/view-company"
      fetchData={fetchCompanyData}
      rowsPerPage={15}
      showSearch={true}
      showActions={true}
      showAddButton={true}
      showExport={true}
      reverseOrder={true}  // ✅ Added this prop
    />
  );
};

export default CompanyList;