"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiBell } from "react-icons/fi";
import Link from "next/link";

export default function SupplierNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "supplier") {
      setLoading(true);
      fetch(`/api/notifications?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => { setNotifications(data); setLoading(false); });
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAsRead(notificationId: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications(n => n.map(notif => notif._id === notificationId ? { ...notif, read: true } : notif));
  }

  if (session?.user?.role !== "supplier") return null;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 font-bold text-gray-900 border-b">Notifications</div>
          {loading ? (
            <div className="p-3 text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-3 text-gray-500">No notifications</div>
          ) : (
            notifications.map(n => (
              <Link
                key={n._id}
                href={n.offerId ? `/requests?offer=${n.offerId}` : "/requests"}
                className={`block px-4 py-3 border-b last:border-0 text-sm ${n.read ? "bg-white" : "bg-green-50 font-semibold"}`}
                onClick={() => markAsRead(n._id)}
              >
                <div>{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
} 
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiBell } from "react-icons/fi";
import Link from "next/link";

export default function SupplierNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "supplier") {
      setLoading(true);
      fetch(`/api/notifications?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => { setNotifications(data); setLoading(false); });
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAsRead(notificationId: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications(n => n.map(notif => notif._id === notificationId ? { ...notif, read: true } : notif));
  }

  if (session?.user?.role !== "supplier") return null;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 font-bold text-gray-900 border-b">Notifications</div>
          {loading ? (
            <div className="p-3 text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-3 text-gray-500">No notifications</div>
          ) : (
            notifications.map(n => (
              <Link
                key={n._id}
                href={n.offerId ? `/requests?offer=${n.offerId}` : "/requests"}
                className={`block px-4 py-3 border-b last:border-0 text-sm ${n.read ? "bg-white" : "bg-green-50 font-semibold"}`}
                onClick={() => markAsRead(n._id)}
              >
                <div>{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
} 
 
 
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiBell } from "react-icons/fi";
import Link from "next/link";

export default function SupplierNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "supplier") {
      setLoading(true);
      fetch(`/api/notifications?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => { setNotifications(data); setLoading(false); });
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAsRead(notificationId: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications(n => n.map(notif => notif._id === notificationId ? { ...notif, read: true } : notif));
  }

  if (session?.user?.role !== "supplier") return null;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 font-bold text-gray-900 border-b">Notifications</div>
          {loading ? (
            <div className="p-3 text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-3 text-gray-500">No notifications</div>
          ) : (
            notifications.map(n => (
              <Link
                key={n._id}
                href={n.offerId ? `/requests?offer=${n.offerId}` : "/requests"}
                className={`block px-4 py-3 border-b last:border-0 text-sm ${n.read ? "bg-white" : "bg-green-50 font-semibold"}`}
                onClick={() => markAsRead(n._id)}
              >
                <div>{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
} 
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { FiBell } from "react-icons/fi";
import Link from "next/link";

export default function SupplierNotifications() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "supplier") {
      setLoading(true);
      fetch(`/api/notifications?userId=${session.user.id}`)
        .then(res => res.json())
        .then(data => { setNotifications(data); setLoading(false); });
    }
  }, [session]);

  const unreadCount = notifications.filter(n => !n.read).length;

  async function markAsRead(notificationId: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId }),
    });
    setNotifications(n => n.map(notif => notif._id === notificationId ? { ...notif, read: true } : notif));
  }

  if (session?.user?.role !== "supplier") return null;

  return (
    <div className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
      >
        <FiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-3 font-bold text-gray-900 border-b">Notifications</div>
          {loading ? (
            <div className="p-3 text-gray-500">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-3 text-gray-500">No notifications</div>
          ) : (
            notifications.map(n => (
              <Link
                key={n._id}
                href={n.offerId ? `/requests?offer=${n.offerId}` : "/requests"}
                className={`block px-4 py-3 border-b last:border-0 text-sm ${n.read ? "bg-white" : "bg-green-50 font-semibold"}`}
                onClick={() => markAsRead(n._id)}
              >
                <div>{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
} 
 
 
 