import type React from "react";
import { VideoQuality } from "livekit-client";
import { Heart, ThumbsUp, PartyPopper, Flame, Star } from "lucide-react";
import { IngressInput } from "livekit-server-sdk";

// ============================================================================
// Auth & Session Constants
// ============================================================================

export const SESSION_COOKIE_NAME = "streamix_session";
export const SESSION_EXPIRATION_DAYS = 7;
export const SESSION_EXPIRATION_SECONDS =
  60 * 60 * 24 * SESSION_EXPIRATION_DAYS; // 7 days in seconds

// ============================================================================
// Stream Player Constants
// ============================================================================

export const REACTIONS = [
  { id: "heart", emoji: "❤️", icon: Heart, color: "#ff3b5c" },
  { id: "thumbsup", emoji: "👍", icon: ThumbsUp, color: "#3b82f6" },
  { id: "party", emoji: "🎉", icon: PartyPopper, color: "#f59e0b" },
  { id: "fire", emoji: "🔥", icon: Flame, color: "#ef4444" },
  { id: "star", emoji: "⭐", icon: Star, color: "#eab308" },
  { id: "laugh", emoji: "😂", icon: null, color: "#fbbf24" },
  { id: "wow", emoji: "😮", icon: null, color: "#8b5cf6" },
  { id: "clap", emoji: "👏", icon: null, color: "#10b981" },
] as const;

export const QUALITY_OPTIONS = [
  {
    id: "auto",
    label: "Auto",
    description: "Best quality for your connection",
    quality: null,
  },
  {
    id: "high",
    label: "1080p",
    description: "Full HD",
    quality: VideoQuality.HIGH,
  },
  {
    id: "medium",
    label: "720p",
    description: "HD",
    quality: VideoQuality.MEDIUM,
  },
  {
    id: "low",
    label: "480p",
    description: "Standard",
    quality: VideoQuality.LOW,
  },
] as const;

// ============================================================================
// Restream Platform Constants
// ============================================================================

export interface Platform {
  id: "youtube" | "facebook" | "twitch" | "custom";
  name: string;
  icon: React.ElementType;
  color: string;
  rtmpUrl: string;
  streamKeyPlaceholder: string;
  helpUrl: string;
}

export interface PlatformBase {
  id: "youtube" | "facebook" | "twitch" | "custom";
  name: string;
  color: string;
  rtmpUrl: string;
  streamKeyPlaceholder: string;
  helpUrl: string;
}

// Base platform configuration (without icons - components should add icons)
export const PLATFORMS_BASE: PlatformBase[] = [
  {
    id: "youtube",
    name: "YouTube Live",
    color: "#ff0000",
    rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
    streamKeyPlaceholder: "xxxx-xxxx-xxxx-xxxx-xxxx",
    helpUrl: "https://studio.youtube.com/channel/UC/livestreaming",
  },
  {
    id: "facebook",
    name: "Facebook Live",
    color: "#1877f2",
    rtmpUrl: "rtmps://live-api-s.facebook.com:443/rtmp",
    streamKeyPlaceholder: "FB-xxxx-xxxx-xxxx",
    helpUrl: "https://www.facebook.com/live/producer",
  },
  {
    id: "twitch",
    name: "Twitch",
    color: "#9147ff",
    rtmpUrl: "rtmp://live.twitch.tv/live",
    streamKeyPlaceholder: "live_xxxxxxxxxx",
    helpUrl: "https://dashboard.twitch.tv/settings/stream",
  },
] as const;

// ============================================================================
// Ingress Constants
// ============================================================================

export const RTMP = String(IngressInput.RTMP_INPUT);
export const WHIP = String(IngressInput.WHIP_INPUT);

// ============================================================================
// Time Constants (in milliseconds)
// ============================================================================

export const TIME = {
  // Animation durations
  REACTION_ANIMATION_DURATION: 3000, // 3 seconds
  REACTION_BAR_ANIMATION_DURATION: 2500, // 2.5 seconds
  UI_TRANSITION_DURATION: 200, // 200ms
  UI_TRANSITION_DURATION_LONG: 300, // 300ms

  // Intervals
  BITRATE_UPDATE_INTERVAL: 1000, // 1 second
  STATS_UPDATE_INTERVAL: 2000, // 2 seconds
  STREAM_DURATION_UPDATE_INTERVAL: 1000, // 1 second

  // Delays
  CHAT_DELAY_SECONDS: 3, // 3 seconds delay for chat
  CONTROLS_HIDE_DELAY: 3000, // 3 seconds
} as const;

// ============================================================================
// UI Color Constants
// ============================================================================

export const COLORS = {
  // Brand colors
  TWITCH_PURPLE: "#9147ff",
  TWITCH_PURPLE_DARK: "#772ce8",
  TWITCH_PURPLE_LIGHT: "#bf94ff",

  // Background colors
  BG_PRIMARY: "#18181b",
  BG_SECONDARY: "#26262c",
  BG_TERTIARY: "#35353b",
  BG_HOVER: "#3a3a3d",

  // Text colors
  TEXT_PRIMARY: "#ffffff",
  TEXT_SECONDARY: "#adadb8",
  TEXT_MUTED: "#666",

  // Status colors
  RED: "#ef4444",
  RED_DARK: "#ff3b5c",
  GREEN: "#10b981",
  YELLOW: "#f59e0b",
  BLUE: "#3b82f6",

  // Reaction colors
  REACTION_HEART: "#ff3b5c",
  REACTION_THUMBSUP: "#3b82f6",
  REACTION_PARTY: "#f59e0b",
  REACTION_FIRE: "#ef4444",
  REACTION_STAR: "#eab308",
  REACTION_LAUGH: "#fbbf24",
  REACTION_WOW: "#8b5cf6",
  REACTION_CLAP: "#10b981",
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULTS = {
  AVATAR_URL: "/default-avatar.png",
  REACTION_X_MIN: 10,
  REACTION_X_MAX: 90,
  REACTION_BAR_X_MIN: 20,
  REACTION_BAR_X_MAX: 80,
} as const;

// ============================================================================
// Bitrate Formatting Constants
// ============================================================================

export const BITRATE = {
  MBPS_THRESHOLD: 1000000,
  KBPS_THRESHOLD: 1000,
} as const;
