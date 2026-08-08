"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { store } from "@/lib/store";
import { ChatMessage } from "@/lib/types";

export default function ChatAdmin() {
  const [sessions, setSessions] = useState<ReturnType<typeof store.getChatSessions>>([]);
  const [active, setActive] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState("");

  const load = () => {
    setSessions(store.getChatSessions());
    if (active) {
      setMessages(store.getChatMessages().filter((m) => m.sessionId === active));
      store.markChatRead(active);
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("tesla_admin_auth") !== "true") {
      window.location.href = "/admin";
      return;
    }
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [active]);

  const openSession = (id: string) => {
    setActive(id);
    store.markChatRead(id);
    setMessages(store.getChatMessages().filter((m) => m.sessionId === id));
  };

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !reply.trim()) return;
    const sess = sessions.find((s) => s.sessionId === active);
    store.addChatMessage({
      sessionId: active,
      name: "Support",
      email: sess?.email || "support",
      message: reply.trim(),
      from: "support",
    });
    setReply("");
    load();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <header className="border-b border-[#26262A] px-6 py-4 flex items-center gap-4 sticky top-0 bg-black/90 backdrop-blur z-20">
        <Link href="/admin" className="text-[#6E6E73] hover:text-white">← Dashboard</Link>
        <h1 className="font-bold text-lg">Live Chat Support</h1>
      </header>

      <div className="flex-1 flex max-w-6xl w-full mx-auto">
        <aside className="w-72 border-r border-[#26262A] overflow-y-auto">
          {sessions.length === 0 && <p className="p-4 text-sm text-[#6E6E73]">No chats yet.</p>}
          {sessions.map((s) => (
            <button
              key={s.sessionId}
              onClick={() => openSession(s.sessionId)}
              className={`w-full text-left px-4 py-3 border-b border-[#26262A] hover:bg-[#121214] ${active === s.sessionId ? "bg-[#121214]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{s.name}</span>
                {s.unread > 0 && <span className="bg-[#E82127] text-white text-xs px-1.5 py-0.5 rounded-full">{s.unread}</span>}
              </div>
              <div className="text-xs text-[#6E6E73] truncate mt-0.5">{s.lastMessage}</div>
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col">
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-[#6E6E73] text-sm">Select a conversation</div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {messages.filter((m) => m.message !== "Chat started").map((m) => (
                  <div key={m.id} className={`max-w-[75%] text-sm px-3 py-2 rounded-xl ${m.from === "support" ? "ml-auto bg-[#E82127]" : "bg-[#26262A]"}`}>
                    <div className="text-[10px] opacity-70 mb-0.5">{m.from === "support" ? "You" : m.name}</div>
                    {m.message}
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="p-4 border-t border-[#26262A] flex gap-2">
                <input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply as support..." className="flex-1 bg-[#121214] border border-[#26262A] rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#E82127]" />
                <button type="submit" className="bg-[#E82127] text-white px-5 rounded-xl font-semibold">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
