/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import KiduValidation from "../../../components/KiduValidation";
import KiduLoader from "../../../components/KiduLoader";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import AppNotificationService from "../../../services/settings/AppNotification.services";

interface NotificationFormData {
  notificationType: string;
  notificationTitle: string;
  notificationImage: string;
  notificationLink: string;
  createdAt: string;
  category: string;
  isActive: boolean;

  // Allow dynamic key indexing
  [key: string]: string | boolean;
}

interface FormErrors {
  [key: string]: string;
}

const AppNotificationEdit: React.FC = () => {
  const navigate = useNavigate();
  const { appNotificationId } = useParams<{ appNotificationId: string }>();

  // ---------- FIELD DEFINITIONS ----------
  const fields = [
    { name: "notificationType", rules: { required: true, type: "select" as const, label: "Notification Type" } },
    { name: "notificationTitle", rules: { required: true, type: "text" as const, label: "Notification Title" } },
    { name: "notificationImage", rules: { required: true, type: "text" as const, label: "Notification Image" } },
    { name: "notificationLink", rules: { required: true, type: "text" as const, label: "Notification Link" } },
    { name: "createdAt", rules: { required: true, type: "date" as const, label: "Created Date" } },
    { name: "category", rules: { required: false, type: "text" as const, label: "Category" } }
  ];

  const notificationTypes = ["Offers", "Alerts", "One-time Alerts", "Repetitive"];

  const [formData, setFormData] = useState<NotificationFormData>({
    notificationType: "",
    notificationTitle: "",
    notificationImage: "",
    notificationLink: "",
    createdAt: "",
    category: "",
    isActive: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [originalData, setOriginalData] = useState<NotificationFormData>(formData);

  // ---------- LABEL HELPER ----------
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

  // ---------- VALIDATION ----------
  const validateField = (name: string, value: string | boolean) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;

    const validation = KiduValidation.validate(value, field.rules);

    if (!validation.isValid) {
      setErrors(prev => ({
        ...prev,
        [name]: validation.message || `${field.rules.label} is required.`
      }));
      return false;
    }

    setErrors(prev => ({ ...prev, [name]: "" }));
    return true;
  };

  const validateForm = () => {
    let ok = true;
    for (const f of fields) {
      if (!validateField(f.name, formData[f.name])) ok = false;
    }
    return ok;
  };

  // ---------- HANDLE CHANGE ----------
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const updatedValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: updatedValue }));

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // ---------- LOAD EXISTING DATA ----------
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await AppNotificationService.getNotificationById(appNotificationId!);

        const data: NotificationFormData = {
          notificationType: res.notificationType || "",
          notificationTitle: res.notificationTitle || "",
          notificationImage: res.notificationImage || "",
          notificationLink: res.notificationLink || "",
          createdAt: res.createdAt?.split("T")[0] || "",
          category: res.category || "",
          isActive: res.isActive
        };

        setFormData(data);
        setOriginalData(data);
      } catch {
        toast.error("Failed to load notification");
        navigate("/AppNotification/AppNotificationPage");
      }
      setIsLoading(false);
    };

    loadData();
  }, [appNotificationId, navigate]);

  // ---------- SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        appNotificationId: Number(appNotificationId),
        ...formData
      };

      await AppNotificationService.updateNotification(appNotificationId!, payload);

      toast.success("Notification Updated Successfully");
      setTimeout(() => navigate("/dashboard/settings/appNotification-list"), 1500);
    } catch {
      toast.error("Failed to update notification");
    }

    setIsSubmitting(false);
  };

  // ---------- LOADER ----------
  if (isLoading) return <KiduLoader type="notification" />;

  // ---------- UI ----------
  return (
    <Card className="mx-3 mt-4" style={{ backgroundColor: "#f7f7f7" }}>
      <Card.Header
        className="d-flex align-items-center"
        style={{ backgroundColor: "#18575A", color: "white" }}
      >
        <Button
          size="sm"
          variant="light"
          className="me-2"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft />
        </Button>
        <h6 className="mb-0">Edit Notification</h6>
      </Card.Header>

      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>{getLabel("notificationType")}</Form.Label>
              <Form.Select
                name="notificationType"
                value={formData.notificationType}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                {notificationTypes.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Form.Select>
              {errors.notificationType && (
                <small className="text-danger">{errors.notificationType}</small>
              )}
            </Col>

            <Col md={6}>
              <Form.Label>{getLabel("notificationTitle")}</Form.Label>
              <Form.Control
                type="text"
                name="notificationTitle"
                value={formData.notificationTitle}
                onChange={handleChange}
              />
              {errors.notificationTitle && (
                <small className="text-danger">{errors.notificationTitle}</small>
              )}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>{getLabel("notificationImage")}</Form.Label>
              <Form.Control
                type="text"
                name="notificationImage"
                value={formData.notificationImage}
                onChange={handleChange}
              />
              {errors.notificationImage && (
                <small className="text-danger">{errors.notificationImage}</small>
              )}
            </Col>

            <Col md={6}>
              <Form.Label>{getLabel("notificationLink")}</Form.Label>
              <Form.Control
                type="text"
                name="notificationLink"
                value={formData.notificationLink}
                onChange={handleChange}
              />
              {errors.notificationLink && (
                <small className="text-danger">{errors.notificationLink}</small>
              )}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>{getLabel("createdAt")}</Form.Label>
              <Form.Control
                type="date"
                name="createdAt"
                value={formData.createdAt}
                onChange={handleChange}
              />
              {errors.createdAt && (
                <small className="text-danger">{errors.createdAt}</small>
              )}
            </Col>

            <Col md={6} className="d-flex align-items-center mt-4">
              <Form.Check
                type="switch"
                label="Is Active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-3 gap-2">
            <KiduReset initialValues={originalData} setFormData={setFormData} />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default AppNotificationEdit;
