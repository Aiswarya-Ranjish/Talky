import React, { useEffect, useState, useCallback } from "react";
import { Purchascoupon } from "../../../types/settings/PurchaseCouponType";
import PurchaseCouponService from "../../../services/PurchaseCoupon.Services";
import KiduLoader from "../../../components/KiduLoader";
import KiduTable from "../../../components/KiduTable";

// Table Columns
const formatDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return "-";
  
    const date = new Date(dateValue);
  
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "long" }); // Full month name
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  };
  
  
  
const columns = [
  { label: "ID", key: "purchaseCouponId" },
  { label: "Coins", key: "coins" },
  { label: "Amount", key: "amount" },
  { label: "Past Amount", key: "pastAmount" },
  { label: "Status", key: "isActive" },
  {
    label: "Created Date",
    key: "createdAt",
    render: (value: string) => formatDate(value),
  },
  
];

const PurchaseCouponPage: React.FC = () => {
  const [couponList, setCouponList] = useState<Purchascoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
  
      const response = await PurchaseCouponService.getAllCoupons();
  
      if (response && Array.isArray(response)) {
  
        // Format dates here before passing to table
        const formattedData = response.map(coupon => ({
          ...coupon,
          createdAt: formatDate(coupon.createdAt)
        }));
  
        setCouponList(formattedData);
        setError(null);
  
      } else {
        setError("Failed to load purchase coupon data");
      }
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);
  
  
  

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  if (loading) return <KiduLoader type="Loading Purchase Coupons..." />;

  return (
    <KiduTable
      title="Purchase Coupon List"
      subtitle="List of all purchase coupons with Edit & View options"
      data={couponList}
      addButtonLabel="Add New Coupon"
      columns={columns}
      idKey="purchaseCouponId"
      addRoute="/dashboard/settings/create-purchasecoupon"
      editRoute="/dashboard/settings/edit-purchasecoupon"   // KiduTable will append /id
      viewRoute="/dashboard/settings/view-purchasecoupon"   // KiduTable will append /id
      error={error}
      onRetry={loadCoupons}
    />
  );
};

export default PurchaseCouponPage;
