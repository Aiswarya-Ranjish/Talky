import React, { useState } from "react";
import { Nav, Navbar, Container, Collapse } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { BsPeople, BsGear, BsChevronDown, BsCashStack, BsPersonBadge } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import AuthService from "../services/common/Authservices";

const Sidebar: React.FC = () => {
    const [hovered, setHovered] = useState(false);
    const [usersOpen, setUsersOpen] = useState(false);
    const [staffsOpen, setStaffsOpen] = useState(false);
    const [accountsOpen, setAccountsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const usersSubMenu = [
        { label: "User List", path: "user/user-list" },
        { label: "User Reactor", path: "/dashboard/users/user-reactor" },
        { label: "Blocked Users", path: "/dashboard/users/blocked-users" },
    ];

    const staffsSubMenu = [
        { label: "Staff List", path: "/dashboard/staff/staff-list" },
        { label: "Staff TYC", path: "/dashboard/staffs/staff-tyc" },
        { label: "Staff Reports", path: "/dashboard/staffs/staff-reports" },
    ];

    const accountsSubMenu = [
        { label: "Payout Request", path: "/dashboard/accounts/payout-request" },
        { label: "Invoice", path: "/dashboard/accounts/invoice" },
        { label: "Payment Permit", path: "/dashboard/accounts/payment-permit" },
    ];

    const settingsSubMenu = [
        {label:"Company", path: "/dashboard/settings/company-list"},
        { label: "Company Branch", path: "/dashboard/settings/company-branch" },
        { label: "System Config", path: "/dashboard/settings/system-config" },
        { label: "Purchase Coupon", path: "/dashboard/settings/purchase-coupon-list"},
        { label: "Financial Year", path: "/dashboard/settings/financial-year" },
        { label: "App Notification", path: "/dashboard/settings/appNotification-list" },
    ];

    const navigate = useNavigate();
    const handleLogout = () => {
        AuthService.logout();
        navigate("/");
    };

    return (
        <>
            {/* Sidebar for medium+ screens */}
            <div
                className="d-none d-md-flex flex-column rounded-3 align-items-center py-3 position-fixed"
                style={{
                    width: hovered ? "200px" : "70px",
                    minHeight: "100vh",
                    backgroundColor: "#a80606",
                    transition: "width 0.3s",
                    zIndex: 1000,
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Profile section */}
                <div className="profile-section text-center mb-4">
                    {hovered ? (
                        <p className="mt-2 text-white fw-bold" style={{ fontSize: "15px" }}>
                            <span>MoveIQ</span>
                        </p>
                    ) : (
                        <p className="fw-bolder fs-6 text-white head-font">
                            <span style={{ fontSize: "8px" }}>MoveIQ</span>
                        </p>
                    )}
                    <img
                        src="https://via.placeholder.com/80"
                        alt="profile"
                        className="rounded-circle mb-2"
                        style={{
                            width: hovered ? "80px" : "45px",
                            height: hovered ? "80px" : "45px",
                            border: "2px solid white",
                            transition: "all 0.3s",
                        }}
                    />
                </div>
                <div
                    style={{
                        flex: 1,
                        width: "100%",
                        maxHeight: "calc(100vh - 190px)",
                        overflowY: hovered ? "auto" : "hidden",
                        overflowX: "hidden",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#c0d5d6ff transparent",
                    }}
                    className="admin-sidebar-scroll"
                >
                    {/* Navigation items */}
                    <Nav className="flex-column gap-2 w-100 text-center">
                        {/* Users Menu */}
                        <div
                            className={`flex-column gap-2 w-100 text-center ${hovered ? "justify-content-start mt-2" : "justify-content-center"} rounded mt-1`}
                            style={{ fontSize: "14px", textDecoration: "none", cursor: "pointer" }}
                            onClick={() => setUsersOpen(!usersOpen)}
                        >
                            <BsPeople className="text-white" />
                            {hovered && (
                                <>
                                    <span className="ms-2 text-white">Users</span>
                                    <BsChevronDown
                                        className="ms-2 text-white"
                                        style={{
                                            transition: "transform 0.3s",
                                            transform: usersOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <Collapse in={usersOpen && hovered}>
                            <div className="flex-column text-light mt-2">
                                {usersSubMenu.map((sub) => (
                                    <NavLink
                                        key={sub.path}
                                        to={sub.path}
                                        end
                                        className={({ isActive }) =>
                                            `d-block p-1 ${isActive ? "bg-white text-success rounded mx-3" : "text-white"}`
                                        }
                                        style={{ fontSize: "12px", textDecoration: "none" }}
                                    >
                                        {sub.label}
                                    </NavLink>
                                ))}
                            </div>
                        </Collapse>

                        {/* Staffs Menu */}
                        <div
                            className={`flex-column gap-2 w-100 text-center ${hovered ? "justify-content-start mt-3" : "justify-content-center"} rounded mt-2`}
                            style={{ fontSize: "14px", textDecoration: "none", cursor: "pointer" }}
                            onClick={() => setStaffsOpen(!staffsOpen)}
                        >
                            <BsPersonBadge className="text-white" />
                            {hovered && (
                                <>
                                    <span className="ms-2 text-white">Staffs</span>
                                    <BsChevronDown
                                        className="ms-2 text-white"
                                        style={{
                                            transition: "transform 0.3s",
                                            transform: staffsOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <Collapse in={staffsOpen && hovered}>
                            <div className="flex-column text-light mt-2">
                                {staffsSubMenu.map((sub) => (
                                    <NavLink
                                        key={sub.path}
                                        to={sub.path}
                                        end
                                        className={({ isActive }) =>
                                            `d-block p-1 ${isActive ? "bg-white text-success rounded mx-3" : "text-white"}`
                                        }
                                        style={{ fontSize: "12px", textDecoration: "none" }}
                                    >
                                        {sub.label}
                                    </NavLink>
                                ))}
                            </div>
                        </Collapse>

                        {/* Accounts Menu */}
                        <div
                            className={`flex-column gap-2 w-100 text-center ${hovered ? "justify-content-start mt-3" : "justify-content-center"} rounded mt-2`}
                            style={{ fontSize: "14px", textDecoration: "none", cursor: "pointer" }}
                            onClick={() => setAccountsOpen(!accountsOpen)}
                        >
                            <BsCashStack className="text-white" />
                            {hovered && (
                                <>
                                    <span className="ms-2 text-white">Accounts</span>
                                    <BsChevronDown
                                        className="ms-2 text-white"
                                        style={{
                                            transition: "transform 0.3s",
                                            transform: accountsOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <Collapse in={accountsOpen && hovered}>
                            <div className="flex-column text-light mt-2">
                                {accountsSubMenu.map((sub) => (
                                    <NavLink
                                        key={sub.path}
                                        to={sub.path}
                                        end
                                        className={({ isActive }) =>
                                            `d-block p-1 ${isActive ? "bg-white text-success rounded mx-3" : "text-white"}`
                                        }
                                        style={{ fontSize: "12px", textDecoration: "none" }}
                                    >
                                        {sub.label}
                                    </NavLink>
                                ))}
                            </div>
                        </Collapse>

                        {/* Settings Menu */}
                        <div
                            className={`flex-column gap-2 w-100 text-center ${hovered ? "justify-content-start mt-3" : "justify-content-center"} rounded mt-2`}
                            style={{ fontSize: "14px", textDecoration: "none", cursor: "pointer" }}
                            onClick={() => setSettingsOpen(!settingsOpen)}
                        >
                            <BsGear className="text-white" />
                            {hovered && (
                                <>
                                    <span className="ms-2 text-white">Settings</span>
                                    <BsChevronDown
                                        className="ms-2 text-white"
                                        style={{
                                            transition: "transform 0.3s",
                                            transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)",
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        <Collapse in={settingsOpen && hovered}>
                            <div className="flex-column text-light mt-2">
                                {settingsSubMenu.map((subItem) => (
                                    <NavLink
                                        key={subItem.path}
                                        to={subItem.path}
                                        end
                                        className={({ isActive }) =>
                                            `d-block p-1 ${isActive ? "bg-white text-success rounded mx-3" : "text-white"}`
                                        }
                                        style={{ fontSize: "12px", textDecoration: "none" }}
                                    >
                                        {subItem.label}
                                    </NavLink>
                                ))}
                            </div>
                        </Collapse>

                        {/* Logout */}
                        <p
                            onClick={handleLogout}
                            className="d-flex align-items-center justify-content-center p-2 text-white mt-5 mx-3 rounded fw-semibold"
                            style={{
                                fontSize: "16px",
                                textDecoration: "none",
                                backgroundColor: "#8B0000",
                                cursor: "pointer",
                            }}
                        >
                            <BiLogOut />
                            {hovered && <span className="ms-2">Logout</span>}
                        </p>
                    </Nav>
                </div>
            </div>

            {/* Bottom navbar for small screens */}
            <Navbar
                fixed="bottom"
                expand="md"
                className="d-md-none"
                style={{ backgroundColor: "#a80606" }}
            >
                <Container fluid className="justify-content-around">
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => setUsersOpen(!usersOpen)}
                    >
                        <BsPeople />
                        <span style={{ fontSize: "10px" }}>Users</span>
                    </div>
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => setStaffsOpen(!staffsOpen)}
                    >
                        <BsPersonBadge />
                        <span style={{ fontSize: "10px" }}>Staffs</span>
                    </div>
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => setAccountsOpen(!accountsOpen)}
                    >
                        <BsCashStack />
                        <span style={{ fontSize: "10px" }}>Accounts</span>
                    </div>
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => setSettingsOpen(!settingsOpen)}
                    >
                        <BsGear />
                        <span style={{ fontSize: "10px" }}>Settings</span>
                    </div>
                </Container>
            </Navbar>

            {/* Inline minimal WebKit scrollbar styles */}
            <style>
                {`
          .admin-sidebar-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 6px;
          }
          .admin-sidebar-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
        `}
            </style>
        </>
    );
};

export default Sidebar;