import React from "react";
import styles from "./WhiteHoverStyleCard.module.css";

export default function WhiteHoverStyleCard({ children, groupClass }: { children: React.ReactNode, groupClass?: string }) {
  return (
    <div className={`w-full h-full mx-auto ${groupClass ? groupClass : ""}`}>
      <div className={`${styles.cardWrapper} h-full`}>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
