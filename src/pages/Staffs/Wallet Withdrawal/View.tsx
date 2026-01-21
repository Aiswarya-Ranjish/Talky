import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Spinner, Badge, Alert, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash, FaCheck, FaTimes, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaCheckDouble } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import { WalletWithdrawal } from "../../../types/Staff/WalletWithdrawal.type";
import WalletWithdrawalService from "../../../services/Staff/WalletWithdrawal.services";

const WalletWithdrawalView: React.FC = () => {
  const navigate = useNavigate();
  const { walletWithdrawalRequestId } = useParams();

  const [data, setData] = useState<WalletWithdrawal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showConfirmApprove, setShowConfirmApprove] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [showConfirmComplete, setShowConfirmComplete] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingAction, setLoadingAction] = useState<'approve' | 'reject' | 'complete' | null>(null);

  useEffect(() => {
    const loadWithdrawal = async () => {
      try {
        if (!walletWithdrawalRequestId) {
          toast.error("No withdrawal request ID provided");
          navigate("/dashboard/wallet-withdrawal/list");
          return;
        }

        const response = await WalletWithdrawalService.getWithdrawalById(walletWithdrawalRequestId);
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || response?.error || "Failed to load withdrawal request");
        }

        setData(response.value);
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
        setTimeout(() => navigate("/dashboard/wallet-withdrawal/list"), 2000);
      } finally {
        setLoading(false);
      }
    };

    loadWithdrawal();
  }, [walletWithdrawalRequestId, navigate]);

  if (loading) return <KiduLoader type="withdrawal request details..." />;

  if (!data) {
    return (
      <div className="text-center mt-5">
        <h5>No withdrawal request details found.</h5>
        <Button className="mt-3" onClick={() => navigate("/dashboard/wallet-withdrawal/list")}>
          Back to List
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: number) => {
    const style = { fontSize: "12px", minWidth: "100px", display: "inline-block", textAlign: "center" as const };
    if (status === 0) return <Badge bg="warning" style={style}>Pending</Badge>;
    if (status === 1) return <Badge bg="success" style={style}>Approved</Badge>;
    if (status === 2) return <Badge bg="danger" style={style}>Rejected</Badge>;
    if (status === 3) return <Badge bg="info" style={style}>Completed</Badge>;
    return <Badge bg="secondary" style={style}>Unknown</Badge>;
  };

  const formatDate = (value: string | Date) => {
  if (!value) return "N/A";

  const utcDate = new Date(value);
  if (isNaN(utcDate.getTime())) return "Invalid Date";

  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffsetMs);

  const day = String(istDate.getDate()).padStart(2, "0");
  const month = istDate.toLocaleString("en-IN", { month: "long" });
  const year = istDate.getFullYear();
  const time = istDate.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return `${day}-${month}-${year} ${time}`;
};


  const handleStatusUpdate = async (newStatus: number) => {
    const actionMap: any = { 1: "approve", 2: "reject", 3: "complete" };
    setLoadingAction(actionMap[newStatus]);

    setShowConfirmApprove(false);
    setShowConfirmReject(false);
    setShowConfirmComplete(false);

    try {
      // Use the dedicated status update endpoint
      const response = await WalletWithdrawalService.updateWithdrawalStatus(
        data.walletWithdrawalRequestId,
        newStatus
      );

      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to update status");
      }

      // Update local state with new status
      setData(prev => prev ? { ...prev, status: newStatus } : null);

      // Show appropriate success message
      if (newStatus === 1) {
        toast.success(
          `✅ Withdrawal Approved!\n${data.coins} coins (₹${data.amount.toFixed(2)}) have been deducted from the user's wallet.`,
          { duration: 5000 }
        );
      } else if (newStatus === 2) {
        toast.success("❌ Withdrawal request rejected. No coins were deducted.", { duration: 4000 });
      } else if (newStatus === 3) {
        toast.success("✅ Withdrawal marked as completed. Payment has been processed.", { duration: 4000 });
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      const response = await WalletWithdrawalService.deleteWithdrawal(data.walletWithdrawalRequestId.toString());
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to delete withdrawal request");
      }
      toast.success("Withdrawal request deleted successfully");
      setTimeout(() => navigate("/dashboard/wallet-withdrawal/list"), 600);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingDelete(false);
      setShowConfirmDelete(false);
    }
  };

  // Only allow actions based on status
  const canApprove = data.status === 0; // Pending
  const canReject = data.status === 0; // Pending
  const canComplete = data.status === 1; // Approved
  const canDelete = data.status === 0 || data.status === 2; // Pending or Rejected

  const rate = data.coins > 0 ? (data.amount / data.coins).toFixed(2) : "0.00";

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Withdrawal Request Details</h5>
          </div>
        </div>

        {/* Warning Alert for Pending Status */}
        {data.status === 0 && (
          <Alert variant="warning" className="d-flex align-items-center">
            <FaInfoCircle className="me-2" size={20} />
            <div>
              <strong>Action Required:</strong> Approving this request will deduct{" "}
              <strong>{data.coins} coins</strong> (₹{data.amount.toFixed(2)}) from the user's wallet balance.
              This action cannot be undone.
            </div>
          </Alert>
        )}

        {/* Success Alert for Approved Status */}
        {data.status === 1 && (
          <Alert variant="success" className="d-flex align-items-center">
            <FaCheckCircle className="me-2" size={20} />
            <div>
              <strong>Approved:</strong> {data.coins} coins (₹{data.amount.toFixed(2)}) have been deducted from the user's wallet.
              Please mark as complete once the payment is processed.
            </div>
          </Alert>
        )}

        {/* Info Alert for Rejected Status */}
        {data.status === 2 && (
          <Alert variant="danger" className="d-flex align-items-center">
            <FaTimes className="me-2" size={20} />
            <div>
              <strong>Rejected:</strong> This withdrawal request was rejected. No coins were deducted.
            </div>
          </Alert>
        )}

        {/* Info Alert for Completed Status */}
        {data.status === 3 && (
          <Alert variant="info" className="d-flex align-items-center">
            <FaCheckDouble className="me-2" size={20} />
            <div>
              <strong>Completed:</strong> This withdrawal has been processed and payment has been sent to the user.
            </div>
          </Alert>
        )}

        {/* Withdrawal Details */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h6 className="fw-bold mb-3" style={{ color: "#882626ff" }}>Request Information</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: "40%" }}>Status:</td>
                      <td>{getStatusBadge(data.status)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Request ID:</td>
                      <td className="fw-bold">#{data.walletWithdrawalRequestId}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">User ID:</td>
                      <td>{data.appUserId} ({data.appUserName})</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Created At:</td>
                      <td>{formatDate(data.createdAt)}</td>
                    </tr>
                   
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h6 className="fw-bold mb-3" style={{ color: "#882626ff" }}>Withdrawal Amount</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td className="text-muted" style={{ width: "40%" }}>Coins:</td>
                      <td className="fw-bold fs-5">{data.coins} 🪙</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Amount:</td>
                      <td className="fw-bold fs-5 text-success">₹{data.amount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="text-muted">Rate:</td>
                      <td className="text-muted small">1 coin = ₹{rate}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        <div className="d-flex justify-content-end gap-2 mb-4">
          {canApprove && (
            <Button
              variant="success"
              onClick={() => setShowConfirmApprove(true)}
              disabled={loadingAction === 'approve'}
            >
              {loadingAction === 'approve' ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Approving...
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  Approve & Deduct Coins
                </>
              )}
            </Button>
          )}

          {canReject && (
            <Button
              variant="danger"
              onClick={() => setShowConfirmReject(true)}
              disabled={loadingAction === 'reject'}
            >
              {loadingAction === 'reject' ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Rejecting...
                </>
              ) : (
                <>
                  <FaTimes className="me-2" />
                  Reject
                </>
              )}
            </Button>
          )}

          {canComplete && (
            <Button
              variant="info"
              onClick={() => setShowConfirmComplete(true)}
              disabled={loadingAction === 'complete'}
            >
              {loadingAction === 'complete' ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Completing...
                </>
              ) : (
                <>
                  <FaCheckDouble className="me-2" />
                  Mark as Complete
                </>
              )}
            </Button>
          )}

          {canDelete && (
            <Button
              variant="outline-danger"
              onClick={() => setShowConfirmDelete(true)}
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
                  Delete
                </>
              )}
            </Button>
          )}
        </div>

        {/* Audit Logs */}
        <KiduAuditLogs 
          tableName="WalletWithdrawalRequest" 
          recordId={data.walletWithdrawalRequestId.toString()} 
        />

        {/* Confirmation Modals */}
        
        {/* Approve Modal */}
        <Modal show={showConfirmApprove} onHide={() => setShowConfirmApprove(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Approval</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <FaExclamationTriangle size={50} className="text-warning mb-3" />
              <h5>Are you sure you want to approve this withdrawal?</h5>
              <p className="text-muted mt-3">
                This action will immediately deduct:
              </p>
              <div className="bg-light p-3 rounded mb-3">
                <h4 className="mb-0">{data.coins} coins</h4>
                <p className="mb-0 text-success fw-bold">₹{data.amount.toFixed(2)}</p>
                <small className="text-muted">From user: {data.appUserName}</small>
              </div>
              <p className="text-danger small">
                <strong>Warning:</strong> This action cannot be undone. The coins will be permanently removed from the user's wallet balance.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmApprove(false)}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={() => handleStatusUpdate(1)}
              disabled={loadingAction === 'approve'}
            >
              {loadingAction === 'approve' ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheck className="me-2" />
                  Yes, Approve & Deduct
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Reject Modal */}
        <Modal show={showConfirmReject} onHide={() => setShowConfirmReject(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Rejection</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <FaTimes size={50} className="text-danger mb-3" />
              <h5>Are you sure you want to reject this withdrawal?</h5>
              <p className="text-muted mt-3">
                No coins will be deducted from the user's wallet.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmReject(false)}>
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={() => handleStatusUpdate(2)}
              disabled={loadingAction === 'reject'}
            >
              {loadingAction === 'reject' ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaTimes className="me-2" />
                  Yes, Reject
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Complete Modal */}
        <Modal show={showConfirmComplete} onHide={() => setShowConfirmComplete(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Completion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <FaCheckDouble size={50} className="text-info mb-3" />
              <h5>Mark this withdrawal as complete?</h5>
              <p className="text-muted mt-3">
                Confirm that the payment has been successfully processed and sent to:
              </p>
              <div className="bg-light p-3 rounded mb-3">
                <h6 className="mb-1 fw-bold">{data.appUserName}</h6>
                <p className="mb-0 text-success fw-bold">₹{data.amount.toFixed(2)}</p>
                <small className="text-muted">{data.coins} coins</small>
              </div>
              <p className="text-info small">
                <strong>Note:</strong> This will mark the withdrawal as completed. Make sure the payment has been sent before confirming.
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmComplete(false)}>
              Cancel
            </Button>
            <Button 
              variant="info" 
              onClick={() => handleStatusUpdate(3)}
              disabled={loadingAction === 'complete'}
            >
              {loadingAction === 'complete' ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Processing...
                </>
              ) : (
                <>
                  <FaCheckDouble className="me-2" />
                  Yes, Mark Complete
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Delete Modal */}
        <Modal show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              <FaTrash size={50} className="text-danger mb-3" />
              <h5>Are you sure you want to delete this withdrawal request?</h5>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
              {loadingDelete ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
                  Yes, Delete
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card>

      <Toaster position="top-right" />
    </div>
  );
};

export default WalletWithdrawalView;