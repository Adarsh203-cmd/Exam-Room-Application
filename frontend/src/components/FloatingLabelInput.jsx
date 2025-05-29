import React, { useState } from 'react';
import './FloatingLabelInput.css';

const FloatingLabelInput = ({ 
  label, 
  type = "text", 
  value, 
  onChange, 
  placeholder = "",
  required = false,
  ...props 
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="floating-label-container">
      <input
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`floating-input ${value || focused ? 'has-value' : ''}`}
        placeholder={focused ? placeholder : ''}
        required={required}
        {...props}
      />
      <label className="floating-label">{label}</label>
    </div>
  );
};

export default FloatingLabelInput;