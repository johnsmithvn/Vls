"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FlipCardProps {
  letter: string;
  mnemonic: string;
  imageUrl?: string;
}

export function FlipCard({ letter, mnemonic, imageUrl }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="perspective-[800px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative h-32 w-full sm:h-36"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl
                     border border-border bg-surface shadow-md
                     transition-shadow hover:shadow-lg"
          style={{ backfaceVisibility: "hidden" }}
        >
          <span className="text-4xl font-bold text-primary">{letter}</span>
          <span className="mt-1 text-xs text-muted">Nhấn để lật</span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-xl
                     border border-primary/30 bg-primary-subtle p-3"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`Ký hiệu chữ ${letter}`}
              className="h-16 w-16 object-contain"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl">🤟</span>
            </div>
          )}
          <span className="mt-2 text-center text-xs font-medium text-primary">
            {mnemonic}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
