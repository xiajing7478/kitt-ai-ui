import React from "react";

interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type"
> {
  children: React.ReactNode;
  type?: "primary" | "outline" | "ghost";
  size?: "small" | "default" | "large";
  className?: string;
  htmlType?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  type = "primary",
  size = "default",
  className = "",
  htmlType = "button",
  ...props
}) => {
  const typeClass = {
    primary: "btn-primary",
    outline: "btn-outline",
    ghost: "btn-ghost",
  }[type];

  const sizeClass = {
    small: "btn-small",
    default: "btn-default",
    large: "btn-large",
  }[size];

  return (
    <button
      type={htmlType}
      className={`btn ${typeClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
