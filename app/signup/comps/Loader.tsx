import { motion } from "framer-motion";
import { WandSparkles, Loader2 } from "lucide-react";
export default function LoaderCv() {
  return (
    <motion.div
      initial={{ y: 20 }}
      animate={{ y: 0 }}
      className="relative p-12 min-w-[280px] bg-dashboard"
      style={{
        borderRadius: "50px 50px 50px 50px",
        position: "relative",
      }}
    >
      <div className="flex flex-col items-center gap-4 relative z-10">
        {/* Animated lightbulb with glow effect */}
        <div className="relative">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="relative"
          >
            <WandSparkles className="w-16 h-16 text-yellow-500" />

            {/* Glow effect */}
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-yellow-400 rounded-full blur-xl -z-10"
            />
          </motion.div>

          {/* Sparkle effects */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                x: [0, (i - 1) * 30],
                y: [0, -20 - i * 10],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
                ease: "easeOut",
              }}
              className="absolute top-0 left-1/2 w-2 h-2 bg-purple-300 rounded-full"
            />
          ))}
        </div>

        {/* Loading text with typewriter effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <motion.h3
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="text-lg font-semibold mb-2"
          >
            Analyzing your resume
          </motion.h3>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">This may take a few minutes</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
