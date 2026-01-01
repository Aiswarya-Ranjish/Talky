import React from "react";
import AppNotificationService from "../../../services/settings/AppNotification.services";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import defaultNotificationImage from "../../../assets/Images/notification.png";

const columns = [
  { key: "appNotificationId", label: "ID" },
  { 
    key: "notificationImage", 
    label: "Image",
    type: "image" as const
  },
  { key: "notificationType", label: "Type" },
  { key: "notificationTitle", label: "Title" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created Date" }
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

const AppNotificationList: React.FC = () => {
  // ✅ Added reverseOrder parameter
  const fetchAppNotificationData = async ({
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
      console.log("Fetching notifications...");
      
      const response = await AppNotificationService.getAllNotification();
      
      console.log("API Response:", response);
      
      if (!response) {
        console.error("No response received from API");
        throw new Error("No response received from server");
      }

      if (!response.isSucess) {
        console.error("API Response not successful:", response);
        const errorMsg = response?.customMessage || response?.error || "Failed to fetch notifications";
        throw new Error(errorMsg);
      }

      const allData = response.value || [];
      console.log("All data:", allData);

      if (allData.length === 0) {
        console.log("No notifications found");
        return { data: [], total: 0 };
      }

      // SEARCH
      let filtered = allData;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filtered = allData.filter(
          (item) =>
            item.notificationTitle?.toLowerCase().includes(s) ||
            item.notificationType?.toLowerCase().includes(s) ||
            item.appNotificationId?.toString().includes(searchTerm)
        );
        console.log(`Filtered ${filtered.length} items from search term: ${searchTerm}`);
      }

      // ✅ Transform data with full image URLs and formatting
      let formattedData = filtered.map((notification) => ({
        ...notification,
        notificationImage: notification.notificationImage 
          ? getFullImageUrl(notification.notificationImage)
          : defaultNotificationImage,
        createdAt: formatDate(notification.createdAt ?? ""),
        isActive: notification.isActive ? "Active" : "Inactive"
      }));

      // ✅ Apply reverse order if requested (show latest notifications first)
      if (reverseOrder) {
        formattedData = [...formattedData].reverse();
      }

      const total = formattedData.length;
      console.log(`Total items after filtering: ${total}`);

      // Pagination
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = formattedData.slice(startIndex, endIndex);
      
      console.log(`Returning ${paginatedData.length} items for page ${pageNumber}`);
      
      return { data: paginatedData, total };
    } catch (err: any) {
      console.error("Error in fetchAppNotificationData:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack
      });
      throw new Error(`Failed to fetch notification details: ${err.message}`);
    }
  };

  return (
    <KiduServerTable
      title="App Notifications"
      subtitle="List of all app notifications with quick edit & view"
      columns={columns}
      idKey="appNotificationId"
      addButtonLabel="Add New Notification"
      addRoute="/dashboard/settings/create-appNotification"
      editRoute="/dashboard/settings/edit-appNotification"
      viewRoute="/dashboard/settings/view-appNotification"
      fetchData={fetchAppNotificationData}
      rowsPerPage={15}
      showSearch={true}
      showActions={true}
      showAddButton={true}
      showExport={true}
      reverseOrder={true}  // ✅ Added this prop
    />
  );
};

export default AppNotificationList;