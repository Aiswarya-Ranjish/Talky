// src/pages/settings/adminUsers/AdminUserList.tsx
import React from "react";
import AdminUserService from "../../../services/settings/AdminUser.services";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import defaultUserAvatar from "../../../assets/Images/profile.jpeg";
import { User } from "../../../types/settings/AdminUser.types";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";

const columns = [
  { key: "userId", label: "User ID" },
  { 
    key: "profilePic", 
    label: "Profile",
    type: "image" as const  
  },
  { key: "userName", label: "User Name" },
  { key: "userEmail", label: "Email" },
  { key: "phoneNumber", label: "Phone" },
];

const AdminUserList: React.FC = () => {
  const fetchData = async (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    reverseOrder?: boolean;
  }) => {
    try {
      const response = await AdminUserService.getAll();
      
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch admin users");
      }

      const allData = response.value || [];
      
      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      // Transform data: create profilePic field with full URL
      const transformedData = allData.map((user: User) => ({
        ...user,
        profilePic: user.profileImagePath 
          ? getFullImageUrl(user.profileImagePath) 
          : defaultUserAvatar
      }));

      let filteredData = transformedData;

      // Apply search filter
      if (params.searchTerm) {
        const s = params.searchTerm.toLowerCase();
        filteredData = transformedData.filter(user =>
          (user.userName || "").toLowerCase().includes(s) ||
          (user.userEmail || "").toLowerCase().includes(s) ||
          (user.phoneNumber || "").toLowerCase().includes(s) ||
          (user.companyName || "").toLowerCase().includes(s) ||
          (user.address || "").toLowerCase().includes(s) ||
          (user.userId?.toString() || "").includes(params.searchTerm)
        );
      }

      // Apply reverse order (latest first)
      if (params.reverseOrder) {
        filteredData = [...filteredData].reverse();
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
      console.error("Error fetching admin users:", error);
      throw new Error(`Failed to fetch admin user details: ${error.message}`);
    }
  };

  return (
    <KiduServerTable
      title="Admin User Details"
      subtitle="List of all admin users with Edit & View options"
      columns={columns}
      idKey="userId"
      addButtonLabel="Add New Admin User"
      addRoute="/dashboard/settings/create-adminUser"
      editRoute="/dashboard/settings/edit-adminUser"
      viewRoute="/dashboard/settings/view-adminUser"
      fetchData={fetchData}
      showSearch={true}
      showActions={true}
      showExport={true}
      showAddButton={true}
      rowsPerPage={10}
      reverseOrder={true}
    />
  );
};

export default AdminUserList;