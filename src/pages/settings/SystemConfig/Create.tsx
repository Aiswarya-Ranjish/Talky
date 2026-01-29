// src/pages/settings/systemConfig/SystemConfigCreate.tsx

import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import KiduValidation from "../../../components/KiduValidation";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import systemconfigService from "../../../services/settings/SystemConfig.services";
import type { CompanyLookup } from "../../../types/settings/Company.types";
import type { systemconfig } from "../../../types/settings/SystemConfig";

type ErrorState = Record<string, string>;

const SystemConfigCreate: React.FC = () => {
  const navigate = useNavigate();

  // ✅ All fields including rewardCoins
  const fields = [
    { name: "currentCompanyId", rules: { required: true, type: "select" as const, label: "Company" } },
    { name: "intCurrentFinancialYear", rules: { required: true, type: "text" as const, label: "Financial Year" } },
    { name: "staff_To_User_Rate_Per_Second", rules: { required: true, type: "number" as const, label: "Staff to User Coins per Second" } },
    { name: "rewardCoins", rules: { required: true, type: "number" as const, label: "Reward Coins" } },
    { name: "one_paisa_to_coin_rate", rules: { required: true, type: "number" as const, label: "1 Paisa to Coin Rate" } },
    { name: "minimumWithdrawalCoins", rules: { required: true, type: "number" as const, label: "Minimum Withdrawal Coins" } },
  ];

  const initialValues: Partial<systemconfig> = {
    currentCompanyId: "",
    intCurrentFinancialYear: "",
    staff_To_User_Rate_Per_Second: 0,
    rewardCoins: 0, // ✅ Added
    one_paisa_to_coin_rate: 0,
    minimumWithdrawalCoins: 0,
    isActive: true,
  };

  const initialErrors: ErrorState = {};
  fields.forEach((f) => {
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState<systemconfig>({
    appMasterSettingId: 0,
    ...initialValues,
  } as systemconfig);

  const [companyList, setCompanyList] = useState<CompanyLookup[]>([]);
  const [errors, setErrors] = useState<ErrorState>(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load company lookup
  useEffect(() => {
    const getCompanyLookup = async () => {
      try {
        const companies = await systemconfigService.getCompanyIds();
        setCompanyList(companies);
      } catch {
        toast.error("Failed to load company list");
      }
    };
    getCompanyLookup();
  }, []);

  const getLabel = (name: string) => {
    const field = fields.find((f) => f.name === name);
    return (
      <>
        {field?.rules.label}
        {field?.rules.required && <span className="text-danger ms-1">*</span>}
      </>
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type } = e.target;
    let value: any = e.target.value;

    if (type === "checkbox") {
      value = (e.target as HTMLInputElement).checked;
    } else if (type === "number") {
      value = value === "" ? 0 : Number(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find((f) => f.name === name);
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
    fields.forEach((f) => {
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

      const response = await systemconfigService.CreateSystemconfig(payload);

      if (!response?.isSucess) {
        throw new Error(response?.customMessage || "Failed to create configuration");
      }

      toast.success("System configuration created successfully!");
      setTimeout(() => navigate("/dashboard/settings/systemconfig-list"), 1200);

    } catch (error: any) {
      toast.error(error.message || "Error creating configuration");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5">
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1100px" }}>
          <div className="d-flex align-items-center mb-4">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>
              Create System Configuration
            </h5>
          </div>

          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3">

                {/* Company Selection */}
                <Col md={6}>
                  <Form.Label>{getLabel("currentCompanyId")}</Form.Label>
                  <Form.Select
                    name="currentCompanyId"
                    value={formData.currentCompanyId}
                    onChange={handleChange}
                    onBlur={() => validateField("currentCompanyId", formData.currentCompanyId)}
                  >
                    <option value="">-- Select Company --</option>
                    {companyList.map((c) => (
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
                    placeholder="Enter rate"
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
                    placeholder="Enter coin rate"
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
                  initialValues={initialValues} 
                  setFormData={setFormData} 
                  setErrors={setErrors} 
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  style={{ backgroundColor: "#882626ff", border: "none" }}
                >
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Toaster position="top-right" />
      </div>
    </>
  );
};

export default SystemConfigCreate;