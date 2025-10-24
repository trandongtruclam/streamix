import { AccessToken } from "livekit-server-sdk";

export async function createLivekitToken(identity: string, roomName: string) {
  const apiKey = process.env.LIVEKIT_API_KEY || "devkey";
  const apiSecret = process.env.LIVEKIT_API_SECRET || "secret";

  console.log("🔑 Using API Key:", apiKey);
  console.log("🔒 Using API Secret:", apiSecret);

  try {
    const at = new AccessToken(apiKey, apiSecret, { identity });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const jwt = await at.toJwt(); // <-- cần await
    console.log("🎟️ Generated token:", jwt);

    return jwt;
  } catch (err) {
    console.error("❌ Token generation failed:", err);
    return null;
  }
}
