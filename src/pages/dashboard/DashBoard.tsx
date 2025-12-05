import React from "react";
import Navbar from "../../layout/Navbar";
import { Col, Container, Row } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import Sidebar from "../../layout/Sidebar";

const DashBoard: React.FC = () => {
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
