// src/pages/user/UserEdit.tsx
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

  // ---------------------- FIELD RULES ----------------------
  const fields = [
    { name: "name", label: "Name", rules: { required: true, type: "text" as const } },
    { name: "email", label: "Email", rules: { required: false, type: "email" as const } },
    { name: "walletBalance", label: "Wallet Amount", rules: { required: false, type: "number" as const } },
    { name: "registeredDate", label: "Registered Date", rules: { required: true, type: "date" as const } },
    { name: "mobileNumber", label: "Mobile Number", rules: { required: true, type: "tel" as const, minLength: 10, maxLength: 10 } },
    { 
      name: "gender", 
      label: "Gender", 
      rules: { 
        required: true, 
        type: "radio" as const, 
        options: ["Male", "Female", "Other"] 
      } 
    }
  ];

  const interestOptions = [
    { value: "reading", label: "Reading" },
    { value: "travel", label: "Travel" },
    { value: "music", label: "Music" },
    { value: "sports", label: "Sports" },
    { value: "dance", label: "Dance" },
  ];

  const languageOptions = [
    { value: "hindi", label: "Hindi" },
    { value: "malayalam", label: "Malayalam" },
    { value: "english", label: "English" },
  ];

  // ✅ IMPROVED toArray function - handles all formats and normalizes to lowercase
  const toArray = (value: string | string[] | undefined | null): string[] => {
    // Handle null/undefined/empty string
    if (!value || value === "") return [];
    
    // If already an array, normalize to lowercase
    if (Array.isArray(value)) {
      return value.map(item => String(item).toLowerCase().trim()).filter(Boolean);
    }
    
    // If it's a string, try to parse as JSON first
    if (typeof value === 'string') {
      // Trim the value first
      const trimmedValue = value.trim();
      
      // Handle empty string after trim
      if (!trimmedValue) return [];
      
      // Try parsing as JSON array
      try {
        const parsed = JSON.parse(trimmedValue);
        if (Array.isArray(parsed)) {
          return parsed.map(item => String(item).toLowerCase().trim()).filter(Boolean);
        }
      } catch (e) {
        // Not JSON, continue to comma-separated logic
      }
      
      // Check if it contains commas (multiple values)
      if (trimmedValue.includes(',')) {
        // Handle comma-separated string and normalize to lowercase
        return trimmedValue.split(",").map(item => item.trim().toLowerCase()).filter(Boolean);
      }
      
      // ✅ Single value - just return it as an array with lowercase
      return [trimmedValue.toLowerCase()];
    }
    
    return [];
  };

  // ------------------------------- FETCH USER --------------------------------
  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      try {
        const res = await AppUserService.getUserById(userId);

        // 🔍 Debug logging (you can remove these after confirming it works)
        console.log("=== API Response Debug ===");
        console.log("Raw prefferedlanguage:", res.prefferedlanguage);
        console.log("Raw interests:", res.interests);

        const processedLanguages = toArray(res.prefferedlanguage);
        const processedInterests = toArray(res.interests);

        console.log("Processed languages:", processedLanguages);
        console.log("Processed interests:", processedInterests);

        const userValues = {
          appUserId: res.appUserId,
          name: res.name || "",
          email: res.email || "",
          mobileNumber: res.mobileNumber || "",
          walletBalance: res.walletBalance || 0,
          status: res.status || "",
          gender: res.gender || "",
          isBlocked: res.isBlocked || false,
          isStaff: res.isStaff || false,
          isKYCCompleted: res.isKYCCompleted || false,
          isAudultVerificationCompleted: res.isAudultVerificationCompleted || false,
          profileImagePath: res.profileImagePath || "",
          interests: processedInterests,
          prefferedlanguage: processedLanguages,
          registeredDate: res.registeredDate
            ? new Date(res.registeredDate).toISOString().split("T")[0]
            : "",
        };

        setFormData(userValues);
        setInitialValues(userValues);

        const errorObj: Record<string, string> = {};
        fields.forEach((field) => (errorObj[field.name] = ""));
        setErrors(errorObj);

        // ✅ Load existing image using helper function
        const imageUrl = res.profileImagePath ? getFullImageUrl(res.profileImagePath) : defaultProfile;
        console.log("Image URL:", imageUrl);
        setImagePreview(imageUrl);

      } catch (err) {
        console.error("Load user error:", err);
        toast.error("Failed to load user");
        navigate("/dashboard/user/user-list");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [userId, navigate]);

  // ------------------------------- HANDLERS --------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file" && files && files.length > 0) {
      const file = files[0];
      setNewImageFile(file);

      // ✅ Only revoke blob URLs, not http URLs
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      const blobUrl = URL.createObjectURL(file);
      console.log("New image selected, blob URL created:", blobUrl);
      setImagePreview(blobUrl);
      return;
    }

    const updated = type === "tel" ? value.replace(/[^0-9]/g, "") : value;
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : updated,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find((f) => f.name === name);
    if (!field) return true;

    const result = KiduValidation.validate(value, field.rules as any);
    setErrors((prev) => ({ ...prev, [name]: result.message || "" }));
    return result.isValid;
  };

  const validateForm = () => {
    let valid = true;
    fields.forEach((field) => {
      if (!validateField(field.name, formData[field.name])) valid = false;
    });
    return valid;
  };

  // ------------------------------- SUBMIT --------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }

    try {
      const dataToSubmit = {
        ...formData,
        interests: Array.isArray(formData.interests)
          ? formData.interests.join(",")
          : formData.interests,
        prefferedlanguage: Array.isArray(formData.prefferedlanguage)
          ? formData.prefferedlanguage.join(",")
          : formData.prefferedlanguage,
      };

      if (!userId) {
        toast.error("Invalid user ID");
        return;
      }

      // Update user basic details
      await AppUserService.editApp(dataToSubmit as any);

      // ✅ Upload new image only if a new file was selected
      if (newImageFile) {
        console.log("Uploading new profile picture...");
        const imageFormData = new FormData();
        imageFormData.append("appUserId", userId.toString());
        imageFormData.append("ProfilePic", newImageFile);

        const uploadRes = await AppUserService.uploadprofilepic(imageFormData);
        if (!uploadRes) {
          console.error("Image upload failed");
          toast.error("User updated but image upload failed");
        } else {
          console.log("Image uploaded successfully");
        }
      }

      toast.success("User updated successfully!");
      setTimeout(() => navigate("/dashboard/user/user-list"), 1500);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error?.message || "Update failed");
    }
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  if (loading) return <KiduLoader type="Loading User Details..." />;

  return (
    <>
      <Container className="px-4 mt-5 shadow-sm rounded bg-white" style={{ fontFamily: "Urbanist" }}>
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 mt-3"><KiduPrevious /></div>
          <h4 className="fw-bold mb-0 mt-3" style={{ color: "#18575A" }}>Edit User</h4>
        </div>

        <hr />

        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            {/* IMAGE SECTION */}
            <Col xs={12} md={4} className="d-flex flex-column align-items-center mb-4">
              <div style={{ position: "relative", width: "160px", height: "160px" }}>
                <Image 
                  src={imagePreview || defaultProfile}
                  roundedCircle 
                  width={160} 
                  height={160}
                  style={{ objectFit: "cover", border: "1px solid #ccc" }}
                  onError={(e: any) => { 
                    console.error("Image load error, using default");
                    e.target.src = defaultProfile; 
                  }}
                />

                <OverlayTrigger placement="bottom" overlay={<Tooltip>Upload Photo</Tooltip>}>
                  <label htmlFor="photoUpload"
                    style={{ 
                      position: "absolute", 
                      bottom: "5px", 
                      right: "5px", 
                      background: "#18575A", 
                      borderRadius: "50%", 
                      padding: "8px 11px", 
                      cursor: "pointer" 
                    }}>
                    <FaPen style={{ color: "#fff", fontSize: "14px" }} />
                  </label>
                </OverlayTrigger>

                <Form.Control 
                  type="file" 
                  id="photoUpload" 
                  name="photo"
                  onChange={handleChange} 
                  accept="image/*"
                  style={{ display: "none" }} 
                />
              </div>
            </Col>

            {/* FORM FIELDS */}
            <Col xs={12} md={8}>
              <Row>
                {/* Name */}
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[0].label} {fields[0].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Enter name"
                    onChange={handleChange}
                    onBlur={() => validateField("name", formData.name)}
                  />
                  {errors.name && <small className="text-danger">{errors.name}</small>}
                </Col>

                {/* Email */}
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[1].label} {fields[1].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Enter email"
                    onChange={handleChange}
                    onBlur={() => validateField("email", formData.email)}
                  />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </Col>

                {/* Mobile Number (Read-only) */}
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[4].label} {fields[4].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    placeholder="Mobile number"
                    disabled
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                  />
                  {errors.mobileNumber && <small className="text-danger">{errors.mobileNumber}</small>}
                </Col>

                {/* Wallet Balance */}
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[2].label}
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="walletBalance"
                    value={formData.walletBalance}
                    placeholder="Wallet balance"
                    onChange={handleChange}
                    onBlur={() => validateField("walletBalance", formData.walletBalance)}
                  />
                  {errors.walletBalance && <small className="text-danger">{errors.walletBalance}</small>}
                </Col>

                {/* Registered Date */}
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    Registered Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="registeredDate"
                    value={formData.registeredDate}
                    disabled
                    readOnly
                    style={{ backgroundColor: "#f0f0f0", cursor: "not-allowed" }}
                  />
                </Col>

                {/* Gender Radio Buttons */}
                <Col md={6} className="mb-3">
                  <Form.Label className="fw-semibold">
                    {fields[5].label} {fields[5].rules.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  <div className="d-flex gap-3 mt-2">
                    <Form.Check
                      type="radio"
                      label="Male"
                      name="gender"
                      value="Male"
                      checked={formData.gender === "Male"}
                      onChange={handleChange}
                      onBlur={() => validateField("gender", formData.gender)}
                    />
                    <Form.Check
                      type="radio"
                      label="Female"
                      name="gender"
                      value="Female"
                      checked={formData.gender === "Female"}
                      onChange={handleChange}
                      onBlur={() => validateField("gender", formData.gender)}
                    />
                    <Form.Check
                      type="radio"
                      label="Other"
                      name="gender"
                      value="Other"
                      checked={formData.gender === "Other"}
                      onChange={handleChange}
                      onBlur={() => validateField("gender", formData.gender)}
                    />
                  </div>
                  {errors.gender && <small className="text-danger">{errors.gender}</small>}
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Multi-select for Interests and Languages */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label className="fw-semibold">Interests</Form.Label>
              <Select
                isMulti
                options={interestOptions}
                value={interestOptions.filter((x) => formData.interests?.includes(x.value))}
                onChange={(e: any) =>
                  setFormData((prev: any) => ({ ...prev, interests: e.map((x: any) => x.value) }))
                }
              />
            </Col>

            <Col md={6}>
              <Form.Label className="fw-semibold">Preferred Languages</Form.Label>
              <Select
                isMulti
                options={languageOptions}
                value={languageOptions.filter((x) => formData.prefferedlanguage?.includes(x.value))}
                onChange={(e: any) =>
                  setFormData((prev: any) => ({
                    ...prev,
                    prefferedlanguage: e.map((x: any) => x.value),
                  }))
                }
              />
            </Col>
          </Row>

          {/* Switches */}
          <Row className="mb-4">
            <Col md={3}>
              <Form.Check
                type="switch"
                label="Blocked"
                checked={formData.isBlocked}
                name="isBlocked"
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                label="Staff"
                checked={formData.isStaff}
                name="isStaff"
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                label="KYC Complete"
                checked={formData.isKYCCompleted}
                name="isKYCCompleted"
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <Form.Check
                type="switch"
                label="Adult Verification"
                checked={formData.isAudultVerificationCompleted}
                name="isAudultVerificationCompleted"
                onChange={handleChange}
              />
            </Col>
          </Row>

          {/* BUTTONS */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button type="submit" style={{ backgroundColor: "#882626ff", border: "none" }}>
              Update
            </Button>
          </div>
        </Form>
      </Container>

      <Toaster position="top-right" />
    </>
  );
};

export default UserEdit;