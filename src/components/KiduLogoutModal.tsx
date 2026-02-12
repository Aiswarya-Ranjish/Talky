import React from "react";
import { Modal, Button } from "react-bootstrap";
import { LogOut } from "lucide-react";

interface KiduLogoutModalProps {
    show: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const KiduLogoutModal: React.FC<KiduLogoutModalProps> = ({
    show,
    onConfirm,
    onCancel,
}) => {
    return (
        <Modal
            show={show}
            onHide={onCancel}
            centered
            backdrop="static"
            dialogClassName="auth-modal"
        >
            <Modal.Body className="p-4">
                {/* HEADER */}
                <div className="auth-div text-center">
                    <div
                        className="auth-icon mb-3 mx-auto d-flex align-items-center justify-content-center"
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                            backgroundColor: "#fef2f2",
                            border: "2px solid #fee2e2"
                        }}
                    >
                        <LogOut size={32} style={{ color: "#882626" }} />
                    </div>
                    <h5
                        className="auth-title mb-2 fw-semibold"
                        style={{
                            color: "#1f2937",
                            fontSize: "1.25rem"
                        }}
                    >
                        Confirm Logout
                    </h5>
                    <p
                        className="auth-sub mb-0"
                        style={{
                            color: "#6b7280",
                            fontSize: "0.95rem"
                        }}
                    >
                        Are you sure you want to sign out of your account?
                    </p>
                </div>

                {/* ACTIONS */}
                <div className="auth-body mt-4">
                    <div className="d-flex gap-2 justify-content-end">
                        <Button
                            variant="light"
                            onClick={onCancel}
                            style={{
                                minWidth: "100px",
                                border: "1px solid #e5e7eb",
                                color: "#374151",
                                fontWeight: "500"
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            className="auth-logoutbtn"
                            onClick={onConfirm}
                            style={{
                                minWidth: "100px",
                                backgroundColor: "#882626",
                                border: "none",
                                color: "#ffffff",
                                fontWeight: "500"
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default KiduLogoutModal;