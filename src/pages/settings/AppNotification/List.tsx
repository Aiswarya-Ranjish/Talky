import React from "react";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import AppNotificationService from "../../../services/settings/AppNotification.services";
import { AppNotification } from "../../../types/settings/AppNotification";
//import AppNotificationService from "services/AppNotificationService";
//import { AppNotification } from "types/AppNotification";
//import KiduServerTable from "../../components/Trip/KiduServerTable"; // adjust path if needed

const columns = [
  { key: "appNotificationId", label: "ID" },
  { key: "notificationType", label: "Type" },
  { key: "notificationTitle", label: "Title" },
  { key: "isActive", label: "Status" },
  { key: "createdAt", label: "Created Date" },
];

const AppNotificationList: React.FC = () => {
  const fetchAppNotificationData = async ({
    pageNumber,
    pageSize,
    searchTerm,
  }: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    try {
      // Fetch all notifications
      const response: AppNotification[] = await AppNotificationService.getAllNotification();

      if (!response || response.length === 0) return { data: [], total: 0 };

      // Filter by search term (client-side)
      let filteredData = response;
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filteredData = response.filter(
          (item) =>
            (item.notificationTitle || "").toLowerCase().includes(lowerSearch) ||
            (item.notificationType || "").toLowerCase().includes(lowerSearch) ||
            (item.appNotificationId?.toString() || "").includes(searchTerm)
        );
      }

      // Format createdAt date
      const formattedData = filteredData.map((item) => ({
        ...item,
        createdAt: new Date(item.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
      }));

      const total = formattedData.length;
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = formattedData.slice(startIndex, endIndex);

      return { data: paginatedData, total };
    } catch (err) {
      console.error("Error fetching notifications:", err);
      throw new Error("Failed to fetch notifications");
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
      editRoute="/dashboard/settings/edit-appNotification/"
      viewRoute="/AppNotification/AppNotificationView"
      fetchData={fetchAppNotificationData}
      rowsPerPage={15}
      showSearch={true}
      showActions={true}
      showAddButton={true}
      showExport={true}
    />
  );
};

export default AppNotificationList;
