import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import KiduValidation from "../../../components/KiduValidation";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
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

const AppNotificationEdit: React.FC = () => {
  const navigate = useNavigate();
  const { appNotificationId } = useParams<{ appNotificationId: string }>();

  const fields = [
    { name: "notificationType", rules: { required: true, type: "select" as const, label: "Notification Type" } },
    { name: "notificationTitle", rules: { required: true, type: "text" as const, label: "Notification Title" } },
    { name: "notificationImage", rules: { required: true, type: "text" as const, label: "Notification Image" } },
    { name: "notificationLink", rules: { required: true, type: "text" as const, label: "Notification Link" } },
    { name: "createdAt", rules: { required: true, type: "date" as const, label: "Created Date" } },
    { name: "category", rules: { required: false, type: "text" as const, label: "Category" } }
  ];

  const notificationTypes = ["Offers", "Alerts", "One-time Alerts", "Repetitive"];

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach(f => {
    initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState<NotificationFormData>({
    ...initialValues,
    notificationType: "",
    notificationTitle: "",
    notificationImage: "",
    notificationLink: "",
    createdAt: "",
    category: "",
    isActive: false
  });

  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

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

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        setLoading(true);
        if (!appNotificationId) { 
          toast.error("No notification ID provided"); 
          navigate("/dashboard/settings/appNotification-list"); 
          return; 
        }
        const response = await AppNotificationService.getNotificationById(appNotificationId);
        if (!response) throw new Error("No data received from server");

        const formattedData = {
          notificationType: response.notificationType || "",
          notificationTitle: response.notificationTitle || "",
          notificationImage: response.notificationImage || "",
          notificationLink: response.notificationLink || "",
          createdAt: response.createdAt?.split("T")[0] || "",
          category: response.category || "",
          isActive: response.isActive ?? false
        };

        setFormData(formattedData);
        setInitialData(formattedData);
      } catch (error: any) {
        console.error("Failed to load notification:", error);
        toast.error(`Error loading notification: ${error.message}`);
        navigate("/dashboard/settings/appNotification-list");
      } finally { 
        setLoading(false); 
      }
    };
    fetchNotification();
  }, [appNotificationId, navigate]);

  const handleChange = (e: any) => {
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
      if (!validateField(f.name, formData[f.name])) ok = false;
    });
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (!appNotificationId) throw new Error("No notification ID available");
      
      const dataToUpdate = {
        appNotificationId: Number(appNotificationId),
        notificationType: formData.notificationType || "",
        notificationTitle: formData.notificationTitle || "",
        notificationImage: formData.notificationImage || "",
        notificationLink: formData.notificationLink || "",
        createdAt: formData.createdAt || "",
        category: formData.category || "",
        isActive: Boolean(formData.isActive)
      };

      const updateResponse = await AppNotificationService.updateNotification(appNotificationId, dataToUpdate as any);
      if (!updateResponse || updateResponse.isSucess === false) {
        throw new Error(updateResponse?.customMessage || updateResponse?.error || "Failed to update notification");
      }

      toast.success("Notification updated successfully!");
      setTimeout(() => navigate("/dashboard/settings/appNotification-list"), 1500);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Error updating notification: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  if (loading) return <KiduLoader type="Notification..." />;

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Edit Notification</h5>
            </div>
          </div>

          <Card.Body style={{ padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col xs={12}>
                  <Row className="g-2">
                    {/* Notification Type */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("notificationType")}</Form.Label>
                      <Form.Select
                        size="sm"
                        name="notificationType"
                        value={formData.notificationType}
                        onChange={handleChange}
                        onBlur={() => validateField("notificationType", formData.notificationType)}
                      >
                        <option value="">Select Type</option>
                        {notificationTypes.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </Form.Select>
                      {errors.notificationType && <div className="text-danger small">{errors.notificationType}</div>}
                    </Col>

                    {/* Notification Title */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("notificationTitle")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="notificationTitle" 
                        value={formData.notificationTitle}
                        onChange={handleChange} 
                        onBlur={() => validateField("notificationTitle", formData.notificationTitle)} 
                        placeholder="Enter Notification Title"
                      />
                      {errors.notificationTitle && <div className="text-danger small">{errors.notificationTitle}</div>}
                    </Col>

                    {/* Notification Image */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("notificationImage")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="notificationImage" 
                        value={formData.notificationImage}
                        onChange={handleChange} 
                        onBlur={() => validateField("notificationImage", formData.notificationImage)} 
                        placeholder="Enter Image URL"
                      />
                      {errors.notificationImage && <div className="text-danger small">{errors.notificationImage}</div>}
                    </Col>

                    {/* Notification Link */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("notificationLink")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="notificationLink" 
                        value={formData.notificationLink}
                        onChange={handleChange} 
                        onBlur={() => validateField("notificationLink", formData.notificationLink)} 
                        placeholder="Enter Notification Link"
                      />
                      {errors.notificationLink && <div className="text-danger small">{errors.notificationLink}</div>}
                    </Col>

                    {/* Created Date */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("createdAt")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="date" 
                        name="createdAt" 
                        value={formData.createdAt}
                        onChange={handleChange} 
                        onBlur={() => validateField("createdAt", formData.createdAt)} 
                      />
                      {errors.createdAt && <div className="text-danger small">{errors.createdAt}</div>}
                    </Col>

                    {/* Category */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("category")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="category" 
                        value={formData.category}
                        onChange={handleChange} 
                        onBlur={() => validateField("category", formData.category)} 
                        placeholder="Enter Category"
                      />
                      {errors.category && <div className="text-danger small">{errors.category}</div>}
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
                      id="isActive" 
                      name="isActive" 
                      label="Is Active"
                      checked={formData.isActive || false} 
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
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </div>
            </Form>

            {/* Audit Logs */}
            {appNotificationId && <KiduAuditLogs tableName="AppNotification" recordId={appNotificationId.toString()} />}
          </Card.Body>
        </Card>

        <Toaster position="top-right" />
      </div>
    </>
  );
};

export default AppNotificationEdit;