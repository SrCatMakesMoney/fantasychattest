"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

interface User {
  id: string;
  username: string;
  displayName: string;
}

interface ConversationUser {
  username: string;
  displayName: string;
  avatar: string;
  realm: string;
}

interface Conversation {
  _id: string;
  user: ConversationUser;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

interface MessageSender {
  _id: string;
  username: string;
  displayName: string;
}

interface ChatMessage {
  _id: string;
  sender: MessageSender;
  receiver: MessageSender;
  content: string;
  createdAt: string;
}

interface SearchUser {
  _id: string;
  username: string;
  displayName: string;
  realm: string;
}

export default function MensajesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(
    searchParams.get("con")
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
    };
    fetchUser();
  }, [router]);

  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/mensajes/conversaciones");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversaciones);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const fetchMessages = useCallback(async () => {
    if (!activeChat) return;
    const res = await fetch(`/api/mensajes?con=${activeChat}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.mensajes);
    }
  }, [activeChat]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId: activeChat, content: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    const res = await fetch(`/api/usuarios?buscar=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data.usuarios);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] pixel-title text-[10px]">
          Abriendo las puertas del castillo...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex max-w-5xl mx-auto w-full">
        {/* Barra lateral de conversaciones */}
        <div className="w-80 border-r-3 border-[var(--color-border-dark)] flex flex-col bg-[var(--color-bg-card)]">
          <div className="p-4 border-b-3 border-[var(--color-border-dark)]">
            <h2 className="pixel-title text-[var(--color-accent-gold)] text-[9px] mb-3">
              💀 Mensajes Oscuros
            </h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar almas..."
              className="input-fantasy text-sm py-2"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 castle-card p-2 max-h-40 overflow-y-auto scrollbar-dark">
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      setActiveChat(u._id);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2 hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {u.displayName}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)] ml-2">
                      @{u.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-dark">
            {conversations.length === 0 ? (
              <p className="text-[var(--color-text-muted)] text-sm p-4 text-center">
                Sin susurros aun. Busca un alma para comenzar.
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setActiveChat(conv._id)}
                  className={`w-full text-left p-4 border-b-2 border-[var(--color-border-dark)] transition-colors ${
                    activeChat === conv._id
                      ? "bg-[var(--color-bg-hover)]"
                      : "hover:bg-[var(--color-bg-secondary)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="pixel-title text-[var(--color-accent-gold)] text-[8px]">
                      {conv.user.displayName}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="bg-[var(--color-accent-purple)] text-white text-xs w-5 h-5 flex items-center justify-center border border-black">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--color-text-muted)] text-xs mt-1 truncate">
                    {conv.lastMessage}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Area de chat */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-dark">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--color-text-muted)]">
                      🏰 Comienza tu conversacion oscura...
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender._id === user.id;
                    return (
                      <div
                        key={msg._id}
                        className={`flex mb-3 ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 ${
                            isOwn
                              ? "bg-[var(--color-accent-purple)] border-2 border-[var(--color-border-glow)]"
                              : "castle-card"
                          }`}
                        >
                          <p className="text-sm text-[var(--color-text-primary)]">
                            {msg.content}
                          </p>
                          <p className="text-[var(--color-text-muted)] text-xs mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <form
                onSubmit={handleSend}
                className="p-4 border-t-3 border-[var(--color-border-dark)] flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Susurra en la oscuridad..."
                  className="input-fantasy flex-1"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-fantasy"
                >
                  {sending ? "..." : "Enviar"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-4">💀</p>
                <p className="text-[var(--color-text-muted)] pixel-title text-[9px]">
                  Selecciona una conversacion
                </p>
                <p className="text-[var(--color-text-muted)] text-sm mt-2">
                  o busca un alma para susurrar
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
