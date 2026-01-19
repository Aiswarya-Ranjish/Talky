// src/components/AdminComponents/AdminNavbar.tsx
import React, { useEffect, useState } from "react";
import { BsBell, BsChevronDown } from "react-icons/bs";
import { Container, Image, Offcanvas, Button, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import AuthService from "../services/common/Authservices";
import Profile from "./Profile";
import ActivityPanel from "./ActivityPanel";
import KiduYearSelector from "../components/KiduYearSelector";
import { useYear } from "../context/YearContext";
import profileImg from "../assets/Images/profile.jpeg";
import { getFullImageUrl } from "../constants/API_ENDPOINTS";

const NavbarComponent: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [username, setUsername] = useState<string>("Username");
  const [profileImage, setProfileImage] = useState<string>(profileImg);
  const { selectedYear, setSelectedYear } = useYear();
  const navigate = useNavigate();

  // Function to load profile image
  const loadProfileImage = () => {
    try {
      const storedUser = localStorage.getItem("user");
      console.log('Navbar - Loading profile, storedUser exists:', !!storedUser);
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        console.log('Navbar - Parsed user:', parsedUser);

        if (parsedUser?.userName) {
          setUsername(parsedUser.userName);
        }

        // Try multiple possible field names (profileImagePath, ProfileImagePath, profilePic)
        const imagePath = parsedUser?.profileImagePath 
            || parsedUser?.ProfileImagePath 
            || parsedUser?.profilePic;
        
        console.log('Navbar - Image path found:', imagePath);

        // Load profile image if available
        if (imagePath && imagePath.trim() !== '') {
          const imageUrl = getFullImageUrl(imagePath);
          console.log('Navbar - Setting profile image:', imageUrl);
          setProfileImage(imageUrl);
        } else {
          console.log('Navbar - No profileImagePath, using default');
          setProfileImage(profileImg);
        }
      } else {
        console.log('Navbar - No user in localStorage');
      }
    } catch (error) {
      console.error("Navbar - Error parsing user from localStorage:", error);
      setProfileImage(profileImg);
    }
  };

  // Fetch username and profile image from localStorage
  useEffect(() => {
    console.log('Navbar - Component mounted, loading profile');
    loadProfileImage();

    // Listen for profile update events
    const handleProfileUpdate = () => {
      console.log('Navbar - Profile update event received');
      loadProfileImage();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    // Also listen for storage events (in case of updates from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        console.log('Navbar - Storage change detected');
        loadProfileImage();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleSettings = () => setShowSettings((prev) => !prev);
  const handleClose = () => setShowNotifications(false);
  const handleShow = () => setShowNotifications(true);

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    console.log("Selected Year Updated Globally:", year);
  };

  const handleLogout = () => {
    AuthService.logout();
    navigate("/");
  };

  return (
    <>
      <Navbar
        expand="lg"
        fixed="top"
        className="bg-white"
        style={{
          height: "60px",
          zIndex: 999,
          paddingLeft: "15px",
          paddingRight: "15px",
        }}
      >
        <Container
          fluid
          className="d-flex shadow align-items-center justify-content-between"
          style={{
            marginLeft: window.innerWidth >= 768 ? "70px" : "0px",
            transition: "margin-left 0.3s ease-in-out",
          }}
        >
          {/* Left Side */}
          <div className="d-flex align-items-center head-font">
            <p
              className="mb-0 text-dark"
              style={{
                fontSize: "12px",
                fontWeight: 500,
              }}
            >
              <span style={{ color: "#FF2A2A" }}>Welcome</span>
              <br />
              {username}
            </p>
          </div>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-1">
            {/* Year Dropdown */}
            <div className="me-3">
              <KiduYearSelector
                startYear={2023}
                onYearSelect={handleYearSelect}
                defaultYear={selectedYear}
              />
            </div>

            {/* Notifications */}
            <BsBell
              size={20}
              className="cursor-pointer"
              onClick={handleShow}
            />

            {/* Profile Section */}
            <div
              className="d-flex align-items-center cursor-pointer border-none py-1 ms-3"
              onClick={toggleSettings}
            >
              <Image
                src={profileImage}
                alt="profile"
                className="rounded-circle me-2 border border-2"
                style={{ 
                  width: "30px", 
                  height: "30px", 
                  objectFit: "cover",
                  borderColor: "#882626ff"
                }}
                onError={(e) => {
                  console.error('Navbar - Image failed to load:', profileImage);
                  (e.target as HTMLImageElement).src = profileImg;
                }}
              />
              <div className="text-end">
                <p className="mb-0" style={{ color: "#787486", fontSize: "12px" }}>
                  {username}
                </p>
              </div>
              <BsChevronDown className="ms-2" />
            </div>

            {/* Logout Button */}
            <Button
              size="sm"
              className="d-flex align-items-center"
              style={{
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "20px",
                backgroundColor: "white",
                border: "none",
                color: "#808080ff",
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Notification Offcanvas */}
      <ActivityPanel show={showNotifications} handleClose={handleClose} />

      {/* Admin Settings Offcanvas */}
      <Offcanvas
        show={showSettings}
        onHide={() => setShowSettings(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <h5 className="fw-semibold text-center" style={{ color: "#882626ff" }}>
            Account Settings
          </h5>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Profile />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavbarComponent;