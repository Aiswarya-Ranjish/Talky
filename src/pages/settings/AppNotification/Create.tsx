/* eslint-disable react-refresh/only-export-components */
import React, { useState } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import KiduValidation from "../../../components/KiduValidation";
import AppNotificationService from "../../../services/settings/AppNotification.services";

interface NotificationFormData {
  notificationType: string;
  notificationTitle: string;
  notificationImage: string;
  notificationLink: string;
  createdAt: string;
  category: string;
  isActive: boolean;


  [key: string]: string | boolean;
}

interface FormErrors {
  [key: string]: string;
}

const AppNotificationCreate: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    { name: "notificationType", rules: { required: true, type: "select" as const, label: "Notification Type" } },
    { name: "notificationTitle", rules: { required: true, type: "text" as const, label: "Notification Title" } },
    { name: "notificationImage", rules: { required: true, type: "text" as const, label: "Notification Image" } },
    { name: "notificationLink", rules: { required: true, type: "text" as const, label: "Notification Link" } },
    { name: "createdAt", rules: { required: true, type: "date" as const, label: "Created Date" } },
    { name: "category", rules: { required: false, type: "text" as const, label: "Category" } },
  ];

  const notificationTypes = [
    "Offers",
    "Alerts",
    "One-time Alerts",
    "Repetitive",
  ];

  const [formData, setFormData] = useState<NotificationFormData>({
    notificationType: "",
    notificationTitle: "",
    notificationImage: "",
    notificationLink: "",
    createdAt: "",
    category: "",
    isActive: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLabel = (name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return "";
    return (
      <>
        {field.rules.label}
        {field.rules.required && <span style={{ color: "red" }}> *</span>}
      </>
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: updatedValue }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: string | boolean) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;

    const validation = KiduValidation.validate(value, field.rules);

    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        [name]: validation.message || `${field.rules.label} is required.`,
      }));
      return false;
    }
    return true;
  };

  const validateForm = () => {
    let valid = true;
    fields.forEach(f => {
      if (!validateField(f.name, formData[f.name])) valid = false;
    });
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        appNotificationId: 0,
        ...formData,
      };

      await AppNotificationService.addNotification(payload);

      toast.success("Notification Created Successfully");
      setTimeout(() => navigate("/dashboard/settings/appNotification-list"), 800);
    } catch {
      toast.error("Failed to create notification");
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
        <h6 className="mb-0">Create Notification</h6>
      </Card.Header>

      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>{getLabel("notificationType")}</Form.Label>
              <Form.Select name="notificationType" value={formData.notificationType} onChange={handleChange}>
                <option value="">Select Type</option>
                {notificationTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
              {errors.notificationType && <small className="text-danger">{errors.notificationType}</small>}
            </Col>

            <Col md={6}>
              <Form.Label>{getLabel("notificationTitle")}</Form.Label>
              <Form.Control type="text" name="notificationTitle" value={formData.notificationTitle} onChange={handleChange} />
              {errors.notificationTitle && <small className="text-danger">{errors.notificationTitle}</small>}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>{getLabel("notificationImage")}</Form.Label>
              <Form.Control type="text" name="notificationImage" value={formData.notificationImage} onChange={handleChange} />
              {errors.notificationImage && <small className="text-danger">{errors.notificationImage}</small>}
            </Col>

            <Col md={6}>
              <Form.Label>{getLabel("notificationLink")}</Form.Label>
              <Form.Control type="text" name="notificationLink" value={formData.notificationLink} onChange={handleChange} />
              {errors.notificationLink && <small className="text-danger">{errors.notificationLink}</small>}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>{getLabel("createdAt")}</Form.Label>
              <Form.Control type="date" name="createdAt" value={formData.createdAt} onChange={handleChange} />
              {errors.createdAt && <small className="text-danger">{errors.createdAt}</small>}
            </Col>

            <Col md={6} className="d-flex align-items-center mt-4">
              <Form.Check type="switch" label="Is Active" name="isActive" checked={formData.isActive} onChange={handleChange} />
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3">
            <Button variant="secondary" className="me-2" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AppNotificationCreate;
