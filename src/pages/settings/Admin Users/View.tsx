// src/pages/settings/adminUsers/ViewAdminUser.tsx
import React, { useState, useEffect } from "react";
import { Card, Table, Image, Button, Modal, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";
import AdminUserService from "../../../services/settings/AdminUser.services";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import AuditTrailsComponent from "../../../components/KiduAuditLogs";
import defaultProfile from "../../../assets/Images/profile.jpeg";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";

const ViewAdminUser: React.FC = () => {
    const navigate = useNavigate();
    const { userId } = useParams();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loadingDelete, setLoadingDelete] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!userId) {
                    toast.error("No user ID provided");
                    navigate("/dashboard/settings/adminUsers-list");
                    return;
                }

                const res = await AdminUserService.getById(Number(userId));
                
                if (!res || !res.isSucess) {
                    throw new Error(res?.customMessage || res?.error || "Failed to load admin user");
                }

                setData(res.value);
            } catch (error: any) {
                console.error("Failed to load admin user:", error);
                toast.error(`Error: ${error.message}`);
                navigate("/dashboard/settings/adminUsers-list");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId, navigate]);

    if (loading) return <KiduLoader type="admin user details..." />;

    if (!data)
        return (
            <div className="text-center mt-5">
                <h5>No admin user details found.</h5>
                <Button className="mt-3" onClick={() => navigate(-1)}>
                    Back
                </Button>
            </div>
        );

    const fields = [
        { key: "userName", label: "User Name", icon: "bi-person-fill" },
        { key: "userEmail", label: "Email", icon: "bi-envelope" },
        { key: "companyName", label: "Company", icon: "bi-building" },
        { key: "phoneNumber", label: "Phone Number", icon: "bi-telephone-fill" },
        { key: "address", label: "Address", icon: "bi-geo-alt-fill" },
        { key: "isActive", label: "Active Status", icon: "bi-check-circle", isBoolean: true },
    ];

    const imageUrl = data.profileImagePath
        ? getFullImageUrl(data.profileImagePath)
        : defaultProfile;

    const handleEdit = () =>
        navigate(`/dashboard/settings/edit-adminUser/${data.userId}`);

    const handleDelete = async () => {
        setLoadingDelete(true);
        try {
            if (!data.userId) throw new Error("No user ID available");

            const response = await AdminUserService.delete(data.userId);
            
            if (!response || !response.isSucess) {
                throw new Error(response?.customMessage || response?.error || "Failed to delete admin user");
            }

            toast.success("Admin user deleted successfully");
            setTimeout(() => navigate("/dashboard/settings/adminUsers-list"), 600);
        } catch (error: any) {
            console.error("Delete failed:", error);
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoadingDelete(false);
            setShowConfirm(false);
        }
    };

    return (
        <div
            className="container d-flex justify-content-center align-items-center mt-4 pt-4"
            style={{ fontFamily: "Urbanist" }}
        >
            <Card
                className="shadow-lg p-4 w-100"
                style={{
                    maxWidth: "1300px",
                    borderRadius: "15px",
                    border: "none",
                }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center">
                        <KiduPrevious />
                        <h5
                            className="fw-bold m-0 ms-2"
                            style={{ color: "#882626ff" }}
                        >
                            Admin User Details
                        </h5>
                    </div>

                    <div className="d-flex">
                        <Button
                            className="d-flex align-items-center gap-2 me-1"
                            style={{
                                backgroundColor: "#882626ff",
                                border: "none",
                                fontWeight: 500
                            }}
                            onClick={handleEdit}
                        >
                            <FaEdit /> Edit
                        </Button>

                        <Button
                            variant="danger"
                            className="d-flex align-items-center gap-2"
                            style={{ fontWeight: 500 }}
                            onClick={() => setShowConfirm(true)}
                        >
                            <FaTrash size={12} /> Delete
                        </Button>
                    </div>
                </div>

                {/* Profile Image */}
                <div className="text-center mb-4">
                    <Image
                        src={imageUrl}
                        alt={data.userName}
                        roundedCircle
                        width={120}
                        height={120}
                        className="mb-3"
                        style={{ border: "3px solid #882626ff", objectFit: "cover" }}
                        onError={(e: any) => { e.target.src = defaultProfile; }}
                    />
                    <h5 className="fw-bold mb-1">{data.userName}</h5>
                    <p
                        className="small mb-0 fw-bold"
                        style={{ color: "#882626ff" }}
                    >
                        User ID: {data.userId}
                    </p>
                </div>

                {/* DETAILS TABLE */}
                <div className="table-responsive">
                    <Table
                        bordered
                        hover
                        responsive
                        className="align-middle mb-0"
                        style={{ fontFamily: "Urbanist", fontSize: "13px" }}
                    >
                        <tbody>
                            {fields.map(({ key, label, icon, isBoolean }, index) => {
                                let value = (data as any)[key];
                                if (isBoolean) value = value ? "Yes" : "No";

                                return (
                                    <tr
                                        key={key}
                                        style={{
                                            lineHeight: "1.2",
                                            backgroundColor: index % 2 === 1 ? "#ffe8e8" : ""
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
                                                padding: "8px 6px",
                                                color: "#882626ff",
                                                fontWeight: 600
                                            }}
                                        >
                                            <i className={`bi ${icon} me-2`}></i>
                                            {label}
                                        </td>
                                        <td style={{ padding: "8px 6px" }}>
                                            {value !== null && value !== undefined ? value : "N/A"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </div>

                {/* AUDIT LOGS */}
                <AuditTrailsComponent tableName="User" recordId={data.userId ?? ""} />
            </Card>

            {/* DELETE MODAL */}
            <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this admin user?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={loadingDelete}>
                        {loadingDelete ? (
                            <>
                                <Spinner animation="border" size="sm" /> Deleting...
                            </>
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Toaster position="top-right" />
        </div>
    );
};

export default ViewAdminUser;