import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Image, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { FaPen } from "react-icons/fa";
import AppUserService from "../../../services/Users/AppUserServices";
import { KiduValidation } from "../../../components/KiduValidation";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduLoader from "../../../components/KiduLoader";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import defaultProfile from "../../../assets/Images/profile.jpeg";

const UserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [initialValues, setInitialValues] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const fields = [
    { name: "name", label: "Name", rules: { required: true, type: "text" as const } },
    { name: "email", label: "Email", rules: { required: false, type: "email" as const } },
    { name: "walletBalance", label: "Wallet Amount", rules: { required: false, type: "number" as const } },
    { name: "registeredDate", label: "Registered Date", rules: { required: true, type: "date" as const } },
    { name: "mobileNumber", label: "Mobile Number", rules: { required: true, type: "tel" as const, minLength: 10, maxLength: 10 } },
    { name: "gender", label: "Gender", rules: { required: true, type: "radio" as const, options: ["Male", "Female", "Other"] } }
  ];

  const interestOptions = [{ value: "reading", label: "Reading" }, { value: "travel", label: "Travel" }, { value: "music", label: "Music" }, { value: "sports", label: "Sports" }, { value: "dance", label: "Dance" }];
  const languageOptions = [{ value: "hindi", label: "Hindi" }, { value: "malayalam", label: "Malayalam" }, { value: "english", label: "English" }];

  const formatDate = (isoString: string | Date | null, dateOnly: boolean = false): string => {
  if (!isoString) return "N/A";

  try {
    const utcDate = new Date(isoString);
    if (isNaN(utcDate.getTime())) return "Invalid Date";

    const istOffsetMs = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(utcDate.getTime() + istOffsetMs);

    const day = String(istDate.getDate()).padStart(2, "0");
    const month = istDate.toLocaleString("en-IN", { month: "long" });
    const year = istDate.getFullYear();

    if (dateOnly) {
      return `${day}-${month}-${year}`;
    }

    const time = istDate.toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    return `${day}-${month}-${year}  ${time}`;
  } catch {
    return "Invalid Date";
  }
};


  const toArray = (value: string | string[] | undefined | null): string[] => {
    if (!value || value === "") return [];
    if (Array.isArray(value)) return value.map(item => String(item).toLowerCase().trim()).filter(Boolean);
    if (typeof value === 'string') {
      const trimmedValue = value.trim();
      if (!trimmedValue) return [];
      try { const parsed = JSON.parse(trimmedValue); if (Array.isArray(parsed)) return parsed.map(item => String(item).toLowerCase().trim()).filter(Boolean); } catch (e) {}
      if (trimmedValue.includes(',')) return trimmedValue.split(",").map(item => item.trim().toLowerCase()).filter(Boolean);
      return [trimmedValue.toLowerCase()];
    }
    return [];
  };

  useEffect(() => {
    if (!userId) return;
    const loadUser = async () => {
      try {
        const res = await AppUserService.getUserById(userId);
        const processedLanguages = toArray(res.prefferedlanguage);
        const processedInterests = toArray(res.interests);
        const userValues = {
          appUserId: res.appUserId, name: res.name || "", email: res.email || "", mobileNumber: res.mobileNumber || "",
          walletBalance: res.walletBalance || 0, status: res.status || "", gender: res.gender || "", isBlocked: res.isBlocked || false,
          isStaff: res.isStaff || false, isKYCCompleted: res.isKYCCompleted || false, isAudultVerificationCompleted: res.isAudultVerificationCompleted || false,
          profileImagePath: res.profileImagePath || "", interests: processedInterests, prefferedlanguage: processedLanguages,
          registeredDate: res.registeredDate ? new Date(res.registeredDate).toISOString().split("T")[0] : "", lastLogin: res.lastLogin || null,
        };
        setFormData(userValues); setInitialValues(userValues);
        const errorObj: Record<string, string> = {}; fields.forEach((field) => (errorObj[field.name] = "")); setErrors(errorObj);
        const imageUrl = res.profileImagePath ? getFullImageUrl(res.profileImagePath) : defaultProfile; setImagePreview(imageUrl);
      } catch (err) { console.error("Load user error:", err); toast.error("Failed to load user"); navigate("/dashboard/user/user-list"); } 
      finally { setLoading(false); }
    };
    loadUser();
  }, [userId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file" && files && files.length > 0) {
      const file = files[0]; setNewImageFile(file);
      if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
      const blobUrl = URL.createObjectURL(file); setImagePreview(blobUrl); return;
    }
    const updated = type === "tel" ? value.replace(/[^0-9]/g, "") : value;
    setFormData((prev: any) => ({ ...prev, [name]: type === "checkbox" ? checked : updated, }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find((f) => f.name === name); if (!field) return true;
    const result = KiduValidation.validate(value, field.rules as any);
    setErrors((prev) => ({ ...prev, [name]: result.message || "" })); return result.isValid;
  };

  const validateForm = () => {
    let valid = true; fields.forEach((field) => { if (!validateField(field.name, formData[field.name])) valid = false; }); return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validateForm()) { toast.error("Please fix validation errors"); return; }
    try {
      const dataToSubmit = { ...formData, interests: Array.isArray(formData.interests) ? formData.interests.join(",") : formData.interests, prefferedlanguage: Array.isArray(formData.prefferedlanguage) ? formData.prefferedlanguage.join(",") : formData.prefferedlanguage, };
      if (!userId) { toast.error("Invalid user ID"); return; }
      await AppUserService.editApp(dataToSubmit as any);
      if (newImageFile) {
        const imageFormData = new FormData(); imageFormData.append("appUserId", userId.toString()); imageFormData.append("ProfilePic", newImageFile);
        const uploadRes = await AppUserService.uploadprofilepic(imageFormData); if (!uploadRes) toast.error("User updated but image upload failed");
      }
      toast.success("User updated successfully!"); setTimeout(() => navigate("/dashboard/user/user-list"), 1500);
    } catch (error: any) { console.error("Update failed:", error); toast.error(error?.message || "Update failed"); }
  };

  useEffect(() => { return () => { if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview); }; }, [imagePreview]);

  if (loading) return <KiduLoader type="Loading User Details..." />;

  return (
    <>
      <Container className="px-4 mt-5 shadow-sm rounded bg-white" style={{ fontFamily: "Urbanist" }}>
        <div className="d-flex align-items-center mb-3"><div className="me-2 mt-3"><KiduPrevious /></div><h4 className="fw-bold mb-0 mt-3" style={{ color: "#882626ff" }}>Edit User</h4></div>
        <hr />
        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            <Col xs={12} md={3} className="d-flex flex-column align-items-start mb-4">
              <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <Image src={imagePreview || defaultProfile} roundedCircle width={160} height={160} style={{ objectFit: "cover", border: "1px solid #ccc" }} onError={(e: any) => { e.target.src = defaultProfile; }} />
                <OverlayTrigger placement="bottom" overlay={<Tooltip>Upload Photo</Tooltip>}>
                  <label htmlFor="photoUpload" style={{ position: "absolute", bottom: "5px", right: "5px", background: "#882626ff", borderRadius: "50%", padding: "8px 11px", cursor: "pointer" }}><FaPen style={{ color: "#fff", fontSize: "14px" }} /></label>
                </OverlayTrigger>
                <Form.Control type="file" id="photoUpload" name="photo" onChange={handleChange} accept="image/*" style={{ display: "none" }} />
              </div>
              <div className="mt-3 text-start"><h5 className="mb-1">{formData.name}</h5><p className="small mb-1 fw-bold text-muted">ID: {formData.appUserId}</p><p className="small text-danger fst-italic">Last Login: {formData?.lastLogin ? formatDate(formData.lastLogin) : 'N/A'}</p></div>
            </Col>
            <Col xs={12} md={9}>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold"><i className="bi bi-person-fill me-2"></i>{fields[0].label} {fields[0].rules.required && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control type="text" name="name" value={formData.name} placeholder="Enter name" onChange={handleChange} onBlur={() => validateField("name", formData.name)} className="input-shadow" />
                  {errors.name && <small className="text-danger">{errors.name}</small>}
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-semibold"><i className="bi bi-telephone-fill me-2"></i>{fields[4].label} {fields[4].rules.required && <span className="text-danger">*</span>}</Form.Label>
                  <Form.Control type="tel" name="mobileNumber" value={formData.mobileNumber} placeholder="Mobile number" disabled style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }} />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold"><i className="bi bi-envelope-fill me-2"></i>{fields[1].label}</Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} placeholder="Enter email" onChange={handleChange} onBlur={() => validateField("email", formData.email)} className="input-shadow" />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-semibold"><i className="bi bi-gender-ambiguous me-2"></i>{fields[5].label} {fields[5].rules.required && <span className="text-danger">*</span>}</Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Form.Check type="radio" label="Male" name="gender" value="Male" checked={formData.gender === "Male"} onChange={handleChange} />
                    <Form.Check type="radio" label="Female" name="gender" value="Female" checked={formData.gender === "Female"} onChange={handleChange} />
                    <Form.Check type="radio" label="Other" name="gender" value="Other" checked={formData.gender === "Other"} onChange={handleChange} />
                  </div>
                  {errors.gender && <small className="text-danger">{errors.gender}</small>}
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-semibold"><i className="bi bi-wallet2 me-2"></i>{fields[2].label}</Form.Label>
                  <Form.Control type="number" name="walletBalance" value={formData.walletBalance} placeholder="Wallet balance" onChange={handleChange} onBlur={() => validateField("walletBalance", formData.walletBalance)} className="input-shadow" />
                  {errors.walletBalance && <small className="text-danger">{errors.walletBalance}</small>}
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-semibold"><i className="bi bi-collection-play me-2"></i>Interests</Form.Label>
                  <Select isMulti options={interestOptions} value={interestOptions.filter((x) => formData.interests?.includes(x.value))} onChange={(e: any) => setFormData((prev: any) => ({ ...prev, interests: e.map((x: any) => x.value) }))} className="basic-multi-select" classNamePrefix="select" />
                </Col>
                <Col md={4} className="mb-3">
                  <Form.Label className="fw-semibold"><i className="bi bi-translate me-2"></i>Languages</Form.Label>
                  <Select isMulti options={languageOptions} value={languageOptions.filter((x) => formData.prefferedlanguage?.includes(x.value))} onChange={(e: any) => setFormData((prev: any) => ({ ...prev, prefferedlanguage: e.map((x: any) => x.value) }))} className="basic-multi-select" classNamePrefix="select" />
                </Col>
              </Row>
              <Row className="mt-4 mb-4">
                <Col md={3}><Form.Check type="switch" label="Blocked" checked={formData.isBlocked} name="isBlocked" onChange={handleChange} /></Col>
                
                {/*  <Col md={3}><Form.Check type="switch" label="KYC Complete" checked={formData.isKYCCompleted} name="isKYCCompleted" onChange={handleChange} /></Col>*/}

                <Col md={3}><Form.Check type="switch" label="Adult Verification" checked={formData.isAudultVerificationCompleted} name="isAudultVerificationCompleted" onChange={handleChange} /></Col>
                <Col md={3}><Form.Check type="switch" label="Is Staff" checked={formData.isStaff} name="isStaff" onChange={handleChange} /></Col>
              </Row>
            </Col>
          </Row>
          
          {/* BUTTONS */}
          <div className="d-flex gap-2 justify-content-end mt-2">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button type="submit" style={{ backgroundColor: "#882626ff", border: "none" }}>Edit</Button>
          </div>
        </Form>
        
       <div className="mt-2 pb-3"> {/* Audit Logs Section - Remove the wrapper div and let the component handle its own spacing */}
        {formData.appUserId && <KiduAuditLogs tableName="AppUser" recordId={formData.appUserId} />}</div>
        
      </Container>
      <Toaster position="top-right" />
    </>
  );
};

export default UserEdit;