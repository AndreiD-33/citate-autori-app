import { useState } from "react";

export function useFormValidation(rules) {
  const [errors, setErrors] = useState({});

  function validate(data) {
    const newErrors = {};
    for (const field in rules) {
      const value = (data[field] || "").trim();
      const rule = rules[field];

      if (rule.required && !value) {
        newErrors[field] = rule.requiredMsg || `Câmpul este obligatoriu.`;
        continue;
      }
      if (rule.minLength && value.length < rule.minLength) {
        newErrors[field] =
          rule.minLengthMsg || `Minim ${rule.minLength} caractere.`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        newErrors[field] =
          rule.maxLengthMsg || `Maxim ${rule.maxLength} caractere.`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function clearErrors() {
    setErrors({});
  }

  return { errors, validate, clearErrors };
}
