import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import FinancialYearService from "../../../services/settings/financial.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduAuditLogs from "../../../components/KiduAuditLogs";

const FinancialYearView: React.FC = () => {
  const navigate = useNavigate();
  const { financialYearId } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const loadFinancialYear = async () => {
      try {
        if (!financialYearId) {
          toast.error("No financial year ID provided");
          navigate("/dashboard/settings/financial-year");
          return;
        }

        const response = await FinancialYearService.getFinancialYearById(financialYearId);
        
        // ✅ FIX 1: Check response structure properly
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || response?.error || "Failed to load financial year");
        }

        // ✅ FIX 2: Extract data from response.value
        setData(response.value);
      } catch (error: any) {
        console.error("Failed to load financial year:", error);
        toast.error(`Error: ${error.message}`);
        navigate("/dashboard/settings/financial-year");
      } finally {
        setLoading(false);
      }
    };
    loadFinancialYear();
  }, [financialYearId, navigate]);

  if (loading) return <KiduLoader type="financial year details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No financial year details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );

  const fields = [
    { key: "financialYearId", label: "Financial Year ID", icon: "bi-hash" },
    { key: "finacialYearCode", label: "Financial Year Code", icon: "bi-code-square" },
    { key: "startDate", label: "Start Date", icon: "bi-calendar-check" },
    { key: "endDate", label: "End Date", icon: "bi-calendar-x" },
    { key: "isCurrent", label: "Is Current", icon: "bi-circle-fill", isBoolean: true },
    { key: "isClosed", label: "Is Closed", icon: "bi-lock", isBoolean: true }
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

  const handleEdit = () => navigate(`/dashboard/settings/edit-financial-year/${data.financialYearId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      // ✅ FIX 3: Use correct delete method signature
      const response = await FinancialYearService.deleteFinanceById(String(data.financialYearId ?? ""));
      
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to delete financial year");
      }

      toast.success("Financial Year deleted successfully");
      setTimeout(() => navigate("/dashboard/settings/financial-year"), 600);
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
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Financial Year Details</h5>
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

        {/* Financial Year Info */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">Financial Year ID: {data.financialYearId || "Unknown"}</h5>
          <p className="small mb-0 fw-bold" style={{ color: "#882626ff" }}>
            Code: {data.finacialYearCode}
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
                } else if (key === "startDate" || key === "endDate") {
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
        <KiduAuditLogs tableName="FinancialYear" recordId={data.financialYearId ?? ""} />

      </Card>

      {/* DELETE MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this financial year?</Modal.Body>
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

export default FinancialYearView;