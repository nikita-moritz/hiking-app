"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export default function FaviconSwitcher() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    const dark = resolvedTheme === "dark";
    const file = dark ? "/favicon-dark.png" : "/favicon-light.png";

    // Remove all existing favicons
    document.querySelectorAll("link[rel~='icon']").forEach(el => el.remove());

    // Add fresh one with cache-busting timestamp
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.href = `${file}?t=${Date.now()}`;
    document.head.appendChild(link);
  }, [resolvedTheme]);

  return null;
}
