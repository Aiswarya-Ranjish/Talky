import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import KiduValidation from "../../../components/KiduValidation";
import { FinancialYear } from "../../../types/settings/Financial.type";
import FinancialYearService from "../../../services/settings/financial.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";

const FinancialYearCreate: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    { name: "finacialYearCode", rules: { required: true, type: "text" as const, label: "Financial Year Code" } },
    { name: "startDate", rules: { required: true, type: "date" as const, label: "Start Date" } },
    { name: "endDate", rules: { required: true, type: "date" as const, label: "End Date" } },
  ];

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach(f => {
    initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState<FinancialYear>({
    ...initialValues,
    financialYearId: 0,
    startDate: "",
    endDate: "",
    isCurrent: false,
    isClosed: false,
  });

  const [errors, setErrors] = useState(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData] = useState({
    ...initialValues,
    financialYearId: 0,
    startDate: "",
    endDate: "",
    isCurrent: false,
    isClosed: false,
  });

  const getLabel = (name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return "";
    return (
      <>
        {field.rules.label}
        {field.rules.required && <span style={{ color: "red", marginLeft: "2px" }}>*</span>}
      </>
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    let updatedValue: any = value;
    if (type === "checkbox") {
      updatedValue = target.checked;
    }

    setFormData((prev: any) => ({ ...prev, [name]: updatedValue }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const overrideMessage = (name: string) => {
    const field = fields.find(f => f.name === name);
    const label = field?.rules.label || "This field";
    return `${label} is required.`;
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    const result = KiduValidation.validate(value, field.rules);
    if (!result.isValid) {
      const msg = overrideMessage(name);
      setErrors((prev: any) => ({ ...prev, [name]: msg }));
      return false;
    }
    setErrors((prev: any) => ({ ...prev, [name]: "" }));
    return true;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach(f => {
      if (!validateField(f.name, formData[f.name as keyof FinancialYear])) ok = false;
    });

    // Custom: startDate < endDate
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      setErrors((prev: any) => ({
        ...prev,
        endDate: "End Date must be after Start Date",
      }));
      ok = false;
    }

    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const dataToCreate = {
        financialYearId: 0,
        finacialYearCode: formData.finacialYearCode || "",
        startDate: formData.startDate || "",
        endDate: formData.endDate || "",
        isCurrent: Boolean(formData.isCurrent),
        isClosed: Boolean(formData.isClosed),
      };

      const createResponse = await FinancialYearService.addFinancialYear(dataToCreate as any);
      if (!createResponse || createResponse.isSucess === false) {
        throw new Error(createResponse?.customMessage || createResponse?.error || "Failed to create financial year");
      }

      toast.success("Financial Year created successfully!");
      setTimeout(() => navigate("/dashboard/settings/financial-year"), 1500);
    } catch (error: any) {
      console.error("Create failed:", error);
      toast.error(`Error creating financial year: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Create Financial Year</h5>
            </div>
          </div>

          <Card.Body style={{ padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col xs={12}>
                  <Row className="g-2">
                    {/* Financial Year Code */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("finacialYearCode")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="finacialYearCode" 
                        value={formData.finacialYearCode}
                        onChange={handleChange} 
                        onBlur={() => validateField("finacialYearCode", formData.finacialYearCode)} 
                        placeholder="Enter Financial Year Code"
                      />
                      {errors.finacialYearCode && <div className="text-danger small">{errors.finacialYearCode}</div>}
                    </Col>

                    {/* Start Date */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("startDate")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="date" 
                        name="startDate" 
                        value={formData.startDate}
                        onChange={handleChange} 
                        onBlur={() => validateField("startDate", formData.startDate)} 
                      />
                      {errors.startDate && <div className="text-danger small">{errors.startDate}</div>}
                    </Col>

                    {/* End Date */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("endDate")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="date" 
                        name="endDate" 
                        value={formData.endDate}
                        onChange={handleChange} 
                        onBlur={() => validateField("endDate", formData.endDate)} 
                      />
                      {errors.endDate && <div className="text-danger small">{errors.endDate}</div>}
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Switches Section */}
              <Row className="mb-3 mx-1">
                <Col xs={12}>
                  <div className="d-flex flex-wrap gap-3">
                    <Form.Check 
                      type="switch" 
                      id="isCurrent" 
                      name="isCurrent" 
                      label="Is Current"
                      checked={formData.isCurrent || false} 
                      onChange={handleChange} 
                      className="fw-semibold" 
                    />
                    <Form.Check 
                      type="switch" 
                      id="isClosed" 
                      name="isClosed" 
                      label="Is Closed"
                      checked={formData.isClosed || false} 
                      onChange={handleChange} 
                      className="fw-semibold" 
                    />
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 me-2">
                <KiduReset initialValues={initialData} setFormData={setFormData} setErrors={setErrors} />
                <Button type="submit" style={{ backgroundColor: "#882626ff", border: "none" }} disabled={isSubmitting}>
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

export default FinancialYearCreate;