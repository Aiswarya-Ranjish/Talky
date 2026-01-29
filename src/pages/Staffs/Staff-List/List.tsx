import React from "react";
import StaffService from "../../../services/Staff/Staff.Services";
import { StaffModel } from "../../../types/Staff/StaffType";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";

const columns = [
  { key: "staffUserId", label: "Staff ID", type: "text" as const },
  { key: "profile", label: "Photo", type: "image" as const },
  { key: "name", label: "Name", type: "text" as const },
  { key: "mobileNumber", label: "Mobile Number", type: "text" as const },
  { key: "email", label: "Email", type: "text" as const },
  { key: "address", label: "Address", type: "text" as const },
  { key: "starRating", label: "Star Rating", type: "rating" as const }, 
  { key: "isBlocked", label: "Is Blocked", type: "checkbox" as const }, 
];

const StaffList: React.FC = () => {
  // ✅ Added reverseOrder parameter
  const fetchStaffData = async ({
    pageNumber,
    pageSize,
    searchTerm,
    reverseOrder,
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    reverseOrder?: boolean;
  }) => {
    try {
      // Fetch data - now returns CustomResponse<StaffModel[]>
      const response = await StaffService.getAllStaff();

      // Check if response is successful
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch staff");
      }

      // Extract the actual data array from response.value
      const allData = response.value || [];

      if (allData.length === 0) {
        return { data: [], total: 0 };
      }

      // FILTER OUT DELETED STAFF
      let filtered = allData.filter((staff: StaffModel) => !staff.isDeleted);

      // Transform data with profile images
      let transformedData = filtered.map((staff: StaffModel) => {
        const imageUrl = staff.profileImagePath 
          ? getFullImageUrl(staff.profileImagePath) 
          : null;

        return {
          ...staff,
          profile: imageUrl,
          starRating: staff.starRating || 0,
          isBlocked: staff.isBlocked,
        };
      });

      // SEARCH
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        transformedData = transformedData.filter(
          (staff) =>
            staff.name?.toLowerCase().includes(lowerSearch) ||
            staff.email?.toLowerCase().includes(lowerSearch) ||
            staff.mobileNumber?.includes(searchTerm) ||
            staff.staffUserId?.toString().includes(searchTerm)
        );
      }

      // ✅ Apply reverse order if requested (show latest staff first)
      if (reverseOrder) {
        transformedData = [...transformedData].reverse();
      }

      const total = transformedData.length;

      // Pagination
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = transformedData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: total,
      };
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      throw new Error("Failed to load staff data");
    }
  };

  return (
    <KiduServerTable
      title="Staff Management"
      subtitle="List of all active staff members with quick edit & view actions"
      columns={columns}
      idKey="staffUserId"
      addButtonLabel="Add New Staff"
      addRoute="/staff-management/staff-create"
      editRoute="/dashboard/staff/staff-edit"
      viewRoute="/dashboard/staff/staff-view"
      fetchData={fetchStaffData}
      rowsPerPage={10}
      showSearch={true}
      showActions={true}
      showAddButton={false}
      showExport={true}
      reverseOrder={true}  // ✅ Added this prop
    />
  );
};

export default StaffList;