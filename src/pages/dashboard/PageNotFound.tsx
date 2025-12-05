// src/pages/PageNotFound.tsx
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import PF from "../../assets/Images/pf.png"; // You can also use the external URL instead

const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Container
        fluid
        className="d-flex justify-content-center align-items-center min-vh-100 bg-white"
        style={{
          backgroundColor: "#f8f9fa",
          fontFamily: "Plus Jakarta Sans",
        }}
      >
        <Row className="text-center">
          <Col>
            {/* GIF Section */}
            <div className="mb-3 rounded-3">
              <img
                src={
                  PF
                }
                alt="Page Not Found"
                className="img-fluid"
                style={{
                  width: "800px",
                  height: "350px",
                  borderRadius: "20px",
                  objectFit: "contain",
                }}
              />
            </div>
            

            <p
              style={{
                color: "#6c757d",
                fontFamily: "Urbanist",
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "20px",
              }}
            >
              The page you’re looking for doesn’t exist or has been moved.
            </p>

            {/* Back Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="rounded-3 p-2 border-0"
              style={{
                backgroundColor: "#882626ff",
                fontFamily: "Urbanist",
                fontSize: "15px",
                color: "#FFFFFF",
                fontWeight: 800,
                padding: "10px 20px",
              }}
            >
              Back to Home
            </button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PageNotFound;
