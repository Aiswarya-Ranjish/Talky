import React, { useEffect, useRef, useState } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import AppNotificationService from "../../../services/settings/AppNotification.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";

const AppNotificationView: React.FC = () => {
  const { appNotificationId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await AppNotificationService.getNotificationById(
          String(appNotificationId)
        );
        setData(res);
      } catch {
        toast.error("Failed to load notification details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [appNotificationId]);

  if (loading) return <KiduLoader type="Notification details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No notification details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  const fields = [
    { key: "appNotificationId", label: "Notification ID" },
    { key: "notificationType", label: "Notification Type" },
    { key: "notificationTitle", label: "Title" },
    { key: "notificationImage", label: "Image URL" },
    { key: "notificationLink", label: "Link" },
    { key: "category", label: "Category" },
    { key: "isActive", label: "Is Active" },
    { key: "createdAt", label: "Created Date" }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handleEdit = () =>
    navigate(`/dashboard/settings/edit-appNotification/${data.appNotificationId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await AppNotificationService.deleteNotificationById(
        String(data.appNotificationId),
        data
      );
      toast.success("Notification deleted successfully");
      setTimeout(
        () => navigate("/dashboard/settings/appNotification-list"),
        800
      );
    } catch {
      toast.error("Failed to delete notification.");
    } finally {
      setLoadingDelete(false);
      setShowConfirm(false);
    }
  };

  return (
    <div
      className="container d-flex justify-content-center align-items-center mt-5"
      style={{ fontFamily: "Urbanist" }}
    >
      <Card
        className="shadow-lg p-4 w-100"
        style={{
          maxWidth: "1300px",
          borderRadius: "15px",
          border: "none"
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#18575A" }}>
              Notification Details
            </h5>
          </div>

          <div className="d-flex">
            <Button
              className="d-flex align-items-center gap-2 me-1"
              style={{
                fontWeight: 500,
                backgroundColor: "#18575A",
                fontSize: "15px",
                border: "none"
              }}
              onClick={handleEdit}
            >
              <FaEdit /> Edit
            </Button>

            <Button
              variant="danger"
              className="d-flex align-items-center gap-2"
              style={{ fontWeight: 500, fontSize: "15px" }}
              onClick={() => setShowConfirm(true)}
            >
              <FaTrash size={12} /> Delete
            </Button>
          </div>
        </div>

        {/* Notification Info */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">Notification #{data.appNotificationId}</h5>
          <p className="small mb-0 fw-bold text-danger">
            Type: {data.notificationType}
          </p>
        </div>

        {/* Details Table */}
        <div className="table-responsive">
          <Table bordered hover responsive className="align-middle mb-0">
            <tbody>
              {fields.map(({ key, label }) => (
                <tr key={key}>
                  <td
                    style={{
                      width: "40%",
                      fontWeight: 600,
                      color: "#18575A"
                    }}
                  >
                    {label}
                  </td>
                  <td>
                    {key === "createdAt"
                      ? formatDate(data[key])
                      : key === "isActive"
                      ? data[key]
                        ? "Yes"
                        : "No"
                      : String(data[key] || "-")}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Delete Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this notification?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
            {loadingDelete ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};

export default AppNotificationView;
