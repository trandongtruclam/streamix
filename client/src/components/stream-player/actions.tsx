"use client";

import React, { useTransition } from "react";
import { Heart, Bell, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { onFollow, onUnfollow } from "@/actions/follow";
import { Hint } from "@/components/hint";

export function Actions({
  hostIdentity,
  isFollowing,
  isHost,
}: {
  hostIdentity: string;
  isFollowing: boolean;
  isHost: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    startTransition(() => {
      onFollow(hostIdentity)
        .then((data) =>
          toast.success(`You are now following ${data.following.username}.`)
        )
        .catch(() => toast.error("Something went wrong while following."));
    });
  };

  const handleUnfollow = () => {
    startTransition(() => {
      onUnfollow(hostIdentity)
        .then((data) =>
          toast.success(`You have unfollowed ${data.following.username}.`)
        )
        .catch(() => toast.error("Something went wrong while unfollowing."));
    });
  };

  const toggleFollow = () => {
    if (!user) {
      return router.push("/sign-in");
    }

    if (isHost) return;

    if (isFollowing) {
      handleUnfollow();
    } else {
      handleFollow();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        disabled={isPending || isHost}
        onClick={toggleFollow}
        size="sm"
        className={cn(
          "font-semibold transition-all duration-200 gap-x-2",
          isFollowing
            ? "bg-[#3d3d40] hover:bg-[#53535f] text-white border border-transparent hover:border-[#9147ff]"
            : "bg-[#9147ff] hover:bg-[#772ce8] text-white"
        )}
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-all duration-200",
            isFollowing ? "fill-[#eb0400] text-[#eb0400]" : "fill-none"
          )}
        />
        {isFollowing ? "Following" : "Follow"}
      </Button>
      
      {isFollowing && (
        <Hint label="Notifications" asChild>
          <Button
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 text-[#adadb8] hover:text-white hover:bg-[#3d3d40]"
          >
            <Bell className="h-4 w-4" />
          </Button>
        </Hint>
      )}
      
      <Hint label="Share" asChild>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleShare}
          className="h-9 w-9 p-0 text-[#adadb8] hover:text-white hover:bg-[#3d3d40]"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </Hint>
    </div>
  );
}

export function ActionsSkeleton() {
  return (
    <div className="flex items-center gap-x-2">
      <Skeleton className="h-9 w-24 bg-[#35353b]" />
      <Skeleton className="h-9 w-9 bg-[#35353b]" />
    </div>
  );
}
