import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import PurchaseCouponService from "../../../services/PurchaseCoupon.Services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";

const PurchaseCouponView: React.FC = () => {
  const navigate = useNavigate();
  const { purchaseCouponId } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await PurchaseCouponService.getCouponsById(String(purchaseCouponId));
        setData(res);
      } catch {
        toast.error("Failed to load coupon details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [purchaseCouponId]);

  if (loading) return <KiduLoader type="Coupon details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No purchase coupon details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  const fields = [
    { key: "purchaseCouponId", label: "Coupon ID" },
    { key: "coins", label: "Coins" },
    { key: "amount", label: "Amount" },
    { key: "pastAmount", label: "Past Amount" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Created Date" },
    { key: "createdAppUserId", label: "Created By User ID" }
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const handleEdit = () =>
    navigate(`/dashboard/settings/edit-purchasecoupon/${data.purchaseCouponId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await PurchaseCouponService.deleteCouponById(
        String(data.purchaseCouponId),
        data
      );
      toast.success("Coupon deleted successfully");
      setTimeout(() => navigate("/dashboard/settings/purchase-coupon-list"), 800);
    } catch {
      toast.error("Failed to delete coupon.");
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
        style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#18575A" }}>
              Purchase Coupon Details
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

        {/* Coupon Info */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">Coupon #{data.purchaseCouponId}</h5>
          <p className="small mb-0 fw-bold text-danger">
            Coins: {data.coins}
          </p>
        </div>

        {/* Details Table */}
        <div className="table-responsive">
          <Table bordered hover responsive className="align-middle mb-0">
            <tbody>
              {fields.map(({ key, label }) => (
                <tr key={key}>
                  <td
                    style={{ width: "40%", fontWeight: 600, color: "#18575A" }}
                  >
                    {label}
                  </td>
                  <td>
                    {key === "createdAt"
                      ? formatDate(data[key])
                      : String(data[key])}
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
        <Modal.Body>Are you sure you want to delete this coupon?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
            {loadingDelete ? (<><Spinner animation="border" size="sm" className="me-2" />Deleting...</>) : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Toaster position="top-right" />
    </div>
  );
};

export default PurchaseCouponView;
