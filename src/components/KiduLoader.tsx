import React from "react";
import { Col, Container, Row, Spinner } from "react-bootstrap";
import Call from "../assets/Gifs/phone-call.webp";

interface LoaderProps {
    type?: string; // to show what is being loaded ,e.g., "customers", "drivers", "trips"
}

const KiduLoader: React.FC<LoaderProps> = ({ type }) => {
    const getMessage = () => {
        if (type) {
            return `Loading ${type.toLowerCase()}... Please wait`;
        }
        return "Preparing your experience... Please wait";
    };

    return (
        <Container
            fluid
            className="d-flex justify-content-center align-items-center min-vh-100 bg-light"
            style={{
                backgroundColor: "#f8f9fa",
                fontFamily: "Plus Jakarta Sans",
            }}
        >
            <Row className="text-center">
                <Col>
                    <div className="mb-3">
                        <img
                            src={Call}
                            alt="Loading..."
                            className="img-fluid"
                            style={{
                                width: "200px",
                                height: "200px",
                                borderRadius: "50%",
                            }}
                        />
                    </div>

                    <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                        <Spinner animation="border" variant="danger" />
                        <Spinner animation="grow" variant="danger" />
                    </div>

                    <p
                        style={{
                            color: "#6c757d",
                            fontFamily: "Urbanist",
                            fontSize: "14px",
                            fontWeight: 500,
                            textTransform: "capitalize",
                        }}
                    >
                        {getMessage()}
                    </p>
                </Col>
            </Row>
        </Container>
    );
};

export default KiduLoader;
