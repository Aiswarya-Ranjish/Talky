import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import FinancialYearService from "../../../services/settings/financial.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduLoader from "../../../components/KiduLoader";

//import FinancialYearService from "services/FinancialYearService";
//import KiduLoader from "components/KiduLoader";
//import KiduPrevious from "components/KiduPrevious";

const FinancialYearView: React.FC = () => {
  const navigate = useNavigate();
  const { financialYearId } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await FinancialYearService.getFinancialYearById(String(financialYearId));
        setData(res);
      } catch {
        toast.error("Failed to load financial year details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [financialYearId]);

  if (loading) return <KiduLoader type="Financial year details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No financial year details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    );

  const fields = [
    { key: "financialYearId", label: "Financial Year ID" },
    { key: "finacialYearCode", label: "Financial Year Code" },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    { key: "isCurrent", label: "Is Current" },
    { key: "isClosed", label: "Is Closed" }
  ];

  // DELETE ACTION
  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      await FinancialYearService.deleteFinanceById(String(data.financialYearId), data);

      toast.success("Financial Year deleted successfully");
      setTimeout(() => navigate("/dashboard/settings/financial-year"), 800);

    } catch {
      toast.error("Failed to delete financial year.");
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
              Financial Year Details
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

        {/* Title Section */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">Financial Year #{data.financialYearId}</h5>
          <p className="small mb-0 fw-bold text-danger">
            Code: {data.finacialYearCode}
          </p>
        </div>

        {/* Details Table */}
        <div className="table-responsive">
          <Table bordered hover responsive className="align-middle mb-0">
            <tbody>
              {fields.map(({ key, label }) => (
                <tr key={key}>
                  <td style={{ width: "40%", fontWeight: 600, color: "#18575A" }}>
                    {label}
                  </td>
                  <td>
                    {key === "startDate" || key === "endDate"
                      ? formatDate(data[key])
                      : key === "isCurrent" || key === "isClosed"
                      ? data[key] ? "Yes" : "No"
                      : data[key]}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete this financial year?
        </Modal.Body>

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

export default FinancialYearView;
