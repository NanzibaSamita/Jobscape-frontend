import React from "react";
import styles from "./BlackHoverStyleCard.module.css";
// interface WhiteStyleButtonProps {
//   title: string;
//   disabled?: boolean;
//   onClick?: () => void;
// }

export default function BlackHoverStyleCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full my-10 mx-auto">
      {/* <div className="bg-black h-full w-full relative group overflow-hidden rounded-2xl shadow-md">
    
        <div
          className="absolute w-[250%] h-[250%] bg-[#ffc31b] rounded-t-[120px]
        top-[135%] left-[115%] -translate-x-1/2 rotate-[45deg] 
        transition-all duration-700 ease-in-out group-hover:top-[-50%] z-0"
        ></div>

        <div className="relative">{children}</div>
      </div> */}
      <div className={`${styles.cardWrapper} h-full`}>
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
