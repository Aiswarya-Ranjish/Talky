import React, { useState, useEffect } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

import ProgressBar from "../layout/ProgressBar";
import Charts from "../layout/Charts";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import KiduLoader from "../components/KiduLoader";
import KiduCard from "../components/KiduCard";
import KiduButton from "../components/KiduButton";
import KiduSearchBar from "../components/KiduSearchBar";
import { useYear } from "../context/YearContext";

interface CardData {
  title: string;
  value: number;
  change: number;
  color: string;
  route: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { selectedYear } = useYear();

  // --------------------- FETCH DASHBOARD ---------------------
  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        
        // TODO: Replace with your actual dashboard service call
        // Example: const response = await DashboardService.getDashboard(selectedYear);
        
        // Mock data for demonstration
        const mockData: CardData[] = [
          { title: "Total Users", value: 150, change: 12, color: "#4CAF50", route: "/dashboard/users" },
          { title: "Total Staff", value: 25, change: 5, color: "#2196F3", route: "/dashboard/staff/staff-list" },
          { title: "Active Sessions", value: 45, change: -3, color: "#FF9800", route: "/dashboard/sessions" },
          { title: "Revenue", value: 12500, change: 8, color: "#9C27B0", route: "/dashboard/revenue" },
        ];
        
        setCards(mockData);
        
        // Uncomment when you have the actual service
        // if (response?.isSuccess && response?.value) {
        //   setCards(response.value);
        // } else {
        //   toast.error("Failed to load dashboard data.");
        // }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Error fetching dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [selectedYear]);

  // --------------------- HANDLE SEARCH ---------------------
  const handleSearch = async (term: string) => {
    if (!term) {
      toast.error("Please enter a search term.");
      return;
    }

    try {
      // TODO: Replace with your actual search service call
      // Example: const response = await SearchService.search(term);
      
      toast.info(`Searching for: ${term}`);
      
      // Uncomment and modify when you have the actual service
      // if (response.isSuccess && response.value) {
      //   const item = response.value;
      //   navigate(`/dashboard/details/${item.id}`);
      //   toast.success(`Item found!`);
      // } else {
      //   toast.error("No results found.");
      // }
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Error performing search.");
    }
  };

  return (
    <>
      <div className="d-flex flex-column p-3 mt-5 mt-md-2">

        {/* Search + Add Button */}
        <div className="d-flex justify-content-between flex-column flex-md-row align-items-stretch gap-2 mt-5">

          <KiduSearchBar onSearch={handleSearch} />

          
        </div>

        {/* Cards */}
        <Container fluid className="mt-5 px-0">
          <Row className="g-2 justify-content-start mb-2">
            <h6 className="fw-medium mb-3 text-start head-font" style={{ color: "gray" }}>
              Overview
            </h6>

            {loading ? (
              <div className="d-flex justify-content-center align-items-center w-100 mt-3">
                <KiduLoader type="..." />
              </div>
            ) : (
              cards.map((card, idx) => (
                <Col xs={6} sm={6} md={4} lg={3} xl={2} key={idx} className="d-flex">
                  <KiduCard
                    title={card.title}
                    value={card.value}
                    change={card.change}
                    color={card.color}
                    onClick={() => navigate(card.route)}
                  />
                </Col>
              ))
            )}
          </Row>

          <Charts />

          <Row>
            <ProgressBar />
          </Row>
        </Container>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default HomePage;