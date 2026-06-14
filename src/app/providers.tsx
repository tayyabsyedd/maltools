'use client';
/**
 * app/providers.tsx
 *
 * Client-side Providers Wrapper
 *
 * NextAuth's SessionProvider must wrap your app so any component
 * can access the session (who is logged in) using useSession().
 */

import { SessionProvider } from 'next-auth/react';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
