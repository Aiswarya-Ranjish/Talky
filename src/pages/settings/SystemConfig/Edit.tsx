// src/pages/settings/systemConfig/SystemConfigEdit.tsx

import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import SystemConfigService from "../../../services/settings/SystemConfig.services";
import KiduValidation from "../../../components/KiduValidation";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import type { CompanyLookup } from "../../../types/settings/Company.types";
import type { systemconfig } from "../../../types/settings/SystemConfig";

const SystemConfigEdit: React.FC = () => {
  const navigate = useNavigate();
  const { appMasterSettingId } = useParams<{ appMasterSettingId: string }>();

  // ✅ All fields including rewardCoins
  const fields = [
    { name: "currentCompanyId", rules: { required: true, type: "select" as const, label: "Company" } },
    { name: "intCurrentFinancialYear", rules: { required: true, type: "text" as const, label: "Financial Year" } },
    { name: "staff_To_User_Rate_Per_Second", rules: { required: true, type: "number" as const, label: "Staff to User Coins per Second" } },
    { name: "rewardCoins", rules: { required: true, type: "number" as const, label: "Reward Coins" } },
    { name: "one_paisa_to_coin_rate", rules: { required: true, type: "number" as const, label: "1 Paisa to Coin Rate" } },
    { name: "minimumWithdrawalCoins", rules: { required: true, type: "number" as const, label: "Minimum Withdrawal Coins" } },
  ];

  const initialErrors: Record<string, string> = {};
  fields.forEach(f => {
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState<systemconfig>({
    appMasterSettingId: 0,
    currentCompanyId: "",
    intCurrentFinancialYear: "",
    staff_To_User_Rate_Per_Second: 0,
    rewardCoins: 0, // ✅ Added
    one_paisa_to_coin_rate: 0,
    minimumWithdrawalCoins: 0,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>(initialErrors);
  const [companyList, setCompanyList] = useState<CompanyLookup[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<systemconfig | null>(null);

  const getLabel = (name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return "";
    return (
      <>
        {field.rules.label}
        {field.rules.required && <span className="text-danger ms-1">*</span>}
      </>
    );
  };

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companies = await SystemConfigService.getCompanyIds();
        setCompanyList(companies);
      } catch {
        toast.error("Failed to load company list");
      }
    };
    loadCompanies();
  }, []);

  // Load system config by ID
  useEffect(() => {
    const fetchSystemConfig = async () => {
      if (!appMasterSettingId) {
        toast.error("No ID provided");
        navigate("/dashboard/settings/systemconfig-list");
        return;
      }
      try {
        setLoading(true);
        const response = await SystemConfigService.getAppmasterSetting();
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || "Failed to load system configuration");
        }

        const data = response.value.find(
          (item: systemconfig) => String(item.appMasterSettingId) === appMasterSettingId
        );
        
        if (!data) throw new Error("System configuration not found");

        // ✅ Ensure all fields are populated including rewardCoins
        const loadedData: systemconfig = {
          appMasterSettingId: data.appMasterSettingId || 0,
          currentCompanyId: data.currentCompanyId || "",
          intCurrentFinancialYear: data.intCurrentFinancialYear || "",
          staff_To_User_Rate_Per_Second: data.staff_To_User_Rate_Per_Second || 0,
          rewardCoins: data.rewardCoins || 0, // ✅ Added
          one_paisa_to_coin_rate: data.one_paisa_to_coin_rate || 0,
          minimumWithdrawalCoins: data.minimumWithdrawalCoins || 0,
          isActive: data.isActive ?? true,
        };

        setFormData(loadedData);
        setInitialData(loadedData);
      } catch (error: any) {
        toast.error(error.message || "Error loading system configuration");
        navigate("/dashboard/settings/systemconfig-list");
      } finally {
        setLoading(false);
      }
    };
    fetchSystemConfig();
  }, [appMasterSettingId, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let updatedValue: any = value;

    if (type === "checkbox") {
      updatedValue = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      updatedValue = value === "" ? 0 : Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;

    const result = KiduValidation.validate(value, field.rules);
    if (!result.isValid) {
      setErrors((prev) => ({ 
        ...prev, 
        [name]: `${field.rules.label} is required.` 
      }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
    return true;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach(f => {
      if (!validateField(f.name, formData[f.name as keyof systemconfig])) {
        ok = false;
      }
    });
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: systemconfig = {
        ...formData,
        staff_To_User_Rate_Per_Second: Number(formData.staff_To_User_Rate_Per_Second),
        rewardCoins: Number(formData.rewardCoins), // ✅ Added
        one_paisa_to_coin_rate: Number(formData.one_paisa_to_coin_rate),
        minimumWithdrawalCoins: Number(formData.minimumWithdrawalCoins),
      };

      const response = await SystemConfigService.updateSystemconfig(payload);
      
      if (!response?.isSucess) {
        throw new Error(response?.customMessage || "Failed to update system configuration");
      }

      toast.success("System configuration updated successfully!");
      setTimeout(() => navigate("/dashboard/settings/systemconfig-list"), 1500);
    } catch (error: any) {
      toast.error(error.message || "Error updating system configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <KiduLoader type="System Config..." />;

  return (
    <div className="container d-flex justify-content-center mt-5">
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1100px" }}>
        <div className="d-flex align-items-center mb-4">
          <KiduPrevious />
          <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>
            Edit System Configuration
          </h5>
        </div>

        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              
              {/* Company */}
              <Col md={6}>
                <Form.Label>{getLabel("currentCompanyId")}</Form.Label>
                <Form.Select
                  name="currentCompanyId"
                  value={formData.currentCompanyId}
                  onChange={handleChange}
                  onBlur={() => validateField("currentCompanyId", formData.currentCompanyId)}
                >
                  <option value="">-- Select Company --</option>
                  {companyList.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.text}
                    </option>
                  ))}
                </Form.Select>
                {errors.currentCompanyId && (
                  <small className="text-danger">{errors.currentCompanyId}</small>
                )}
              </Col>

              {/* Financial Year */}
              <Col md={6}>
                <Form.Label>{getLabel("intCurrentFinancialYear")}</Form.Label>
                <Form.Control
                  type="text"
                  name="intCurrentFinancialYear"
                  value={formData.intCurrentFinancialYear}
                  onChange={handleChange}
                  onBlur={() => validateField("intCurrentFinancialYear", formData.intCurrentFinancialYear)}
                  placeholder="e.g., 2024-2025"
                />
                {errors.intCurrentFinancialYear && (
                  <small className="text-danger">{errors.intCurrentFinancialYear}</small>
                )}
              </Col>

              {/* Staff Rate */}
              <Col md={6}>
                <Form.Label>{getLabel("staff_To_User_Rate_Per_Second")}</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="staff_To_User_Rate_Per_Second"
                  value={formData.staff_To_User_Rate_Per_Second}
                  onChange={handleChange}
                  onBlur={() => validateField("staff_To_User_Rate_Per_Second", formData.staff_To_User_Rate_Per_Second)}
                />
                {errors.staff_To_User_Rate_Per_Second && (
                  <small className="text-danger">{errors.staff_To_User_Rate_Per_Second}</small>
                )}
              </Col>

              {/* ✅ Reward Coins - ADDED */}
              <Col md={6}>
                <Form.Label>{getLabel("rewardCoins")}</Form.Label>
                <Form.Control
                  type="number"
                  name="rewardCoins"
                  value={formData.rewardCoins}
                  onChange={handleChange}
                  onBlur={() => validateField("rewardCoins", formData.rewardCoins)}
                  placeholder="Enter reward coins"
                />
                {errors.rewardCoins && (
                  <small className="text-danger">{errors.rewardCoins}</small>
                )}
              </Col>

              {/* Coin Rate */}
              <Col md={6}>
                <Form.Label>{getLabel("one_paisa_to_coin_rate")}</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="one_paisa_to_coin_rate"
                  value={formData.one_paisa_to_coin_rate}
                  onChange={handleChange}
                  onBlur={() => validateField("one_paisa_to_coin_rate", formData.one_paisa_to_coin_rate)}
                />
                {errors.one_paisa_to_coin_rate && (
                  <small className="text-danger">{errors.one_paisa_to_coin_rate}</small>
                )}
              </Col>

              {/* Minimum Withdrawal Coins */}
              <Col md={6}>
                <Form.Label>{getLabel("minimumWithdrawalCoins")}</Form.Label>
                <Form.Control
                  type="number"
                  name="minimumWithdrawalCoins"
                  value={formData.minimumWithdrawalCoins}
                  onChange={handleChange}
                  onBlur={() => validateField("minimumWithdrawalCoins", formData.minimumWithdrawalCoins)}
                  placeholder="Enter minimum coins"
                />
                {errors.minimumWithdrawalCoins && (
                  <small className="text-danger">{errors.minimumWithdrawalCoins}</small>
                )}
              </Col>

              {/* Active Switch */}
              <Col md={12} className="d-flex align-items-center">
                <Form.Check
                  type="switch"
                  id="isActive"
                  label="Is Active"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              </Col>

            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <KiduReset 
                initialValues={initialData} 
                setFormData={setFormData} 
                setErrors={setErrors} 
              />
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                style={{ backgroundColor: "#882626ff", border: "none" }}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </Button>
            </div>
          </Form>

          {formData.appMasterSettingId > 0 && (
            <div className="mt-4">
              <KiduAuditLogs 
                tableName="AppMasterSetting" 
                recordId={formData.appMasterSettingId} 
              />
            </div>
          )}
        </Card.Body>
      </Card>

      <Toaster position="top-right" />
    </div>
  );
};

export default SystemConfigEdit;