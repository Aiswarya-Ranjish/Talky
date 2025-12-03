import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaArrowLeft, FaPen } from "react-icons/fa";
import { getFullImageUrl } from "../../constants/API_ENDPOINTS";
import { KiduValidation } from "../../components/KiduValidation";
import StaffService from "../../services/Staff/Staff.Services";
import defaultProfile from "../../assets/Images/profile.jpeg";



const StaffEdit = () => {
  const navigate = useNavigate();
  const { staffUserId } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(defaultProfile);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kycDocumentOptions = ["Passport", "Aadhar", "PAN", "Voter ID"];

  // Define all form fields with validation rules
  const fields = [
    { 
      name: "name", 
      type: "text" as const,
      rules: { 
        required: true, 
        type: "text" as const, 
        label: "Name" 
      } 
    },
    { 
      name: "bio", 
      type: "text" as const,
      rules: { 
        required: false, 
        type: "text" as const, 
        label: "Bio" 
      } 
    },
    { 
      name: "mobileNumber", 
      type: "text" as const,
      rules: { 
        required: true, 
        type: "text" as const,
        pattern: /^[0-9]{10}$/,
        label: "Mobile Number" 
      } 
    },
    { 
      name: "address", 
      type: "textarea" as const,
      rules: { 
        required: true, 
        type: "text" as const,
        minLength: 10,
        label: "Address" 
      } 
    },
    { 
      name: "email", 
      type: "email" as const,
      rules: { 
        required: true, 
        type: "email" as const, 
        label: "Email" 
      } 
    },
    { 
      name: "walletBalance", 
      type: "number" as const,
      rules: { 
        required: false, 
        type: "number" as const, 
        label: "Wallet Balance" 
      } 
    },
    { 
      name: "customerCoinsPerSecondVideo", 
      type: "number" as const,
      rules: { 
        required: false, 
        type: "number" as const, 
        label: "Customer CPS Video" 
      } 
    },
    { 
      name: "customerCoinsPerSecondAudio", 
      type: "number" as const,
      rules: { 
        required: false, 
        type: "number" as const, 
        label: "Customer CPS Audio" 
      } 
    },
    { 
      name: "companyCoinsPerSecondVideo", 
      type: "number" as const,
      rules: { 
        required: false, 
        type: "number" as const, 
        label: "Company CPS Video" 
      } 
    },
    { 
      name: "companyCoinsPerSecondAudio", 
      type: "number" as const,
      rules: { 
        required: false, 
        type: "number" as const, 
        label: "Company CPS Audio" 
      } 
    },
    { 
      name: "priority", 
      type: "number" as const,
      rules: { 
        required: false, 
        type: "number" as const, 
        label: "Priority" 
      } 
    },
    { 
      name: "kycDocument", 
      type: "select" as const,
      rules: { 
        required: false, 
        type: "select" as const, 
        label: "KYC Document" 
      } 
    },
    { 
      name: "kycDocumentNumber", 
      type: "text" as const,
      rules: { 
        required: false, 
        type: "text" as const, 
        label: "KYC Document Number" 
      } 
    },
    { 
      name: "kycCompletedDate", 
      type: "date" as const,
      rules: { 
        required: false, 
        type: "date" as const, 
        label: "KYC Completed Date" 
      } 
    }
  ];

  // Initialize form data with all fields
  const initialValues: any = {};
  fields.forEach(field => {
    if (field.type === "select") {
      initialValues[field.name] = "";
    } else if (field.type === "number") {
      initialValues[field.name] = 0;
    } else if (field.type === "textarea") {
      initialValues[field.name] = "";
    } else {
      initialValues[field.name] = "";
    }
  });

  // Add boolean fields
  const booleanFields = [
    "isBlocked", "isKYCCompleted", "isAudioEnbaled", 
    "isVideoEnabled", "isOnline", "isDeleted"
  ];
  
  booleanFields.forEach(field => {
    initialValues[field] = false;
  });

  // Add additional fields not in the main fields array
  initialValues.staffUserId = 0;
  initialValues.appUserId = 0;
  initialValues.gender = "";
  initialValues.registeredDate = new Date().toISOString();
  initialValues.referredBy = "";
  initialValues.referralCode = "";
  initialValues.starRating = 0;
  initialValues.profileImagePath = "";
  initialValues.lastLogin = new Date().toISOString();

  const [formData, setFormData] = useState(initialValues);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
        console.log("Fetching staff with ID:", staffUserId);
        
        const response = await StaffService.getStaffById(staffUserId);
        console.log("Staff data received:", response);
        
        if (!response) {
          throw new Error("No data received from server");
        }
        
        // Format date fields
        const formattedData = { ...response };
        if (formattedData.kycCompletedDate) {
          formattedData.kycCompletedDate = new Date(formattedData.kycCompletedDate).toISOString().split('T')[0];
        }
        
        setFormData(formattedData);
        setOriginalData(formattedData);
        
        // Load existing image using helper function
        const imageUrl = formattedData.profileImagePath 
          ? getFullImageUrl(formattedData.profileImagePath) 
          : defaultProfile;
        console.log("Staff loaded - Original path:", formattedData.profileImagePath, "→ Full URL:", imageUrl);
        setPreviewUrl(imageUrl);
        
      } catch (error) {
        console.error("Failed to load staff:", error);
        toast.error(`Error loading staff: ${error.message}`);
        navigate("/staff-management/staff");
      } finally {
        setLoading(false);
      }
    };
    
    if (staffUserId) {
      fetchStaff();
    } else {
      toast.error("No staff ID provided");
      navigate("/staff-management/staff");
    }
  }, [staffUserId, navigate]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Only revoke blob URLs, not http URLs
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      console.log("New image selected, blob URL created:", objectUrl);
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
    }
  };

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let updatedValue = value;
    if (type === "checkbox") {
      updatedValue = checked;
    } else if (fields.find(f => f.name === name)?.type === "number") {
      updatedValue = value === "" ? 0 : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: updatedValue }));
    
    // Clear error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    
    const result = KiduValidation.validate(value, field.rules);
    
    if (!result.isValid) {
      setValidationErrors(prev => ({ ...prev, [name]: result.message }));
      return false;
    }
    
    setValidationErrors(prev => ({ ...prev, [name]: "" }));
    return true;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    fields.forEach(field => {
      if (field.rules.required) {
        const result = KiduValidation.validate(formData[field.name], field.rules);
        if (!result.isValid) {
          newErrors[field.name] = result.message;
          isValid = false;
        }
      }
    });
    
    setValidationErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix validation errors.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Updating staff with ID:", staffUserId);
      console.log("Update data:", formData);
      
      // Update staff data
      const updateResponse = await StaffService.editStaffById(staffUserId, formData);
      console.log("Update response:", updateResponse);
      
      if (!updateResponse) {
        throw new Error("No response from server");
      }
      
      // Check if the response indicates success
      if (updateResponse.isSucess === false || updateResponse.success === false) {
        throw new Error(updateResponse.customMessage || updateResponse.message || "Failed to update staff");
      }
      
      // Upload new image only if a new file was selected
      if (selectedFile) {
        console.log("Uploading new profile picture...");
        const uploadFormData = new FormData();
        uploadFormData.append("AppUserId", formData.appUserId.toString());
        uploadFormData.append("ProfilePic", selectedFile);
        
        try {
          const uploadRes = await StaffService.uploadprofilepic(uploadFormData);
          console.log("Image upload response:", uploadRes);
          
          if (!uploadRes || !uploadRes.data) {
            console.error("Image upload failed");
            toast.error("Staff updated but image upload failed");
          } else {
            console.log("Image uploaded successfully");
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          toast.error("Staff updated but image upload failed");
        }
      }
      
      toast.success("Staff updated successfully!");
      setTimeout(() => navigate("/dashboard/staff/staff-list"), 1500);
      
    } catch (error) {
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
      
      // Reset image preview
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

  const formatDate = (isoString) => {
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

  const renderStarRating = (rating) => {
    if (!rating) rating = 0;
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <span style={{ color: "#ffc107", fontSize: "18px" }}>
        {"★".repeat(fullStars)}
        {hasHalfStar && "½"}
        {"☆".repeat(emptyStars)}
      </span>
    );
  };

  const renderFormControl = (field) => {
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
            value={value}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            maxLength={100}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#9f73e6" }}
          />
        );
        
      case "select":
        if (name === "kycDocument") {
          return (
            <Form.Select
              size="sm"
              name={name}
              value={value}
              onChange={handleChange}
              onBlur={() => validateField(name, value)}
              isInvalid={!!validationErrors[name]}
              style={{ borderColor: "#9f73e6" }}
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
            value={value}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#9f73e6" }}
          />
        );
        
      case "email":
        return (
          <Form.Control
            size="sm"
            type="email"
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#9f73e6" }}
          />
        );
        
      default: // text and number
        return (
          <Form.Control
            size="sm"
            type={type === "number" ? "number" : "text"}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={() => validateField(name, value)}
            isInvalid={!!validationErrors[name]}
            style={{ borderColor: "#9f73e6" }}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading staff details...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="mx-3" style={{ maxWidth: "100%", fontSize: "0.85rem", marginTop: "50px", backgroundColor: "#f8f9fa" }}>
        <Card.Header style={{ backgroundColor: "#18575A", color: "white", height: "65px" }}>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <Button 
                size="sm" 
                variant="link" 
                className="me-2 mb-2" 
                style={{ backgroundColor: "white", padding: "0.2rem 0.5rem", color: "#18575A" }} 
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
                      border: "3px solid #18575A"
                    }}
                    onError={(e) => {
                      console.error("Image load error, using default");
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
                <h6 className="fw-bold" style={{ color: "#18575A" }}>{formData.name || "Unknown"}</h6>
                <p className="small text-muted mb-1">ID: {formData.staffUserId || "N/A"}</p>
                <p className="small text-danger fst-italic mb-2">
                  Last Login: {formatDate(formData.lastLogin)}
                </p>
                <div>{renderStarRating(formData.starRating)}</div>
              </Col>

              {/* Form Fields Section */}
              <Col xs={12} md={9}>
                <Row className="g-2">
                  {/* Render all fields in 3-column layout */}
                  {fields.map((field) => (
                    <Col md={4} key={field.name}>
                      <Form.Group className="mb-2">
                        <Form.Label className="mb-1 fw-medium small">
                          <i className={`bi ${getFieldIcon(field.name)} me-1`}></i>
                          {getLabel(field.name)}
                        </Form.Label>
                        {renderFormControl(field)}
                        {validationErrors[field.name] && (
                          <Form.Control.Feedback type="invalid">
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
                      checked={formData[fieldName] || false}
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
                style={{ backgroundColor: "#18575A", border: "none" }}
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

// Helper functions
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

export default StaffEdit;