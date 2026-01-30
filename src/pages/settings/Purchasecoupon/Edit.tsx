import React, { useEffect, useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import KiduValidation from "../../../components/KiduValidation";
import PurchaseCouponService from "../../../services/PurchaseCoupon.Services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduLoader from "../../../components/KiduLoader";
import KiduReset from "../../../components/ReuseButtons/KiduReset";
import KiduAuditLogs from "../../../components/KiduAuditLogs";

const PurchaseCouponEdit: React.FC = () => {
  const navigate = useNavigate();
  const { purchaseCouponId } = useParams<{ purchaseCouponId: string }>();

  const fields = [
    { name: "coins", rules: { required: true, type: "number" as const, label: "Coins" } },
    { name: "amount", rules: { required: true, type: "number" as const, label: "Amount" } },
    { name: "pastAmount", rules: { required: false, type: "number" as const, label: "Past Amount" } },
    { name: "description", rules: { required: false, type: "text" as const, label: "Description", maxLength: 100 } },
  ];

  const initialValues: any = {};
  const initialErrors: any = {};
  fields.forEach(f => {
    initialValues[f.name] = "";
    initialErrors[f.name] = "";
  });

  const [formData, setFormData] = useState({
    ...initialValues,
    purchaseCouponId: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdAppUserId: 0,
  });

  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);

  const getLabel = (name: string) => {
    const field = fields.find(f => f.name === name);
    if (!field) return "";
    return (
      <>
        {field.rules.label}
        {field.rules.required && <span style={{ color: "red", marginLeft: "2px" }}>*</span>}
      </>
    );
  };

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        setLoading(true);
        if (!purchaseCouponId) { 
          toast.error("No coupon ID provided"); 
          navigate("/dashboard/settings/purchase-coupon-list"); 
          return; 
        }
        const response = await PurchaseCouponService.getCouponsById(purchaseCouponId);
        if (!response) throw new Error("No data received from server");

        const formattedData = {
          purchaseCouponId: response.purchaseCouponId || 0,
          coins: response.coins || "",
          amount: response.amount || "",
          pastAmount: response.pastAmount || "",
          description: response.description || "",
          isActive: response.isActive ?? true,
          createdAt: response.createdAt || new Date().toISOString(),
          createdAppUserId: response.createdAppUserId || 0,
        };

        setFormData(formattedData);
        setInitialData(formattedData);
      } catch (error: any) {
        console.error("Failed to load coupon:", error);
        toast.error(`Error loading coupon: ${error.message}`);
        navigate("/dashboard/settings/purchase-coupon-list");
      } finally { 
        setLoading(false); 
      }
    };
    fetchCoupon();
  }, [purchaseCouponId, navigate]);

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    const target = e.target as HTMLInputElement;
    let updatedValue: any = value;
    
    if (type === "checkbox") {
      updatedValue = target.checked;
    } else if (type === "number") {
      if (value === "") {
        updatedValue = "";
      } else {
        updatedValue = Number(value);
      }
    }
    
    setFormData((prev: any) => ({ ...prev, [name]: updatedValue }));
    if (errors[name]) setErrors((prev: any) => ({ ...prev, [name]: "" }));
  };

  const overrideMessage = (name: string) => {
    const field = fields.find(f => f.name === name);
    const label = field?.rules.label || "This field";
    return `${label} is required.`;
  };

  const validateField = (name: string, value: any) => {
    const field = fields.find(f => f.name === name);
    if (!field) return true;
    const result = KiduValidation.validate(value, field.rules);
    if (!result.isValid) {
      const msg = overrideMessage(name);
      setErrors((prev: any) => ({ ...prev, [name]: msg }));
      return false;
    }
    setErrors((prev: any) => ({ ...prev, [name]: "" }));
    return true;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach(f => {
      if (!validateField(f.name, formData[f.name])) ok = false;
    });
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      if (!purchaseCouponId) throw new Error("No coupon ID available");
      
      const dataToUpdate = {
        purchaseCouponId: Number(formData.purchaseCouponId),
        coins: Number(formData.coins) || 0,
        amount: Number(formData.amount) || 0,
        pastAmount: formData.pastAmount === "" ? 0 : Number(formData.pastAmount),
        description: formData.description || "",
        isActive: Boolean(formData.isActive),
        createdAt: formData.createdAt,
        createdAppUserId: formData.createdAppUserId,
      };

      const updateResponse = await PurchaseCouponService.editCouponById(purchaseCouponId, dataToUpdate as any);
      if (!updateResponse || updateResponse.isSucess === false) {
        throw new Error(updateResponse?.customMessage || updateResponse?.error || "Failed to update coupon");
      }

      toast.success("Purchase coupon updated successfully!");
      setTimeout(() => navigate("/dashboard/settings/purchase-coupon-list"), 1500);
    } catch (error: any) {
      console.error("Update failed:", error);
      toast.error(`Error updating coupon: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  if (loading) return <KiduLoader type="Coupon..." />;

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Edit Purchase Coupon</h5>
            </div>
          </div>

          <Card.Body style={{ padding: "1.5rem" }}>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col xs={12}>
                  <Row className="g-2">
                    {/* Coins */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("coins")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="number" 
                        name="coins" 
                        value={formData.coins === "" ? "" : formData.coins || ""}
                        onChange={handleChange} 
                        onBlur={() => validateField("coins", formData.coins)} 
                        placeholder="Enter Coins"
                      />
                      {errors.coins && <div className="text-danger small">{errors.coins}</div>}
                    </Col>

                    {/* Amount */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("amount")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="number" 
                        name="amount" 
                        value={formData.amount === "" ? "" : formData.amount || ""}
                        onChange={handleChange} 
                        onBlur={() => validateField("amount", formData.amount)} 
                        placeholder="Enter Amount"
                      />
                      {errors.amount && <div className="text-danger small">{errors.amount}</div>}
                    </Col>

                    {/* Past Amount */}
                    <Col md={4}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("pastAmount")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        type="number" 
                        name="pastAmount" 
                        value={formData.pastAmount === "" ? "" : formData.pastAmount || ""}
                        onChange={handleChange} 
                        onBlur={() => validateField("pastAmount", formData.pastAmount)} 
                        placeholder="Enter Past Amount"
                      />
                      {errors.pastAmount && <div className="text-danger small">{errors.pastAmount}</div>}
                    </Col>

                    {/* Description */}
                    <Col md={12}>
                      <Form.Label className="mb-1 fw-medium small">{getLabel("description")}</Form.Label>
                      <Form.Control 
                        size="sm" 
                        as="textarea"
                        rows={2}
                        name="description" 
                        value={formData.description}
                        onChange={handleChange} 
                        onBlur={() => validateField("description", formData.description)} 
                        placeholder="Enter Description"
                        maxLength={100}
                      />
                      {errors.description && <div className="text-danger small">{errors.description}</div>}
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Switches Section */}
              <Row className="mb-3 mx-1">
                <Col xs={12}>
                  <div className="d-flex flex-wrap gap-3">
                    <Form.Check 
                      type="switch" 
                      id="isActive" 
                      name="isActive" 
                      label="Is Active"
                      checked={formData.isActive || false} 
                      onChange={handleChange} 
                      className="fw-semibold" 
                    />
                  </div>
                </Col>
              </Row>

              {/* Action Buttons */}
              <div className="d-flex justify-content-end gap-2 mt-4 me-2">
                <KiduReset initialValues={initialData} setFormData={setFormData} setErrors={setErrors} />
                <Button type="submit" style={{ backgroundColor: "#882626ff", border: "none" }} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Update"}
                </Button>
              </div>
            </Form>

            {/* Audit Logs */}
            {formData.purchaseCouponId && <KiduAuditLogs tableName="PurchaseCoupon" recordId={formData.purchaseCouponId.toString()} />}
          </Card.Body>
        </Card>

        <Toaster position="top-right" />
      </div>
    </>
  );
};

export default PurchaseCouponEdit;