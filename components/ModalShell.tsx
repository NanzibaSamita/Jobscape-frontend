import { ReactNode } from "react";

const ModalShell = (props: { children: ReactNode; closeModal: (key: string) => void; keyIs: string }) => {
    const { children } = props;

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99] h-screen w-screen"
        >
            <div
                className="scrollbar-hide shadow-2xl fixed z-[100] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[47.5%] rounded-[2rem] overflow-x-auto max-h-[85vh] pointer-events-auto"
            >
                {children}
            </div>
        </div>
    );
};

export default ModalShell;
