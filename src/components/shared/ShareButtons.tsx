"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
}

export function ShareButtons({ title }: ShareButtonsProps) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Only access window on the client side
    setShareUrl(window.location.href);
  }, []);

  const handleFacebookShare = () => {
    if (!shareUrl) return;
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(fbUrl, "_blank", "noopener,noreferrer");
  };

  const handleWhatsAppShare = () => {
    if (!shareUrl) return;
    const text = `${title} ${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      text
    )}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleFacebookShare}
        className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        <span>Share to Facebook</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleWhatsAppShare}
        className="flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Share to WhatsApp</span>
      </Button>
    </div>
  );
}
