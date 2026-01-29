import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col, Image } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaPen, FaStar } from "react-icons/fa";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import { KiduValidation } from "../../../components/KiduValidation";
import StaffService from "../../../services/Staff/Staff.Services";
import defaultProfile from "../../../assets/Images/profile.jpeg";
import { StaffModel } from "../../../types/Staff/StaffType";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import KiduAttachments from "../../../components/KiduAttachments";

const StaffEdit: React.FC = () => {
  const navigate = useNavigate();
  const { staffUserId } = useParams<{ staffUserId: string }>();

  const fields = [
    { name: "name", rules: { required: true, type: "text" as const, label: "Name" } },
    { name: "bio", rules: { required: false, type: "textarea" as const, label: "Bio" } },
    { name: "mobileNumber", rules: { required: true, type: "text" as const, label: "Mobile Number" } },
    { name: "address", rules: { required: false, type: "textarea" as const, label: "Address" } },
    { name: "email", rules: { required: false, type: "email" as const, label: "Email" } },
    { name: "walletBalance", rules: { required: false, type: "number" as const, label: "Wallet Balance" } },
    { name: "customerCoinsPerSecondVideo", rules: { required: false, type: "number" as const, label: "Customer Coins Per Second Video" } },
    { name: "customerCoinsPerSecondAudio", rules: { required: false, type: "number" as const, label: "Customer Coins Per Second Audio" } },
    { name: "companyCoinsPerSecondVideo", rules: { required: false, type: "number" as const, label: "Company Coins Per Second Video" } },
    { name: "companyCoinsPerSecondAudio", rules: { required: false, type: "number" as const, label: "Company Coins Per Second Audio" } },
    { name: "priority", rules: { required: false, type: "number" as const, label: "Priority" } },
    { name: "kycDocument", rules: { required: false, type: "select" as const, label: "KYC Document" } },
    { name: "kycDocumentNumber", rules: { required: false, type: "text" as const, label: "KYC Document Number" } },
    { name: "kycCompletedDate", rules: { required: false, type: "date" as const, label: "KYC Completed Date" } }
  ];

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach(f => {
    initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState<any>({
    ...initialValues,
    staffUserId: 0, appUserId: 0, gender: "", registeredDate: new Date().toISOString(),
    referredBy: "", referralCode: "", starRating: 0, profileImagePath: "",
    lastLogin: new Date().toISOString(), isBlocked: false, isKYCCompleted: false,
    isAudioEnbaled: false, isVideoEnabled: false, isOnline: false, isDeleted: false,
    walletBalance: 0, priority: 0
  });

  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState<string>(defaultProfile);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  const kycDocumentOptions = ["Passport", "Aadhar", "PAN", "Voter ID"];

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
    const fetchStaff = async () => {
      try {
        setLoading(true);
        if (!staffUserId) {
          toast.error("No staff ID provided");
          navigate("/dashboard/staff/staff-list");
          return;
        }

        const response = await StaffService.getStaffById(staffUserId);

        if (!response || !response.isSucess) {
          throw new Error(response?.customMessage || response?.error || "Failed to load staff");
        }

        const data = response.value;
        const formattedData = {
          ...data,
          kycCompletedDate: data.kycCompletedDate ? new Date(data.kycCompletedDate).toISOString().split('T')[0] : "",
          kycDocumentNumber: String(data.kycDocumentNumber || ""),
          starRating: data.starRating || 0,
          walletBalance: data.walletBalance ?? 0,
          priority: data.priority ?? 0,
          customerCoinsPerSecondVideo: data.customerCoinsPerSecondVideo ?? 0,
          customerCoinsPerSecondAudio: data.customerCoinsPerSecondAudio ?? 0,
          companyCoinsPerSecondVideo: data.companyCoinsPerSecondVideo ?? 0,
          companyCoinsPerSecondAudio: data.companyCoinsPerSecondAudio ?? 0,
          auditLogs: data.auditLogs
        };

        setFormData(formattedData);
        setInitialData(formattedData);
        const imageUrl = formattedData.profileImagePath ? getFullImageUrl(formattedData.profileImagePath) : defaultProfile;
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
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (previewUrl && previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
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

      // If KYC Completed is toggled ON and there's no completion date, set current date
      if (name === "isKYCCompleted" && updatedValue === true && !formData.kycCompletedDate) {
        setFormData((prev: any) => ({
          ...prev,
          [name]: updatedValue,
          kycCompletedDate: new Date().toISOString().split('T')[0]
        }));
        if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
        return;
      }
      // If KYC Completed is toggled OFF, clear the completion date
      if (name === "isKYCCompleted" && updatedValue === false) {
        setFormData((prev: any) => ({
          ...prev,
          [name]: updatedValue,
          kycCompletedDate: ""
        }));
        if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
        return;
      }
    } else if (type === "number") {
      // Handle number fields properly - allow empty string or convert to number
      updatedValue = value === "" ? 0 : Number(value);
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
      if (!validateField(f.name, formData[f.name as keyof StaffModel])) ok = false;
    });
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (!staffUserId) throw new Error("No staff ID available");

      const dataToUpdate = {
        staffUserId: Number(formData.staffUserId),
        appUserId: formData.appUserId,
        name: formData.name || "",
        email: formData.email || "",
        mobileNumber: formData.mobileNumber || "",
        bio: formData.bio || "",
        gender: formData.gender || "",
        address: formData.address || "",
        isAudioEnbaled: Boolean(formData.isAudioEnbaled),
        isVideoEnabled: Boolean(formData.isVideoEnabled),
        isBlocked: Boolean(formData.isBlocked),
        isDeleted: Boolean(formData.isDeleted),
        kycDocument: formData.kycDocument || "",
        kycDocumentNumber: formData.kycDocumentNumber || "",
        isKYCCompleted: Boolean(formData.isKYCCompleted),
        kycCompletedDate: formData.kycCompletedDate && formData.kycCompletedDate !== ""
          ? new Date(formData.kycCompletedDate).toISOString()
          : null,
        customerCoinsPerSecondVideo: Number(formData.customerCoinsPerSecondVideo ?? 0),
        customerCoinsPerSecondAudio: Number(formData.customerCoinsPerSecondAudio ?? 0),
        companyCoinsPerSecondVideo: Number(formData.companyCoinsPerSecondVideo ?? 0),
        companyCoinsPerSecondAudio: Number(formData.companyCoinsPerSecondAudio ?? 0),
        profileImagePath: formData.profileImagePath || "",
        walletBalance: Number(formData.walletBalance ?? 0),
        isOnline: Boolean(formData.isOnline),
        priority: Number(formData.priority ?? 0),
        registeredDate: formData.registeredDate,
        lastLogin: formData.lastLogin,
        referredBy: formData.referredBy || "",
        referralCode: formData.referralCode || "",
        starRating: formData.starRating || 0
      };

      console.log("Submitting data:", dataToUpdate); // Debug log

      const updateResponse = await StaffService.editStaffById(staffUserId, dataToUpdate as any);

      if (!updateResponse || !updateResponse.isSucess) {
        throw new Error(updateResponse?.customMessage || updateResponse?.error || "Failed to update staff");
      }

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

      toast.success("Staff updated successfully!");
      setTimeout(() => navigate("/dashboard/staff/staff-list"), 1500);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Error updating staff: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
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


  if (loading) return <KiduLoader type="Staff..." />;

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Edit Staff Member</h5>
            </div>
          </div>

          <Card.Body style={{ padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                {/* Profile Picture Section */}
                <Col xs={12} md={3} className="text-center mb-3 mb-md-0">
                  <div className="position-relative d-inline-block mb-2">
                    <Image src={previewUrl} alt="Profile" roundedCircle
                      style={{ width: "130px", height: "140px", objectFit: "cover", border: "3px solid #882626ff" }}
                      onError={(e: any) => { e.target.src = defaultProfile; }} />
                    <label htmlFor="profilePicture"
                      className="position-absolute bg-primary text-white rounded-circle d-flex justify-content-center align-items-center"
                      style={{ width: "32px", height: "32px", cursor: "pointer", bottom: "5px", right: "calc(50% - 65px)", border: "2px solid white" }}
                      title="Upload Photo"><FaPen size={14} /></label>
                    <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                  </div>
                  <h6 className="fw-bold" style={{ color: "#882626ff" }}>{formData.name || "Unknown"}</h6>
                  <p className="small text-muted mb-1">ID: {formData.staffUserId || "N/A"}</p>
                  <p className="small text-danger fst-italic mb-2">Last Login: {formatDate(formData.lastLogin)}</p>

                  {/* Star Rating Display */}
                  <div className="d-flex flex-column align-items-center">
                    <small className="text-muted mb-1 fw-semibold">Staff Rating</small>
                    <div className="d-flex align-items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar key={star} size={22} style={{ color: (formData.starRating || 0) >= star ? "#ffc107" : "#e4e5e9" }} />
                      ))}
                      <span className="ms-2 fw-semibold" style={{ fontSize: "14px", color: "#666" }}>
                        ({(formData.starRating || 0).toFixed(1)})
                      </span>
                    </div>
                  </div>
                </Col>

                {/* Form Fields Section */}
                <Col xs={12} md={9}>
                  <Row className="g-2">
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("name")}</Form.Label>
                      <Form.Control size="sm" type="text" name="name" value={formData.name}
                        onChange={handleChange} onBlur={() => validateField("name", formData.name)} />
                      {errors.name && <div className="text-danger small">{errors.name}</div>}
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("bio")}</Form.Label>
                      <Form.Control size="sm" as="textarea" rows={1} name="bio" value={formData.bio}
                        onChange={handleChange} onBlur={() => validateField("bio", formData.bio)} maxLength={100} />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("mobileNumber")}</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        name="mobileNumber"
                        value={formData.mobileNumber}
                        disabled
                        readOnly
                        style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
                      />
                    </Col>


                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("address")}</Form.Label>
                      <Form.Control size="sm" as="textarea" rows={1} name="address" value={formData.address}
                        onChange={handleChange} onBlur={() => validateField("address", formData.address)} maxLength={100} />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("email")}</Form.Label>
                      <Form.Control size="sm" type="email" name="email" value={formData.email}
                        onChange={handleChange} onBlur={() => validateField("email", formData.email)} />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("walletBalance")}</Form.Label>
                      <Form.Control size="sm" type="number" name="walletBalance"
                        value={formData.walletBalance}
                        onChange={handleChange} onBlur={() => validateField("walletBalance", formData.walletBalance)}
                        placeholder="0" />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("customerCoinsPerSecondVideo")}</Form.Label>
                      <Form.Control size="sm" type="number" name="customerCoinsPerSecondVideo"
                        value={formData.customerCoinsPerSecondVideo}
                        onChange={handleChange} placeholder="0" />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("customerCoinsPerSecondAudio")}</Form.Label>
                      <Form.Control size="sm" type="number" name="customerCoinsPerSecondAudio"
                        value={formData.customerCoinsPerSecondAudio}
                        onChange={handleChange} placeholder="0" />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("companyCoinsPerSecondVideo")}</Form.Label>
                      <Form.Control size="sm" type="number" name="companyCoinsPerSecondVideo"
                        value={formData.companyCoinsPerSecondVideo}
                        onChange={handleChange} placeholder="0" />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("companyCoinsPerSecondAudio")}</Form.Label>
                      <Form.Control size="sm" type="number" name="companyCoinsPerSecondAudio"
                        value={formData.companyCoinsPerSecondAudio}
                        onChange={handleChange} placeholder="0" />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("priority")}</Form.Label>
                      <Form.Control size="sm" type="number" name="priority"
                        value={formData.priority}
                        onChange={handleChange} placeholder="0" />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("kycDocument")}</Form.Label>
                      <Form.Select size="sm" name="kycDocument" value={formData.kycDocument}
                        onChange={handleChange}>
                        <option value="">-- Select Document --</option>
                        {kycDocumentOptions.map(doc => <option key={doc} value={doc}>{doc}</option>)}
                      </Form.Select>
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("kycDocumentNumber")}</Form.Label>
                      <Form.Control size="sm" type="text" name="kycDocumentNumber" value={formData.kycDocumentNumber}
                        onChange={handleChange} />
                    </Col>

                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("kycCompletedDate")}</Form.Label>
                      {formData.isKYCCompleted ? (
                        <Form.Control
                          size="sm"
                          type="text"
                          value={formData.kycCompletedDate ? formatDate(formData.kycCompletedDate, true) : "Not Available"}
                          readOnly
                          disabled
                          style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed" }}
                        />
                      ) : (
                        <Form.Control
                          size="sm"
                          type="text"
                          value="KYC Not Completed"
                          readOnly
                          disabled
                          style={{ backgroundColor: "#f8f9fa", cursor: "not-allowed", color: "#6c757d" }}
                        />
                      )}
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Switches Section */}
              <Row className="mb-3 mx-1">
                <Col xs={12}>
                  <div className="d-flex flex-wrap gap-3">
                    <Form.Check type="switch" id="isBlocked" name="isBlocked" label="Is Blocked"
                      checked={formData.isBlocked || false} onChange={handleChange} className="fw-semibold" />
                    <Form.Check type="switch" id="isKYCCompleted" name="isKYCCompleted" label="KYC Completed"
                      checked={formData.isKYCCompleted || false} onChange={handleChange} className="fw-semibold" />
                    <Form.Check type="switch" id="isAudioEnbaled" name="isAudioEnbaled" label="Audio Enabled"
                      checked={formData.isAudioEnbaled || false} onChange={handleChange} className="fw-semibold" />
                    <Form.Check type="switch" id="isVideoEnabled" name="isVideoEnabled" label="Video Enabled"
                      checked={formData.isVideoEnabled || false} onChange={handleChange} className="fw-semibold" />
                    <Form.Check type="switch" id="isOnline" name="isOnline" label="Online"
                      checked={formData.isOnline || false} onChange={handleChange} className="fw-semibold" />
                    <Form.Check type="switch" id="isDeleted" name="isDeleted" label="Is Deleted"
                      checked={formData.isDeleted || false} onChange={handleChange} className="fw-semibold" />
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 me-2">
                <KiduReset initialValues={initialData} setFormData={setFormData} setErrors={setErrors} />
                <Button type="submit" style={{ backgroundColor: "#882626ff", border: "none" }} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </div>
            </Form>

            {formData.staffUserId && (
              <>
                <KiduAttachments tableName="Staff" recordId={formData.staffUserId.toString()} />
                <KiduAuditLogs tableName="StaffUser" recordId={formData.staffUserId.toString()} />
              </>
            )}
          </Card.Body>
        </Card>

        <Toaster position="top-right" />
      </div>
    </>
  );
};

export default StaffEdit;