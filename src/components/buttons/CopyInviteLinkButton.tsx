"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui";

interface CopyInviteLinkProps {
  playerId: string;
}

export default function CopyInviteLinkButton({ playerId }: CopyInviteLinkProps) {
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  // Set inviteUrl in the browser only
  useEffect(() => {
    if (playerId) {
      setInviteUrl(`${window.location.origin}/sign-up/invite/${playerId}`);
      console.log("CopyInviteLinkButton inviteUrl:", inviteUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId]);

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy invite link:", err);
    }
  };

  if (!inviteUrl) return null; // avoid rendering before client sets URL

  return (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-sm text-gray-600">Share this link with friends:</p>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          value={inviteUrl}
          className="border rounded px-2 py-1 w-80"
        />
        <Button onClick={handleCopy} className="bg-primary">
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
