import React from "react";
import StaffService from "../../services/Staff/Staff.Services";
import { StaffModel } from "../../types/Staff/StaffType";
import KiduServerTable from "../../components/Trip/KiduServerTable";
import { getFullImageUrl } from "../../constants/API_ENDPOINTS";

const columns = [
  { key: "staffUserId", label: "Staff ID" },
  { key: "profile", label: "Photo" },
  { key: "name", label: "Name" },
  { key: "mobileNumber", label: "Mobile Number" },
  { key: "email", label: "Email" },
  { key: "address", label: "Address" },
  { key: "starRating", label: "Star Rating" },
  { key: "isBlocked", label: "Is Blocked" },
];

const StaffList: React.FC = () => {
  // Server-side pagination fetch function
  const fetchStaffData = async ({
    pageNumber,
    pageSize,
    searchTerm,
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    try {
      console.log("📡 Fetching staff data:", { pageNumber, pageSize, searchTerm });

      // Get all staff from API
      const response = await StaffService.getAllStaff();

      if (!response || response.length === 0) {
        return { data: [], total: 0 };
      }

      // Transform data with profile images
      let transformedData = response.map((staff: StaffModel) => {
        const imageUrl = getFullImageUrl(staff.profileImagePath) || "/assets/Images/profile.jpeg";

        return {
          ...staff,
          profile: imageUrl,
          // starRating is already a number, keep it as is
        };
      });

      // Client-side search filtering
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        transformedData = transformedData.filter(
          (staff) =>
            (staff.name?.toString() || '').toLowerCase().includes(lowerSearch) ||
            (staff.email?.toString() || '').toLowerCase().includes(lowerSearch) ||
            (staff.mobileNumber?.toString() || '').includes(searchTerm) ||
            (staff.staffUserId?.toString() || '').includes(searchTerm)
        );
      }

      const total = transformedData.length;

      // Client-side pagination
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = transformedData.slice(startIndex, endIndex);

      console.log("✅ Staff data fetched:", {
        total,
        pageData: paginatedData.length,
        sampleStarRating: paginatedData[0]?.starRating,
      });

      return {
        data: paginatedData,
        total: total,
      };
    } catch (error) {
      console.error("❌ Error fetching staff:", error);
      throw new Error("Failed to load staff data");
    }
  };

  return (
    <KiduServerTable
      title="Staff Management"
      subtitle="List of all staff members with quick edit & view actions"
      columns={columns}
      idKey="staffUserId"
      addButtonLabel="Add New Staff"
      addRoute="/staff-management/staff-create"
      editRoute="/dashboard/staff/staff-Edit"
      viewRoute="/dashboard/staff/staff-view"
      fetchData={fetchStaffData}
      rowsPerPage={15}
      showSearch={true}
      showActions={true}
      showAddButton={true}
      showExport={true}
    />
  );
};

export default StaffList;