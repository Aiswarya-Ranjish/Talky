import React, { useEffect, useState } from "react";
import { Card, Table, Image, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

import KiduLoader from "../../components/KiduLoader";
import KiduPrevious from "../../components/KiduPrevious";
import defaultProfile from "../../assets/Images/profile.jpeg";
import { StaffModel } from "../../types/Staff/StaffType";
import StaffService from "../../services/Staff/Staff.Services";
import { getFullImageUrl } from "../../constants/API_ENDPOINTS";

const StaffView: React.FC = () => {
  const navigate = useNavigate();
  const { staffUserId } = useParams<{ staffUserId: string }>();

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
        setData(response);
      } catch (err: any) {
        console.error("Error loading staff:", err);
        toast.error("Failed to load staff details.");
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
        <Button className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
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
    { key: "isOnline", label: "Online Status", icon: "bi-circle-fill", isBoolean: true },
  ];

  const formatDate = (isoString: string | Date | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();
    const time = date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
    return `${day}-${month}-${year}  ${time}`;
  };

  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <span style={{ color: "#ffc107", fontSize: "20px" }}>
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  const handleEdit = () => navigate(`/dashboard/staff/staff-edit/${data.staffUserId}`);

  const handleDelete = async () => {
    if (!data || !staffUserId) {
      toast.error("Invalid staff data");
      return;
    }

    setLoadingDelete(true);
    try {
      // Mark staff as deleted
      const updatedStaff: StaffModel = { 
        ...data, 
        isDeleted: true 
      };
      
      const response = await StaffService.editStaffById(staffUserId, updatedStaff);
      
      if (!response || response.isSucess === false) {
        throw new Error(response?.customMessage || "Failed to delete staff");
      }
      
      toast.success("Staff deleted successfully");
      setTimeout(() => navigate("/dashboard/staff/staff-list"), 800);
    } catch (err: any) {
      console.error("Error deleting staff:", err);
      toast.error(err.message || "Failed to delete staff.");
    } finally {
      setLoadingDelete(false);
      setShowConfirm(false);
    }
  };

  const imageUrl = data.profileImagePath 
    ? getFullImageUrl(data.profileImagePath) 
    : defaultProfile;

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#18575A" }}>Staff Details</h5>
          </div>

          <div className="d-flex">
            <Button
              className="d-flex align-items-center gap-2 me-1"
              style={{ fontWeight: 500, backgroundColor: "#18575A", fontSize: "15px", border: "none" }}
              onClick={handleEdit}
            >
              <FaEdit /> Edit
            </Button>

            <Button variant="danger" className="d-flex align-items-center gap-2"
              style={{ fontWeight: 500, fontSize: "15px" }}
              onClick={() => setShowConfirm(true)}>
              <FaTrash size={12} /> Delete
            </Button>
          </div>
        </div>

        {/* Staff Details Header with Image */}
        <div className="text-center mb-4">
          <Image
            src={imageUrl}
            alt={data.name}
            roundedCircle
            width={130}
            height={130}
            className="mb-3"
            style={{ border: "3px solid #18575A", objectFit: "cover" }}
            onError={(e: any) => { 
              e.target.src = defaultProfile; 
            }}
          />

          <h5 className="fw-bold mb-1">{data.name}</h5>
          <p className="small mb-0 fw-bold" style={{ color: "#18575A" }}>
            Staff ID: {data.staffUserId}
          </p>
          <p className="small text-danger fst-italic">
            Last Login: {formatDate(data.lastLogin)}
          </p>
          <div className="mt-2">{renderStarRating(data.starRating || 0)}</div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <Table bordered hover responsive className="align-middle mb-0" style={{ fontSize: "14px" }}>
            <tbody>
              {fields.map(({ key, label, icon, isBoolean }) => {
                let value: any = (data as any)[key];

                if (isBoolean) {
                  value = value ? (
                    <span className="badge bg-success">Yes</span>
                  ) : (
                    <span className="badge bg-secondary">No</span>
                  );
                }

                return (
                  <tr key={key} style={{ lineHeight: "1.2" }}>
                    <td style={{ width: "40%", fontWeight: 600, color: "#18575A", padding: "8px 12px" }}>
                      <i className={`bi ${icon} me-2`}></i>
                      {label}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {value !== null && value !== undefined ? value : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

      </Card>

      {/* Delete Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to mark this staff as deleted?</Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)} disabled={loadingDelete}>
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

export default StaffView;