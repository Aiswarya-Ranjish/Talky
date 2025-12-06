import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import PurchaseCouponService from "../../../services/PurchaseCoupon.Services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduAuditLogs from "../../../components/KiduAuditLogs";

const PurchaseCouponView: React.FC = () => {
  const navigate = useNavigate();
  const { purchaseCouponId } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const loadCoupon = async () => {
      try {
        const res = await PurchaseCouponService.getCouponsById(purchaseCouponId!);
        setData(res);
      } catch {
        toast.error("Failed to load coupon details.");
        navigate("/dashboard/settings/purchase-coupon-list");
      } finally {
        setLoading(false);
      }
    };
    loadCoupon();
  }, [purchaseCouponId]);

  if (loading) return <KiduLoader type="coupon details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No coupon details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );

  const fields = [
    { key: "purchaseCouponId", label: "Coupon ID", icon: "bi-hash" },
    { key: "coins", label: "Coins", icon: "bi-coin" },
    { key: "amount", label: "Amount", icon: "bi-currency-dollar" },
    { key: "pastAmount", label: "Past Amount", icon: "bi-cash-stack" },
    { key: "description", label: "Description", icon: "bi-file-text" },
    { key: "createdAt", label: "Created Date", icon: "bi-calendar-check" },
    { key: "createdAppUserId", label: "Created By User ID", icon: "bi-person-badge" },
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
      const time = date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      return `${day}-${month}-${year}  ${time}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const handleEdit = () => navigate(`/dashboard/settings/edit-purchasecoupon/${data.purchaseCouponId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await PurchaseCouponService.deleteCouponById(String(data.purchaseCouponId ?? ""), data);
      toast.success("Coupon deleted successfully");
      setTimeout(() => navigate("/dashboard/settings/purchase-coupon-list"), 600);
    } catch {
      toast.error("Failed to delete coupon.");
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
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Purchase Coupon Details</h5>
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

        {/* Coupon Info */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">Coupon ID:{data.purchaseCouponId || "Unknown"}</h5>
          <p className="small mb-0 fw-bold" style={{ color: "#882626ff" }}>
            Coins: {data.coins} | Amount: ₹{data.amount}
          </p>
        </div>

        {/* DETAILS TABLE (MATCHES COMPANYVIEW STYLE) */}
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
        <KiduAuditLogs tableName="PurchaseCoupon" recordId={data.purchaseCouponId ?? ""} />

      </Card>

      {/* DELETE MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this coupon?</Modal.Body>
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

export default PurchaseCouponView;