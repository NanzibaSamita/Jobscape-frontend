"use client";
import React from "react";
import styles from "./StarButton.module.css";
export default function StarButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <div className="max-w-min">
      <div className={`${styles.buttonWrapper}`}>
        <button onClick={(e) => { e.preventDefault(); if (onClick) onClick(e) }} className={`${styles.button} `}>{children}</button>
      </div>
    </div>
  );
}
// This component is a simple button with a star icon, styled using CSS modules.