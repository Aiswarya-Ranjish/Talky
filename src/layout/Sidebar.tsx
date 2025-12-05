import React, { useState } from "react";
import { Nav, Navbar, Container, Collapse } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { BiCategory } from "react-icons/bi";import { 
    BsPeople, 
    BsGear, 
    BsChevronDown, 
    BsCashStack, 
    BsPersonBadge,
    BsListUl,
    BsShieldExclamation,
    BsPersonX,
    BsPeopleFill,
    BsFileText,
    BsClipboardData,
    BsWallet2,
    BsReceipt,
    BsCreditCard,
    BsBuilding,
    BsBuildingAdd,
    BsGearFill,
    BsTicketPerforated,
    BsCalendar3,
    BsBell,
    BsSpeedometer2
} from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import AuthService from "../services/common/Authservices";
import profileImage from "../assets/Images/profile.jpeg";

const Sidebar: React.FC = () => {
    const [hovered, setHovered] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);

    const handleMenuToggle = (menuName: string) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const usersSubMenu = [
        { label: "User List", path: "user/user-list", icon: <BsListUl /> },
        { label: "User Recharge", path: "/dashboard/users/user-recharge", icon: <BsShieldExclamation /> },
        { label: "Blocked Users", path: "/dashboard/users/blocked-users", icon: <BsPersonX /> },
    ];

    const staffsSubMenu = [
        { label: "Staff List", path: "/dashboard/staff/staff-list", icon: <BsPeopleFill /> },
        { label: "Staff TYC", path: "/dashboard/staffs/staff-tyc", icon: <BsFileText /> },
        { label: "Staff Reports", path: "/dashboard/staffs/staff-reports", icon: <BsClipboardData /> },
    ];

    const accountsSubMenu = [
        { label: "Payout Request", path: "/dashboard/accounts/payout-request", icon: <BsWallet2 /> },
        { label: "Invoice", path: "/dashboard/accounts/invoice", icon: <BsReceipt /> },
        { label: "Payment Permit", path: "/dashboard/accounts/payment-permit", icon: <BsCreditCard /> },
    ];

    const settingsSubMenu = [
        { label: "Company", path: "/dashboard/settings/company-list", icon: <BsBuilding /> },
        { label: "Company Branch", path: "/dashboard/settings/company-branch", icon: <BsBuildingAdd /> },
        { label: "System Config", path: "/dashboard/settings/system-config", icon: <BsGearFill /> },
        { label: "Purchase Coupon", path: "/dashboard/settings/purchase-coupon-list", icon: <BsTicketPerforated /> },
        { label:'Category',path:'/category/CategoryPage', icon:<BiCategory />},
        { label: "Financial Year", path: "/dashboard/settings/financial-year", icon: <BsCalendar3 /> },
        { label: "App Notification", path: "/dashboard/settings/appNotification-list", icon: <BsBell /> },
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
                    width: hovered ? "220px" : "70px",
                    minHeight: "100vh",
                    backgroundColor: "#882626ff",
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
                            <span>Talky</span>
                        </p>
                    ) : (
                        <p className="fw-bolder fs-6 text-white head-font">
                            <span style={{ fontSize: "8px" }}>Talky</span>
                        </p>
                    )}
                    <img
                        src={profileImage}
                        alt="profile"
                        className="rounded-circle mb-2"
                        style={{
                            width: hovered ? "80px" : "45px",
                            height: hovered ? "80px" : "45px",
                            border: "2px solid white",
                            transition: "all 0.3s",
                            objectFit: "cover",
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
                    <Nav className="flex-column gap-2 w-100">
                        {/* Dashboard Menu */}
                        <NavLink
                            to="/dashboard"
                            end
                            className={({ isActive }) =>
                                `d-flex align-items-center gap-2 w-100 ${hovered ? "ps-4 pe-3" : "justify-content-center"} rounded mt-1 ${isActive ? "bg-white" : ""}`
                            }
                            style={{ fontSize: "15px", textDecoration: "none", padding: "8px 0" }}
                        >
                            {({ isActive }) => (
                                <>
                                    <BsSpeedometer2 
                                        className={isActive ? "text-danger" : "text-white"} 
                                        style={{ fontSize: "20px", minWidth: "20px" }} 
                                    />
                                    {hovered && (
                                        <span className={`fw-bold flex-grow-1 ${isActive ? "text-danger" : "text-white"}`}>
                                            Dashboard
                                        </span>
                                    )}
                                </>
                            )}
                        </NavLink>

                        {/* Users Menu */}
                        <div>
                            <div
                                className={`d-flex align-items-center gap-2 w-100 ${hovered ? "ps-4 pe-3" : "justify-content-center"} rounded mt-1`}
                                style={{ fontSize: "15px", textDecoration: "none", cursor: "pointer", padding: "8px 0" }}
                                onClick={() => handleMenuToggle('users')}
                            >
                                <BsPeople className="text-white" style={{ fontSize: "20px", minWidth: "20px" }} />
                                {hovered && (
                                    <>
                                        <span className="text-white fw-bold flex-grow-1">Users</span>
                                        <BsChevronDown
                                            className="text-white"
                                            style={{
                                                transition: "transform 0.3s",
                                                transform: openMenu === 'users' ? "rotate(180deg)" : "rotate(0deg)",
                                            }}
                                        />
                                    </>
                                )}
                            </div>

                            <Collapse in={openMenu === 'users' && hovered}>
                                <div className="flex-column text-light mt-2">
                                    {usersSubMenu.map((sub) => (
                                        <NavLink
                                            key={sub.path}
                                            to={sub.path}
                                            end
                                            className={({ isActive }) =>
                                                `d-flex align-items-center gap-2 p-2 ms-4 me-3 mb-1 ${isActive ? "bg-white text-danger rounded" : "text-white"}`
                                            }
                                            style={{ fontSize: "13px", textDecoration: "none" }}
                                        >
                                            {sub.icon}
                                            <span className="fw-bold">{sub.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </Collapse>
                        </div>

                        {/* Staffs Menu */}
                        <div>
                            <div
                                className={`d-flex align-items-center gap-2 w-100 ${hovered ? "ps-4 pe-3" : "justify-content-center"} rounded mt-2`}
                                style={{ fontSize: "15px", textDecoration: "none", cursor: "pointer", padding: "8px 0" }}
                                onClick={() => handleMenuToggle('staffs')}
                            >
                                <BsPersonBadge className="text-white" style={{ fontSize: "20px", minWidth: "20px" }} />
                                {hovered && (
                                    <>
                                        <span className="text-white fw-bold flex-grow-1">Staffs</span>
                                        <BsChevronDown
                                            className="text-white"
                                            style={{
                                                transition: "transform 0.3s",
                                                transform: openMenu === 'staffs' ? "rotate(180deg)" : "rotate(0deg)",
                                            }}
                                        />
                                    </>
                                )}
                            </div>

                            <Collapse in={openMenu === 'staffs' && hovered}>
                                <div className="flex-column text-light mt-2">
                                    {staffsSubMenu.map((sub) => (
                                        <NavLink
                                            key={sub.path}
                                            to={sub.path}
                                            end
                                            className={({ isActive }) =>
                                                `d-flex align-items-center gap-2 p-2 ms-4 me-3 mb-1 ${isActive ? "bg-white text-danger rounded" : "text-white"}`
                                            }
                                            style={{ fontSize: "13px", textDecoration: "none" }}
                                        >
                                            {sub.icon}
                                            <span className="fw-bold">{sub.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </Collapse>
                        </div>

                        {/* Accounts Menu */}
                        <div>
                            <div
                                className={`d-flex align-items-center gap-2 w-100 ${hovered ? "ps-4 pe-3" : "justify-content-center"} rounded mt-2`}
                                style={{ fontSize: "15px", textDecoration: "none", cursor: "pointer", padding: "8px 0" }}
                                onClick={() => handleMenuToggle('accounts')}
                            >
                                <BsCashStack className="text-white" style={{ fontSize: "20px", minWidth: "20px" }} />
                                {hovered && (
                                    <>
                                        <span className="text-white fw-bold flex-grow-1">Accounts</span>
                                        <BsChevronDown
                                            className="text-white"
                                            style={{
                                                transition: "transform 0.3s",
                                                transform: openMenu === 'accounts' ? "rotate(180deg)" : "rotate(0deg)",
                                            }}
                                        />
                                    </>
                                )}
                            </div>

                            <Collapse in={openMenu === 'accounts' && hovered}>
                                <div className="flex-column text-light mt-2">
                                    {accountsSubMenu.map((sub) => (
                                        <NavLink
                                            key={sub.path}
                                            to={sub.path}
                                            end
                                            className={({ isActive }) =>
                                                `d-flex align-items-center gap-2 p-2 ms-4 me-3 mb-1 ${isActive ? "bg-white text-danger rounded" : "text-white"}`
                                            }
                                            style={{ fontSize: "13px", textDecoration: "none" }}
                                        >
                                            {sub.icon}
                                            <span className="fw-bold">{sub.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </Collapse>
                        </div>

                        {/* Settings Menu */}
                        <div>
                            <div
                                className={`d-flex align-items-center gap-2 w-100 ${hovered ? "ps-4 pe-3" : "justify-content-center"} rounded mt-2`}
                                style={{ fontSize: "15px", textDecoration: "none", cursor: "pointer", padding: "8px 0" }}
                                onClick={() => handleMenuToggle('settings')}
                            >
                                <BsGear className="text-white" style={{ fontSize: "20px", minWidth: "20px" }} />
                                {hovered && (
                                    <>
                                        <span className="text-white fw-bold flex-grow-1">Settings</span>
                                        <BsChevronDown
                                            className="text-white"
                                            style={{
                                                transition: "transform 0.3s",
                                                transform: openMenu === 'settings' ? "rotate(180deg)" : "rotate(0deg)",
                                            }}
                                        />
                                    </>
                                )}
                            </div>

                            <Collapse in={openMenu === 'settings' && hovered}>
                                <div className="flex-column text-light mt-2">
                                    {settingsSubMenu.map((subItem) => (
                                        <NavLink
                                            key={subItem.path}
                                            to={subItem.path}
                                            end
                                            className={({ isActive }) =>
                                                `d-flex align-items-center gap-2 p-2 ms-4 me-3 mb-1 ${isActive ? "bg-white text-danger rounded" : "text-white"}`
                                            }
                                            style={{ fontSize: "13px", textDecoration: "none" }}
                                        >
                                            {subItem.icon}
                                            <span className="fw-bold">{subItem.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </Collapse>
                        </div>

                        {/* Logout */}
                        <p
                            onClick={handleLogout}
                            className="d-flex align-items-center justify-content-center p-2 text-white mt-5 mx-3 rounded fw-bold"
                            style={{
                                fontSize: "15px",
                                textDecoration: "none",
                                backgroundColor: "#6a2b2bff",
                                cursor: "pointer",
                            }}
                        >
                            <BiLogOut style={{ fontSize: "20px" }} />
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
                style={{ backgroundColor: "#642323ff" }}
            >
                <Container fluid className="justify-content-around">
                    <NavLink
                        to="/dashboard"
                        className="d-flex flex-column align-items-center text-decoration-none"
                        style={{ fontSize: "10px" }}
                    >
                        {({ isActive }) => (
                            <>
                                <BsSpeedometer2 className={isActive ? "text-danger" : "text-white"} />
                                <span className={`fw-bold ${isActive ? "text-danger" : "text-white"}`} style={{ fontSize: "10px" }}>
                                    Dashboard
                                </span>
                            </>
                        )}
                    </NavLink>
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => handleMenuToggle('users')}
                    >
                        <BsPeople />
                        <span className="fw-bold" style={{ fontSize: "10px" }}>Users</span>
                    </div>
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => handleMenuToggle('staffs')}
                    >
                        <BsPersonBadge />
                        <span className="fw-bold" style={{ fontSize: "10px" }}>Staffs</span>
                    </div>
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => handleMenuToggle('accounts')}
                    >
                        <BsCashStack />
                        <span className="fw-bold" style={{ fontSize: "10px" }}>Accounts</span>
                    </div>
                    <div
                        className="d-flex flex-column align-items-center text-white"
                        style={{ fontSize: "10px", cursor: "pointer" }}
                        onClick={() => handleMenuToggle('settings')}
                    >
                        <BsGear />
                        <span className="fw-bold" style={{ fontSize: "10px" }}>Settings</span>
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