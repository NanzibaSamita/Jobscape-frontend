import React from "react";
import styles from "./WhiteBlackStyleButton.module.css";

interface WhiteStyleButtonProps {
  title?: string | React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  fullWidth?: boolean;
  customStyles?: {
    buttonWrapper?: React.CSSProperties;
    text1?: React.CSSProperties;
    text2?: React.CSSProperties;
    button?: React.CSSProperties;
  };
}

export default function WhiteBlackStyleButton({
  title,
  disabled = false,
  onClick,
  customStyles = {},
  fullWidth = false,
}: WhiteStyleButtonProps) {
  return (
    <div className={`w-auto flex justify-center relative items-center ${fullWidth ? "w-full" : "max-w-min"}`}>
      <button
        disabled={disabled}
        onClick={onClick}
        className={styles.buttonWrapper}
        style={{
          ...customStyles?.button,
          ...fullWidth && { width: "100%" }
        }
        }
      >
        <div
          style={{
            ...customStyles?.buttonWrapper
          }}
          className={styles.innerContent}>
          <p
            style={{
              ...customStyles?.text1
            }}
            className={styles.text1}>{title}</p>
          <p
            style={{
              ...customStyles?.text2
            }}
            className={styles.text2}>{title}</p>
        </div>
      </button>
    </div>
  );
}