import React, { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { Card, Button, Form, Row, Col } from "react-bootstrap";
import toast, { Toaster } from "react-hot-toast";
import { BsUpload } from "react-icons/bs";
import AdminUserService from "../services/settings/AdminUser.services";
import  profileImg from "../assets/Images/profile.jpeg"

const Profile: React.FC = () => {
  const [username, setUsername] = useState("User");
 // const [password] = useState("********"); // cannot be edited
  const [preview, setPreview] = useState<string>(profileImg);
    // NEW password fields
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load username from localStorage (same as Navbar)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);

        if (parsedUser?.userName) {
          setUsername(parsedUser.userName);
        }
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }, []);

  // Handle new image selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save handler now also calls Change Password API
   const handleSave = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return toast.error("User not found!");

    const { userId } = JSON.parse(storedUser);

    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error("All password fields are required.");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("New password and confirm password do not match!");
    }

    try {
      const payload = {
        userId: Number(userId),
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
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    }
  };

  return (
    <div
      className="d-flex p-3 px-md-4 head-font"
      style={{ minHeight: "100vh" }}
    >
      <Card
        className="shadow-sm border-0 w-100"
        style={{
          borderRadius: "10px",
          maxWidth: "500px",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Card.Body>
          {/* Profile Picture */}
          <div className="d-flex flex-column align-items-center mb-1">
            <div
              className="position-relative"
              style={{ width: "80px", height: "80px" }}
            >
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
                style={{ cursor: "pointer" }}
              >
                <BsUpload color="#882626ff" />
              </label>
              <input
                type="file"
                id="profileUpload"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
            </div>
            <p className="mt-2 mb-0 fw-medium" style={{fontSize:"15px"}}>{username}</p>
            <small className="text-muted">User</small>
          </div>

          {/* Form Fields */}
          <Form>
            <Row className="mb-1">
              <Form.Group as={Col} md={12} controlId="username">
                <Form.Label className="fw-semibold" style={{fontSize:"15px"}}>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={username}
                  placeholder="Enter username"
                  disabled
                  style={{ borderRadius: "6px" ,height:"28px"}}
                />
                <Form.Text className="text-muted" style={{fontSize:"11px"}}>
                  User Name cannot be changed here.
                </Form.Text>
              </Form.Group>
            </Row>

            <Row className="mb-1">
              <Form.Group as={Col} md={12} controlId="oldpassword">
                <Form.Label className="fw-semibold" style={{fontSize:"15px"}}>Old Password</Form.Label>
                <Form.Control
                  type="password"
                   value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    height:"28px"
                  }}
                />

              </Form.Group>
            </Row>

            <Row className="mb-1">
              <Form.Group as={Col} md={12} controlId="newpassword">
                <Form.Label className="fw-semibold" style={{fontSize:"15px"}}>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}

                  style={{
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    height:"28px"
                  }}
                />

              </Form.Group>
            </Row>

            <Row className="mb-1">
              <Form.Group as={Col} md={12} controlId="confirmPassword">
                <Form.Label className="fw-semibold" style={{fontSize:"15px"}}>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    borderRadius: "6px",
                    backgroundColor: "white",
                    height:"28px"
                  }}
                />

              </Form.Group>
            </Row>

            {/* Save Button */}
            <div className="text-center mt-3">
              <Button
                onClick={handleSave}
                className="fw-semibold px-4"
                style={{
                  backgroundColor: "#882626ff",
                   color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Save Changes
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
