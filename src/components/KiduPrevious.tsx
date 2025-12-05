import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const KiduPrevious: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      className="btn d-flex align-items-center justify-content-center shadow-sm"
      style={{
        backgroundColor: "#882626ff", // primary dark teal
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        width: "38px",
        height: "38px",
        transition: "all 0.25s ease-in-out",
      }}
      onClick={() => navigate(-1)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#f7f0f0ff"; // hover light blue
        e.currentTarget.style.color = "#882626ff"; // icon color on hover
        e.currentTarget.style.boxShadow = "0 4px 10px #571515ff";
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#882626ff";
        e.currentTarget.style.color = "#ffffff";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <FaArrowLeft size={18} />
    </button>
  );
};

export default KiduPrevious;
