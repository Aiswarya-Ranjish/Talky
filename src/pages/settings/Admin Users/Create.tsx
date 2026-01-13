// src/pages/settings/adminUsers/CreateAdminUser.tsx
import React, { useState, useEffect } from "react";
import { Form, Button, Card, Row, Col, InputGroup, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash, FaPen } from "react-icons/fa6";
import CompanyService from "../../../services/settings/Company.services";
import KiduValidation from "../../../components/KiduValidation";
import AdminUserService from "../../../services/settings/AdminUser.services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import defaultProfile from "../../../assets/Images/profile.jpeg";

const CreateAdminUser: React.FC = () => {
    const navigate = useNavigate();

    const fields = [
        { name: "userName", rules: { required: true, type: "text", label: "User Name" } },
        { name: "passwordHash", rules: { required: true, type: "password", label: "Password" } },
        { name: "companyId", rules: { required: true, type: "select", label: "Company" } },
        { name: "userEmail", rules: { required: true, type: "email", label: "Email ID" } },
        { name: "phoneNumber", rules: { required: true, type: "number", minLength: 10, maxLength: 10, label: "Phone Number" } },
        { name: "address", rules: { required: false, type: "text", label: "Address" } }
    ];

    const initialValues: any = {};
    const initialErrors: any = {};
    fields.forEach(f => { initialValues[f.name] = ""; initialErrors[f.name] = ""; });

    const [formData, setFormData] = useState(initialValues);
    const [errors, setErrors] = useState(initialErrors);
    const [companies, setCompanies] = useState<any[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>(defaultProfile);
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
        const updated = type === "tel" ? value.replace(/[^0-9]/g, "") : value;
        setFormData((prev: any) => ({ ...prev, [name]: updated }));
        if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
    };

    const validateField = (name: string, value: any) => {
        const rule = fields.find(f => f.name === name)?.rules;
        if (!rule) return true;
        const result = KiduValidation.validate(value, rule as any);
        setErrors((prev: any) => ({ ...prev, [name]: result.isValid ? "" : result.message }));
        return result.isValid;
    };

    const validateForm = () => {
        let ok = true;
        fields.forEach(f => { if (!validateField(f.name, formData[f.name])) ok = false; });
        return ok;
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            const userData = {
                ...formData,
                isActive: true,
                createdAt: new Date().toISOString()
            };

            const res = await AdminUserService.create(userData);

            if (res.isSucess) {
                // If profile picture is selected, upload it
                if (selectedFile && res.value?.userId) {
                    try {
                        await AdminUserService.uploadProfilePic(res.value.userId, selectedFile);
                        toast.success("Admin user created with profile picture!");
                    } catch (uploadError) {
                        console.error("Image upload error:", uploadError);
                        toast.success("Admin user created but profile picture upload failed");
                    }
                } else {
                    toast.success("Admin user created successfully!");
                }

                setTimeout(() => navigate("/dashboard/settings/adminUsers-list"), 1500);
            } else {
                toast.error(res.customMessage || res.error);
            }
        } catch (err: any) {
            toast.error(err.message);
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
                            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Add New Admin User</h5>
                        </div>
                    </div>

                    <Card.Body style={{ padding: "1.5rem" }}>
                        <Form onSubmit={handleSubmit} autoComplete="off">
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
                                                backgroundColor: "#882626ff"
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
                                    <p className="small text-muted mb-0">Upload Profile Picture</p>
                                    <p className="small text-muted">(Optional)</p>
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
                                                autoComplete="new-user"
                                                placeholder="Enter username"
                                                maxLength={30}
                                                value={formData.userName}
                                                onChange={handleChange}
                                                onBlur={() => validateField("userName", formData.userName)}
                                            />
                                            {errors.userName && <div className="text-danger small">{errors.userName}</div>}
                                        </Col>

                                        <Col md={6}>
                                            <Form.Label className="mb-1 fw-medium small">{getLabel("passwordHash")}</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control
                                                    type={showPassword ? "text" : "password"}
                                                    name="passwordHash"
                                                    autoComplete="new-password"
                                                    placeholder="Enter password"
                                                    maxLength={30}
                                                    value={formData.passwordHash}
                                                    onChange={handleChange}
                                                    onBlur={() => validateField("passwordHash", formData.passwordHash)}
                                                />
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                                </Button>
                                            </InputGroup>
                                            {errors.passwordHash && <div className="text-danger small">{errors.passwordHash}</div>}
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
                                            {errors.companyId && <div className="text-danger small">{errors.companyId}</div>}
                                        </Col>

                                        <Col md={6}>
                                            <Form.Label className="mb-1 fw-medium small">{getLabel("userEmail")}</Form.Label>
                                            <Form.Control
                                                size="sm"
                                                type="email"
                                                name="userEmail"
                                                placeholder="Enter email"
                                                value={formData.userEmail}
                                                onChange={handleChange}
                                                onBlur={() => validateField("userEmail", formData.userEmail)}
                                            />
                                            {errors.userEmail && <div className="text-danger small">{errors.userEmail}</div>}
                                        </Col>

                                        <Col md={6}>
                                            <Form.Label className="mb-1 fw-medium small">{getLabel("phoneNumber")}</Form.Label>
                                            <Form.Control
                                                size="sm"
                                                type="tel"
                                                name="phoneNumber"
                                                placeholder="Enter phone number"
                                                value={formData.phoneNumber}
                                                onChange={handleChange}
                                                onBlur={() => validateField("phoneNumber", formData.phoneNumber)}
                                            />
                                            {errors.phoneNumber && <div className="text-danger small">{errors.phoneNumber}</div>}
                                        </Col>

                                        <Col md={6}>
                                            <Form.Label className="mb-1 fw-medium small">{getLabel("address")}</Form.Label>
                                            <Form.Control
                                                size="sm"
                                                as="textarea"
                                                rows={3}
                                                name="address"
                                                placeholder="Enter address"
                                                maxLength={200}
                                                value={formData.address}
                                                onChange={handleChange}
                                                onBlur={() => validateField("address", formData.address)}
                                            />
                                            {errors.address && <div className="text-danger small">{errors.address}</div>}
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
                                    {isSubmitting ? "Creating..." : "Submit"}
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

export default CreateAdminUser;