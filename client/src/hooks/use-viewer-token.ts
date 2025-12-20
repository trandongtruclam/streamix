import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";
import { JwtPayload, jwtDecode } from "jwt-decode";

import { createViewerToken } from "@/actions/token";

interface LiveKitJwtPayload extends JwtPayload {
  name?: string;
  video?: {
    room?: string;
    roomJoin?: boolean;
    canPublish?: boolean;
    canPublishData?: boolean;
  };
}

export const useViewerToken = (hostIdentity: string) => {
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [identity, setIdentity] = useState("");
  const tokenRef = useRef<string>("");

  useEffect(() => {
    // Only create token if we don't have one or hostIdentity changed
    if (tokenRef.current) {
      // Check if token is still valid (not expired)
      try {
        const decodedToken = jwtDecode<LiveKitJwtPayload>(tokenRef.current);
        const exp = decodedToken.exp;
        if (exp && exp * 1000 > Date.now() + 60000) {
          // Token is still valid (more than 1 minute left), reuse it
          setToken(tokenRef.current);
          const tokenIdentity = decodedToken.sub;
          const tokenName = decodedToken?.name;
          if (tokenIdentity) setIdentity(tokenIdentity);
          if (tokenName) setName(tokenName);
          return;
        }
      } catch (e) {
        // Token invalid, create new one
      }
    }

    const createToken = async () => {
      try {
        const viewerToken = await createViewerToken(hostIdentity);
        tokenRef.current = viewerToken;
        setToken(viewerToken);

        const decodedToken = jwtDecode<LiveKitJwtPayload>(viewerToken);

        // LiveKit uses 'sub' claim for identity
        const tokenIdentity = decodedToken.sub;
        const tokenName = decodedToken?.name;

        if (tokenIdentity) {
          setIdentity(tokenIdentity);
        }

        if (tokenName) {
          setName(tokenName);
        }
      } catch (error) {
        console.error("error creating token", error);
        toast.error("Something went wrong! Error creating token");
      }
    };

    createToken();
  }, [hostIdentity]);

  return {
    token,
    name,
    identity,
  };
};
