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

export default function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(
    searchParams.get("with")
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
    const res = await fetch("/api/messages/conversations");
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations);
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
    const res = await fetch(`/api/messages?with=${activeChat}`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
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
      const res = await fetch("/api/messages", {
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
    const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setSearchResults(data.users);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--color-text-muted)] font-[family-name:var(--font-family-gothic)]">
          Opening the castle gates...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex max-w-5xl mx-auto w-full">
        {/* Conversations sidebar */}
        <div className="w-80 border-r border-[var(--color-border-dark)] flex flex-col">
          <div className="p-4 border-b border-[var(--color-border-dark)]">
            <h2 className="font-[family-name:var(--font-family-gothic)] text-sm font-bold text-[var(--color-accent-gold)] mb-2">
              💀 Dark Messages
            </h2>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search souls..."
              className="input-fantasy text-sm py-2"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 castle-card rounded p-2 max-h-40 overflow-y-auto scrollbar-dark">
                {searchResults.map((u) => (
                  <button
                    key={u._id}
                    onClick={() => {
                      setActiveChat(u._id);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="w-full text-left p-2 rounded hover:bg-[var(--color-bg-hover)] transition-colors"
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
                No whispers yet. Search for a soul to begin.
              </p>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv._id}
                  onClick={() => setActiveChat(conv._id)}
                  className={`w-full text-left p-4 border-b border-[var(--color-border-dark)] transition-colors ${
                    activeChat === conv._id
                      ? "bg-[var(--color-bg-hover)]"
                      : "hover:bg-[var(--color-bg-secondary)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-[family-name:var(--font-family-gothic)] text-sm text-[var(--color-accent-gold)]">
                      {conv.user.displayName}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="bg-[var(--color-accent-purple)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
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

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-dark">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[var(--color-text-muted)]">
                      🏰 Begin your dark conversation...
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
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isOwn
                              ? "bg-[var(--color-accent-purple)] bg-opacity-30 border border-[var(--color-accent-purple)]"
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
                className="p-4 border-t border-[var(--color-border-dark)] flex gap-2"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Whisper into the darkness..."
                  className="input-fantasy flex-1"
                  maxLength={1000}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="btn-fantasy"
                >
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-4">💀</p>
                <p className="text-[var(--color-text-muted)] font-[family-name:var(--font-family-gothic)]">
                  Select a soul to begin whispering
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
