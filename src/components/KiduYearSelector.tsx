import React, { useState, useEffect } from "react";
import { Dropdown, ButtonGroup } from "react-bootstrap";
import TripService from "../services/Trip.services";

interface YearDropdownProps {
  startYear?: number; // optional, defaults to 2023
  onYearSelect: (year: number) => void; // callback when a year is selected
  defaultYear?: number; // optional, defaults to current year
}
const KiduYearSelector: React.FC<YearDropdownProps> = ({
  startYear = 2023,
  onYearSelect,
  defaultYear = new Date().getFullYear(),
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [years, setYears] = useState<number[]>([]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearList: number[] = [];
    for (let y = currentYear; y >= startYear; y--) {
      yearList.push(y);
    }
    setYears(yearList);
  }, [startYear]);

  const handleSelect = async (year: number) => {
    setSelectedYear(year);
    onYearSelect(year);

    try {
      const response = await TripService.getTripsByYear(year);
      console.log(response);
      
      if (response.isSucess && response.value) {
        console.log("Trips for selected year:", response.value);
        // You can lift this data up via context or props if needed
      } else {
        console.error("Failed to fetch trips for the year");
      }
    } catch (error) {
      console.error("Error fetching trips by year:", error);
    }
  };

  return (
    <Dropdown as={ButtonGroup}>
      <Dropdown.Toggle
        variant="outline"
        id="year-dropdown"
         className="fw-semibold px-4 py-1 mb-1 shadow-lg rounded-2 border border-1 border-light bg-white text-dark"
         style={{
          // boxShadow: "inset 0px 1px 3px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease-in-out",
        }}
      >
       <span className="head-font"> {selectedYear}</span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="head-font">
        {years.map((year) => (
          <Dropdown.Item
            key={year}
            onClick={() => handleSelect(year)}
            active={year === selectedYear}
            style={{
              transition: "all 0.2s ease-in-out",
              backgroundColor:
                year === selectedYear ? "#882626ff" : "transparent",
              color: year === selectedYear ? "white" : "black",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#882626ff";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              if (year === selectedYear) {
                e.currentTarget.style.backgroundColor = "#882626ff";
                e.currentTarget.style.color = "white";
              } else {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "black";
              }
            }}
          >
            {year}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default KiduYearSelector;
