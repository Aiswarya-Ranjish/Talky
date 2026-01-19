import React, { useEffect } from "react";
import Navbar from "../../layout/Navbar";
import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Sidebar from "../../layout/Sidebar";
import AuthService from "../../services/common/Authservices";
import AdminUserService from "../../services/settings/AdminUser.services";

const DashBoard: React.FC = () => {
  useEffect(() => {
    // Refresh user data when dashboard mounts (after login)
    const refreshUserData = async () => {
      try {
        console.log('Dashboard mounted, checking user data...');
        
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          console.log('User data found in localStorage');
          const parsedUser = JSON.parse(storedUser);
          console.log('Stored user:', parsedUser);
          
          // Dispatch event to notify components even if we don't fetch from API
          console.log('Dispatching profileUpdated event for existing data');
          window.dispatchEvent(new CustomEvent("profileUpdated"));
          
          // Try to get fresh data from /api/User/{id} endpoint instead of /me
          // because /me might not return profileImagePath
          if (parsedUser.userId) {
            try {
              console.log('Fetching user by ID:', parsedUser.userId);
              const userByIdResponse = await AdminUserService.getById(parsedUser.userId);
              
              if (userByIdResponse.isSucess && userByIdResponse.value) {
                console.log('User data from getById:', userByIdResponse.value);
                localStorage.setItem('user', JSON.stringify(userByIdResponse.value));
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent("profileUpdated"));
                
                setTimeout(() => {
                  window.dispatchEvent(new CustomEvent("profileUpdated"));
                }, 100);
                
                return; // Exit early, we got the data
              }
            } catch (error) {
              console.error('Error fetching user by ID:', error);
            }
          }
        }
        
        // Fallback: try /me endpoint
        console.log('Fetching fresh user data from API /me...');
        const response = await AuthService.getCurrentUserFromAPI();
        
        if (response.isSucess && response.value) {
          console.log('User data refreshed successfully:', response.value);
          localStorage.setItem('user', JSON.stringify(response.value));
          
          // Dispatch event to notify Navbar and Sidebar
          console.log('Dispatching profileUpdated event from Dashboard');
          window.dispatchEvent(new CustomEvent("profileUpdated"));
          
          // Dispatch again with a small delay to ensure components caught it
          setTimeout(() => {
            console.log('Dispatching delayed profileUpdated event');
            window.dispatchEvent(new CustomEvent("profileUpdated"));
          }, 100);
        } else {
          console.error('Failed to refresh user data:', response);
        }
      } catch (error) {
        console.error('Error refreshing user data in Dashboard:', error);
        
        // Even if API fails, dispatch event for stored data
        console.log('API failed, using stored data and dispatching event');
        window.dispatchEvent(new CustomEvent("profileUpdated"));
      }
    };

    // Only refresh if authenticated
    if (AuthService.isAuthenticated()) {
      // Add a small delay to ensure Navbar and Sidebar are mounted
      setTimeout(() => {
        refreshUserData();
      }, 200);
    }
  }, []); // Run once on mount

  return (
    <Container fluid className="min-vh-100">
      <Row className="flex-nowrap">
        <Col
          xs={12}
          className="p-2 border-end min-vh-100 d-flex flex-column"
          style={{ backgroundColor: "#f7f0f0ff" }}>
          <Sidebar />
          <div className="mb-4">
            <Navbar />
          </div>
          <div
            className="ms-md-5 ps-md-5"
            style={{ backgroundColor: "#f7f0f0ff" }}>
            <Outlet />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default DashBoard;