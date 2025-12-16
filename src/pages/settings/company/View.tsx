import React, { useState, useEffect } from "react";
import { Card, Table, Image, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import CompanyService from "../../../services/settings/Company.services";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import defaultLogo from "../../../assets/Images/company.png";

const CompanyView: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        if (!companyId) {
          toast.error("No company ID provided");
          navigate("/dashboard/settings/company-list");
          return;
        }

        const response = await CompanyService.getCompanyById(companyId);
        
        // ✅ Check if response is successful
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || response?.error || "Failed to load company");
        }

        // ✅ Extract data from response.value
        setData(response.value);
      } catch (error: any) {
        console.error("Failed to load company:", error);
        toast.error(`Error loading company: ${error.message}`);
        navigate("/dashboard/settings/company-list");
      } finally {
        setLoading(false);
      }
    };
    loadCompany();
  }, [companyId, navigate]);

  if (loading) return <KiduLoader type="company details..." />;

  if (!data)
    return (
      <div className="text-center mt-5">
        <h5>No company details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Back</Button>
      </div>
    );

  const fields = [
    { key: "comapanyName", label: "Company Name", icon: "bi-building" },
    { key: "website", label: "Website", icon: "bi-globe" },
    { key: "email", label: "Email", icon: "bi-envelope" },
    { key: "contactNumber", label: "Contact Number", icon: "bi-telephone-fill" },
    { key: "taxNumber", label: "Tax Number", icon: "bi-receipt" },
    { key: "addressLine1", label: "Address Line 1", icon: "bi-geo-alt-fill" },
    { key: "addressLine2", label: "Address Line 2", icon: "bi-geo-alt" },
    { key: "city", label: "City", icon: "bi-pin-map-fill" },
    { key: "state", label: "State", icon: "bi-map" },
    { key: "country", label: "Country", icon: "bi-flag" },
    { key: "zipCode", label: "Zip Code", icon: "bi-mailbox" },
    { key: "invoicePrefix", label: "Invoice Prefix", icon: "bi-file-earmark-text" },
    { key: "isActive", label: "Is Active", icon: "bi-check-circle", isBoolean: true },
    { key: "isDeleted", label: "Is Deleted", icon: "bi-trash", isBoolean: true }
  ];

  const imageUrl = data.companyLogo
    ? getFullImageUrl(data.companyLogo)
    : defaultLogo;

  const handleEdit = () => navigate(`/dashboard/settings/edit-company/${data.companyId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      // ✅ Call delete service with correct parameters
      const response = await CompanyService.deleteCompanyById(String(data.companyId ?? ""));
      
      // ✅ Check if response is successful
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to delete company");
      }

      toast.success("Company deleted successfully");
      setTimeout(() => navigate("/dashboard/settings/company-list"), 600);
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Error deleting company: ${error.message}`);
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
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Company Details</h5>
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

        {/* Company Logo */}
        <div className="text-center mb-4">
          <Image
            src={imageUrl}
            alt={data.comapanyName}
            roundedCircle
            width={120}
            height={120}
            className="mb-3"
            style={{ border: "3px solid #882626ff", objectFit: "cover" }}
            onError={(e: any) => { e.target.src = defaultLogo; }}
          />
          <h5 className="fw-bold mb-1">{data.comapanyName || "Unknown Company"}</h5>
          <p className="small mb-0 fw-bold" style={{ color: "#882626ff" }}>
            Company ID: {data.companyId}
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
                      {value !== null && value !== undefined && value !== "" ? value : "N/A"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* AUDIT LOGS */}
        {data.companyId && (
          <KiduAuditLogs tableName="Company" recordId={data.companyId.toString()} />
        )}

      </Card>

      {/* DELETE MODAL */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirm Delete</Modal.Title></Modal.Header>
        <Modal.Body>Are you sure you want to delete this company?</Modal.Body>
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

export default CompanyView;