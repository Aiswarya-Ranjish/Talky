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
  { key: "companyId", label: "Company ID" }
];

// Format text (fallback for empty fields)
const formatValue = (value: any) => {
  return value ? value : "-";
};

const CategoryList: React.FC = () => {
  const fetchCategoryData = async ({
    pageNumber,
    pageSize,
    searchTerm
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    try {
      console.log("🔄 Fetching categories from API..."); // Debug log
      const response: Category[] = await CategoryService.getAllCategory();

      console.log("📦 Raw API response:", response); // Debug log
      console.log("📊 Response length:", response?.length); // Debug log
      console.log("📋 Full response object:", JSON.stringify(response)); // Debug log

      if (!response || response.length === 0) {
        console.warn("⚠️ No data received from API");
        return { data: [], total: 0 };
      }

      // ✅ FILTER OUT DELETED ITEMS FIRST
      let filteredData = response.filter((c) => {
        // Filter out items where isDeleted is true, 1, or any truthy value
        const isDeletedValue = c.isDeleted;
        return !isDeletedValue; // Keep only non-deleted items
      });

      console.log("After isDeleted filter:", filteredData.length); // Debug log

      // ✅ THEN APPLY SEARCH FILTER
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filteredData = filteredData.filter(
          (c) =>
            c.categoryName?.toLowerCase().includes(s) ||
            c.categoryCode?.toLowerCase().includes(s) ||
            c.categoryId?.toString().includes(searchTerm)
        );
      }

      console.log("After search filter:", filteredData.length); // Debug log

      // Format rows
      const formattedData = filteredData.map((item) => ({
        ...item,
        categoryName: formatValue(item.categoryName),
        categoryDescription: formatValue(item.categoryDescription),
        categoryTitle: formatValue(item.categoryTitle),
        categoryCode: formatValue(item.categoryCode),
        companyId: formatValue(item.companyId)
      }));

      const total = formattedData.length;

      // PAGINATION
      const start = (pageNumber - 1) * pageSize;
      const end = start + pageSize;
      const paginatedRows = formattedData.slice(start, end);

      console.log("Final paginated data:", paginatedRows); // Debug log

      return { data: paginatedRows, total };
    } catch (err) {
      console.error("Error fetching category details:", err);
      throw new Error("Failed to load category details.");
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
    />
  );
};

export default CategoryList;