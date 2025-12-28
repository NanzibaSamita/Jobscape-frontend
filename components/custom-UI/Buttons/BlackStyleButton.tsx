"use client";
import React from "react";
import styles from "./BlackStyleButton.module.css";

interface BlackStyleButtonProps {
  title?: string | React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
  className?: string; // optional extra classes if you want
  style?: React.CSSProperties; // optional inline override
}

export default function BlackStyleButton({
  title,
  disabled = false,
  onClick,
  fullWidth = false,
  className = "",
  style,
}: BlackStyleButtonProps) {
  return (
    <div
      className={`flex justify-center items-center ${
        fullWidth ? "w-full" : "w-auto"
      }`}
    >
      <button
        disabled={disabled}
        onClick={onClick}
        className={`${styles.buttonWrapper} ${
          fullWidth ? "w-full" : ""
        } ${className}`}
        style={style}
      >
        {title}
      </button>
    </div>
  );
}
