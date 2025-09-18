"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionDebug() {
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('Session Debug:', {
      status,
      session,
      user: session?.user,
      expires: session?.expires
    });
  }, [session, status]);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">Session Debug</div>
      <div>Status: {status}</div>
      <div>User: {session?.user?.email || 'None'}</div>
      <div>Expires: {session?.expires || 'None'}</div>
    </div>
  );
}
