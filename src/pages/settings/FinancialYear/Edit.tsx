import React, { useEffect, useState } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import FinancialYearService from "../../../services/settings/financial.services";
import KiduValidation from "../../../components/KiduValidation";
import KiduLoader from "../../../components/KiduLoader";
import KiduPrevious from "../../../components/KiduPrevious";
import KiduReset from "../../../components/ReuseButtons/KiduReset";


const FinancialYearEdit: React.FC = () => {
  const { financialYearId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [errors, setErrors] = useState<any>({});

  // ---------- FIELD DEFINITIONS ----------
  const fields = [
    { name: "finacialYearCode", rules: { required: true, type: "text", label: "Financial Year Code" } },
    { name: "startDate", rules: { required: true, type: "date", label: "Start Date" } },
    { name: "endDate", rules: { required: true, type: "date", label: "End Date" } }
  ];

  // ---------- LOAD DATA ----------
  useEffect(() => {
    const loadFinancialYear = async () => {
      if (!financialYearId) {
        toast.error("Invalid Financial Year ID");
        navigate("/FinancialYear/FinancialYearPage");
        return;
      }

      try {
        const res = await FinancialYearService.getFinancialYearById(financialYearId);

        if (res) {
          const loadedValues = {
            financialYearId: res.financialYearId,
            finacialYearCode: res.finacialYearCode ?? "",
            startDate: res.startDate?.split("T")[0] ?? "",
            endDate: res.endDate?.split("T")[0] ?? "",
            isCurrent: res.isCurrent ?? false,
            isClosed: res.isClosed ?? false
          };

          setFormData(loadedValues);
          setInitialValues(loadedValues);

          const err: any = {};
          fields.forEach((f) => (err[f.name] = ""));
          setErrors(err);

        } else {
          toast.error("Failed to load financial year");
          navigate("/FinancialYear/FinancialYearPage");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load financial year");
        navigate("/FinancialYear/FinancialYearPage");
      } finally {
        setLoading(false);
      }
    };

    loadFinancialYear();
  }, [financialYearId, navigate]);

  // ---------- HANDLE CHANGE ----------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
  
    let updatedValue: any = value;
  
    // Check if the element is actually a checkbox input
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      updatedValue = e.target.checked;
    }
  
    setFormData((prev: any) => ({
      ...prev,
      [name]: updatedValue,
    }));
  
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };
  

  // ---------- VALIDATION ----------
  const validateField = (name: string, value: any) => {
    const rule = fields.find((f) => f.name === name)?.rules;
    if (!rule) return true;

    const result = KiduValidation.validate(value, rule as any);

    setErrors((prev: any) => ({
      ...prev,
      [name]: result.isValid ? "" : result.message
    }));

    return result.isValid;
  };

  const validateForm = () => {
    let ok = true;
    fields.forEach((f) => {
      if (!validateField(f.name, formData[f.name])) ok = false;
    });
    return ok;
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (!financialYearId) {
      toast.error("Invalid financial year ID");
      return;
    }

    try {
      const payload = {
        financialYearId: Number(financialYearId),
        finacialYearCode: formData.finacialYearCode,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        isClosed: formData.isClosed
      };

      await FinancialYearService.editFinanceById(financialYearId, payload);

      toast.success("Financial Year Updated Successfully!");

      setTimeout(() => navigate("/dashboard/settings/financial-year"), 1500);

    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  // ---------- SHOW LOADER ----------
  if (loading) return <KiduLoader type="Loading Financial Year..." />;

  return (
    <>
      <Container className="px-4 mt-5 shadow-sm rounded bg-white" style={{ fontFamily: "Urbanist" }}>
        <div className="d-flex align-items-center mb-3">
          <div className="me-2 mt-3"><KiduPrevious /></div>
          <h4 className="fw-bold mt-3" style={{ color: "#18575A" }}>
            Edit Financial Year
          </h4>
        </div>

        <hr />

        <Form onSubmit={handleSubmit} className="p-4">
          <Row>
            {/* FINANCIAL YEAR CODE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                {fields[0].rules.label} <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="finacialYearCode"
                placeholder="Enter Financial Year Code"
                value={formData.finacialYearCode}
                onChange={handleChange}
                onBlur={() => validateField("finacialYearCode", formData.finacialYearCode)}
              />
              {errors.finacialYearCode && (
                <small className="text-danger">{errors.finacialYearCode}</small>
              )}
            </Col>

            {/* START DATE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                Start Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                onBlur={() => validateField("startDate", formData.startDate)}
              />
              {errors.startDate && (
                <small className="text-danger">{errors.startDate}</small>
              )}
            </Col>

            {/* END DATE */}
            <Col md={6} className="mb-3">
              <Form.Label className="fw-semibold">
                End Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                onBlur={() => validateField("endDate", formData.endDate)}
              />
              {errors.endDate && (
                <small className="text-danger">{errors.endDate}</small>
              )}
            </Col>

            {/* SWITCHES */}
            <Col md={6} className="mt-4">
              <Form.Check
                type="switch"
                label="Is Current"
                name="isCurrent"
                checked={formData.isCurrent}
                onChange={handleChange}
              />

              <Form.Check
                type="switch"
                label="Is Closed"
                name="isClosed"
                checked={formData.isClosed}
                onChange={handleChange}
                className="mt-2"
              />
            </Col>
          </Row>

          {/* BUTTONS */}
          <div className="d-flex gap-2 justify-content-end mt-4">
            <KiduReset initialValues={initialValues} setFormData={setFormData} />
            <Button type="submit" style={{ backgroundColor: "#18575A", border: "none" }}>
              Update
            </Button>
          </div>
        </Form>
      </Container>

      <Toaster position="top-right" />
    </>
  );
};

export default FinancialYearEdit;
