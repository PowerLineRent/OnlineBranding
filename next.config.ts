import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    // Centralized asset URL settings used by the email signature icon resolver.
    // New references should target public/EmailSignature; legacy path is retained for fallback.
    NEXT_PUBLIC_PLREI_ICON_REPO_BASE:
      process.env.PLREI_ICON_REPO_BASE ??
      'https://raw.githubusercontent.com/PowerLineRent/OnlineBranding/refs/heads/main',
    NEXT_PUBLIC_PLREI_ICON_NEW_DIR: process.env.PLREI_ICON_NEW_DIR ?? 'public/EmailSignature',
    NEXT_PUBLIC_PLREI_ICON_OLD_DIR: process.env.PLREI_ICON_OLD_DIR ?? 'EmailSignature',
  },
};

export default nextConfig;
