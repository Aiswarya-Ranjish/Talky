import React from "react";
import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";

interface KiduPopupButtonProps {
  label: string;
  onClick: () => void;
}

const KiduPopupButton: React.FC<KiduPopupButtonProps> = ({ label, onClick }) => {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="d-flex align-items-center justify-content-center gap-2"
      style={{
        backgroundColor: "#882626ff",
        border: "none",
        color: "#fff",
        borderRadius: "8px",
        padding: "6px 12px",
      }}
    >
      <FaPlus /> {label}
    </Button>
  );
};

export default KiduPopupButton;