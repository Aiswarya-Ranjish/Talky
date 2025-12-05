import React from "react";
import CategoryService from "../../../services/settings/Category.services";
import { Category } from "../../../types/settings/Category.type";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
//import CategoryService from "services/CategoryService";
//import { Category } from "types/Category";
//import KiduServerTable from "components/Trip/KiduServerTable";

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
      const response: Category[] = await CategoryService.getAllCategory();

      if (!response || response.length === 0) {
        return { data: [], total: 0 };
      }

      // SEARCH FILTER
      let filteredData = response;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filteredData = response.filter(
          (c) =>
            c.categoryName?.toLowerCase().includes(s) ||
            c.categoryCode?.toLowerCase().includes(s) ||
            c.categoryId?.toString().includes(searchTerm)
        );
      }

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
      viewRoute="/Category/CategoryView"
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
