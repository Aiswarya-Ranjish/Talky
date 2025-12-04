import React, { useEffect, useState, useCallback } from "react";
import { User } from "../../../types/TalkyUser";
import AppUserService from "../../../services/Users/AppUserServices";
import KiduLoader from "../../../components/KiduLoader";
import toast from "react-hot-toast";
import KiduServerTable from "../../../components/Trip/KiduServerTable";

// ✅ Specify column types explicitly
const columns = [
  { key: "appUserId", label: "ID", type: "text" as const },
  { key: "name", label: "Name", type: "text" as const },
  { key: "mobileNumber", label: "Mobile Number", type: "text" as const },
  { key: "registeredDate", label: "Joined On", type: "date" as const },
  { key: "status", label: "Status", type: "text" as const }, // ✅ Changed to text
  { key: "isBlocked", label: "Is Blocked", type: "checkbox" as const }, // ✅ Checkbox only for isBlocked
  { key: "walletBalance", label: "Wallet Balance", type: "text" as const },
];

const UserPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await AppUserService.getAllUsers();

      if (response && Array.isArray(response)) {
        setUsers(response);
        setError(null);
      } else {
        setError("Failed to load users");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
      toast.error("Error fetching user list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (loading) return <KiduLoader type="Loading Users..." />;

  // Create a fetchData function that KiduServerTable expects
  const fetchData = async (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    try {
      const response = await AppUserService.getAllUsers();
      let filteredData = response || [];
      
      // Apply search filter locally
      if (params.searchTerm) {
        const searchLower = params.searchTerm.toLowerCase();
        filteredData = filteredData.filter(user => 
          (user.name?.toString() || '').toLowerCase().includes(searchLower) ||
          (user.mobileNumber?.toString() || '').includes(searchLower) ||
          (user.appUserId?.toString() || '').includes(searchLower) ||
          (user.status?.toString() || '').toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const startIndex = (params.pageNumber - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        data: paginatedData,
        total: filteredData.length
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { data: [], total: 0 };
    }
  };

  return (
    <KiduServerTable
      title="User Management"
      subtitle="List of all registered users with actions"
      columns={columns}
      idKey="appUserId"
      addButtonLabel="Add New User"
      addRoute="/user-management/create-user"
      editRoute="/dashboard/user/edit-user"
      viewRoute="/dashboard/user/view-user"
      fetchData={fetchData}
      showSearch={true}
      showActions={true}
      showExport={true}
      showAddButton={false} // ✅ Set to false to hide add button
      rowsPerPage={10}
    />
  );
};

export default UserPage;