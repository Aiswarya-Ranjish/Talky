/* eslint-disable react-refresh/only-export-components */
import React from "react";

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  label?: string;
}

export interface ValidationRule {
  type?: "text" | "number" | "email" | "url" | "textarea" | "popup" | "password" | "select" | "dropLocations" | "image" | "date" | "radio";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  label?: string;
}

export const KiduValidation = {
  validate(value: unknown, rules: ValidationRule): ValidationResult {
    const rawLabel = rules.label || "This field";
    const label = rules.required ? `${rawLabel} <span style="color:#EF4444;">*</span>` : rawLabel;
    const val = value;

    if (rules.type === "dropLocations") {
      const arr = Array.isArray(val) ? val : [];
      if (rules.required && arr.filter(v => v.trim() !== "").length === 0)
        return { isValid: false, message: `${rawLabel} is required.`, label };
      if (rules.minLength && arr.length < rules.minLength)
        return { isValid: false, message: `${rawLabel} must have at least ${rules.minLength} locations.`, label };
      if (rules.maxLength && arr.length > rules.maxLength)
        return { isValid: false, message: `${rawLabel} can have at most ${rules.maxLength} locations.`, label };
      return { isValid: true, label };
    }

    if (rules.type === "image") {
      const file = val as File | null;
      if (rules.required && !file)
        return { isValid: false, message: `${rawLabel} is required.`, label };
      if (file) {
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowed.includes(file.type))
          return { isValid: false, message: `${rawLabel} must be a valid image (JPG, PNG, WEBP).`, label };
        const max = 5;
        if (file.size > max * 1024 * 1024)
          return { isValid: false, message: `${rawLabel} must be less than ${max}MB.`, label };
      }
      return { isValid: true, label };
    }

    if (rules.type === "select") {
      if (rules.required && (!val || String(val).trim() === ""))
        return { isValid: false, message: `${rawLabel} is required.`, label };
    }

    /* ⭐ NEW RADIO BUTTON VALIDATION */
    if (rules.type === "radio") {
      if (rules.required && (!val || String(val).trim() === ""))
        return { isValid: false, message: `${rawLabel} is required.`, label };
      return { isValid: true, label };
    }

    if (rules.type === "date") {
      const str = String(val ?? "").trim();
      if (rules.required && !str)
        return { isValid: false, message: `${rawLabel} is required.`, label };
      if (str) {
        const d = new Date(str);
        if (isNaN(d.getTime()))
          return { isValid: false, message: `${rawLabel} must be a valid date.`, label };
      }
      return { isValid: true, label };
    }

    const strVal = String(val ?? "").trim();

    if (rules.required && !strVal)
      return { isValid: false, message: `${rawLabel} is required.`, label };

    if (rules.type === "number" && strVal && isNaN(Number(strVal)))
      return { isValid: false, message: `${rawLabel} must be a number.`, label };

    // IMPROVED EMAIL VALIDATION - Requires proper domain with TLD
    if (rules.type === "email" && strVal) {
      // Standard email format that requires at least one dot in the domain
      // Ensures the TLD (like .com) is at least 2 characters
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
      if (!emailRegex.test(strVal)) {
        return { 
          isValid: false, 
          message: `Please enter a valid email address (e.g., name@example.com).`, 
          label 
        };
      }
      
      // Additional validation to ensure proper domain structure
      const parts = strVal.split('@');
      if (parts.length === 2) {
        const domain = parts[1];
        const domainParts = domain.split('.');
        
        // Ensure there's a TLD and it's at least 2 characters
        if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
          return { 
            isValid: false, 
            message: `Please enter a complete email address with a valid domain.`, 
            label 
          };
        }
      }
    }

    if (rules.type === "url" && strVal && !/^(https?:\/\/)?([\w\d-]+\.)+\w{2,}(\/.*)?$/.test(strVal))
      return { isValid: false, message: `Please enter a valid website URL.`, label };

    if (rules.type === "password" && strVal) {
      if (strVal.length < 8)
        return { isValid: false, message: `${rawLabel} must be at least 8 characters.`, label };
      if (!/[A-Z]/.test(strVal))
        return { isValid: false, message: `${rawLabel} must contain an uppercase letter.`, label };
      if (!/[a-z]/.test(strVal))
        return { isValid: false, message: `${rawLabel} must contain a lowercase letter.`, label };
      if (!/[0-9]/.test(strVal))
        return { isValid: false, message: `${rawLabel} must contain a number.`, label };
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(strVal))
        return { isValid: false, message: `${rawLabel} must contain a special character.`, label };
    }

    if (rules.minLength && strVal.length < rules.minLength)
      return { isValid: false, message: `${rawLabel} must be at least ${rules.minLength} characters.`, label };

    if (rules.maxLength && strVal.length > rules.maxLength)
      return { isValid: false, message: `${rawLabel} must be less than ${rules.maxLength} characters.`, label };

    if (rules.pattern && strVal && !rules.pattern.test(strVal))
      return { isValid: false, message: `Invalid ${rawLabel.toLowerCase()}.`, label };

    return { isValid: true, label };
  }
};

export const ValidationMessage: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div style={{ fontSize: "0.8rem", color: "#EF4444", marginTop: "4px", fontFamily: "Urbanist" }}>
      {message}
    </div>
  );
};

export default KiduValidation;