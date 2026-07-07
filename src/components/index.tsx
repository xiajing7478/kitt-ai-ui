import React from "react";
import { Button } from "./Button";
import "./index.module.less";

export { Button };

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`card ${className}`}>{children}</div>
);

export const Input: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "email" | "password";
  className?: string;
}> = ({ value, onChange, placeholder, type = "text", className = "" }) => (
  <input
    className={`input ${className}`}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);

export const Textarea: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  className?: string;
}> = ({ value, onChange, placeholder, className = "" }) => (
  <textarea
    className={`textarea ${className}`}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);
