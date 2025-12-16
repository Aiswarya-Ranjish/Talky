import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaPen } from "react-icons/fa";
import defaultLogo from "../../../assets/Images/company.png";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import KiduValidation from "../../../components/KiduValidation";
import CompanyService from "../../../services/settings/Company.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduLoader from "../../../components/KiduLoader";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import { Company } from "../../../types/settings/Company.types";

const CompanyEdit: React.FC = () => {
  const navigate = useNavigate();
  const { companyId } = useParams<{ companyId: string }>();

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

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach(f => {
    initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState<Company>({
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
  });

  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultLogo);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Company | null>(null);

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
    const fetchCompany = async () => {
      try {
        setLoading(true);
        if (!companyId) { 
          toast.error("No company ID provided"); 
          navigate("/dashboard/settings/company-list"); 
          return; 
        }
        
        const response = await CompanyService.getCompanyById(companyId);
        
        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || response?.error || "Failed to load company");
        }

        const data = response.value;
        const formattedData: Company = {
          companyId: data.companyId || 0,
          comapanyName: data.comapanyName || "",
          website: data.website || "",
          contactNumber: data.contactNumber || "",
          email: data.email || "",
          taxNumber: data.taxNumber || "",
          addressLine1: data.addressLine1 || "",
          addressLine2: data.addressLine2 || "",
          city: data.city || "",
          state: data.state || "",
          country: data.country || "",
          zipCode: data.zipCode || "",
          invoicePrefix: data.invoicePrefix || "",
          companyLogo: data.companyLogo || "",
          isActive: data.isActive ?? true,
          isDeleted: data.isDeleted ?? false,
          auditLogs: data.auditLogs
        };

        setFormData(formattedData);
        setInitialData(formattedData);
        const imageUrl = formattedData.companyLogo ? getFullImageUrl(formattedData.companyLogo) : defaultLogo;
        setPreviewUrl(imageUrl);
      } catch (error: any) {
        console.error("Failed to load company:", error);
        toast.error(`Error loading company: ${error.message}`);
        navigate("/dashboard/settings/company-list");
      } finally { 
        setLoading(false); 
      }
    };
    fetchCompany();
  }, [companyId, navigate]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      if (f.rules.required && !validateField(f.name, formData[f.name as keyof Company])) {
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
      if (!companyId) throw new Error("No company ID available");
      
      // Step 1: Update company data
      const dataToUpdate: Company = {
        companyId: Number(formData.companyId),
        comapanyName: formData.comapanyName || "",
        website: formData.website || "",
        contactNumber: formData.contactNumber || "",
        email: formData.email || "",
        taxNumber: formData.taxNumber || "",
        addressLine1: formData.addressLine1 || "",
        addressLine2: formData.addressLine2 || "",
        city: formData.city || "",
        state: formData.state || "",
        country: formData.country || "",
        zipCode: formData.zipCode || "",
        invoicePrefix: formData.invoicePrefix || "",
        companyLogo: formData.companyLogo || "",
        isActive: Boolean(formData.isActive),
        isDeleted: Boolean(formData.isDeleted)
      };

      console.log("Updating company data...");
      const response = await CompanyService.updateCompany(companyId, dataToUpdate);
      
      if (!response || !response.isSucess) {
        throw new Error(response?.customMessage || response?.error || "Failed to update company");
      }

      // Step 2: Upload new logo if selected
      if (selectedFile) {
        console.log("Uploading new company logo...");
        const logoResponse = await CompanyService.uploadCompanyLogo(
          Number(companyId),
          selectedFile
        );

        if (!logoResponse || !logoResponse.isSucess) {
          console.warn("Logo upload failed:", logoResponse?.customMessage || logoResponse?.error);
          toast.success("Company updated successfully, but logo upload failed.");
        } else {
          console.log("Logo uploaded successfully");
          toast.success("Company and logo updated successfully!");
        }
      } else {
        toast.success("Company updated successfully!");
      }

      setTimeout(() => navigate("/dashboard/settings/company-list"), 1500);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Error updating company: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <KiduLoader type="Company..." />;

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Edit Company</h5>
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
                        backgroundColor: "#882626ff"
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
                  <h6 className="fw-bold" style={{ color: "#882626ff" }}>
                    {formData.comapanyName || "Unknown"}
                  </h6>
                  <p className="small text-muted mb-1">ID: {formData.companyId || "N/A"}</p>
                  <p className="small text-muted">Upload company logo</p>
                </Col>

                {/* Form Fields Section */}
                <Col xs={12} md={9}>
                  <Row className="g-2">
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("comapanyName")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="comapanyName" 
                        value={formData.comapanyName}
                        onChange={handleChange} 
                        onBlur={() => validateField("comapanyName", formData.comapanyName)} 
                        placeholder="Enter Company Name"
                      />
                      {errors.comapanyName && <div className="text-danger small">{errors.comapanyName}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("website")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="website" 
                        value={formData.website}
                        onChange={handleChange} 
                        onBlur={() => validateField("website", formData.website)} 
                        placeholder="Enter Website"
                      />
                      {errors.website && <div className="text-danger small">{errors.website}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("contactNumber")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="tel" 
                        name="contactNumber" 
                        value={formData.contactNumber}
                        onChange={handleChange} 
                        onBlur={() => validateField("contactNumber", formData.contactNumber)} 
                        placeholder="Enter Contact Number"
                        maxLength={10}
                      />
                      {errors.contactNumber && <div className="text-danger small">{errors.contactNumber}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("email")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange} 
                        onBlur={() => validateField("email", formData.email)} 
                        placeholder="Enter Email"
                      />
                      {errors.email && <div className="text-danger small">{errors.email}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("taxNumber")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="taxNumber" 
                        value={formData.taxNumber}
                        onChange={handleChange} 
                        onBlur={() => validateField("taxNumber", formData.taxNumber)} 
                        placeholder="Enter Tax Number"
                      />
                      {errors.taxNumber && <div className="text-danger small">{errors.taxNumber}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("addressLine1")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="addressLine1" 
                        value={formData.addressLine1}
                        onChange={handleChange} 
                        onBlur={() => validateField("addressLine1", formData.addressLine1)} 
                        placeholder="Enter Address Line 1"
                      />
                      {errors.addressLine1 && <div className="text-danger small">{errors.addressLine1}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("addressLine2")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="addressLine2" 
                        value={formData.addressLine2}
                        onChange={handleChange} 
                        onBlur={() => validateField("addressLine2", formData.addressLine2)} 
                        placeholder="Enter Address Line 2"
                      />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("city")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="city" 
                        value={formData.city}
                        onChange={handleChange} 
                        onBlur={() => validateField("city", formData.city)} 
                        placeholder="Enter City"
                      />
                      {errors.city && <div className="text-danger small">{errors.city}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("state")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="state" 
                        value={formData.state}
                        onChange={handleChange} 
                        onBlur={() => validateField("state", formData.state)} 
                        placeholder="Enter State"
                      />
                      {errors.state && <div className="text-danger small">{errors.state}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("country")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="country" 
                        value={formData.country}
                        onChange={handleChange} 
                        onBlur={() => validateField("country", formData.country)} 
                        placeholder="Enter Country"
                      />
                      {errors.country && <div className="text-danger small">{errors.country}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("zipCode")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="tel" 
                        name="zipCode" 
                        value={formData.zipCode}
                        onChange={handleChange} 
                        onBlur={() => validateField("zipCode", formData.zipCode)} 
                        placeholder="Enter Zip Code"
                      />
                      {errors.zipCode && <div className="text-danger small">{errors.zipCode}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("invoicePrefix")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="text" 
                        name="invoicePrefix" 
                        value={formData.invoicePrefix}
                        onChange={handleChange} 
                        onBlur={() => validateField("invoicePrefix", formData.invoicePrefix)} 
                        placeholder="Enter Invoice Prefix"
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
                      type="switch" 
                      id="isActive" 
                      name="isActive" 
                      label="Is Active"
                      checked={formData.isActive || false} 
                      onChange={handleChange} 
                      className="fw-semibold" 
                    />
                    <Form.Check 
                      type="switch" 
                      id="isDeleted" 
                      name="isDeleted" 
                      label="Is Deleted"
                      checked={formData.isDeleted || false} 
                      onChange={handleChange} 
                      className="fw-semibold" 
                    />
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 me-2">
                {initialData && (
                  <KiduReset initialValues={initialData} setFormData={setFormData} setErrors={setErrors} />
                )}
                <Button 
                  type="submit" 
                  style={{ backgroundColor: "#882626ff", border: "none" }} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </div>
            </Form>

            {/* Audit Logs */}
            {formData.companyId && (
              <KiduAuditLogs tableName="Company" recordId={formData.companyId.toString()} />
            )}
          </Card.Body>
        </Card>

        <Toaster position="top-right" />
      </div>
    </>
  );
};

export default CompanyEdit;