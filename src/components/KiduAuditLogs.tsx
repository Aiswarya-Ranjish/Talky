// KiduAuditLogs.tsx
import React, { useEffect, useState } from "react";
import { Accordion, Table, Card, Spinner, Alert } from "react-bootstrap";
import AuditLogService from "../services/common/AuditLog.services";
import type { AuditTrails } from "../types/common/AuditLog.types";

interface AuditTrailsProps {
  tableName: string;
  recordId: string | number;
}

const KiduAuditLogs: React.FC<AuditTrailsProps> = ({ tableName, recordId }) => {
  const [history, setHistory] = useState<AuditTrails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tableName && recordId) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName, recordId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await AuditLogService.getByTableAndId(tableName, recordId);
      console.log("Fetched audit logs:", data);

      if (data.isSucess && Array.isArray(data.value)) {
        setHistory(data.value);
        console.log("History updated:", data.value);
      } else {
        console.warn("Unexpected data format:", data);
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to fetch edit history:", err);
      setError("Failed to load edit history. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Updated history:", history);
  }, [history]);

  const formatDateSafe = (isoOrAny?: string) => {
  if (!isoOrAny) return "—";

  const utcDate = new Date(isoOrAny);
  if (isNaN(utcDate.getTime())) return isoOrAny;

  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcDate.getTime() + istOffsetMs);

  const day = String(istDate.getDate()).padStart(2, "0");
  const month = istDate.toLocaleString("en-IN", { month: "long" });
  const year = istDate.getFullYear();
  const time = istDate.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return `${day} ${month} ${year}, ${time}`;
};


  return (
    <>
      <Accordion
        alwaysOpen
        className="mt-4 mb-4 custom-accordion"
        style={{
          maxWidth: "100%",
          fontSize: "0.85rem",
          backgroundColor: "#f0f0f0ff",
        }}
      >
        <Accordion.Item eventKey="0">
          <Card.Header
            as={Accordion.Button}
            className="custom-audit-header"
            style={{
              backgroundColor: "#882626ff",
              color: "white",
              width: "100%",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              cursor: "pointer",
              height: "50px",
            }}
          >
            <h6 className="mb-0 fw-medium head-font">Audit Logs</h6>
          </Card.Header>

          <Accordion.Body>
            <Card
              style={{
                maxWidth: "100%",
                fontSize: "0.85rem",
                backgroundColor: "#f0f0f0ff",
                border: "1px solid #ccc",
                borderRadius: "0.5rem",
              }}
              className="shadow-sm"
            >
              <Card.Body style={{ padding: "1rem" }} className="border border-1 m-2">
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Loading edit history...</p>
                  </div>
                ) : error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : history.length === 0 ? (
                  <p className="text-center text-muted mb-0">
                    No edit history available.
                  </p>
                ) : (
                  <Accordion alwaysOpen>
                    {history.map((item, idx) => (
                      <Accordion.Item eventKey={idx.toString()} key={item.logID}>
                        <Accordion.Header>
                          <div className="head-font d-flex flex-column flex-sm-row justify-content-between w-100">
                            <span className="fw-medium fst-italic fs-6 head-font">
                              - {item.action.toLowerCase()}d by {item.changedBy}
                            </span>
                            <small className="text-muted head-font">
                              {formatDateSafe(item.changedAt)}
                            </small>
                          </div>
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="table-responsive">
                            <Table bordered hover size="sm" className="align-middle">
                              <thead
                                style={{ backgroundColor: "#882626ff", color: "white" }}
                              >
                                <tr className="head-font text-center">
                                  <th style={{ width: "5%" }}>SL No</th>
                                  <th style={{ width: "25%" }}>Field Name</th>
                                  <th style={{ width: "35%" }}>From</th>
                                  <th style={{ width: "35%" }}>To</th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.changes?.length > 0 ? (
                                  item.changes.map((change, i) => (
                                    <tr key={i} className="head-font">
                                      <td>{i + 1}</td>
                                      <td>{change.item || ""}</td>
                                      <td>{change.from || "-"}</td>
                                      <td>{change.to || "-"}</td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan={4} className="text-center text-muted">
                                      No field-level changes recorded.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                )}
              </Card.Body>
            </Card>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <style>{`
        .custom-audit-header.accordion-button {
          background-color: #882626ff !important;
          color: white !important;
          box-shadow: none !important;
        }
        .custom-audit-header.accordion-button:not(.collapsed) {
          background-color: #882626ff !important;
          color: white !important;
        }
        .custom-audit-header.accordion-button::after {
          filter: invert(1); /* make arrow white */
        }
      `}</style>
    </>
  );
};

export default KiduAuditLogs;