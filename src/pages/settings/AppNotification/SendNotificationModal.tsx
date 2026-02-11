import React, { useState } from "react";
import { Modal, Form, Button, Badge, Alert } from "react-bootstrap";
import toast from "react-hot-toast";
import { getFullImageUrl } from "../../../constants/API_ENDPOINTS";
import AppNotificationService from "../../../services/settings/AppNotification.services";
import { AppNotification } from "../../../types/settings/AppNotification";
import AppUserMultiSelectPopup from "./AppUserMultiSelectPopup";

interface SendNotificationModalProps {
  show: boolean;
  onHide: () => void;
  notification: AppNotification | null;
}

const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  show,
  onHide,
  notification,
}) => {
  const [sending, setSending] = useState(false);
  const [targetCriteria, setTargetCriteria] = useState<string>("all_users");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [daysWithoutActivity, setDaysWithoutActivity] = useState<string>("7");
  const [balanceThreshold, setBalanceThreshold] = useState<string>("100");
  const [sendResult, setSendResult] = useState<any>(null);
  
  const [showUserPopup, setShowUserPopup] = useState(false);

  const targetAudiences = [
    { criteria: "all_users", label: "📢 All Active Users", description: "All users who logged in within last 30 days" },
    { criteria: "low_balance", label: "💰 Low Balance Users", description: "Users with wallet balance less than threshold" },
    { criteria: "no_activity", label: "😴 Inactive Users", description: "Users who haven't logged in for specified days" },
    { criteria: "new_users", label: "🆕 New Users", description: "Users registered in the last 7 days" },
    { criteria: "custom", label: "🎯 Custom User IDs", description: "Send to specific user IDs only" },
  ];

  const handleSend = async () => {
    if (!notification) return;

    // Validation
    if (targetCriteria === "custom" && selectedUserIds.length === 0) {
      toast.error("Please select at least one user for custom targeting");
      return;
    }

    setSending(true);
    setSendResult(null);

    try {
      const requestBody: any = {
        notificationType: notification.notificationType,
        notificationTitle: notification.notificationTitle,
        notificationBody: `${notification.notificationTitle}`,
        notificationLink: notification.notificationLink || "",
        notificationImage: notification.notificationImage 
          ? getFullImageUrl(notification.notificationImage) 
          : "",
        targetCriteria: targetCriteria,
      };

      // Add conditional fields
      if (targetCriteria === "custom") {
        requestBody.customUserIds = selectedUserIds;
      }

      if (targetCriteria === "no_activity") {
        requestBody.daysWithoutActivity = parseInt(daysWithoutActivity);
      }

      if (targetCriteria === "low_balance") {
        requestBody.balanceThreshold = parseFloat(balanceThreshold);
      }

      console.log("📤 Sending notification:", requestBody);

      const response = await AppNotificationService.sendTargetedNotification(requestBody);

      console.log("📥 API Response:", response);

      // ✅ FIXED: Check if response.value exists and has the notification result
      // The backend returns the NotificationBatchResult in the 'value' field
      if (response && response.value && typeof response.value === 'object') {
        const result = response.value;
        
        // Check if it's a NotificationBatchResult object
        if ('totalTokens' in result && 'successCount' in result && 'failureCount' in result) {
          setSendResult(result);
          
          // Show appropriate message based on success count
          if (result.successCount > 0) {
            toast.success(
              `✅ Notification sent successfully!\n` +
              `Delivered: ${result.successCount}/${result.totalTokens} ` +
              `(${result.successRate?.toFixed(1) || 0}%)`
            );
          } else if (result.totalTokens > 0 && result.failureCount === result.totalTokens) {
            toast.error(
              `⚠️ Notification processed but delivery failed.\n` +
              `Total devices: ${result.totalTokens}\n` +
              `All ${result.failureCount} devices failed to receive the notification.\n` +
              `This may happen if devices are offline or tokens are invalid.`
            );
          } else {
            toast("Notification processed. Check the delivery report below.");
          }
        } else {
          // If value doesn't have expected structure, still show success
          toast.success("Notification sent successfully!");
          setSendResult({ 
            totalTokens: 0, 
            successCount: 0, 
            failureCount: 0,
            successRate: 0,
            message: "Processed" 
          });
        }
      } else {
        // ✅ FIXED: Properly handle null values when throwing error
        if (response?.error || response?.customMessage) {
          const errorMsg = response.error || response.customMessage || "Unknown error occurred";
          throw new Error(errorMsg);
        } else {
          // No error but also no data - treat as unknown success
          toast.success("Notification request processed");
        }
      }
    } catch (error: any) {
      console.error("❌ Send failed:", error);
      
      const errorMessage = error?.response?.data?.error || 
                          error?.response?.data?.customMessage ||
                          error?.message || 
                          "Failed to send notification";
      
      toast.error(`Failed to send: ${errorMessage}`);
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSendResult(null);
    setTargetCriteria("all_users");
    setSelectedUserIds([]);
    setDaysWithoutActivity("7");
    setBalanceThreshold("100");
    onHide();
  };

  const handleUserSelection = (userIds: number[]) => {
    setSelectedUserIds(userIds);
    setShowUserPopup(false);
  };

  const handleRemoveUser = (userId: number) => {
    setSelectedUserIds(prev => prev.filter(id => id !== userId));
  };

  return (
    <>
      <Modal show={show} onHide={handleClose} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #882626ff" }}>
          <Modal.Title style={{ color: "#882626ff", fontFamily: "Urbanist" }}>
            📤 Send Notification
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ fontFamily: "Urbanist" }}>
          {/* Preview Section */}
          <div
            className="mb-4 p-3"
            style={{
              backgroundColor: "#f8f9fa",
              borderRadius: "10px",
              border: "1px solid #dee2e6",
            }}
          >
            <h6 className="mb-3 fw-bold" style={{ color: "#882626ff" }}>
              📋 Notification Preview
            </h6>

            <div className="d-flex align-items-start gap-3">
              {notification?.notificationImage && (
                <img
                  src={getFullImageUrl(notification.notificationImage)}
                  alt="Preview"
                  style={{
                    width: "80px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "2px solid #882626ff",
                  }}
                />
              )}
              <div className="flex-grow-1">
                <div className="mb-2">
                  <Badge bg="secondary" className="me-2">
                    {notification?.notificationType}
                  </Badge>
                  <Badge bg={notification?.isActive ? "success" : "danger"}>
                    {notification?.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <h6 className="mb-1 fw-bold">{notification?.notificationTitle}</h6>
                <small className="text-muted">
                  Link: {notification?.notificationLink || "None"}
                </small>
              </div>
            </div>
          </div>

          {/* Target Audience Section */}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">
                🎯 Target Audience <span style={{ color: "red" }}>*</span>
              </Form.Label>
              <Form.Select
                value={targetCriteria}
                onChange={(e) => setTargetCriteria(e.target.value)}
                disabled={sending}
              >
                {targetAudiences.map((audience) => (
                  <option key={audience.criteria} value={audience.criteria}>
                    {audience.label}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                {targetAudiences.find(a => a.criteria === targetCriteria)?.description}
              </Form.Text>
            </Form.Group>

            {/* Custom User Selection */}
            {targetCriteria === "custom" && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  Select Users <span style={{ color: "red" }}>*</span>
                </Form.Label>
                
                <Button
                  variant="outline-primary"
                  className="w-100 mb-2"
                  onClick={() => setShowUserPopup(true)}
                  disabled={sending}
                >
                  <i className="bi bi-person-plus me-2"></i>
                  Select Users from List ({selectedUserIds.length} selected)
                </Button>

                {selectedUserIds.length > 0 && (
                  <div
                    className="p-2"
                    style={{
                      backgroundColor: "#f8f9fa",
                      borderRadius: "5px",
                      maxHeight: "150px",
                      overflowY: "auto"
                    }}
                  >
                    <small className="text-muted d-block mb-2">
                      Selected User IDs:
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {selectedUserIds.map(userId => (
                        <Badge
                          key={userId}
                          bg="primary"
                          className="d-flex align-items-center gap-1"
                          style={{ cursor: "pointer" }}
                        >
                          <span>ID: {userId}</span>
                          <i
                            className="bi bi-x-circle"
                            onClick={() => handleRemoveUser(userId)}
                            style={{ fontSize: "14px" }}
                          ></i>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Form.Group>
            )}

            {targetCriteria === "no_activity" && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Days Without Activity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={daysWithoutActivity}
                  onChange={(e) => setDaysWithoutActivity(e.target.value)}
                  disabled={sending}
                />
              </Form.Group>
            )}

            {targetCriteria === "low_balance" && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Balance Threshold</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  value={balanceThreshold}
                  onChange={(e) => setBalanceThreshold(e.target.value)}
                  disabled={sending}
                />
              </Form.Group>
            )}
          </Form>

          {/* Send Result */}
          {sendResult && (
            <Alert variant={sendResult.successCount > 0 ? "success" : "warning"} className="mt-3">
              <h6 className="fw-bold mb-2">📊 Delivery Report</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Devices:</span>
                <strong>{sendResult.totalTokens || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>✅ Successful:</span>
                <strong className="text-success">{sendResult.successCount || 0}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>❌ Failed:</span>
                <strong className="text-danger">{sendResult.failureCount || 0}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span>Success Rate:</span>
                <strong>{sendResult.successRate?.toFixed(1) || 0}%</strong>
              </div>
              
              {sendResult.failureCount > 0 && (
                <small className="text-muted d-block mt-2">
                  Failed tokens have been marked as inactive and will be cleaned up automatically.
                </small>
              )}
            </Alert>
          )}

          {/* Warning */}
          {!sendResult && (
            <Alert variant="warning" className="d-flex align-items-center mt-3">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <small>
                This will send push notifications to the selected users. Make sure the content is correct.
              </small>
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={sending}>
            {sendResult ? "Close" : "Cancel"}
          </Button>
          {!sendResult && (
            <Button
              style={{ backgroundColor: "#882626ff", border: "none" }}
              onClick={handleSend}
              disabled={sending || !notification?.isActive}
            >
              {sending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Sending...
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i>
                  Send Notification
                </>
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* User Multi-Select Popup */}
      <AppUserMultiSelectPopup
        show={showUserPopup}
        onHide={() => setShowUserPopup(false)}
        onConfirm={handleUserSelection}
        initialSelectedIds={selectedUserIds}
      />
    </>
  );
};

export default SendNotificationModal;