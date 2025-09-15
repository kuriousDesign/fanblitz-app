import { motion } from "framer-motion";
export default function PicksIndicator({
  numPicks,
  numSelections,
}: {
  numPicks: number;
  numSelections: number;
}) {
  const percentage = Math.min((numPicks / numSelections) * 100, 100);
  const radius = 30; // larger radius for smoother look
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="fixed bottom-3 right-3">
      <motion.div
        className="relative w-20 h-20"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <svg className="w-full h-full rotate-[-90deg]">
          {/* background track */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            className="text-gray-300 dark:text-gray-700"
            strokeWidth={stroke}
            fill="none"
          />
          {/* animated progress */}
          <motion.circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke={percentage === 100 ? "#22c55e" : "#3b82f6"} // green-500 if full, blue-500 otherwise
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{
              strokeDashoffset:
                circumference - (percentage / 100) * circumference,
            }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </svg>

        {/* center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {numPicks}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 -mt-2">
            picks
          </span>
        </div>

        {/* pulse animation when complete */}
        {percentage === 100 && (
          <motion.div
            className="absolute inset-0 rounded-full bg-green-500/20"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "reverse",
              duration: 1.2,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
