import { toast } from "sonner";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    const createToken = async () => {
      try {
        const viewerToken = await createViewerToken(hostIdentity);
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
