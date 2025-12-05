import React, { useState } from "react";
import { Form, InputGroup, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";

interface KiduSearchBarProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  width?: string;
}

const KiduSearchBar: React.FC<KiduSearchBarProps> = ({
  placeholder = "Search...",
  onSearch,
  width = "400px",
}) => {
  const [value, setValue] = useState("");

  const handleSearch = () => {
    onSearch(value.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div style={{ width, maxWidth: "100%" }}>
      <InputGroup>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{
            borderRight: "none",
            borderColor: "#dee2e6",
            boxShadow: "none",
            fontFamily: "Urbanist",
          }}
        />
        <Button
          onClick={handleSearch}
          style={{
            backgroundColor: "#882626ff",
            border: "none",
            color: "white",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
          <FaSearch />
        </Button>
      </InputGroup>
    </div>
  );
};

export default KiduSearchBar;
