import React from "react";
import styles from "./ClassicButton.module.css";
interface ClassicButtonProps {
  text1?: string;
  text2?: string;
  disabled?: boolean;
  onClick?: () => void;
  customStyles?: {
    button?: {
      [key: string]: string | number;
    };
    buttonWrapper?: {
      [key: string]: string | number;
    };
    text1?: {
      [key: string]: string | number;
    };
    text2?: {
      [key: string]: string | number;
    };
  };
}
export default function ClassicButton({
  text1,
  text2,
  disabled = false,
  onClick,
  customStyles
}: ClassicButtonProps) {
  return (
    <div
      style={{
        ...customStyles?.button,
      }}
      className={`${disabled && "cursor-not-allowed"} ${styles.button}`} onClick={() => { if (!disabled && onClick) onClick(); }}>
      <div className={styles.buttonWrapper}>
        <p
          style={{
            ...customStyles?.text1
          }}
          className={`${styles.text1} text-nowrap`}>{text1}</p>
        <p
          style={{
            ...customStyles?.text2
          }}
          className={`${styles.text2} text-nowrap`}>{text2 ?? text1}</p>
      </div>
    </div>
  );
}
