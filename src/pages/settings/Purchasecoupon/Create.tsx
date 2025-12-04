import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { FaArrowLeft } from "react-icons/fa";
import KiduValidation from "../../../components/KiduValidation";
import PurchaseCouponService from "../../../services/PurchaseCoupon.Services";
import KiduReset from "../../../components/ReuseButtons/KiduReset";

const CreatePurchaseCoupon: React.FC = () => {
  const navigate = useNavigate();

  // ---------- Initial State ----------
  const initialValues = {
    coins: "",
    amount: "",
    pastAmount: "",
    description: "",
    isActive: true,
    createdAt: new Date().toISOString(),
    createdAppUserId: 0,
  };

  const initialErrors = {
    coins: "",
    amount: "",
    pastAmount: "",
    description: "",
  };

  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);

  // ---------- Validation Rules ----------
  const fieldRules: any = {
    coins: { required: true, type: "number", label: "Coins" },
    amount: { required: true, type: "number", label: "Amount" },
    pastAmount: { required: false, type: "number", label: "Past Amount" },
    description: {
      required: true,
      type: "text",
      maxLength: 100,
      label: "Description",
    },
  };

  // ---------- Handle Change ----------
  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;

    const updatedValue =
      type === "checkbox"
        ? checked
        : type === "number"
        ? value.replace(/[^0-9]/g, "")
        : value;

    setFormData({ ...formData, [name]: updatedValue });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // ---------- Validate Single Field ----------
  const validateField = (name: string, value: any) => {
    const rule = fieldRules[name];
    if (!rule) return true;

    const result = KiduValidation.validate(value, rule);
    setErrors((prev) => ({ ...prev, [name]: result.isValid ? "" : result.message }));

    return result.isValid;
  };

  // ---------- Validate Entire Form ----------
  const validateForm = () => {
    let isValid = true;
    Object.keys(fieldRules).forEach((field) => {
      if (!validateField(field, formData[field])) isValid = false;
    });
    return isValid;
  };

  // ---------- Submit Handler ----------
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      purchaseCouponId: 0,
      coins: Number(formData.coins),
      amount: Number(formData.amount),
      pastAmount: formData.pastAmount === "" ? 0 : Number(formData.pastAmount),
      description: formData.description,
      isActive: formData.isActive,
      createdAt: formData.createdAt,
      createdAppUserId: formData.createdAppUserId,
    };

    try {
      await PurchaseCouponService.addCoupon(payload);

      toast.success("Purchase coupon created successfully!");

      setTimeout(() => {
        navigate("/dashboard/settings/purchase-coupon-list");
      }, 1500);
    } catch (error: any) {
      toast.error("Failed to create purchase coupon");
      console.error(error);
    }
  };

  return (
    <>
      <Card className="mx-3 mt-5" style={{ backgroundColor: "#f6f6f6" }}>
        <Card.Header className="text-white" style={{ background: "#18575A" }}>
          <div className="d-flex align-items-center">
            <Button
              size="sm"
              variant="link"
              className="me-2"
              style={{
                backgroundColor: "white",
                padding: "0.25rem 0.5rem",
                color: "#18575A",
              }}
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft />
            </Button>
            <h6 className="mb-0 p-2 fw-semibold fs-5">Add Purchase Coupon</h6>
          </div>
        </Card.Header>

        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>
                  Coins <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="coins"
                  value={formData.coins}
                  placeholder="Enter coins"
                  onChange={handleChange}
                  onBlur={() => validateField("coins", formData.coins)}
                />
                {errors.coins && <div className="text-danger small">{errors.coins}</div>}
              </Col>

              <Col md={6}>
                <Form.Label>
                  Amount <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  value={formData.amount}
                  placeholder="Enter amount"
                  onChange={handleChange}
                  onBlur={() => validateField("amount", formData.amount)}
                />
                {errors.amount && <div className="text-danger small">{errors.amount}</div>}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Past Amount</Form.Label>
                <Form.Control
                  type="number"
                  name="pastAmount"
                  value={formData.pastAmount}
                  placeholder="Enter past amount"
                  onChange={handleChange}
                  onBlur={() => validateField("pastAmount", formData.pastAmount)}
                />
                {errors.pastAmount && (
                  <div className="text-danger small">{errors.pastAmount}</div>
                )}
              </Col>

              <Col md={6}>
                <Form.Label>
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  placeholder="Enter description"
                  onChange={handleChange}
                  onBlur={() => validateField("description", formData.description)}
                />
                {errors.description && (
                  <div className="text-danger small">{errors.description}</div>
                )}
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Check
                  type="switch"
                  label="Active"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <KiduReset initialValues={initialValues} setFormData={setFormData} />
              <Button type="submit" style={{ background: "#18575A", border: "none" }}>
                Submit
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <Toaster position="top-right" />
    </>
  );
};

export default CreatePurchaseCoupon;
