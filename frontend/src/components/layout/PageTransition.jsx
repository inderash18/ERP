import { motion } from "framer-motion";

export default function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, filter: "blur(12px)", scale: 1.02, y: 8 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(12px)", scale: 0.98, y: -8 }}
            transition={{
                duration: 0.38,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="min-h-screen w-full"
        >
            {children}
        </motion.div>
    );
}