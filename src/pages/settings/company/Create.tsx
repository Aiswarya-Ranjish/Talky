import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaPen } from "react-icons/fa";
import defaultLogo from "../../../assets/Images/company.png";
import KiduValidation from "../../../components/KiduValidation";
import CompanyService from "../../../services/settings/Company.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduLoader from "../../../components/KiduLoader";

const CompanyCreate: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    { name: "comapanyName", rules: { required: true, type: "text" as const, label: "Company Name" } },
    { name: "website", rules: { required: true, type: "text" as const, label: "Website" } },
    { name: "contactNumber", rules: { required: true, type: "text" as const, label: "Contact Number", minLength: 10, maxLength: 10 } },
    { name: "email", rules: { required: true, type: "email" as const, label: "Email" } },
    { name: "taxNumber", rules: { required: true, type: "text" as const, label: "Tax Number" } },
    { name: "addressLine1", rules: { required: true, type: "text" as const, label: "Address Line 1" } },
    { name: "addressLine2", rules: { required: false, type: "text" as const, label: "Address Line 2" } },
    { name: "city", rules: { required: true, type: "text" as const, label: "City" } },
    { name: "state", rules: { required: true, type: "text" as const, label: "State" } },
    { name: "country", rules: { required: true, type: "text" as const, label: "Country" } },
    { name: "zipCode", rules: { required: true, type: "text" as const, label: "Zip Code" } },
    { name: "invoicePrefix", rules: { required: false, type: "text" as const, label: "Invoice Prefix" } },
  ];

  const initialValues: any = {
    companyId: 0,
    comapanyName: "",
    website: "",
    contactNumber: "",
    email: "",
    taxNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    invoicePrefix: "",
    companyLogo: "",
    isActive: true,
    isDeleted: false,
  };

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultLogo);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new window.Image();
      
      img.onload = () => {
        // Create canvas to resize image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize to max 800x800 to reduce base64 size
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 (quality 0.8 for JPEG)
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        resolve(base64);
      };
      
      img.onerror = () => reject(new Error("Failed to load image"));
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const objectUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    let updatedValue: any = value;
    
    if (type === "checkbox") {
      updatedValue = target.checked;
    } else if (type === "tel" || (name === "contactNumber" || name === "zipCode")) {
      updatedValue = value.replace(/[^0-9]/g, "");
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: updatedValue }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    const result = KiduValidation.validate(value, field.rules);
    if (!result.isValid) {
      const label = field.rules.label || "This field";
      setErrors((prev: any) => ({ ...prev, [name]: `${label} is required.` }));
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
    
    if (!validateForm()) {
      toast.error("Please fill all required fields");
      return;
    }
    
    if (!selectedFile) {
      toast.error("Please upload a company logo");
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Convert image to base64 (if file selected)
      let base64Logo = "";
      if (selectedFile) {
        base64Logo = await fileToBase64(selectedFile);
      }
      
      // Send as JSON - all fields properly filled from form validation
      const dataToSend = {
        companyId: 0,
        comapanyName: formData.comapanyName.trim(),
        website: formData.website.trim(),
        contactNumber: formData.contactNumber.trim(),
        email: formData.email.trim(),
        taxNumber: formData.taxNumber.trim(),
        addressLine1: formData.addressLine1.trim(),
        addressLine2: formData.addressLine2.trim() || "",
        city: formData.city.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        zipCode: formData.zipCode.trim(),
        invoicePrefix: formData.invoicePrefix.trim() || "",
        companyLogo: base64Logo,
        isActive: true,
        isDeleted: false,
      };

      // Debug: Log the payload
      console.log("Sending data:", {
        ...dataToSend,
        companyLogo: dataToSend.companyLogo ? `[Base64 string length: ${dataToSend.companyLogo.length}]` : "empty"
      });

      const response = await CompanyService.addCompany(dataToSend);
      
      console.log("Server response:", response);
      
      // ✅ Backend returns Company directly, not CustomResponse
      if (!response) {
        throw new Error("Failed to create company");
      }

      toast.success("Company created successfully!");
      setTimeout(() => navigate("/dashboard/settings/company-list"), 1500);
      
    } catch (error: any) {
      console.error("Create failed:", error);
      
      let errorMessage = "An error occurred while creating the company";
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.error) {
          errorMessage = data.error;
        } else if (data.customMessage) {
          errorMessage = data.customMessage;
        } else if (data.title) {
          errorMessage = data.title;
        } else if (data.errors) {
          const validationErrors = Object.values(data.errors).flat();
          errorMessage = validationErrors.join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialValues);
    setErrors({});
    setSelectedFile(null);
    setPreviewUrl(defaultLogo);
  };

  if (loading) return <KiduLoader type="Company..." />;

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Create Company</h5>
            </div>
          </div>

          <Card.Body style={{ padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                {/* Company Logo Section */}
                <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                  <div className="position-relative d-inline-block mb-2">
                    <Image 
                      src={previewUrl} 
                      alt="Company Logo" 
                      roundedCircle
                      style={{ 
                        width: "130px", 
                        height: "140px", 
                        objectFit: "cover", 
                        border: "3px solid #882626ff" 
                      }}
                      onError={(e: any) => { e.target.src = defaultLogo; }} 
                    />
                    <label 
                      htmlFor="companyLogo"
                      className="position-absolute text-white rounded-circle d-flex justify-content-center align-items-center"
                      style={{ 
                        width: "32px", 
                        height: "32px", 
                        cursor: "pointer", 
                        bottom: "5px", 
                        right: "calc(50% - 65px)", 
                        border: "2px solid white", 
                        backgroundColor:"#882626ff"
                      }}
                      title="Upload Logo"
                    >
                      <FaPen size={14} />
                    </label>
                    <input 
                      type="file" 
                      id="companyLogo" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      style={{ display: "none" }} 
                    />
                  </div>
                  <h6 className="fw-bold mt-3" style={{ color: "#882626ff" }}>
                    {formData.comapanyName || "Company Logo"}
                  </h6>
                  <p className="small text-muted">Upload company logo<span style={{ color: "red" }}>*</span></p>
                </Col>

                {/* Form Fields Section */}
                <Col xs={12} md={9}>
                  <Row className="g-2">
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("comapanyName")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="comapanyName" value={formData.comapanyName}
                        onChange={handleChange} onBlur={() => validateField("comapanyName", formData.comapanyName)} 
                        placeholder="Enter Company Name"
                      />
                      {errors.comapanyName && <div className="text-danger small">{errors.comapanyName}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("website")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="website" value={formData.website}
                        onChange={handleChange} onBlur={() => validateField("website", formData.website)} 
                        placeholder="Enter Website"
                      />
                      {errors.website && <div className="text-danger small">{errors.website}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("contactNumber")}</Form.Label>
                      <Form.Control 
                        size="sm" type="tel" name="contactNumber" value={formData.contactNumber}
                        onChange={handleChange} onBlur={() => validateField("contactNumber", formData.contactNumber)} 
                        placeholder="Enter Contact Number" maxLength={10}
                      />
                      {errors.contactNumber && <div className="text-danger small">{errors.contactNumber}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("email")}</Form.Label>
                      <Form.Control 
                        size="sm" type="email" name="email" value={formData.email}
                        onChange={handleChange} onBlur={() => validateField("email", formData.email)} 
                        placeholder="Enter Email"
                      />
                      {errors.email && <div className="text-danger small">{errors.email}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("taxNumber")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="taxNumber" value={formData.taxNumber}
                        onChange={handleChange} onBlur={() => validateField("taxNumber", formData.taxNumber)} 
                        placeholder="Enter Tax Number"
                      />
                      {errors.taxNumber && <div className="text-danger small">{errors.taxNumber}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("addressLine1")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="addressLine1" value={formData.addressLine1}
                        onChange={handleChange} onBlur={() => validateField("addressLine1", formData.addressLine1)} 
                        placeholder="Enter Address Line 1"
                      />
                      {errors.addressLine1 && <div className="text-danger small">{errors.addressLine1}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("addressLine2")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="addressLine2" value={formData.addressLine2}
                        onChange={handleChange} placeholder="Enter Address Line 2"
                      />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("city")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="city" value={formData.city}
                        onChange={handleChange} onBlur={() => validateField("city", formData.city)} 
                        placeholder="Enter City"
                      />
                      {errors.city && <div className="text-danger small">{errors.city}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("state")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="state" value={formData.state}
                        onChange={handleChange} onBlur={() => validateField("state", formData.state)} 
                        placeholder="Enter State"
                      />
                      {errors.state && <div className="text-danger small">{errors.state}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("country")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="country" value={formData.country}
                        onChange={handleChange} onBlur={() => validateField("country", formData.country)} 
                        placeholder="Enter Country"
                      />
                      {errors.country && <div className="text-danger small">{errors.country}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("zipCode")}</Form.Label>
                      <Form.Control 
                        size="sm" type="tel" name="zipCode" value={formData.zipCode}
                        onChange={handleChange} onBlur={() => validateField("zipCode", formData.zipCode)} 
                        placeholder="Enter Zip Code"
                      />
                      {errors.zipCode && <div className="text-danger small">{errors.zipCode}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("invoicePrefix")}</Form.Label>
                      <Form.Control 
                        size="sm" type="text" name="invoicePrefix" value={formData.invoicePrefix}
                        onChange={handleChange} placeholder="Enter Invoice Prefix"
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Switches Section */}
              <Row className="mb-3 mx-1">
                <Col xs={12}>
                  <div className="d-flex flex-wrap gap-3">
                    <Form.Check 
                      type="switch" id="isActive" name="isActive" label="Is Active"
                      checked={formData.isActive || false} onChange={handleChange} className="fw-semibold" 
                    />
                    <Form.Check 
                      type="switch" id="isDeleted" name="isDeleted" label="Is Deleted"
                      checked={formData.isDeleted || false} onChange={handleChange} className="fw-semibold" 
                    />
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 me-2">
                <Button type="button" variant="secondary" onClick={handleReset} disabled={isSubmitting}>
                  Reset
                </Button>
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

export default CompanyCreate;