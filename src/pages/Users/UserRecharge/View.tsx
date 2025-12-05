import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import PurchaseOrderService from "../../../services/Users/UserRecharge.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import { purchaseorder } from "../../../types/Users/UserRecharge.types";

const ViewUserRecharge: React.FC = () => {
    const navigate = useNavigate();
    const { purchaseOrderId } = useParams();

    const [data, setData] = useState<purchaseorder | null>(null);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await PurchaseOrderService.getPurchaseOrderById(purchaseOrderId!);
                if (res) setData(res);
                else toast.error("Recharge order not found.");
            } catch {
                toast.error("Failed to load recharge order details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [purchaseOrderId]);

    if (loading) return <KiduLoader type="recharge order details..." />;

    if (!data)
        return (
            <div className="text-center mt-5">
                <h5>No recharge order details found.</h5>
                <Button className="mt-3" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </div>
        );

    const fields = [
        { key: "purchaseOrderId", label: "Order ID" },
        { key: "purchaseCouponId", label: "Coupon ID" },
        { key: "appUserId", label: "User ID" },
        { key: "amount", label: "Amount" },
        { key: "description", label: "Description" },
        { key: "isSucsess", label: "Success Status", type: "boolean" },
        { key: "isdeleted", label: "Deleted", type: "boolean" },
        { key: "createdAt", label: "Created At", type: "date" },
        { key: "createdAppUserId", label: "Created By User ID" },
        { key: "requestText", label: "Request Text" },
        { key: "responseText", label: "Response Text" },
    ];

    const handleDelete = async () => {
        setLoadingDelete(true);
        try {
            await PurchaseOrderService.deleteOrderById(purchaseOrderId!, data);
            toast.success("Recharge order deleted successfully");
            setTimeout(
                () => navigate("/dashboard/recharge/list"),
                800
            );
        } catch {
            toast.error("Failed to delete recharge order.");
        } finally {
            setLoadingDelete(false);
            setShowConfirm(false);
        }
    };

    const formatValue = (key: string, value: any) => {
        const field = fields.find(f => f.key === key);
        
        if (field?.type === "boolean") {
            return value ? "Yes" : "No";
        }
        
        if (field?.type === "date" && value) {
            return new Date(value).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        return String(value || "-");
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
                    border: "none",
                }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <KiduPrevious />
                        <h5
                            className="fw-bold m-0 ms-2"
                            style={{ color: "#882626ff" }}
                        >
                            Recharge Order Details
                        </h5>
                    </div>

                    <div className="d-flex">
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

                {/* Order Title */}
                <div className="text-center mb-4">
                    <h5 className="fw-bold mb-1">Order ID:{data.purchaseOrderId}</h5>
                    <p
                        className="small mb-0 fw-bold"
                        style={{ color: data.isSucsess ? "#28a745" : "#dc3545" }}
                    >
                        Status: {data.isSucsess ? "Success" : "Failed"}
                    </p>
                </div>

              {/* Table */}
<div className="table-responsive">
  <Table
    bordered
    hover
    responsive
    className="align-middle mb-0"
    style={{ fontFamily: "Urbanist", fontSize: "13px" }}
  >
    <tbody>
      {fields.map(({ key, label }, index) => (
        <tr
          key={key}
          style={{
            lineHeight: "1.2",
            backgroundColor: index % 2 === 1 ? "#ffe8e8" : "",
            cursor: "default"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#ffe6e6";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              index % 2 === 1 ? "#ffe8e8" : "";
          }}
        >
          <td
            style={{
              width: "40%",
              fontWeight: 600,
              color: "#882626ff",
              padding: "8px 6px",
              verticalAlign: "middle"
            }}
          >
            {label}
          </td>

          <td style={{ padding: "8px 6px", verticalAlign: "middle" }}>
            {formatValue(key, data[key as keyof purchaseorder])}
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
                <Modal.Body>Are you sure you want to delete this recharge order?</Modal.Body>
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

export default ViewUserRecharge;