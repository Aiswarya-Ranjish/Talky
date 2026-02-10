// pages/settings/AppNotification/AppNotificationList.tsx

import React, { useState } from "react";
import { Button } from "react-bootstrap";
import AppNotificationService from "../../../services/settings/AppNotification.services";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import { AppNotification } from "../../../types/settings/AppNotification";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import defaultNotificationImage from "../../../assets/Images/notification.png";
import SendNotificationModal from "./SendNotificationModal";

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

const formatDate = (isoString: string) => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = date.toLocaleString("en-US", { month: "long" });
  const day = String(date.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
};

const AppNotificationList: React.FC = () => {
  const [showSendModal, setShowSendModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

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
      const response = await AppNotificationService.getAllNotification();
      
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to fetch notifications");
      }

      const allData = response.value || [];

      // Search
      let filtered = allData;
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filtered = allData.filter(
          (item) =>
            item.notificationTitle?.toLowerCase().includes(s) ||
            item.notificationType?.toLowerCase().includes(s) ||
            item.appNotificationId?.toString().includes(searchTerm)
        );
      }

      // Transform data
      let formattedData = filtered.map((notification) => ({
        ...notification,
        notificationImage: notification.notificationImage 
          ? getFullImageUrl(notification.notificationImage)
          : defaultNotificationImage,
        createdAt: formatDate(notification.createdAt ?? ""),
        isActive: notification.isActive ? "Active" : "Inactive"
      }));

      if (reverseOrder) {
        formattedData = [...formattedData].reverse();
      }

      const total = formattedData.length;
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = formattedData.slice(startIndex, endIndex);
      
      return { data: paginatedData, total };
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      throw new Error(`Failed to fetch notifications: ${err.message}`);
    }
  };

  // ✅ Custom action buttons renderer
  const renderCustomActions = (notification: any) => {
    return (
      <>
        {/* Default Edit button will be rendered by KiduServerTable */}
        {/* Default View button will be rendered by KiduServerTable */}
        
        {/* ✅ NEW: Send button */}
        {notification.isActive === "Active" && (
          <Button
            size="sm"
            variant="outline-success"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedNotification(notification);
              setShowSendModal(true);
            }}
            className="ms-2"
          >
            <i className="bi bi-send"></i> Send
          </Button>
        )}
      </>
    );
  };

  return (
    <>
      <KiduServerTable
        title="App Notifications"
        subtitle="List of all app notifications with quick edit, view & send"
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
        reverseOrder={true}
        // ✅ Pass custom actions renderer
        customActionsRenderer={renderCustomActions}
      />

      {/* ✅ Send Notification Modal */}
      <SendNotificationModal
        show={showSendModal}
        onHide={() => {
          setShowSendModal(false);
          setSelectedNotification(null);
        }}
        notification={selectedNotification}
      />
    </>
  );
};

export default AppNotificationList;