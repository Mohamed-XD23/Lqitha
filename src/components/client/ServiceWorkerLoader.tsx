"use client";

import { useEffect } from "react";
import { preRegisterSW } from "@/lib/sw";

export default function ServiceWorkerLoader() {
  useEffect(() => {
    preRegisterSW();
  }, []);

  return null;
}
