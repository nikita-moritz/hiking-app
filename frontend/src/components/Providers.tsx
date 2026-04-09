"use client";

import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n";
import FaviconSwitcher from "@/components/FaviconSwitcher";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LanguageProvider>
        <FaviconSwitcher />
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
