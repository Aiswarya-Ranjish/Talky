import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import KiduValidation from "../../../components/KiduValidation";
import PurchaseCouponService from "../../../services/PurchaseCoupon.Services";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";

const CreatePurchaseCoupon: React.FC = () => {
  const navigate = useNavigate();

  const fields = [
    { name: "coins", rules: { required: true, type: "number" as const, label: "Coins" } },
    { name: "amount", rules: { required: true, type: "number" as const, label: "Amount" } },
    { name: "pastAmount", rules: { required: false, type: "number" as const, label: "Past Amount" } },
    { name: "description", rules: { required: true, type: "text" as const, label: "Description", maxLength: 100 } },
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialData] = useState({
    ...initialValues,
    purchaseCouponId: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    createdAppUserId: 0,
  });

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
        updatedValue = value.replace(/[^0-9]/g, "");
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
      const dataToCreate = {
        purchaseCouponId: 0,
        coins: Number(formData.coins) || 0,
        amount: Number(formData.amount) || 0,
        pastAmount: formData.pastAmount === "" ? 0 : Number(formData.pastAmount),
        description: formData.description || "",
        isActive: Boolean(formData.isActive),
        createdAt: formData.createdAt,
        createdAppUserId: formData.createdAppUserId,
      };

      const createResponse = await PurchaseCouponService.addCoupon(dataToCreate as any);
      if (!createResponse || createResponse.isSucess === false) {
        throw new Error(createResponse?.customMessage || createResponse?.error || "Failed to create purchase coupon");
      }

      toast.success("Purchase coupon created successfully!");
      setTimeout(() => navigate("/dashboard/settings/purchase-coupon-list"), 1500);
    } catch (error: any) {
      console.error("Create failed:", error);
      toast.error(`Error creating purchase coupon: ${error.message}`);
    }
    setIsSubmitting(false);
  };

  return (
    <>
      <div className="container d-flex justify-content-center align-items-center mt-5" style={{ fontFamily: "Urbanist" }}>
        <Card className="shadow-lg p-4 w-100" style={{ maxWidth: "1300px", borderRadius: "15px", border: "none" }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <KiduPrevious />
              <h5 className="fw-bold m-0 ms-2" style={{ color: "#882626ff" }}>Create Purchase Coupon</h5>
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
                        value={formData.coins}
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
                        value={formData.amount}
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
                        value={formData.pastAmount}
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
                  {isSubmitting ? "Creating..." : "Create"}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>

        <Toaster position="top-right" />
      </div>
    </>
  );
};

export default CreatePurchaseCoupon;