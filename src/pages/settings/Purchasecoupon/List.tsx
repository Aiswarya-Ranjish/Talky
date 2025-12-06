import React, { useEffect, useState, useCallback } from "react";
import type { Purchascoupon } from "../../../types/settings/PurchaseCouponType";
import PurchaseCouponService from "../../../services/PurchaseCoupon.Services";
import KiduLoader from "../../../components/KiduLoader";
import KiduServerTable from "../../../components/Trip/KiduServerTable";

const formatDate = (dateValue: string | Date | null | undefined): string => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "long" });
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const columns = [
  { key: "purchaseCouponId", label: "Coupon ID", type: "text" as const },
  { key: "coins", label: "Coins", type: "text" as const },
  { key: "amount", label: "Amount", type: "text" as const },
  { key: "pastAmount", label: "Past Amount", type: "text" as const },
  { key: "description", label: "Description", type: "text" as const },
  { key: "isActive", label: "Status", type: "text" as const },
  { key: "createdAt", label: "Created Date", type: "text" as const },
];

const PurchaseCouponPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const loadCoupons = useCallback(async () => {
    try {
      setLoading(true);
      await PurchaseCouponService.getAllCoupons();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  if (loading) return <KiduLoader type="Loading Purchase Coupons..." />;

  const fetchData = async (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }) => {
    try {
      const response = await PurchaseCouponService.getAllCoupons();
      let filteredData = response || [];

      // Search filtering
      if (params.searchTerm) {
        const s = params.searchTerm.toLowerCase();
        filteredData = filteredData.filter(coupon =>
          (coupon.purchaseCouponId?.toString() || "").includes(s) ||
          (coupon.coins?.toString() || "").includes(s) ||
          (coupon.amount?.toString() || "").includes(s) ||
          (coupon.description || "").toLowerCase().includes(s)
        );
      }

      // Format dates for display
      const formattedData = filteredData.map(coupon => ({
        ...coupon,
        createdAt: formatDate(coupon.createdAt),
        isActive: coupon.isActive ? "Active" : "Inactive"
      }));

      // Pagination
      const start = (params.pageNumber - 1) * params.pageSize;
      const data = formattedData.slice(start, start + params.pageSize);

      return { data, total: formattedData.length };
    } catch {
      return { data: [], total: 0 };
    }
  };

  return (
    <KiduServerTable
      title="Purchase Coupon List"
      subtitle="List of all purchase coupons with Edit & View options"
      columns={columns}
      idKey="purchaseCouponId"
      addButtonLabel="Add New Coupon"
      addRoute="/dashboard/settings/create-purchasecoupon"
      editRoute="/dashboard/settings/edit-purchasecoupon"
      viewRoute="/dashboard/settings/view-purchasecoupon"
      fetchData={fetchData}
      showSearch={true}
      showActions={true}
      showExport={true}
      showAddButton={true}
      rowsPerPage={10}
    />
  );
};

export default PurchaseCouponPage;