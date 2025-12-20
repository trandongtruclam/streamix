"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  useDataChannel,
  useConnectionState,
  useRoomContext,
} from "@livekit/components-react";
import type { ReceivedDataMessage } from "@livekit/components-core";
import { ConnectionState } from "livekit-client";
import { motion, AnimatePresence } from "motion/react";
import { REACTIONS, TIME, DEFAULTS } from "@/lib/constants";

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
  const connectionState = useConnectionState();
  const room = useRoomContext();

  const addFlyingReaction = useCallback((emoji: string) => {
    const newReaction: FlyingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x:
        Math.random() * (100 - DEFAULTS.REACTION_X_MIN * 2) +
        DEFAULTS.REACTION_X_MIN, // Random position
      startY: 100,
    };

    setFlyingReactions((prev) => [...prev, newReaction]);

    // Remove reaction after animation completes
    setTimeout(() => {
      setFlyingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, TIME.REACTION_ANIMATION_DURATION);
  }, []);

  // Handle incoming reactions from other viewers
  const onMessage = useCallback(
    (msg: ReceivedDataMessage) => {
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

  // Debug: Log data channel status
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      console.log(
        "LiveReactions: Room connected, send function available:",
        !!send
      );
    }
  }, [connectionState, send]);

  const handleReaction = (emoji: string) => {
    // Show locally immediately
    addFlyingReaction(emoji);

    // Send to other viewers via DataChannel if connected
    if (send && connectionState === ConnectionState.Connected && room) {
      try {
        const message = JSON.stringify({ type: "reaction", emoji });
        const encoded = encoder.encode(message);
        send(encoded, { reliable: true });
        console.log("LiveReactions: Sent reaction", emoji);
      } catch (e) {
        console.error("Failed to send reaction", e);
      }
    } else {
      console.warn(
        "LiveReactions: Cannot send reaction - send:",
        !!send,
        "state:",
        connectionState,
        "room:",
        !!room
      );
    }
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
                duration: TIME.REACTION_ANIMATION_DURATION / 1000,
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
  const connectionState = useConnectionState();
  const room = useRoomContext();

  const addFlyingReaction = useCallback((emoji: string) => {
    const newReaction: FlyingReaction = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      x:
        Math.random() *
          (DEFAULTS.REACTION_BAR_X_MAX - DEFAULTS.REACTION_BAR_X_MIN) +
        DEFAULTS.REACTION_BAR_X_MIN,
      startY: 100,
    };

    setFlyingReactions((prev) => [...prev, newReaction]);

    setTimeout(() => {
      setFlyingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);
  }, []);

  const onMessage = useCallback(
    (msg: ReceivedDataMessage) => {
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

  // Debug: Log data channel status
  useEffect(() => {
    if (connectionState === ConnectionState.Connected) {
      console.log(
        "ReactionBar: Room connected, send function available:",
        !!send
      );
    }
  }, [connectionState, send]);

  const handleReaction = (emoji: string) => {
    // Show locally immediately
    addFlyingReaction(emoji);

    // Send to other viewers via DataChannel if connected
    if (send && connectionState === ConnectionState.Connected && room) {
      try {
        const message = JSON.stringify({ type: "reaction", emoji });
        const encoded = encoder.encode(message);
        send(encoded, { reliable: true });
        console.log("ReactionBar: Sent reaction", emoji);
      } catch (e) {
        console.error("Failed to send reaction", e);
      }
    } else {
      console.warn(
        "ReactionBar: Cannot send reaction - send:",
        !!send,
        "state:",
        connectionState,
        "room:",
        !!room
      );
    }
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
              transition={{
                duration: TIME.REACTION_BAR_ANIMATION_DURATION / 1000,
                ease: "easeOut",
              }}
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
