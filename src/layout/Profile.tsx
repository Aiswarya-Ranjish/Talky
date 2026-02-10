import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Card, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { BsUpload } from "react-icons/bs";
import AdminUserService from "../services/settings/AdminUser.services";
import profileImg from "../assets/Images/profile.jpeg";
import { getFullImageUrl } from "../constants/API_ENDPOINTS";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const PASSWORD_RULE = {
  minLength: 6,
  maxLength: 30,
  regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]+$/,
  message:
    "Minimum 8 characters, with at least one uppercase letter and one number.",
};


const Profile: React.FC = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState("User");
  const [email, setEmail] = useState("");
  const [_phoneNumber, setPhoneNumber] = useState("");
  const [preview, setPreview] = useState<string>(profileImg);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  //password eye button
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  //password validation
  const [passwordErrors, setPasswordErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validatePasswordField = (
    name: "oldPassword" | "newPassword" | "confirmPassword",
    value: string
  ) => {
    let error = "";

    if (!value) {
      error = "This field is required";
    } else if (
      name === "newPassword" &&
      (!PASSWORD_RULE.regex.test(value) ||
        value.length < PASSWORD_RULE.minLength ||
        value.length > PASSWORD_RULE.maxLength)
    ) {
      error = PASSWORD_RULE.message;
    } else if (
      name === "confirmPassword" &&
      value !== newPassword
    ) {
      error = "Passwords do not match";
    }

    setPasswordErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };


  // Load user data from localStorage and fetch from API
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        toast.error("User not found in session");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const currentUserId = parsedUser.userId;

      if (!currentUserId) {
        toast.error("User ID not found");
        return;
      }

      setUserId(currentUserId);
      setUsername(parsedUser.userName || "");
      setEmail(parsedUser.userEmail || "");

      // Fetch fresh data from API
      setIsLoadingProfile(true);
      const response = await AdminUserService.getById(currentUserId);

      if (response.isSucess && response.value) {
        const userData = response.value;
        setUsername(userData.userName || "");
        setEmail(userData.userEmail || "");
        setPhoneNumber(userData.phoneNumber || "");

        // Set profile picture
        if (userData.profileImagePath) {
          setPreview(getFullImageUrl(userData.profileImagePath));
        }

        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        toast.error(response.error || "Failed to load profile");
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error(error.message || "Failed to load profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload profile picture
  const handleUploadProfilePic = async () => {
    if (!selectedFile) {
      toast.error("Please select an image first");
      return;
    }

    if (!userId) {
      toast.error("User ID not found");
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await AdminUserService.uploadProfilePic(userId, selectedFile);

      if (response.isSucess) {
        toast.success("Profile picture updated successfully!");

        // Reload profile to get updated image path
        await loadUserProfile();

        // Dispatch custom event to notify other components
        window.dispatchEvent(new CustomEvent("profileUpdated"));

        // Clear selected file
        setSelectedFile(null);
      } else {
        toast.error(response.error || "Failed to upload profile picture");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    if (!userId) {
      toast.error("User not found!");
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    const isValid =
      validatePasswordField("oldPassword", oldPassword) &&
      validatePasswordField("newPassword", newPassword) &&
      validatePasswordField("confirmPassword", confirmPassword);

    if (!isValid) return;


    setIsLoadingPassword(true);
    try {
      const payload = {
        userId: userId,
        oldPassword,
        newPassword,
      };

      const response = await AdminUserService.changePassword(payload);

      if (response.isSucess) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.error || "Failed to change password");
      }
    } catch (error: any) {
      console.error("Password change error:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <Spinner animation="border" style={{ color: "#882626ff" }} />
      </div>
    );
  }

  return (
    <div className="d-flex p-3 px-md-4 head-font" style={{ minHeight: "100vh" }}>
      <Card
        className="shadow-sm border-0 w-100"
        style={{
          borderRadius: "10px",
          maxWidth: "500px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Card.Body>
          {/* Profile Picture Section */}
          <div className="d-flex flex-column align-items-center mb-3">
            <div className="position-relative" style={{ width: "80px", height: "80px" }}>
              <img
                src={preview}
                alt="Profile"
                className="rounded-circle border border-2"
                style={{
                  width: "80px",
                  height: "80px",
                  objectFit: "cover",
                  borderColor: "#882626ff",
                }}
              />
              <label
                htmlFor="profileUpload"
                className="position-absolute bottom-0 end-0 bg-white rounded-circle px-2 py-1 shadow"
                style={{ cursor: isUploadingImage ? "not-allowed" : "pointer" }}
              >
                <BsUpload color="#882626ff" />
              </label>
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
                disabled={isUploadingImage}
              />
            </div>
            <p className="mt-2 mb-0 fw-medium" style={{ fontSize: "15px" }}>
              {username}
            </p>
            <small className="text-muted">{email}</small>

            {/* Upload button appears only when image is selected */}
            {selectedFile && (
              <Button
                size="sm"
                onClick={handleUploadProfilePic}
                disabled={isUploadingImage}
                className="mt-2"
                style={{
                  backgroundColor: "#882626ff",
                  border: "none",
                  fontSize: "12px",
                }}
              >
                {isUploadingImage ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-1"
                    />
                    Uploading...
                  </>
                ) : (
                  "Upload Picture"
                )}
              </Button>
            )}
          </div>

          {/* Profile Information */}
          <Form>
            <Row className="mb-2">
              <Form.Group as={Col} md={12} controlId="username">
                <Form.Label className="fw-semibold" style={{ fontSize: "15px" }}>
                  Username
                </Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  disabled
                  style={{ borderRadius: "6px", height: "32px", backgroundColor: "#e9ecef" }}
                />
                <Form.Text className="text-muted" style={{ fontSize: "11px" }}>
                  Username cannot be changed
                </Form.Text>
              </Form.Group>
            </Row>
            {/* Password Change Section */}
            <hr />
            <Row className="mb-2">
              <Form.Group as={Col} md={12} controlId="oldPassword">
                <Form.Label className="fw-semibold" style={{ fontSize: "15px" }}>
                  Old Password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => {
                      setOldPassword(e.target.value);
                      if (passwordErrors.oldPassword)
                        validatePasswordField("oldPassword", e.target.value);
                    }}
                    disabled={isLoadingPassword}
                    placeholder="Enter old password"
                    style={{ borderRadius: "6px", height: "32px", paddingRight: "35px" }}
                  />
                  {passwordErrors.oldPassword && (
                    <small className="text-danger">{passwordErrors.oldPassword}</small>
                  )}
                  <span
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{ cursor: "pointer", color: "#882626ff" }}
                  >
                    {showOldPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>
            </Row>

            <Row className="mb-2">
              <Form.Group as={Col} md={12} controlId="newPassword">
                <Form.Label className="fw-semibold" style={{ fontSize: "15px" }}>
                  New Password
                </Form.Label>
                <div className="position-relative">

                  <Form.Control
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.newPassword)
                        validatePasswordField("newPassword", e.target.value);
                    }}
                    disabled={isLoadingPassword}
                    placeholder="Enter new password"
                    style={{ borderRadius: "6px", height: "32px", paddingRight: "35px" }}
                  />
                  {passwordErrors.newPassword && (
                    <small className="text-danger">{passwordErrors.newPassword}</small>
                  )}
                  <span
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{ cursor: "pointer", color: "#882626ff" }}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col} md={12} controlId="confirmPassword">
                <Form.Label className="fw-semibold" style={{ fontSize: "15px" }}>
                  Confirm Password
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.confirmPassword)
                        validatePasswordField("confirmPassword", e.target.value);
                    }}
                    disabled={isLoadingPassword}
                    placeholder="Confirm new password"
                    style={{ borderRadius: "6px", height: "32px", paddingRight: "35px" }}
                  />
                  {passwordErrors.confirmPassword && (
                    <small className="text-danger">
                      {passwordErrors.confirmPassword}
                    </small>
                  )}
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{ cursor: "pointer", color: "#882626ff" }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>
            </Row>

            {/* Change Password Button */}
            <div className="text-center">
              <Button
                onClick={handleChangePassword}
                disabled={isLoadingPassword}
                className="fw-semibold px-4"
                style={{
                  backgroundColor: "#882626ff",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                {isLoadingPassword ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      className="me-2"
                    />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
      <Toaster position="top-right" />
    </div>
  );
};

export default Profile;