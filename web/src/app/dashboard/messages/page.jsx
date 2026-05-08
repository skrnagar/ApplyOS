"use client";
import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card, { CardHeader, CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { motion } from "motion/react";
import { Send, Paperclip, Smile, MoreVertical } from "lucide-react";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else if (response.status === 401 && typeof window !== "undefined") {
        window.location.href = "/account/signin";
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-neutral-900">Messages</h1>
          <p className="text-neutral-600 mt-1">
            Chat with your dedicated assistant
          </p>
        </div>

        {/* Messages Container */}
        <Card className="flex-1 flex flex-col">
          {/* Assistant Info */}
          <CardHeader className="border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-green-500 rounded-full" />
                <div>
                  <h3 className="font-semibold text-neutral-900">Sarah Chen</h3>
                  <p className="text-sm text-green-600">● Active now</p>
                </div>
              </div>
              <button className="p-2 hover:bg-neutral-100 rounded-lg">
                <MoreVertical size={20} />
              </button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div>
                  <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-neutral-400" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-neutral-600">
                    Start a conversation with your assistant
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => {
                  const isUser = message.sender_type === "user";
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[70%] ${isUser ? "flex-row-reverse" : ""}`}
                      >
                        {!isUser && (
                          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-green-500 rounded-full flex-shrink-0" />
                        )}
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              isUser
                                ? "bg-blue-600 text-white"
                                : "bg-neutral-100 text-neutral-900"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>
                          <p className="text-xs text-neutral-500 mt-1 px-2">
                            {new Date(message.created_at).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>

          {/* Input */}
          <div className="border-t border-neutral-200 p-4">
            <div className="flex items-end gap-3">
              <button className="p-3 hover:bg-neutral-100 rounded-lg text-neutral-600">
                <Paperclip size={20} />
              </button>
              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                />
              </div>
              <button className="p-3 hover:bg-neutral-100 rounded-lg text-neutral-600">
                <Smile size={20} />
              </button>
              <Button
                onClick={handleSend}
                disabled={!newMessage.trim() || sending}
                loading={sending}
              >
                <Send size={20} />
                Send
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-2 px-4">
              Press Enter to send, Shift + Enter for new line
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
