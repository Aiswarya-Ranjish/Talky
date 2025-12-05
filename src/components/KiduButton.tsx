import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface KiduButtonProps {
  label: React.ReactNode;
  to?: string;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const KiduButton: React.FC<KiduButtonProps> = ({
  label,
  to,
  onClick,
  className = "",
  
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick();
    if (to) return navigate(to);
  };

  return (
    <Button
      className={`fw-bold text-white d-flex justify-content-center align-items-center ${className}`}
      style={{
        backgroundColor: "#882626ff",
        border: "none",
        borderRadius: 6,
        height: 45,
        padding: "0 16px",
        textDecoration: "none", 
      }}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
};

export default KiduButton;
