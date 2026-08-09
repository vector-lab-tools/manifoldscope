// SPDX-License-Identifier: GPL-3.0-or-later
"use client";

import { ManifoldProvider } from "@/context/ManifoldContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <ManifoldProvider>{children}</ManifoldProvider>;
}
