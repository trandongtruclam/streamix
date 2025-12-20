"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useDataChannel, ReceivedMessage } from "@livekit/components-react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, ThumbsUp, PartyPopper, Flame, Star } from "lucide-react";

const REACTIONS = [
  { id: "heart", emoji: "❤️", icon: Heart, color: "#ff3b5c" },
  { id: "thumbsup", emoji: "👍", icon: ThumbsUp, color: "#3b82f6" },
  { id: "party", emoji: "🎉", icon: PartyPopper, color: "#f59e0b" },
  { id: "fire", emoji: "🔥", icon: Flame, color: "#ef4444" },
  { id: "star", emoji: "⭐", icon: Star, color: "#eab308" },
  { id: "laugh", emoji: "😂", icon: null, color: "#fbbf24" },
  { id: "wow", emoji: "😮", icon: null, color: "#8b5cf6" },
  { id: "clap", emoji: "👏", icon: null, color: "#10b981" },
];

interface FlyingReaction {
  id: string;
  emoji: string;
  x: number;
  startY: number;
}

interface LiveReactionsProps {
  isOverlay?: boolean;
}

// Encoder/Decoder for DataChannel messages
const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function LiveReactions({ isOverlay = false }: LiveReactionsProps) {
  const [flyingReactions, setFlyingReactions] = useState<FlyingReaction[]>([]);

  const addFlyingReaction = useCallback((emoji: string) => {
    const newReaction: FlyingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: Math.random() * 80 + 10, // Random position 10-90%
      startY: 100,
    };

    setFlyingReactions((prev) => [...prev, newReaction]);

    // Remove reaction after animation completes
    setTimeout(() => {
      setFlyingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);
  }, []);

  // Handle incoming reactions from other viewers
  const onMessage = useCallback(
    (msg: ReceivedMessage<"reactions">) => {
      try {
        const message = JSON.parse(decoder.decode(msg.payload));
        if (message.type === "reaction") {
          addFlyingReaction(message.emoji);
        }
      } catch (e) {
        console.error("Failed to parse reaction message", e);
      }
    },
    [addFlyingReaction]
  );

  const { send } = useDataChannel("reactions", onMessage);

  const handleReaction = (emoji: string) => {
    // Send to other viewers via DataChannel
    if (send) {
      const message = JSON.stringify({ type: "reaction", emoji });
      send(encoder.encode(message), { reliable: true });
    }

    // Show locally immediately
    addFlyingReaction(emoji);
  };

  if (isOverlay) {
    // Overlay mode - only shows flying emojis
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
        <AnimatePresence>
          {flyingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{
                opacity: 1,
                y: "100vh",
                x: `${reaction.x}%`,
                scale: 0.5,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: "-20vh",
                scale: [0.5, 1.2, 1],
                rotate: [0, -10, 10, -5, 5, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 3,
                ease: "easeOut",
              }}
              className="absolute text-4xl drop-shadow-lg"
              style={{ left: `${reaction.x}%` }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // Reaction buttons panel
  return (
    <div className="flex items-center gap-1 p-2 bg-black/60 backdrop-blur-sm rounded-full">
      {REACTIONS.map((reaction) => (
        <motion.button
          key={reaction.id}
          onClick={() => handleReaction(reaction.emoji)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-white/20 transition-colors"
          title={reaction.emoji}
        >
          <span className="text-xl">{reaction.emoji}</span>
        </motion.button>
      ))}
    </div>
  );
}

// Compact reaction bar for mobile/small screens
export function ReactionBar() {
  const [showAll, setShowAll] = useState(false);
  const [flyingReactions, setFlyingReactions] = useState<FlyingReaction[]>([]);

  const addFlyingReaction = useCallback((emoji: string) => {
    const newReaction: FlyingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: Math.random() * 60 + 20,
      startY: 100,
    };

    setFlyingReactions((prev) => [...prev, newReaction]);

    setTimeout(() => {
      setFlyingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);
  }, []);

  const onMessage = useCallback(
    (msg: ReceivedMessage<"reactions">) => {
      try {
        const message = JSON.parse(decoder.decode(msg.payload));
        if (message.type === "reaction") {
          addFlyingReaction(message.emoji);
        }
      } catch (e) {
        console.error("Failed to parse reaction message", e);
      }
    },
    [addFlyingReaction]
  );

  const { send } = useDataChannel("reactions", onMessage);

  const addFlyingReaction = (emoji: string) => {
    const newReaction: FlyingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x: Math.random() * 60 + 20,
      startY: 100,
    };

    setFlyingReactions((prev) => [...prev, newReaction]);

    setTimeout(() => {
      setFlyingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);
  };

  const handleReaction = (emoji: string) => {
    if (send) {
      const message = JSON.stringify({ type: "reaction", emoji });
      send(encoder.encode(message), { reliable: true });
    }
    addFlyingReaction(emoji);
  };

  const quickReactions = REACTIONS.slice(0, 4);
  const moreReactions = REACTIONS.slice(4);

  return (
    <div className="relative">
      {/* Flying reactions overlay */}
      <div className="fixed bottom-20 left-0 right-0 pointer-events-none overflow-hidden h-[50vh] z-50">
        <AnimatePresence>
          {flyingReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{
                opacity: 1,
                y: 0,
                scale: 0.5,
              }}
              animate={{
                opacity: [1, 1, 0],
                y: -300,
                scale: [0.5, 1.5, 1],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: "easeOut" }}
              className="absolute text-3xl"
              style={{ left: `${reaction.x}%` }}
            >
              {reaction.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction buttons */}
      <div className="flex items-center gap-1">
        {quickReactions.map((reaction) => (
          <motion.button
            key={reaction.id}
            onClick={() => handleReaction(reaction.emoji)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.85 }}
            className="p-1.5 rounded-full hover:bg-[#3a3a3d] transition-colors"
          >
            <span className="text-lg">{reaction.emoji}</span>
          </motion.button>
        ))}

        <div className="relative">
          <motion.button
            onClick={() => setShowAll(!showAll)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-1.5 rounded-full hover:bg-[#3a3a3d] transition-colors text-[#adadb8]"
          >
            <span className="text-sm">+{moreReactions.length}</span>
          </motion.button>

          {/* More reactions popup */}
          <AnimatePresence>
            {showAll && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                className="absolute bottom-full right-0 mb-2 p-2 bg-[#1f1f23] border border-[#3a3a3d] rounded-lg shadow-xl flex gap-1"
              >
                {moreReactions.map((reaction) => (
                  <motion.button
                    key={reaction.id}
                    onClick={() => {
                      handleReaction(reaction.emoji);
                      setShowAll(false);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 rounded-full hover:bg-[#3a3a3d] transition-colors"
                  >
                    <span className="text-lg">{reaction.emoji}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

