import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import KiduValidation from "../../../components/KiduValidation";
import AppNotificationService from "../../../services/settings/AppNotification.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import { AppNotification } from "../../../types/settings/AppNotification";
import defaultNotificationImage from "../../../assets/Images/notification.png";

const AppNotificationCreate: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    { name: "notificationType", rules: { required: true, type: "select" as const, label: "Notification Type" } },
    { name: "notificationTitle", rules: { required: true, type: "text" as const, label: "Notification Title" } },
    { name: "notificationLink", rules: {  type: "text" as const, label: "Notification Link" } },
    { name: "createdAt", rules: { required: true, type: "date" as const, label: "Created Date" } },
  ];

  const notificationTypes = ["Offers", "Alerts", "One-time Alerts", "Repetitive"];

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach(f => {
    initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState<AppNotification>({
    appNotificationId: 0,
    notificationType: "",
    notificationTitle: "",
    notificationImage: "",
    isActive: false,
    notificationLink: "",
    createdAt: "",
  });

  const [errors, setErrors] = useState(initialErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData] = useState<AppNotification>({ ...formData });
  
  // ✅ Image upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(defaultNotificationImage);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    
    let updatedValue: any = value;
    if (type === "checkbox") {
      updatedValue = target.checked;
    }

    setFormData((prev: any) => ({ ...prev, [name]: updatedValue }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  // ✅ Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
      if (f.rules.required && !validateField(f.name, formData[f.name as keyof AppNotification])) {
        ok = false;
      }
    });
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      // Step 1: Create notification without image
      const dataToCreate: AppNotification = {
        appNotificationId: 0,
        notificationType: formData.notificationType || "",
        notificationTitle: formData.notificationTitle || "",
        notificationImage: "", // Will be updated after upload
        notificationLink: formData.notificationLink || "",
        createdAt: formData.createdAt || "",
        isActive: Boolean(formData.isActive),
      };

      const response = await AppNotificationService.createNotification(dataToCreate);
      
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to create notification");
      }

      const createdNotification = response.value;

      // Step 2: Upload image if selected
      if (selectedFile && createdNotification?.appNotificationId) {
        try {
          const uploadResponse = await AppNotificationService.uploadNotificationImage(
            createdNotification.appNotificationId,
            selectedFile
          );
          
          if (!uploadResponse || !uploadResponse.isSucess) {
            console.warn("Image upload failed, but notification was created");
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }

      toast.success("Notification created successfully!");
      setTimeout(() => navigate("/dashboard/settings/appNotification-list"), 1500);
    } catch (error: any) {
      console.error("Create failed:", error);
      toast.error(`Error creating notification: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Create Notification</h5>
            </div>
          </div>

          <Card.Body style={{ padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                {/* Image Upload Section */}
                <Col md={12} className="text-center mb-3">
                  <div className="d-flex flex-column align-items-center">
                    <img
                      src={imagePreview}
                      alt="Notification Preview"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "2px solid #882626ff",
                        marginBottom: "10px"
                      }}
                    />
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ maxWidth: "300px" }}
                    />
                    <small className="text-muted mt-1">Upload notification image</small>
                  </div>
                </Col>

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
                <Button 
                  type="submit" 
                  style={{ backgroundColor: "#882626ff", border: "none" }} 
                  disabled={isSubmitting}
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

export default AppNotificationCreate;