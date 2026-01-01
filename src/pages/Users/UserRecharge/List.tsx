import React, { useEffect, useState, useCallback } from "react";
import { purchaseorder } from "../../../types/Users/UserRecharge.types";
import KiduLoader from "../../../components/KiduLoader";
import toast from "react-hot-toast";
import KiduServerTable from "../../../components/Trip/KiduServerTable";
import PurchaseOrderService from "../../../services/Users/UserRecharge.services";

const columns = [
  { key: "purchaseOrderId", label: "Order ID", type: "text" as const },
  { key: "appUserId", label: "User ID", type: "text" as const },
  { key: "amount", label: "Amount", type: "text" as const },
  { key: "description", label: "Description", type: "text" as const },
  { key: "isSucsess", label: "Success", type: "checkbox" as const },
  { key: "createdAt", label: "Date", type: "date" as const },
];

const UserRechargeListPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      await PurchaseOrderService.getAllPurchaseOrder();
    } catch (err: any) {
      toast.error("Error fetching recharge list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (loading) return <KiduLoader type="Loading Recharge Orders..." />;

  // ✅ Added reverseOrder parameter
  const fetchData = async (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
    reverseOrder?: boolean;
  }) => {
    try {
      const response = await PurchaseOrderService.getAllPurchaseOrder();
      let filteredData = response || [];
      
      // Apply search filter locally
      if (params.searchTerm) {
        const searchLower = params.searchTerm.toLowerCase();
        filteredData = filteredData.filter(order => 
          (order.purchaseOrderId?.toString() || '').includes(searchLower) ||
          (order.appUserId?.toString() || '').includes(searchLower) ||
          (order.amount?.toString() || '').includes(searchLower) ||
          (order.description?.toString() || '').toLowerCase().includes(searchLower)
        );
      }
      
      // ✅ Apply reverse order if requested (show latest recharges first)
      if (params.reverseOrder) {
        filteredData = [...filteredData].reverse();
      }
      
      // Apply pagination
      const startIndex = (params.pageNumber - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        data: paginatedData,
        total: filteredData.length
      };
    } catch (error) {
      console.error("Error fetching data:", error);
      return { data: [], total: 0 };
    }
  };

  return (
    <KiduServerTable
      title="User Recharge Management"
      subtitle="List of all recharge orders"
      columns={columns}
      idKey="purchaseOrderId"
      addButtonLabel="Add Recharge"
      viewRoute="/dashboard/recharge/view"
      fetchData={fetchData}
      showSearch={true}
      showActions={true}
      showExport={true}
      showAddButton={false}
      rowsPerPage={10}
      reverseOrder={true}  // ✅ Added this prop
    />
  );
};

export default UserRechargeListPage;