import React, { useEffect, useState } from "react";
import { Card, Table, Image, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduAuditLogs from "../../../components/KiduAuditLogs";
import AppUserService from "../../../services/Users/AppUserServices";
import { User } from "../../../types/TalkyUser";
import defaultProfile from "../../../assets/Images/profile.jpeg";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import WalletAccordion from "./WalletAccordion";

const UserPageView: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!userId) return;
        const data = await AppUserService.getUserById(userId);
        if (data) setUser(data);
        else toast.error("User not found.");
      } catch {
        toast.error("Failed to load user details.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId]);

  if (loading) return <KiduLoader type="user details..." />;

  if (!user)
    return (
      <div className="text-center mt-5">
        <h5>No user details found.</h5>
        <Button className="mt-3" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );

  const fields = [
    { key: "mobileNumber", label: "Mobile Number" },
    { key: "registeredDate", label: "Joined Date" },
    { key: "interests", label: "Hobby" },
    { key: "prefferedlanguage", label: "Preferred Language" },
    { key: "isBlocked", label: "Is Blocked" },
    { key: "isAudultVerificationCompleted", label: "Is Adult Verified" },
    { key: "isStaff", label: "Is Staff" },
    { key: "isLockedOut", label: "Is Locked Out" },
    { key: "isKYCCompleted", label: "Is KYC Completed" },
    { key: "walletBalance", label: "Wallet Balance" }
  ];

  const formatDate = (isoString: string | null) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const d = String(date.getDate()).padStart(2, "0");
    const m = date.toLocaleString("en-US", { month: "long" });
    const y = date.getFullYear();
    const t = date.toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    return `${d}-${m}-${y} ${t}`;
  };

  const handleEdit = () => navigate(`/dashboard/user/edit-user/${user.appUserId}`);

  const imageUrl = user.profileImagePath ? getFullImageUrl(user.profileImagePath) : defaultProfile;

  return (
    <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
      <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center">
            <KiduPrevious />
            <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>User Details</h5>
          </div>

          <Button
            className="d-flex align-items-center gap-2"
            style={{ fontWeight: 500, backgroundColor: "#882626ff", fontSize: "15px", border: "none" }}
            onClick={handleEdit}>
            <FaEdit /> Edit
          </Button>
        </div>

        <div className="text-center mb-4">
          <Image
            src={imageUrl}
            alt={user.name}
            roundedCircle
            width={100}
            height={100}
            className="mb-3"
            style={{ border: "3px solid #882626ff", objectFit: "cover" }}
            onError={(e: any) => { e.target.src = defaultProfile; }}
          />
          <h5 className="fw-bold mb-1">{user.name}</h5>
          <p className="small mb-0 fw-bold" style={{ color: "#882626ff" }}>ID: {user.appUserId}</p>
        </div>

        <div className="table-responsive">
  <Table bordered hover responsive className="align-middle mb-0" style={{ fontFamily: "Urbanist", fontSize: "13px" }}>
    <tbody>
      {fields.map(({ key, label }, index) => {
        let value = (user as any)[key];
        if (key === "registeredDate") value = formatDate(value);
        if (typeof value === "boolean") value = value ? "Yes" : "No";

        return (
          <tr
            key={key}
            style={{
              lineHeight: "1.2",
              backgroundColor: index % 2 === 1 ? "#ffe8e8" : "",
              cursor: "default"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#ffe6e6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = index % 2 === 1 ? "#ffe8e8" : "";
            }}
          >
            <td
              style={{
                width: "40%",
                fontWeight: 600,
                color: "#882626ff",
                padding: "8px 6px",
                verticalAlign: "middle"
              }}
            >
              {label}
            </td>

            <td style={{ padding: "8px 6px", verticalAlign: "middle" }}>
              {String(value)}
            </td>
          </tr>
        );
      })}
    </tbody>
  </Table>
</div>


        {/* Wallet Accordion with mt-4 spacing */}
        {user.appUserId && <WalletAccordion userId={user.appUserId} />}

        {/* Audit Logs with mt-4 spacing (no mb-4) */}
        {user.appUserId && <KiduAuditLogs tableName="AppUser" recordId={user.appUserId} />}

      </Card>

      <Toaster position="top-right" />
    </div>
  );
};

export default UserPageView;