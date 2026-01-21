import React, { useEffect, useState } from "react";
import { Card, Table, Image, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import defaultProfile from "../../../assets/Images/profile.jpeg";
import { StaffModel } from "../../../types/Staff/StaffType";
import StaffService from "../../../services/Staff/Staff.Services";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import KiduAuditLogs from "../../../components/KiduAuditLogs";

const StaffView: React.FC = () => {
  const navigate = useNavigate();
  const { staffUserId } = useParams();

  const [data, setData] = useState<StaffModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        if (!staffUserId) {
          toast.error("No staff ID provided");
          navigate("/dashboard/staff/staff-list");
          return;
        }

        const response = await StaffService.getStaffById(staffUserId);
        
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || response?.error || "Failed to load staff");
        }

        setData(response.value);
      } catch (error: any) {
        console.error("Failed to load staff:", error);
        toast.error(`Error: ${error.message}`);
        navigate("/dashboard/staff/staff-list");
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, [staffUserId, navigate]);

  if (loading) return <KiduLoader type="staff details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No staff details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );

  const fields = [
    { key: "email", label: "Email", icon: "bi-envelope" },
    { key: "mobileNumber", label: "Mobile Number", icon: "bi-telephone-fill" },
    { key: "address", label: "Address", icon: "bi-geo-alt-fill" },
    { key: "bio", label: "Bio", icon: "bi-person-lines-fill" },
    { key: "gender", label: "Gender", icon: "bi-gender-ambiguous" },
    { key: "walletBalance", label: "Wallet Balance", icon: "bi-wallet2" },
    { key: "customerCoinsPerSecondAudio", label: "Customer Audio Rate", icon: "bi-mic-fill" },
    { key: "customerCoinsPerSecondVideo", label: "Customer Video Rate", icon: "bi-camera-video-fill" },
    { key: "companyCoinsPerSecondAudio", label: "Company Audio Rate", icon: "bi-soundwave" },
    { key: "companyCoinsPerSecondVideo", label: "Company Video Rate", icon: "bi-camera-video" },
    { key: "priority", label: "Priority", icon: "bi-star" },
    { key: "kycDocument", label: "KYC Document", icon: "bi-file-earmark-text" },
    { key: "kycDocumentNumber", label: "KYC Document Number", icon: "bi-hash" },
    { key: "isAudioEnbaled", label: "Audio Enabled", icon: "bi-mic-fill", isBoolean: true },
    { key: "isVideoEnabled", label: "Video Enabled", icon: "bi-camera-video-fill", isBoolean: true },
    { key: "isBlocked", label: "Is Blocked", icon: "bi-slash-circle", isBoolean: true },
    { key: "isKYCCompleted", label: "KYC Completed", icon: "bi-check-circle", isBoolean: true },
    { key: "isOnline", label: "Online Status", icon: "bi-circle-fill", isBoolean: true }
  ];

  const imageUrl = data.profileImagePath
    ? getFullImageUrl(data.profileImagePath)
    : defaultProfile;

  const handleEdit = () => navigate(`/dashboard/staff/staff-edit/${data.staffUserId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      if (!data.staffUserId) throw new Error("No staff ID available");
      
      // Update staff with isDeleted = true
      const dataToUpdate: StaffModel = {
        ...data,
        isDeleted: true
      };

      const response = await StaffService.editStaffById(String(data.staffUserId), dataToUpdate);
      
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to delete staff");
      }

      toast.success("Staff deleted successfully");
      setTimeout(() => navigate("/dashboard/staff/staff-list"), 600);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingDelete(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center mt-4 pt-4" style={{ fontFamily: "Urbanist" }}>
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Staff Details</h5>
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

        {/* Profile Image */}
        <div className="text-center mb-4">
          <Image
            src={imageUrl}
            alt={data.name}
            roundedCircle
            width={120}
            height={120}
            className="mb-3"
            style={{ border: "3px solid #882626ff", objectFit: "cover" }}
          />
          <h5 className="fw-bold mb-1">{data.name}</h5>
          <p className="small mb-0 fw-bold" style={{ color: "#882626ff" }}>
            Staff ID: {data.staffUserId}
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
                if (isBoolean) value = value ? "Yes" : "No";

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
                      {value !== null && value !== undefined ? value : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* AUDIT LOGS */}
        <KiduAuditLogs tableName="Staff" recordId={data.staffUserId ?? ""} />

      </Card>

      {/* DELETE MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this staff?</Modal.Body>
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

export default StaffView;