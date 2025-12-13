"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function BetaMessage() {

    return (
        <AnimatePresence>

            <motion.div
                key="beta-message"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: "auto", opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="fixed top-24 right-4 bg-yellow-100 text-yellow-900 px-4 py-1 rounded-lg shadow-lg z-50 overflow-hidden md:whitespace-nowrap flex items-center"
            >
                Beta
            </motion.div>

        </AnimatePresence>
    );
}
