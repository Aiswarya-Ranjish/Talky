import React from "react";
import CategoryService from "../../../services/settings/Category.services";
import { Category } from "../../../types/settings/Category.type";
import KiduServerTable from "../../../components/Trip/KiduServerTable";

const columns = [
  { key: "categoryId", label: "Category ID" },
  { key: "categoryName", label: "Name" },
  { key: "categoryDescription", label: "Description" },
  { key: "categoryTitle", label: "Title" },
  { key: "categoryCode", label: "Code" },
  { key: "companyName", label: "Company" }
];

const formatValue = (value: any) => {
  return value ? value : "-";
};

const CategoryList: React.FC = () => {
  // ✅ Added reverseOrder parameter
  const fetchCategoryData = async ({
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
      // Fetch data - now returns CustomResponse<Category[]>
      const response = await CategoryService.getAllCategory();

      // Check if response is successful
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch categories");
      }

      // Extract the actual data array from response.value
      const allData = response.value || [];

      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      // FILTER OUT DELETED ITEMS
      let filtered = allData.filter((c) => !c.isDeleted);

      // SEARCH
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (c) =>
            c.categoryName?.toLowerCase().includes(s) ||
            c.categoryCode?.toLowerCase().includes(s) ||
            c.categoryId?.toString().includes(searchTerm)
        );
      }

      // Format rows
      let formattedData = filtered.map((item) => ({
        ...item,
        categoryName: formatValue(item.categoryName),
        categoryDescription: formatValue(item.categoryDescription),
        categoryTitle: formatValue(item.categoryTitle),
        categoryCode: formatValue(item.categoryCode),
        companyName: formatValue(item.companyName)
      }));

      // ✅ Apply reverse order if requested (show latest categories first)
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
      console.error("Error fetching categories:", err);
      throw new Error("Failed to fetch category details.");
    }
  };

  return (
    <KiduServerTable
      title="Category List"
      subtitle="List of all categories with quick edit & view"
      columns={columns}
      idKey="categoryId"
      addButtonLabel="Add New Category"
      addRoute="/dashboard/settings/create-Category"
      editRoute="/dashboard/settings/edit-Category"
      viewRoute="/dashboard/settings/view-Category"
      fetchData={fetchCategoryData}
      rowsPerPage={15}
      showSearch={true}
      showActions={true}
      showAddButton={true}
      showExport={true}
      reverseOrder={true}  // ✅ Added this prop
    />
  );
};

export default CategoryList;