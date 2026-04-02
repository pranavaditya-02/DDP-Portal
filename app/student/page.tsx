"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
    </div>
  );
}
