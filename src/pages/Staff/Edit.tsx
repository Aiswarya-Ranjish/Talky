import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaArrowLeft, FaPen, FaStar } from "react-icons/fa";
import { getFullImageUrl } from "../../constants/API_ENDPOINTS";
import { KiduValidation } from "../../components/KiduValidation";
import StaffService from "../../services/Staff/Staff.Services";
import defaultProfile from "../../assets/Images/profile.jpeg";
import { StaffModel } from "../../types/Staff/StaffType";
import KiduLoader from "../../components/KiduLoader";

interface ValidationRule {
  required: boolean;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  label: string;
  pattern?: RegExp;
  minLength?: number;
}

interface FieldConfig {
  name: keyof StaffModel;
  type: "text" | "email" | "number" | "date" | "select" | "textarea";
  rules: ValidationRule;
}

// ⭐ Interactive Star Rating Component
interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
  readonly?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ 
  rating, 
  onRatingChange, 
  size = 24,
  readonly = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  const handleClick = (selectedRating: number) => {
    if (!readonly) {
      onRatingChange(selectedRating);
    }
  };

  const handleMouseEnter = (selectedRating: number) => {
    if (!readonly) {
      setHoverRating(selectedRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || rating) >= star;
        return (
          <FaStar
            key={star}
            size={size}
            style={{
              color: isFilled ? "#ffc107" : "#e4e5e9",
              cursor: readonly ? "default" : "pointer",
              transition: "color 0.2s ease",
            }}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
      <span className="ms-2 fw-semibold" style={{ fontSize: "14px", color: "#666" }}>
        ({rating.toFixed(1)})
      </span>
    </div>
  );
};

const StaffEdit: React.FC = () => {
  const navigate = useNavigate();
  const { staffUserId } = useParams<{ staffUserId: string }>();
  
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState<StaffModel | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string>(defaultProfile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kycDocumentOptions = ["Passport", "Aadhar", "PAN", "Voter ID"];

  const fields: FieldConfig[] = [
    { 
      name: "name", 
      type: "text",
      rules: { required: true, type: "text", label: "Name" } 
    },
    { 
      name: "bio", 
      type: "textarea",
      rules: { required: false, type: "text", label: "Bio" } 
    },
    { 
      name: "mobileNumber", 
      type: "text",
      rules: { 
        required: true, 
        type: "text",
        pattern: /^[0-9]{10}$/,
        label: "Mobile Number" 
      } 
    },
    { 
      name: "address", 
      type: "textarea",
      rules: { 
        required: true, 
        type: "text",
        minLength: 10,
        label: "Address" 
      } 
    },
    { 
      name: "email", 
      type: "email",
      rules: { required: true, type: "email", label: "Email" } 
    },
    { 
      name: "walletBalance", 
      type: "number",
      rules: { required: false, type: "number", label: "Wallet Balance" } 
    },
    { 
      name: "customerCoinsPerSecondVideo", 
      type: "number",
      rules: { required: false, type: "number", label: "Customer CPS Video" } 
    },
    { 
      name: "customerCoinsPerSecondAudio", 
      type: "number",
      rules: { required: false, type: "number", label: "Customer CPS Audio" } 
    },
    { 
      name: "companyCoinsPerSecondVideo", 
      type: "number",
      rules: { required: false, type: "number", label: "Company CPS Video" } 
    },
    { 
      name: "companyCoinsPerSecondAudio", 
      type: "number",
      rules: { required: false, type: "number", label: "Company CPS Audio" } 
    },
    { 
      name: "priority", 
      type: "number",
      rules: { required: false, type: "number", label: "Priority" } 
    },
    { 
      name: "kycDocument", 
      type: "select",
      rules: { required: false, type: "select", label: "KYC Document" } 
    },
    { 
      name: "kycDocumentNumber", 
      type: "text",
      rules: { required: false, type: "text", label: "KYC Document Number" } 
    },
    { 
      name: "kycCompletedDate", 
      type: "date",
      rules: { required: false, type: "date", label: "KYC Completed Date" } 
    }
  ];

  const booleanFields: (keyof StaffModel)[] = [
    "isBlocked", "isKYCCompleted", "isAudioEnbaled", 
    "isVideoEnabled", "isOnline", "isDeleted"
  ];

  const [formData, setFormData] = useState<StaffModel>({
    staffUserId: 0,
    appUserId: 0,
    name: "",
    bio: "",
    mobileNumber: "",
    address: "",
    email: "",
    gender: "",
    walletBalance: 0,
    customerCoinsPerSecondVideo: 0,
    customerCoinsPerSecondAudio: 0,
    companyCoinsPerSecondVideo: 0,
    companyCoinsPerSecondAudio: 0,
    priority: 0,
    kycDocument: "",
    kycDocumentNumber: "", // Changed to string
    kycCompletedDate: "",
    registeredDate: new Date().toISOString(),
    referredBy: "",
    referralCode: "",
    starRating: 0,
    profileImagePath: "",
    lastLogin: new Date().toISOString(),
    isBlocked: false,
    isKYCCompleted: false,
    isAudioEnbaled: false,
    isVideoEnabled: false,
    isOnline: false,
    isDeleted: false,
    message: undefined,
    customMessage: undefined,
    isSucess: false,
    success: false
  });

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        
        if (!staffUserId) {
          toast.error("No staff ID provided");
          navigate("/dashboard/staff/staff-list");
          return;
        }
        
        const response = await StaffService.getStaffById(staffUserId);
        
        if (!response) {
          throw new Error("No data received from server");
        }
        
        // Format date field
        const formattedData: StaffModel = {
          ...response,
          kycCompletedDate: response.kycCompletedDate 
            ? new Date(response.kycCompletedDate).toISOString().split('T')[0]
            : "",
          kycDocumentNumber: String(response.kycDocumentNumber || ""), // Convert to string
          starRating: response.starRating || 0
        };
        
        setFormData(formattedData);
        setOriginalData(formattedData);
        
        // Load existing image
        const imageUrl = formattedData.profileImagePath 
          ? getFullImageUrl(formattedData.profileImagePath) 
          : defaultProfile;
        setPreviewUrl(imageUrl);
        
      } catch (error: any) {
        console.error("Failed to load staff:", error);
        toast.error(`Error loading staff: ${error.message}`);
        navigate("/dashboard/staff/staff-list");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStaff();
  }, [staffUserId, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
    }
  };

  // ⭐ Handle star rating change
  const handleRatingChange = (newRating: number) => {
    console.log("⭐ Rating changed to:", newRating);
    setFormData(prev => ({ ...prev, starRating: newRating }));
  };

  const getLabel = (name: keyof StaffModel) => {
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
    } else if (fields.find(f => f.name === name)?.type === "number") {
      updatedValue = value === "" ? 0 : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: updatedValue }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name: keyof StaffModel, value: any): boolean => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    
    const result = KiduValidation.validate(value, field.rules as any);
    
    if (!result.isValid) {
      setValidationErrors(prev => ({ ...prev, [name]: result.message || "" }));
      return false;
    }
    
    setValidationErrors(prev => ({ ...prev, [name]: "" }));
    return true;
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    fields.forEach(field => {
      if (field.rules.required) {
        const result = KiduValidation.validate(formData[field.name], field.rules as any);
        if (!result.isValid) {
          newErrors[field.name] = result.message || "";
          isValid = false;
        }
      }
    });
    
    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix validation errors.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!staffUserId) {
        throw new Error("No staff ID available");
      }
      
      // 🔧 FIX: Send data directly without dto wrapper, ensure proper types
      const dataToUpdate: StaffModel = {
        ...formData,
        kycDocumentNumber: String(formData.kycDocumentNumber || ""),
        starRating: Number(formData.starRating) || 0,
        walletBalance: Number(formData.walletBalance) || 0,
        customerCoinsPerSecondVideo: Number(formData.customerCoinsPerSecondVideo) || 0,
        customerCoinsPerSecondAudio: Number(formData.customerCoinsPerSecondAudio) || 0,
        companyCoinsPerSecondVideo: Number(formData.companyCoinsPerSecondVideo) || 0,
        companyCoinsPerSecondAudio: Number(formData.companyCoinsPerSecondAudio) || 0,
        priority: Number(formData.priority) || 0,
        kycCompletedDate: formData.kycCompletedDate || "",
        registeredDate: formData.registeredDate || new Date().toISOString(),
        lastLogin: formData.lastLogin || new Date().toISOString(),
      };
      
      // 🔍 DEBUG: Log the data being sent
      console.log("📤 Submitting staff data:", dataToUpdate);
      console.log("📤 Star rating value:", formData.starRating);
      
      const updateResponse = await StaffService.editStaffById(staffUserId, dataToUpdate);
      
      console.log("📥 Update response:", updateResponse);
      
      if (!updateResponse || updateResponse.isSucess === false) {
        throw new Error(updateResponse?.customMessage || updateResponse?.error || "Failed to update staff");
      }
      
      // Upload new image if selected
      if (selectedFile && formData.appUserId) {
        const uploadFormData = new FormData();
        uploadFormData.append("AppUserId", formData.appUserId.toString());
        uploadFormData.append("ProfilePic", selectedFile);
        
        try {
          await StaffService.uploadprofilepic(uploadFormData);
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error("Staff updated but image upload failed");
        }
      }
      
      toast.success(`Staff updated successfully! Rating: ${formData.starRating}`);
      setTimeout(() => navigate("/dashboard/staff/staff-list"), 1500);
      
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Error updating staff: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (originalData) {
      setFormData(originalData);
      setValidationErrors({});
      
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const imageUrl = originalData.profileImagePath 
        ? getFullImageUrl(originalData.profileImagePath) 
        : defaultProfile;
      setPreviewUrl(imageUrl);
      setSelectedFile(null);
    }
  };

  const formatDate = (isoString: string | Date | null): string => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const day = String(date.getDate()).padStart(2, '0');
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();
      const time = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      return `${day}-${month}-${year}  ${time}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const renderFormControl = (field: FieldConfig) => {
    const { name, type } = field;
    const value = formData[name] || "";
    
    switch (type) {
      case "textarea":
        return (
          <Form.Control
            size="sm"
            as="textarea"
            rows={1}
            name={name}
            value={String(value)}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            maxLength={100}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#882626ff" }}
          />
        );
        
      case "select":
        if (name === "kycDocument") {
          return (
            <Form.Select
              size="sm"
              name={name}
              value={String(value)}
              onChange={handleChange}
              onBlur={() => validateField(name, value)}
              isInvalid={!!validationErrors[name]}
              style={{ borderColor: "#882626ff" }}
            >
              <option value="">-- Select Document --</option>
              {kycDocumentOptions.map(doc => (
                <option key={doc} value={doc}>{doc}</option>
              ))}
            </Form.Select>
          );
        }
        return null;
        
      case "date":
        return (
          <Form.Control
            size="sm"
            type="date"
            name={name}
            value={value ? String(value) : ""}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#882626ff" }}
          />
        );
        
      case "email":
        return (
          <Form.Control
            size="sm"
            type="email"
            name={name}
            value={String(value)}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#882626ff" }}
          />
        );
        
      default:
        return (
          <Form.Control
            size="sm"
            type={type === "number" ? "number" : "text"}
            name={name}
            value={String(value)}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#882626ff" }}
          />
        );
    }
  };

  const getFieldIcon = (fieldName: string): string => {
    const icons: Record<string, string> = {
      name: "bi-person-fill",
      bio: "bi-person-lines-fill",
      mobileNumber: "bi-telephone-fill",
      address: "bi-geo-alt",
      email: "bi-envelope",
      walletBalance: "bi-wallet2",
      customerCoinsPerSecondVideo: "bi-camera-video-fill",
      customerCoinsPerSecondAudio: "bi-mic",
      companyCoinsPerSecondVideo: "bi-camera-video-fill",
      companyCoinsPerSecondAudio: "bi-soundwave",
      priority: "bi-star",
      kycDocument: "bi-file-earmark-text-fill",
      kycDocumentNumber: "bi-hash",
      kycCompletedDate: "bi-calendar-check-fill"
    };
    return icons[fieldName] || "bi-input-cursor-text";
  };

  const formatSwitchLabel = (fieldName: string): string => {
    const labels: Record<string, string> = {
      isBlocked: "Is Blocked",
      isKYCCompleted: "KYC Completed",
      isAudioEnbaled: "Audio Enabled",
      isVideoEnabled: "Video Enabled",
      isOnline: "Online",
      isDeleted: "Is Deleted"
    };
    return labels[fieldName] || fieldName;
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <KiduLoader type="Staff..." />
      </div>
    );
  }

  return (
    <>
      <Card className="mx-3" style={{ maxWidth: "100%", fontSize: "0.85rem", marginTop: "50px", backgroundColor: "#f8f9fa" }}>
        <Card.Header style={{ backgroundColor: "#882626ff", color: "white", height: "65px" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                size="sm" 
                variant="link" 
                className="me-2 mb-2" 
                style={{ backgroundColor: "white", padding: "0.2rem 0.5rem", color: "#882626ff" }} 
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft />
              </Button>
              <h6 className="mb-0 px-2 fw-medium fs-5 mb-2">Edit Staff Member</h6>
            </div>
          </div>
        </Card.Header>

        <Card.Body style={{ padding: "1.5rem" }}>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              {/* Profile Picture Section */}
              <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                <div className="position-relative d-inline-block mb-2">
                  <Image
                    src={previewUrl}
                    alt="Profile"
                    roundedCircle
                    style={{
                      width: "130px",
                      height: "140px",
                      objectFit: "cover",
                      border: "3px solid #882626ff"
                    }}
                    onError={(e: any) => {
                      e.target.src = defaultProfile;
                    }}
                  />
                  <label
                    htmlFor="profilePicture"
                    className="position-absolute bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
                    style={{
                      width: "32px",
                      height: "32px",
                      cursor: "pointer",
                      bottom: "5px",
                      right: "calc(50% - 65px)",
                      border: "2px solid white"
                    }}
                    title="Upload Photo"
                  >
                    <FaPen size={14} />
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
                <h6 className="fw-bold" style={{ color: "#882626ff" }}>{formData.name || "Unknown"}</h6>
                <p className="small text-muted mb-1">ID: {formData.staffUserId || "N/A"}</p>
                <p className="small text-danger fst-italic mb-2">
                  Last Login: {formatDate(formData.lastLogin)}
                </p>
                
                {/* ⭐ Editable Star Rating */}
                <div className="d-flex flex-column align-items-center">
                  <small className="text-muted mb-1 fw-semibold">Staff Rating</small>
                  <StarRating 
                    rating={formData.starRating || 0} 
                    onRatingChange={handleRatingChange}
                    size={22}
                  />
                  <small className="text-muted mt-1" style={{ fontSize: "11px" }}>
                    <i className="bi bi-hand-index me-1"></i>Click stars to rate
                  </small>
                </div>
              </Col>

              {/* Form Fields Section */}
              <Col xs={12} md={9}>
                <Row className="g-2">
                  {fields.map((field) => (
                    <Col md={4} key={field.name}>
                      <Form.Group className="mb-2">
                        <Form.Label className="mb-1 fw-medium small">
                          <i className={`bi ${getFieldIcon(field.name)} me-1`}></i>
                          {getLabel(field.name)}
                        </Form.Label>
                        {renderFormControl(field)}
                        {validationErrors[field.name] && (
                          <Form.Control.Feedback type="invalid" style={{ display: "block" }}>
                            {validationErrors[field.name]}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>

            {/* Switches Section */}
            <Row className="mb-3 mx-1">
              <Col xs={12}>
                <div className="d-flex flex-wrap gap-3">
                  {booleanFields.map(fieldName => (
                    <Form.Check
                      key={fieldName}
                      type="switch"
                      id={fieldName}
                      name={fieldName}
                      label={formatSwitchLabel(fieldName)}
                      checked={formData[fieldName] as boolean || false}
                      onChange={handleChange}
                      className="fw-semibold"
                    />
                  ))}
                </div>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-4 me-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                size="sm"
                style={{ backgroundColor: "#882626ff", border: "none" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "UPDATE"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Toaster position="top-right" />
    </>
  );
};

export default StaffEdit;