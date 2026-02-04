// src/pages/settings/adminUsers/EditAdminUser.tsx
import React, { useEffect, useState } from "react";
import { Form, Button, Card, Row, Col, Image } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaPen } from "react-icons/fa6";
import CompanyService from "../../../services/settings/Company.services";
import AdminUserService from "../../../services/settings/AdminUser.services";
import KiduValidation from "../../../components/KiduValidation";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import AuditTrailsComponent from "../../../components/KiduAuditLogs";
import KiduLoader from "../../../components/KiduLoader";
import defaultProfile from "../../../assets/Images/profile.jpeg";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";

const EditAdminUser: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const fields = [
    { name: "userName", rules: { required: true, type: "text", label: "User Name" } },
    { name: "companyId", rules: { required: true, type: "select", label: "Company" } },
    { name: "userEmail", rules: { required: true, type: "email", label: "Email ID" } },
    { name: "phoneNumber", rules: { required: true, type: "number", minLength: 10, maxLength: 10, label: "Phone Number" } },
    { name: "address", rules: { required: false, type: "text", label: "Address" } }
  ];

  const [formData, setFormData] = useState<any>({});
  const [initialValues, setInitialValues] = useState<any>({});
  const [errors, setErrors] = useState<any>({});
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultProfile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tableName = "User";
  const recordId = Number(userId);

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

  const formatDate = (value: string | Date) => {
    if (!value) return "N/A";

    const utcDate = new Date(value);
    if (isNaN(utcDate.getTime())) return "Invalid Date";

    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcDate.getTime() + istOffsetMs);

    const day = String(istDate.getDate()).padStart(2, "0");
    const month = istDate.toLocaleString("en-IN", { month: "long" });
    const year = istDate.getFullYear();
    const time = istDate.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    return `${day}-${month}-${year} ${time}`;
  };


  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await CompanyService.getAllCompany();
        if (res.isSucess && res.value) {
          setCompanies(res.value);
        } else {
          toast.error("Failed to load companies");
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await AdminUserService.getById(Number(userId));
        if (res.isSucess && res.value) {
          const d = res.value;

          const loadedValues = {
            userName: d.userName || "",
            companyId: d.companyId || "",
            userEmail: (d.userEmail || "").toLowerCase().trim(), // Normalize email on load
            phoneNumber: d.phoneNumber || "",
            address: d.address || "",
            createAt: d.createAt || "",
            lastlogin: d.lastlogin || "",
            profileImagePath: d.profileImagePath || ""
          };

          setFormData(loadedValues);
          setInitialValues(loadedValues);

          // Set profile picture
          const imageUrl = d.profileImagePath 
            ? getFullImageUrl(d.profileImagePath) 
            : defaultProfile;
          setPreviewUrl(imageUrl);

          const errObj: any = {};
          fields.forEach(f => (errObj[f.name] = ""));
          setErrors(errObj);
        } else {
          toast.error("Failed to load admin user details");
          navigate("dashboard/settings/adminUsers-list");
        }
      } catch (err: any) {
        toast.error(err.message);
        navigate("/dashboard/settings/adminUsers-list");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, navigate]);

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

      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        toast.error("Only JPG, PNG, GIF, WEBP files are allowed");
        return;
      }

      // Validate file size (max 2MB)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File size exceeds 2MB");
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
    let updated = type === "tel" ? value.replace(/[^0-9]/g, "") : value;

    // Normalize email to lowercase and trim whitespace
    if (name === "userEmail") {
      updated = value.toLowerCase().trim();
    }

    setFormData((prev: any) => ({ ...prev, [name]: updated }));

    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: any) => {
    const rule = fields.find(f => f.name === name)?.rules;
    if (!rule) return true;
    const result = KiduValidation.validate(value, rule as any);
    setErrors((prev: any) => ({
      ...prev,
      [name]: result.isValid ? "" : result.message
    }));
    return result.isValid;
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
      const userIdFromUrl = parseInt(userId!);
      
      // Upload profile picture first if a new one was selected
      let profileImagePath = formData.profileImagePath;
      if (selectedFile) {
        const uploadResponse = await AdminUserService.uploadProfilePic(userIdFromUrl, selectedFile);
        if (uploadResponse && uploadResponse.isSucess) {
          profileImagePath = uploadResponse.value;
        }
      }
      
      // Prepare data matching the exact Swagger format
      const dataToUpdate = {
        userId: userIdFromUrl, // CRITICAL: Must match URL parameter
        userName: formData.userName,
        userEmail: formData.userEmail.toLowerCase().trim(), // Ensure email is lowercase
        phoneNumber: formData.phoneNumber,
        profileImagePath: profileImagePath || "string",
        address: formData.address || "",
        passwordHash: formData.passwordHash || "",
        isActive: true,
        islocked: false,
        createAt: formData.createAt ? new Date(formData.createAt).toISOString() : new Date().toISOString(),
        lastlogin: formData.lastlogin ? new Date(formData.lastlogin).toISOString() : new Date().toISOString(),
        companyId: parseInt(formData.companyId) || 0
      };

      console.log("🔍 URL userId:", userIdFromUrl);
      console.log("📦 Payload:", JSON.stringify(dataToUpdate, null, 2));

      // Call the update service
      const updateResponse = await AdminUserService.update(userIdFromUrl, dataToUpdate);

      if (!updateResponse || !updateResponse.isSucess) {
        throw new Error(updateResponse?.customMessage || updateResponse?.error || "Failed to update user");
      }

      toast.success("User updated successfully!");
      setTimeout(() => navigate("/dashboard/settings/adminUsers-list"), 1500);
    } catch (error: any) {
      console.error("❌ Update failed:", error);
      toast.error(`Error updating user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <KiduLoader type="admin user details..." />;

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Edit Admin User</h5>
            </div>
          </div>

          <Card.Body style={{ padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                {/* Profile Picture Section - Left Side */}
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
                      onError={(e: any) => { e.target.src = defaultProfile; }}
                    />
                    <label
                      htmlFor="profilePicture"
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
                  <h6 className="fw-bold" style={{ color: "#882626ff" }}>
                    {formData.userName || "Unknown"}
                  </h6>
                  <p className="small text-muted mb-1">User ID: {userId || "N/A"}</p>
                  {formData.lastlogin && (
                    <p className="small text-danger fst-italic mb-2">
                      Last Login: {formatDate(formData.lastlogin)}
                    </p>
                  )}
                </Col>

                {/* Form Fields Section - Right Side */}
                <Col xs={12} md={9}>
                  <Row className="g-2">
                    <Col md={6}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("userName")}</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        name="userName"
                        value={formData.userName}
                        placeholder="Enter username"
                        maxLength={30}
                        onChange={handleChange}
                        onBlur={() => validateField("userName", formData.userName)}
                      />
                      {errors.userName && (
                        <div className="text-danger small">{errors.userName}</div>
                      )}
                    </Col>

                    <Col md={6}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("companyId")}</Form.Label>
                      <Form.Select
                        size="sm"
                        name="companyId"
                        value={formData.companyId}
                        onChange={handleChange}
                        onBlur={() => validateField("companyId", formData.companyId)}
                      >
                        <option value="">-- Select Company --</option>
                        {companies.map((c: any) => (
                          <option key={c.companyId} value={c.companyId}>
                            {c.comapanyName}
                          </option>
                        ))}
                      </Form.Select>
                      {errors.companyId && (
                        <div className="text-danger small">{errors.companyId}</div>
                      )}
                    </Col>

                    <Col md={6}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("userEmail")}</Form.Label>
                      <Form.Control
                        size="sm"
                        type="email"
                        name="userEmail"
                        value={formData.userEmail}
                        placeholder="Enter email"
                        onChange={handleChange}
                        onBlur={() => validateField("userEmail", formData.userEmail)}
                      />
                      {errors.userEmail && (
                        <div className="text-danger small">{errors.userEmail}</div>
                      )}
                    </Col>

                    <Col md={6}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("phoneNumber")}</Form.Label>
                      <Form.Control
                        size="sm"
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        placeholder="Enter phone number"
                        onChange={handleChange}
                        onBlur={() => validateField("phoneNumber", formData.phoneNumber)}
                      />
                      {errors.phoneNumber && (
                        <div className="text-danger small">{errors.phoneNumber}</div>
                      )}
                    </Col>

                    <Col md={6}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("address")}</Form.Label>
                      <Form.Control
                        size="sm"
                        as="textarea"
                        rows={3}
                        name="address"
                        value={formData.address}
                        placeholder="Enter address"
                        maxLength={200}
                        onChange={handleChange}
                        onBlur={() => validateField("address", formData.address)}
                      />
                      {errors.address && (
                        <div className="text-danger small">{errors.address}</div>
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 me-2">
                <KiduReset initialValues={initialValues} setFormData={setFormData} />
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
            <div className="mt-4">
              <AuditTrailsComponent tableName={tableName} recordId={recordId} />
            </div>
          </Card.Body>
        </Card>

        <Toaster position="top-right" />
      </div>
    </>
  );
};

export default EditAdminUser;