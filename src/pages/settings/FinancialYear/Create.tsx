import React, { useState } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";

import KiduValidation from "../../../components/KiduValidation";
import { FinancialYear } from "../../../types/settings/Financial.type";
import FinancialYearService from "../../../services/settings/financial.services";

// Validation fields
const fields = [
  { name: "finacialYearCode", rules: { required: true, type: "text" as const, label: "Financial Year Code" } },
  { name: "startDate", rules: { required: true, type: "date" as const, label: "Start Date" } },
  { name: "endDate", rules: { required: true, type: "date" as const, label: "End Date" } },
];

// Format date for datetime-local
const formatDateTimeLocal = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

const FinacialYearCreate: React.FC = () => {
  const navigate = useNavigate();

  const [financialyear, setFinancialYear] = useState<FinancialYear>({
    financialYearId: 0,
    finacialYearCode: "",
    startDate: formatDateTimeLocal(new Date()),
    endDate: formatDateTimeLocal(new Date()),
    isCurrent: false,
    isClosed: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Label with "*"
  const getLabel = (name: string) => {
    const field = fields.find((f) => f.name === name);
    if (!field) return "";

    return (
      <>
        {field.rules.label}
        {field.rules.required && <span style={{ color: "red" }}> *</span>}
      </>
    );
  };

  // Handle input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, type, value } = e.target;
  
    // Checkbox Safe Narrowing
    const updatedValue =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;
  
    setFinancialYear((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };
  

  // Validate each field
  const validateField = (name: string, value: any) => {
    const field = fields.find((f) => f.name === name);
    if (!field) return true;

    const validation = KiduValidation.validate(value, field.rules);

    if (!validation.isValid) {
      setErrors((prev) => ({
        ...prev,
        [name]: validation.message || `${field.rules.label} is required.`,
      }));
      return false;
    }
    return true;
  };

  // Validate entire form
  const validateForm = () => {
    let valid = true;

    fields.forEach((f) => {
      if (!validateField(f.name, financialyear[f.name as keyof FinancialYear])) valid = false;
    });

    // Custom: startDate < endDate
    if (new Date(financialyear.startDate!) >= new Date(financialyear.endDate!)) {
      setErrors((prev) => ({
        ...prev,
        endDate: "End Date must be after Start Date",
      }));
      valid = false;
    }

    return valid;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors.");
      return;
    }

    setIsSubmitting(true);

    try {
      await FinancialYearService.addFinancialYear(financialyear);

      toast.success("Financial Year Created Successfully!");
      setTimeout(() => navigate("/dashboard/settings/financial-year"), 800);
    } catch (error) {
      toast.error("Failed to create Financial Year");
      console.error(error);
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="mx-3 mt-4" style={{ backgroundColor: "#f7f7f7" }}>
      <Card.Header
        className="d-flex align-items-center"
        style={{ backgroundColor: "#18575A", color: "white" }}
      >
        <Button size="sm" variant="light" className="me-2" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </Button>
        <h6 className="mb-0">Create Financial Year</h6>
      </Card.Header>

      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            {/* Financial Year Code */}
            <Col md={6}>
              <Form.Group controlId="finacialYearCode">
                <Form.Label>{getLabel("finacialYearCode")}</Form.Label>
                <Form.Control
                  type="text"
                  name="finacialYearCode"
                  value={financialyear.finacialYearCode}
                  onChange={handleChange}
                  isInvalid={!!errors.finacialYearCode}
                />
                <Form.Control.Feedback type="invalid">{errors.finacialYearCode}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Start Date */}
            <Col md={6}>
              <Form.Group controlId="startDate">
                <Form.Label>{getLabel("startDate")}</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startDate"
                  value={financialyear.startDate}
                  onChange={handleChange}
                  isInvalid={!!errors.startDate}
                />
                <Form.Control.Feedback type="invalid">{errors.startDate}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            {/* End Date */}
            <Col md={6}>
              <Form.Group controlId="endDate">
                <Form.Label>{getLabel("endDate")}</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endDate"
                  value={financialyear.endDate}
                  onChange={handleChange}
                  isInvalid={!!errors.endDate}
                />
                <Form.Control.Feedback type="invalid">{errors.endDate}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Is Current */}
            <Col md={6} className="d-flex align-items-center mt-4">
              <Form.Check
                type="switch"
                label="Is Current"
                name="isCurrent"
                checked={financialyear.isCurrent}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            {/* Is Closed */}
            <Col md={6} className="d-flex align-items-center">
              <Form.Check
                type="switch"
                label="Is Closed"
                name="isClosed"
                checked={financialyear.isClosed}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FinacialYearCreate;
