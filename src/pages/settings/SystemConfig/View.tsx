// src/pages/settings/systemConfig/SystemConfigView.tsx

import React, { useState, useEffect } from "react";
import { Card, Table, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import SystemConfigService from "../../../services/settings/SystemConfig.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import type { systemconfig } from "../../../types/settings/SystemConfig";

const SystemConfigView: React.FC = () => {
  const navigate = useNavigate();
  const { appMasterSettingId } = useParams<{ appMasterSettingId: string }>();

  const [data, setData] = useState<systemconfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        if (!appMasterSettingId) {
          toast.error("No ID provided");
          navigate("/dashboard/settings/systemconfig-list");
          return;
        }

        const response = await SystemConfigService.getAppmasterSetting();
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || "Failed to load system configuration");
        }

        const config = response.value.find(
          (item: systemconfig) => String(item.appMasterSettingId) === appMasterSettingId
        );
        
        if (!config) throw new Error("System configuration not found");

        setData(config);
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
        navigate("/dashboard/settings/systemconfig-list");
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [appMasterSettingId, navigate]);

  if (loading) return <KiduLoader type="system configuration details..." />;

  if (!data) {
    return (
      <div className="text-center mt-5">
        <h5>No system configuration details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    );
  }

  // ✅ All fields including rewardCoins
  const fields = [
    { key: "appMasterSettingId", label: "Setting ID", icon: "bi-hash" },
    { key: "intCurrentFinancialYear", label: "Financial Year", icon: "bi-calendar" },
    { key: "staff_To_User_Rate_Per_Second", label: "Staff to User Coins / Second", icon: "bi-clock" },
    { key: "rewardCoins", label: "Reward Coins", icon: "bi-gift" }, // ✅ Added with gift icon
    { key: "one_paisa_to_coin_rate", label: "1 Paisa to Coin Rate", icon: "bi-currency-exchange" },
    { key: "minimumWithdrawalCoins", label: "Minimum Withdrawal Coins", icon: "bi-coin" },
    { key: "isActive", label: "Is Active", icon: "bi-check-circle", isBoolean: true },
  ];

  const handleEdit = () => 
    navigate(`/dashboard/settings/edit-systemconfig/${data.appMasterSettingId}`);

  const handleDelete = async () => {
    setLoadingDelete(true);
    try {
      const response = await SystemConfigService.delete(String(data.appMasterSettingId));
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || "Failed to delete system configuration");
      }
      toast.success("System configuration deleted successfully");
      setTimeout(() => navigate("/dashboard/settings/systemconfig-list"), 600);
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
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
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>
              System Configuration Details
            </h5>
          </div>

          <div className="d-flex">
            <Button
              className="d-flex align-items-center gap-2 me-2"
              style={{ backgroundColor: "#882626ff", border: "none", fontWeight: 500 }}
              onClick={handleEdit}
            >
              <FaEdit /> Edit
            </Button>

            <Button
              variant="danger"
              className="d-flex align-items-center gap-2"
              style={{ fontWeight: 500 }}
              onClick={() => setShowConfirm(true)}
            >
              <FaTrash size={12} /> Delete
            </Button>
          </div>
        </div>

        {/* Config Info */}
        <div className="text-center mb-4">
          <h5 className="fw-bold mb-1">Configuration ID: {data.appMasterSettingId}</h5>
          <p className="text-muted small">Financial Year: {data.intCurrentFinancialYear}</p>
        </div>

        {/* Details Table */}
        <div className="table-responsive">
          <Table 
            bordered 
            hover 
            responsive 
            className="align-middle mb-0" 
            style={{ fontFamily: "Urbanist", fontSize: "14px" }}
          >
            <tbody>
              {fields.map(({ key, label, icon, isBoolean }, index) => {
                let value: any = (data as any)[key];
                
                if (isBoolean) {
                  value = value ? "Yes" : "No";
                } else if (value === null || value === undefined || value === "") {
                  value = "N/A";
                }

                return (
                  <tr
                    key={key}
                    style={{ 
                      backgroundColor: index % 2 === 1 ? "#fff5f5" : "white" 
                    }}
                  >
                    <td 
                      style={{ 
                        width: "40%", 
                        padding: "12px", 
                        color: "#882626ff", 
                        fontWeight: 600 
                      }}
                    >
                      <i className={`bi ${icon} me-2`}></i>
                      {label}
                    </td>
                    <td style={{ padding: "12px" }}>{value}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        {/* Audit Logs */}
        {data.appMasterSettingId > 0 && (
          <div className="mt-4">
            <KiduAuditLogs 
              tableName="AppMasterSetting" 
              recordId={data.appMasterSettingId} 
            />
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this system configuration?
          <div className="mt-2 text-danger small">
            This action cannot be undone.
          </div>
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

export default SystemConfigView;