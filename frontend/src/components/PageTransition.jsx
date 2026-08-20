import { motion } from "framer-motion";

export default function PageTransition({ children }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -10 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen w-full"
        >
            {children}
        </motion.div>
    );
}