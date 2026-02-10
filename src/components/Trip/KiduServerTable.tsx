import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Button, Row, Col, Container, Pagination, Badge } from "react-bootstrap";
import { FaEdit, FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
  ColumnFiltersState,
  ColumnDef,
} from "@tanstack/react-table";
import KiduLoader from "../KiduLoader";
import KiduSearchBar from "../KiduSearchBar";
import KiduButton from "../KiduButton";
import KiduExcelButton from "../KiduExcelButton";
import KiduPopupButton from "../KiduPopupButton";

interface Column {
  key: string;
  label: string;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  type?: 'text' | 'checkbox' | 'image' | 'rating' | 'date' | 'status';
}

interface KiduServerTableProps {
  title?: string;
  subtitle?: string;
  columns: Column[];
  idKey?: string;
  addButtonLabel?: string;
  addRoute?: string;
  viewRoute?: string;
  editRoute?: string;
  showAddButton?: boolean;
  showKiduPopupButton?: boolean;
  showExport?: boolean;
  onRowClick?: (item: any) => void;
  onAddClick?: () => void;
  showSearch?: boolean;
  showActions?: boolean;
  showTitle?: boolean;
  fetchData: (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    reverseOrder?: boolean;
  }) => Promise<{ data: any[]; total: number }>;
  rowsPerPage?: number;
  reverseOrder?: boolean;
  // ✅ NEW: Custom actions renderer prop
  customActionsRenderer?: (row: any) => React.ReactNode;
}

const KiduServerTable: React.FC<KiduServerTableProps> = ({
  title = "Table",
  subtitle = "",
  columns,
  idKey = "id",
  addButtonLabel = "Add New",
  addRoute,
  viewRoute,
  editRoute,
  showAddButton = false,
  showKiduPopupButton = false,
  showExport = true,
  onRowClick,
  onAddClick,
  showSearch = true,
  showActions = true,
  showTitle = true,
  fetchData,
  rowsPerPage = 10,
  reverseOrder = true,
  customActionsRenderer, // ✅ NEW
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // React Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const totalPages = Math.ceil(total / rowsPerPage);

  const loadData = useCallback(
    async (page: number, search: string) => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchData({
          pageNumber: page,
          pageSize: rowsPerPage,
          searchTerm: search,
          ...(reverseOrder !== undefined && { reverseOrder }),
        });

        setData(result.data || []);
        setTotal(result.total || 0);
      } catch (err: any) {
        console.error("❌ KiduServerTable - Error:", err);
        setError(err.message || "Failed to load data");
        setData([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [fetchData, rowsPerPage, reverseOrder]
  );

  useEffect(() => {
    loadData(currentPage, searchTerm);
  }, [loadData, currentPage, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadData(1, searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, loadData]);

  // Helper function to render status badge with fixed width
  const renderStatusBadge = (status: string | number) => {
    const statusStr = String(status).toLowerCase();
    
    let variant = "secondary";
    let displayText = String(status);
    
    if (statusStr === "pending" || statusStr === "0") {
      variant = "warning";
      displayText = "Pending";
    } else if (statusStr === "approved" || statusStr === "1") {
      variant = "success";
      displayText = "Approved";
    } else if (statusStr === "rejected" || statusStr === "2") {
      variant = "danger";
      displayText = "Rejected";
    } else if (statusStr === "completed" || statusStr === "3") {
      variant = "info";
      displayText = "Completed";
    }
    
    return (
      <Badge 
        bg={variant} 
        className="px-3 py-2" 
        style={{ 
          fontSize: "12px",
          minWidth: "100px",
          display: "inline-block",
          textAlign: "center"
        }}
      >
        {displayText}
      </Badge>
    );
  };

  // Helper function to format date to DD-MONTH-YYYY format
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return '-';
    
    try {
      const valueStr = String(dateValue);
      const date = new Date(valueStr);
      
      if (!isNaN(date.getTime())) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'long' }).toUpperCase();
        const year = date.getFullYear();
        
        return `${day}-${month}-${year}`;
      }
    } catch (e) {
      console.error("Error formatting date:", e);
    }
    
    return String(dateValue);
  };

  // Define columns for React Table
  const tableColumns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = columns.map((col) => ({
      accessorKey: col.key,
      header: col.label,
      enableSorting: col.enableSorting !== false,
      enableColumnFilter: col.enableFiltering !== false,
      cell: ({ getValue, row }) => {
        const rawValue = getValue();
        
        if (rawValue === null || rawValue === undefined || rawValue === '') {
          return '-';
        }

        switch (col.type) {
          case 'status':
            const statusValue = row.original.statusValue ?? rawValue;
            return renderStatusBadge(statusValue);

          case 'checkbox':
            let boolValue = false;
            if (typeof rawValue === 'boolean') {
              boolValue = rawValue;
            } else if (typeof rawValue === 'string') {
              boolValue = rawValue.toLowerCase() === 'true' || rawValue === '1';
            } else if (typeof rawValue === 'number') {
              boolValue = rawValue !== 0;
            }
            
            return (
              <input 
                type="checkbox" 
                checked={boolValue} 
                disabled 
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'not-allowed',
                  accentColor: '#882626ff'
                }}
              />
            );

          case 'image':
            const imageSrc = typeof rawValue === 'string' ? rawValue : "/assets/Images/profile.jpeg";
            return (
              <img
                src={imageSrc}
                alt="Profile"
                style={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid #882626ff"
                }}
              />
            );

          case 'rating':
            let rating: number = 0;
            
            if (typeof rawValue === 'number') {
              rating = rawValue;
            } else if (typeof rawValue === 'string') {
              const match = rawValue.match(/(\d+(\.\d+)?)/);
              rating = match ? parseFloat(match[1]) : 0;
            }
            
            rating = Math.min(Math.max(rating, 0), 5);
            
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating - fullStars >= 0.5;
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
            
            return (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
                gap: '2px' 
              }}>
                {Array.from({ length: fullStars }).map((_, i) => (
                  <span key={`full-${i}`} style={{ color: '#FFD700', fontSize: '14px' }}>★</span>
                ))}
                {hasHalfStar && (
                  <span style={{ position: 'relative', display: 'inline-block', width: '14px', height: '14px' }}>
                    <span style={{ position: 'absolute', color: '#e0e0e0', fontSize: '14px', zIndex: 1 }}>★</span>
                    <span style={{ position: 'absolute', color: '#FFD700', fontSize: '14px', width: '50%', overflow: 'hidden', zIndex: 2 }}>★</span>
                  </span>
                )}
                {Array.from({ length: emptyStars }).map((_, i) => (
                  <span key={`empty-${i}`} style={{ color: '#e0e0e0', fontSize: '14px' }}>★</span>
                ))}
                <span style={{ marginLeft: '4px', fontSize: '11px', color: '#666', fontWeight: 500 }}>
                  ({rating.toFixed(1)})
                </span>
              </div>
            );

          case 'date':
            return formatDate(rawValue);

          case 'text':
          default:
            return String(rawValue);
        }
        
        return String(rawValue);
      },
    }));

    // Add actions column
    if (showActions) {
      cols.push({
        id: "actions",
        header: () => (
          <div className="d-flex justify-content-between align-items-center w-100">
            <span className="ms-4">Action</span>
            {showExport && total > 0 && (
              <div>
                <KiduExcelButton data={data} title={title} />
              </div>
            )}
          </div>
        ),
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div
            className="d-flex justify-content-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Default Edit Button */}
            {editRoute && (
              <Button
                size="sm"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #882626ff",
                  color: "#882626ff",
                  fontSize: "12px",
                  padding: "4px 10px",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#882626ff";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#882626ff";
                }}
                onClick={() => navigate(`${editRoute}/${row.original[idKey]}`)}
              >
                <FaEdit className="me-1" /> Edit
              </Button>
            )}

            {/* Default View Button */}
            {viewRoute && (
              <Button
                size="sm"
                style={{
                  backgroundColor: "#882626ff",
                  border: "none",
                  color: "white",
                  fontSize: "12px",
                  padding: "4px 10px",
                  fontWeight: 500,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#882626ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#882626ff";
                }}
                onClick={() => navigate(`${viewRoute}/${row.original[idKey]}`)}
              >
                <FaEye className="me-1" /> View
              </Button>
            )}

            {/* ✅ NEW: Render custom actions if provided */}
            {customActionsRenderer && customActionsRenderer(row.original)}
          </div>
        ),
      });
    }

    return cols;
  }, [columns, showActions, showExport, total, data, title, editRoute, viewRoute, navigate, idKey, customActionsRenderer]);

  // Create React Table instance
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleRetry = () => {
    loadData(currentPage, searchTerm);
  };

  const fieldName = title ? title.replace("Select ", "") : addButtonLabel;

  if (loading && data.length === 0) return <KiduLoader type="talky..." />;

  if (error && data.length === 0) {
    return (
      <Container fluid className="py-3 mt-5">
        <div className="alert alert-danger">{error}</div>
        <Button onClick={handleRetry} style={{ backgroundColor: "#882626ff", border: "none" }}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3 mt-4">
      {/* Title always shows regardless of data */}
      {showTitle !== false && (
        <Row className="mb-2 align-items-center">
          <Col>
            <h4 className="mb-0 fw-bold" style={{ fontFamily: "Urbanist", color: "#882626ff" }}>
              {title}
            </h4>
            {subtitle && (
              <p className="text-muted mb-0" style={{ fontFamily: "Urbanist", fontSize: "14px" }}>
                {subtitle}
              </p>
            )}
          </Col>
        </Row>
      )}

      {/* Search and Add button always show regardless of data */}
      {(showSearch || (showAddButton && addRoute)) && (
        <Row className="mb-3 align-items-center">
          {showSearch && (
            <Col>
              <KiduSearchBar
                placeholder="Search..."
                onSearch={(val) => setSearchTerm(val)}
                width="250px"
              />
            </Col>
          )}

          {showAddButton && addRoute && (
            <Col xs="auto" className="text-end">
              <KiduButton
                label={`+ ${addButtonLabel}`}
                to={addRoute}
                className="fw-bold d-flex align-items-center text-white"
                style={{
                  backgroundColor: "#882626ff",
                  border: "none",
                  height: 42,
                  width: 180,
                  fontSize: "14px"
                }}
              />
            </Col>
          )}
        </Row>
      )}

      <Row>
        <Col>
          <div ref={tableRef} className="table-responsive">
            <table
              className="table table-striped table-bordered table-hover align-middle mb-0"
              style={{ fontSize: "13px" }}
            >
              <thead className="text-center" style={{ fontFamily: "Urbanist" }}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{ 
                          padding: "10px 8px", 
                          cursor: header.column.getCanSort() ? "pointer" : "default",
                          borderBottom: "2px solid #882626ff",
                          verticalAlign: "middle",
                          fontSize: "13px",
                          fontWeight: 600
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="ms-1">
                              {header.column.getIsSorted() === "asc" ? (
                                <FaSortUp />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <FaSortDown />
                              ) : (
                                <FaSort style={{ opacity: 0.5 }} />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>

              <tbody className="text-center" style={{ fontFamily: "Urbanist" }}>
                {loading ? (
                  <tr>
                    <td colSpan={tableColumns.length} className="text-center py-4">
                      <KiduLoader type="talky..." />
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      className="text-center py-4"
                      style={{ border: "2px solid #dee2e6" }}
                    >
                      <div className="d-flex flex-column justify-content-center align-items-center">
                        <p className="text-muted mb-2">No matching records found</p>
                        {showKiduPopupButton && addRoute && (
                          <KiduPopupButton
                            label={`Add ${fieldName}`}
                            onClick={() => {
                              if (onAddClick) onAddClick();
                              else if (addRoute) navigate(addRoute);
                            }}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      onClick={() => onRowClick?.(row.original)}
                      style={{
                        cursor: onRowClick ? "pointer" : "default",
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
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          style={{ 
                            padding: "8px 6px",
                            verticalAlign: "middle"
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Col>
      </Row>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <span style={{ fontFamily: "Urbanist", color: "#882626ff", fontWeight: 600, fontSize: "13px" }}>
            Page {currentPage} of {totalPages} (Total: {total} records)
          </span>

          <Pagination className="m-0" size="sm">
            <Pagination.First 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(1)}
              style={{
                color: currentPage === 1 ? "#999" : "#882626ff"
              }}
            />
            <Pagination.Prev 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                color: currentPage === 1 ? "#999" : "#882626ff"
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
                color: currentPage === totalPages ? "#999" : "#882626ff"
              }}
            />
            <Pagination.Last 
              disabled={currentPage === totalPages} 
              onClick={() => handlePageChange(totalPages)}
              style={{
                color: currentPage === totalPages ? "#999" : "#882626ff"
              }}
            />
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default KiduServerTable;