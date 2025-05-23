// FloatingTextarea.js
import React, { useState } from "react";
import '../../styles/register_module_css/FloatingInput.css';

const FloatingTextarea = ({
  label,
  name,
  value,
  onChange,
  error,
  required,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`floating-input-container ${error ? "has-error" : ""}`}>
      <textarea
        className="floating-input"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        required={required}
        rows={3}
        {...rest}
      />
      <label
        htmlFor={name}
        className={`floating-label${isFocused || value ? " floated" : ""}`}
      >
        {label}
      </label>
      <div className="error-message">{error || "\u00A0"}</div>
    </div>
  );
};

export default FloatingTextarea;
