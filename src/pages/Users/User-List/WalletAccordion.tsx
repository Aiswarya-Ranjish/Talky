import React from "react";
import { Accordion, Card } from "react-bootstrap";
import WalletTransactionServices from "../../../services/Users/WalletTransactionService";
import { Wallettransaction } from "../../../types/Users/WalletTransaction.types";
import KiduServerTable from "../../../components/Trip/KiduServerTable";

interface WalletAccordionProps {
  userId: string | number;
}

const WalletAccordion: React.FC<WalletAccordionProps> = ({ userId }) => {
  const fetchWalletTransactions = async (params: {
    pageNumber: number;
    pageSize: number;
    searchTerm: string;
  }): Promise<{ data: any[]; total: number }> => {
    try {
      console.log("Fetching wallet transactions for userId:", userId);
      
      const allTransactions = await WalletTransactionServices.getUserById(String(userId));
      
      console.log("Fetched transactions:", allTransactions);

      if (!allTransactions || allTransactions.length === 0) {
        return { data: [], total: 0 };
      }

      const transformedData = allTransactions.map((tx: Wallettransaction) => ({
        ...tx,
        status: tx.isSuccess ? "Success" : "Failed",
        isSuccessOriginal: tx.isSuccess
      }));
      
      let filteredData = transformedData;
      if (params.searchTerm) {
        const searchLower = params.searchTerm.toLowerCase();
        filteredData = transformedData.filter((tx: any) =>
          tx.transactionType?.toLowerCase().includes(searchLower) ||
          tx.description?.toLowerCase().includes(searchLower) ||
          tx.paymentGateWaySerialNumber?.toLowerCase().includes(searchLower) ||
          String(tx.coins).includes(searchLower) ||
          String(tx.amount).includes(searchLower) ||
          String(tx.id).includes(searchLower) ||
          tx.status?.toLowerCase().includes(searchLower)
        );
      }

      const startIndex = (params.pageNumber - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total: filteredData.length,
      };
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      return { data: [], total: 0 };
    }
  };

  const columns = [
    { key: "id", label: "ID", enableSorting: true, enableFiltering: true, type: "text" as const },
    { key: "transactionType", label: "Type", enableSorting: true, enableFiltering: true, type: "text" as const },
    { key: "coins", label: "Coins", enableSorting: true, enableFiltering: true, type: "text" as const },
    { key: "amount", label: "Amount", enableSorting: true, enableFiltering: true, type: "text" as const },
    { key: "description", label: "Description", enableSorting: false, enableFiltering: true, type: "text" as const },
    { key: "paymentGateWaySerialNumber", label: "Payment Ref", enableSorting: false, enableFiltering: true, type: "text" as const },
    { key: "status", label: "Status", enableSorting: true, enableFiltering: true, type: "text" as const },
    { key: "createdAt", label: "Date", enableSorting: true, enableFiltering: false, type: "date" as const },
  ];

  return (
    <>
      <Accordion 
        className="mt-4 custom-accordion"
        style={{
          maxWidth: "100%",
          fontSize: "0.85rem",
          backgroundColor: "#f0f0f0ff",
        }}
      >
        <Accordion.Item eventKey="0">
          <Card.Header
            as={Accordion.Button}
            className="custom-wallet-header"
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
              height: "50px"
            }}
          >
            <h6 className="mb-0 fw-medium head-font">Wallet Transactions</h6>
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
                <KiduServerTable
                  title=""
                  columns={columns}
                  idKey="id"
                  fetchData={fetchWalletTransactions}
                  showAddButton={false}
                  showExport={true}
                  showSearch={true}
                  showActions={false}
                  showTitle={false}
                  rowsPerPage={10}
                />
              </Card.Body>
            </Card>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <style>{`
        .custom-wallet-header.accordion-button {
          background-color: #882626ff !important;
          color: white !important;
          box-shadow: none !important;
        }
        .custom-wallet-header.accordion-button:not(.collapsed) {
          background-color: #882626ff !important;
          color: white !important;
        }
        .custom-wallet-header.accordion-button::after {
          filter: invert(1);
        }
      `}</style>
    </>
  );
};

export default WalletAccordion;