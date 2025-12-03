// src/pages/user/UserEdit.tsx
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Image } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import toast, { Toaster } from "react-hot-toast";
import { FaPen } from "react-icons/fa";

//import AppUserService from "../../services/UserService";
import AppUserService from "../../../services/AppUserServices";
import { KiduValidation } from "../../../components/KiduValidation";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduLoader from "../../../components/KiduLoader";
import KiduReset from "../../../components/ReuseButtons/KiduReset";

const UserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<any>({});
  const [initialValues, setInitialValues] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const baseURL = "http://sreenathganga-001-site12.jtempurl.com/";

  // ---------------------- FIELD RULES ----------------------
  const fields = [
    { name: "name", label: "Name", rules: { required: true, type: "text" } },
    { name: "email", label: "Email", rules: { required: true, type: "email" } },
    { name: "walletBalance", label: "Wallet Amount", rules: { required: false, type: "number" } },
    { name: "registeredDate", label: "Date", rules: { required: true, type: "date" } },
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

  const toArray = (value: string | string[] | undefined) => {
    if (!value) return [];
    return Array.isArray(value) ? value : value.split(",");
  };

  // ------------------------------- FETCH USER --------------------------------
  useEffect(() => {
    if (!userId) return;

    const loadUser = async () => {
      try {
        const res = await AppUserService.getUserById(userId);

        const userValues = {
          appUserId: res.appUserId,
          name: res.name || "",
          email: res.email || "",
          mobileNumber: res.mobileNumber || "",
          walletBalance: res.walletBalance || 0,
          status: res.status || "",
          isBlocked: res.isBlocked || false,
          isStaff: res.isStaff || false,
          isKYCCompleted: res.isKYCCompleted || false,
          isAudultVerificationCompleted: res.isAudultVerificationCompleted || false,
          profileImagePath: res.profileImagePath || "",
          interests: toArray(res.interests),
          prefferedlanguage: toArray(res.prefferedlanguage),
          registeredDate: res.registeredDate
        };

        setFormData(userValues);
        setInitialValues(userValues);

        const errorObj: Record<string, string> = {};
        fields.forEach((field) => (errorObj[field.name] = ""));
        setErrors(errorObj);
      } catch (err) {
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
    const { name, value, type, checked } = e.target;

    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];
    setSelectedFile(file);
    setFormData((prev: any) => ({
      ...prev,
      profileImagePath: URL.createObjectURL(file),
    }));
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

    if (!validateForm()) return;

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

      // Upload profile image if selected
      if (selectedFile) {
        const imageFormData = new FormData();
        imageFormData.append("appUserId", userId.toString());
        imageFormData.append("ProfilePic", selectedFile);

        await AppUserService.uploadprofilepic(imageFormData);
      }

      toast.success("User updated successfully!");
      setTimeout(() => navigate("/dashboard/user/user-list"), 800);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(error?.message || "Update failed");
    }
  };

  if (loading) return <KiduLoader type="Loading User Details..." />;

  return (
    <>
      <Container className="px-4 mt-5 shadow-sm rounded bg-white">
        <div className="d-flex align-items-center mb-3">
          <KiduPrevious />
          <h4 className="fw-bold ms-2">Edit User</h4>
        </div>
        <hr />

        <Form onSubmit={handleSubmit} className="py-3">
          <Row>
            {/* Profile Picture */}
            <Col md={3} className="text-center">
              <Image
                src={
                  selectedFile
                    ? URL.createObjectURL(selectedFile)
                    : formData.profileImagePath
                    ? `${baseURL}/${formData.profileImagePath}`
                    : "https://via.placeholder.com/120"
                }
                roundedCircle
                width={120}
                height={120}
                style={{ objectFit: "cover" }}
              />
              <label htmlFor="profilePic" className="btn btn-sm btn-primary mt-3">
                <FaPen /> Change
              </label>
              <input type="file" id="profilePic" hidden onChange={handleFileChange} />
            </Col>

            {/* Form Fields */}
            <Col md={9}>
              <Row>
                {fields.map((field) => (
                  <Col md={6} className="mb-3" key={field.name}>
                    <Form.Label>
                      {field.label} {field.rules.required && <span className="text-danger">*</span>}
                    </Form.Label>
                    <Form.Control
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      onBlur={() => validateField(field.name, formData[field.name])}
                    />
                    {errors[field.name] && <small className="text-danger">{errors[field.name]}</small>}
                  </Col>
                ))}
              </Row>

              {/* Multi-select */}
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Label>Interests</Form.Label>
                  <Select
                    isMulti
                    options={interestOptions}
                    value={interestOptions.filter((x) => formData.interests.includes(x.value))}
                    onChange={(e: any) =>
                      setFormData((prev: any) => ({ ...prev, interests: e.map((x: any) => x.value) }))
                    }
                  />
                </Col>

                <Col md={6}>
                  <Form.Label>Languages</Form.Label>
                  <Select
                    isMulti
                    options={languageOptions}
                    value={languageOptions.filter((x) => formData.prefferedlanguage.includes(x.value))}
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
              <Row>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    label="Blocked"
                    checked={formData.isBlocked}
                    name="isBlocked"
                    onChange={handleChange}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="switch"
                    label="Staff"
                    checked={formData.isStaff}
                    name="isStaff"
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2 mt-4">
            <KiduReset setFormData={setFormData} initialValues={initialValues} />
            <Button type="submit" style={{ background: "#18575A", border: "none" }}>
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
