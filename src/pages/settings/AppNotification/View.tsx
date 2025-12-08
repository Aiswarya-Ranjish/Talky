import React, { useEffect, useState } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import AppNotificationService from "../../../services/settings/AppNotification.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduAuditLogs from "../../../components/KiduAuditLogs";

const AppNotificationView: React.FC = () => {
  const navigate = useNavigate();
  const { appNotificationId } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const loadNotification = async () => {
      try {
        if (!appNotificationId) {
          toast.error("No notification ID provided");
          navigate("/dashboard/settings/appNotification-list");
          return;
        }

        const response = await AppNotificationService.getNotificationById(appNotificationId);
        
        // ✅ Check response structure properly
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || response?.error || "Failed to load notification");
        }

        // ✅ Extract data from response.value
        setData(response.value);
      } catch (error: any) {
        console.error("Failed to load notification:", error);
        toast.error(`Error: ${error.message}`);
        navigate("/dashboard/settings/appNotification-list");
      } finally {
        setLoading(false);
      }
    };
    loadNotification();
  }, [appNotificationId, navigate]);

  if (loading) return <KiduLoader type="notification details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No notification details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );

  const fields = [
    { key: "appNotificationId", label: "Notification ID", icon: "bi-hash" },
    { key: "notificationType", label: "Notification Type", icon: "bi-tags" },
    { key: "notificationTitle", label: "Title", icon: "bi-card-heading" },
    { key: "notificationImage", label: "Image URL", icon: "bi-image" },
    { key: "notificationLink", label: "Link", icon: "bi-link-45deg" },
    { key: "createdAt", label: "Created Date", icon: "bi-calendar-check" },
    { key: "isActive", label: "Is Active", icon: "bi-check-circle", isBoolean: true }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleEdit = () => navigate(`/dashboard/settings/edit-appNotification/${data.appNotificationId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      // ✅ Use correct delete method signature
      const response = await AppNotificationService.deleteNotificationById(String(data.appNotificationId ?? ""));
      
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to delete notification");
      }

      toast.success("Notification deleted successfully");
      setTimeout(() => navigate("/dashboard/settings/appNotification-list"), 600);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingDelete(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Notification Details</h5>
          </div>

          <div className="d-flex">
            <Button
              className="d-flex align-items-center gap-2 me-1"
              style={{ backgroundColor: "#882626ff", border: "none", fontWeight: 500 }}
              onClick={handleEdit}>
              <FaEdit /> Edit
            </Button>

            <Button variant="danger" className="d-flex align-items-center gap-2"
              style={{ fontWeight: 500 }}
              onClick={() => setShowConfirm(true)}>
              <FaTrash size={12} /> Delete
            </Button>
          </div>
        </div>

        {/* Notification Info */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">Notification ID: {data.appNotificationId || "Unknown"}</h5>
          <p className="small mb-0 fw-bold" style={{ color: "#882626ff" }}>
            Type: {data.notificationType}
          </p>
        </div>

        {/* DETAILS TABLE */}
        <div className="table-responsive">
          <Table
            bordered
            hover
            responsive
            className="align-middle mb-0"
            style={{ fontFamily: "Urbanist", fontSize: "13px" }}
          >
            <tbody>
              {fields.map(({ key, label, icon, isBoolean }, index) => {
                let value = (data as any)[key];
                
                if (isBoolean) {
                  value = value ? "Yes" : "No";
                } else if (key === "createdAt") {
                  value = formatDate(value);
                }

                return (
                  <tr
                    key={key}
                    style={{
                      lineHeight: "1.2",
                      backgroundColor: index % 2 === 1 ? "#ffe8e8" : ""
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffe6e6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 1 ? "#ffe8e8" : "";
                    }}
                  >
                    <td
                      style={{
                        width: "40%",
                        padding: "8px 6px",
                        color: "#882626ff",
                        fontWeight: 600
                      }}
                    >
                      <i className={`bi ${icon} me-2`}></i>
                      {label}
                    </td>
                    <td style={{ padding: "8px 6px" }}>
                      {value !== null && value !== undefined && value !== "" ? value : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* AUDIT LOGS */}
        {data.appNotificationId && (
          <KiduAuditLogs tableName="AppNotification" recordId={data.appNotificationId.toString()} />
        )}

      </Card>

      {/* DELETE MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this notification?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
            {loadingDelete ? (
              <>
                <Spinner animation="border" size="sm" /> Deleting...
              </>
            ) : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};

export default AppNotificationView;