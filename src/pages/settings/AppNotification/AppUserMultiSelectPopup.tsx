import React, { useState, useEffect, useMemo } from "react";
import { Modal, Button, Form, Badge, Pagination } from "react-bootstrap";
import AppUserService from "../../../services/Users/AppUserServices";
import KiduLoader from "../../../components/KiduLoader";
import KiduSearchBar from "../../../components/KiduSearchBar";
import toast from "react-hot-toast";
import { User } from "../../../types/Users/AppUser.types";

interface AppUserMultiSelectPopupProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (selectedUserIds: number[]) => void;
  initialSelectedIds?: number[];
  rowsPerPage?: number;
}

const AppUserMultiSelectPopup: React.FC<AppUserMultiSelectPopupProps> = ({
  show,
  onHide,
  onConfirm,
  initialSelectedIds = [],
  rowsPerPage = 10,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);
  const [selectAll, setSelectAll] = useState(false);
  
  // ✅ Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Load users when modal opens
  useEffect(() => {
    if (!show) return;

    const loadUsers = async () => {
      try {
        setLoading(true);
        const response = await AppUserService.getAllUsers();

        // ✅ getAllUsers() returns User[] directly
        if (Array.isArray(response) && response.length > 0) {
          // ✅ Reverse to show latest first
          setUsers([...response].reverse());
        } else {
          toast.error("No users found");
          setUsers([]);
        }
      } catch (err: any) {
        console.error("Error loading users:", err);
        toast.error("Error fetching user list");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
    setSelectedIds(initialSelectedIds);
    setSearchTerm("");
    setCurrentPage(1);
  }, [show, initialSelectedIds]);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;

    const searchLower = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchLower) ||
        user.mobileNumber?.toString().includes(searchTerm) ||
        user.appUserId?.toString().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchLower)
    );
  }, [users, searchTerm]);

  // ✅ Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // ✅ Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle individual checkbox
  const handleToggleUser = (userId: number) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle select all (for current page only)
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all on current page
      setSelectedIds((prev) =>
        prev.filter((id) => !paginatedUsers.some((user) => user.appUserId === id))
      );
    } else {
      // Select all on current page
      const currentPageIds = paginatedUsers
        .filter((user) => user.appUserId !== undefined)
        .map((user) => user.appUserId!);
      setSelectedIds((prev) => {
        const newIds = [...prev];
        currentPageIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      });
    }
    setSelectAll(!selectAll);
  };

  // Update select all checkbox when selection changes
  useEffect(() => {
    if (paginatedUsers.length > 0) {
      setSelectAll(
        paginatedUsers
          .filter((user) => user.appUserId !== undefined)
          .every((user) => selectedIds.includes(user.appUserId!))
      );
    }
  }, [selectedIds, paginatedUsers]);

  // ✅ Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    onConfirm(selectedIds);
  };

  const handleCancel = () => {
    setSelectedIds(initialSelectedIds);
    setSearchTerm("");
    setCurrentPage(1);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleCancel} size="lg" centered>
      <Modal.Header closeButton style={{ borderBottom: "2px solid #882626ff" }}>
        <Modal.Title style={{ color: "#882626ff", fontFamily: "Urbanist" }}>
          <i className="bi bi-people-fill me-2"></i>
          Select Users
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ fontFamily: "Urbanist", minHeight: "400px" }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
            <KiduLoader type="Loading users..." />
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-3">
              <KiduSearchBar
                onSearch={setSearchTerm}
                placeholder="Search by name, mobile, or ID..."
                width="100%"
              />
            </div>

            {/* Selection Summary */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div>
                <Badge bg="primary" className="me-2">
                  {selectedIds.length} Selected
                </Badge>
                <Badge bg="secondary">
                  {filteredUsers.length} Total
                </Badge>
              </div>

              {paginatedUsers.length > 0 && (
                <Form.Check
                  type="checkbox"
                  label={selectAll ? "Deselect All (Page)" : "Select All (Page)"}
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="fw-semibold"
                  style={{ fontSize: "13px" }}
                />
              )}
            </div>

            {/* User Table */}
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              {filteredUsers.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i>
                  <p className="mt-2">No users found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0" style={{ fontSize: "13px" }}>
                    <thead
                      style={{
                        backgroundColor: "#fff",
                        borderBottom: "2px solid #882626ff",
                      }}
                    >
                      <tr>
                        <th style={{ width: "50px", textAlign: "center", padding: "10px 8px" }}>
                          <Form.Check
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th style={{ padding: "10px 8px" }}>ID</th>
                        <th style={{ padding: "10px 8px" }}>Name</th>
                        <th style={{ padding: "10px 8px" }}>Mobile</th>
                        <th style={{ padding: "10px 8px" }}>Status</th>
                        <th style={{ padding: "10px 8px" }}>Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedUsers.map((user, index) => {
                        if (!user.appUserId) return null; // Skip users without ID
                        const isSelected = selectedIds.includes(user.appUserId);
                        return (
                          <tr
                            key={user.appUserId}
                            onClick={() => handleToggleUser(user.appUserId!)}
                            style={{
                              cursor: "pointer",
                              backgroundColor: isSelected
                                ? "#e8f4f8"
                                : index % 2 === 1
                                ? "#ffe8e8"
                                : "#fff",
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor = "#ffe6e6";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.backgroundColor =
                                  index % 2 === 1 ? "#ffe8e8" : "#fff";
                              }
                            }}
                          >
                            <td style={{ textAlign: "center", padding: "8px 6px" }}>
                              <Form.Check
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleUser(user.appUserId!)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td style={{ padding: "8px 6px" }}>{user.appUserId}</td>
                            <td className="fw-semibold" style={{ padding: "8px 6px" }}>
                              {user.name || "-"}
                            </td>
                            <td style={{ padding: "8px 6px" }}>{user.mobileNumber || "-"}</td>
                            <td style={{ padding: "8px 6px" }}>
                              <Badge
                                bg={
                                  user.status === "Active"
                                    ? "success"
                                    : user.status === "Inactive"
                                    ? "warning"
                                    : "secondary"
                                }
                                style={{ fontSize: "11px", minWidth: "70px", display: "inline-block" }}
                              >
                                {user.status || "Unknown"}
                              </Badge>
                            </td>
                            <td style={{ padding: "8px 6px" }}>
                              ₹{user.walletBalance?.toFixed(2) || "0.00"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* ✅ Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span style={{ fontFamily: "Urbanist", color: "#882626ff", fontWeight: 600, fontSize: "13px" }}>
                  Page {currentPage} of {totalPages} (Total: {filteredUsers.length} users)
                </span>

                <Pagination className="m-0" size="sm">
                  <Pagination.First
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                    style={{
                      color: currentPage === 1 ? "#999" : "#882626ff",
                    }}
                  />
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    style={{
                      color: currentPage === 1 ? "#999" : "#882626ff",
                    }}
                  />
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Pagination.Item
                        key={pageNum}
                        active={pageNum === currentPage}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          backgroundColor: pageNum === currentPage ? "#882626ff" : "transparent",
                          borderColor: "#882626ff",
                          color: pageNum === currentPage ? "white" : "#882626ff",
                        }}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  })}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    style={{
                      color: currentPage === totalPages ? "#999" : "#882626ff",
                    }}
                  />
                  <Pagination.Last
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(totalPages)}
                    style={{
                      color: currentPage === totalPages ? "#999" : "#882626ff",
                    }}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          style={{ backgroundColor: "#882626ff", border: "none" }}
          onClick={handleConfirm}
          disabled={loading || selectedIds.length === 0}
        >
          <i className="bi bi-check-circle me-2"></i>
          Confirm ({selectedIds.length} users)
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AppUserMultiSelectPopup;