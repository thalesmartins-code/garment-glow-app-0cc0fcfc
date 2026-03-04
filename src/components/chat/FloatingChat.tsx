import { useState } from "react";
import { MessageCircle, X, Send, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "support";
  timestamp: Date;
  read: boolean;
}

interface Ticket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved";
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const mockTickets: Ticket[] = [
  {
    id: "1",
    subject: "Problema com pagamento",
    status: "in_progress",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000),
    messages: [
      {
        id: "1",
        content: "Olá, estou tendo problemas para finalizar um pagamento via PIX.",
        sender: "user",
        timestamp: new Date(Date.now() - 86400000),
        read: true,
      },
      {
        id: "2",
        content: "Olá! Vou verificar isso para você. Pode me informar o número do pedido?",
        sender: "support",
        timestamp: new Date(Date.now() - 82800000),
        read: true,
      },
      {
        id: "3",
        content: "O pedido é #12345",
        sender: "user",
        timestamp: new Date(Date.now() - 79200000),
        read: true,
      },
    ],
  },
];

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [view, setView] = useState<"tickets" | "chat" | "new">("tickets");
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const unreadCount = tickets.reduce(
    (acc, ticket) =>
      acc + ticket.messages.filter((m) => !m.read && m.sender === "support").length,
    0
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
      read: true,
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, messages: [...t.messages, message], updatedAt: new Date() }
          : t
      )
    );

    setSelectedTicket((prev) =>
      prev ? { ...prev, messages: [...prev.messages, message] } : null
    );

    setNewMessage("");

    // Simular resposta do suporte
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Obrigado pela mensagem! Nossa equipe está analisando e retornará em breve.",
        sender: "support",
        timestamp: new Date(),
        read: false,
      };

      setTickets((prev) =>
        prev.map((t) =>
          t.id === selectedTicket.id
            ? { ...t, messages: [...t.messages, supportMessage], updatedAt: new Date() }
            : t
        )
      );

      setSelectedTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, supportMessage] } : null
      );
    }, 2000);
  };

  const handleCreateTicket = () => {
    if (!newSubject.trim() || !newDescription.trim()) return;

    const ticket: Ticket = {
      id: Date.now().toString(),
      subject: newSubject,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [
        {
          id: Date.now().toString(),
          content: newDescription,
          sender: "user",
          timestamp: new Date(),
          read: true,
        },
      ],
    };

    setTickets((prev) => [ticket, ...prev]);
    setNewSubject("");
    setNewDescription("");
    setSelectedTicket(ticket);
    setView("chat");
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    const config = {
      open: { label: "Aberto", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      in_progress: { label: "Em Andamento", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
      resolved: { label: "Resolvido", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    };
    return (
      <Badge variant="outline" className={config[status].className}>
        {config[status].label}
      </Badge>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary shadow-glow hover:scale-105 transition-transform z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col bg-card border border-border rounded-2xl shadow-2xl transition-all duration-300",
        isMinimized ? "w-80 h-14" : "w-96 h-[500px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Suporte</h3>
            {!isMinimized && (
              <p className="text-xs text-muted-foreground">Estamos aqui para ajudar</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {view === "tickets" && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-border">
                  <Button
                    onClick={() => setView("new")}
                    className="w-full bg-gradient-primary hover:opacity-90"
                  >
                    Novo Chamado
                  </Button>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-2 space-y-2">
                    {tickets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Nenhum chamado ainda</p>
                      </div>
                    ) : (
                      tickets.map((ticket) => (
                        <button
                          key={ticket.id}
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setView("chat");
                          }}
                          className="w-full p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-medium text-sm truncate flex-1">
                              {ticket.subject}
                            </span>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mb-1">
                            {ticket.messages[ticket.messages.length - 1]?.content}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(ticket.updatedAt)} às {formatTime(ticket.updatedAt)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {view === "new" && (
              <div className="p-4 space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("tickets")}
                  className="mb-2"
                >
                  ← Voltar
                </Button>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Assunto</label>
                    <Input
                      placeholder="Ex: Problema com pagamento"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Descrição</label>
                    <textarea
                      placeholder="Descreva seu problema ou dúvida..."
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleCreateTicket}
                    className="w-full bg-gradient-primary hover:opacity-90"
                    disabled={!newSubject.trim() || !newDescription.trim()}
                  >
                    Enviar Chamado
                  </Button>
                </div>
              </div>
            )}

            {view === "chat" && selectedTicket && (
              <div className="flex flex-col h-full">
                <div className="p-3 border-b border-border flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setView("tickets");
                      setSelectedTicket(null);
                    }}
                  >
                    ←
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{selectedTicket.subject}</p>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(selectedTicket.status)}
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-3">
                  <div className="space-y-3">
                    {selectedTicket.messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.sender === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-2",
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted rounded-bl-sm"
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span
                            className={cn(
                              "text-[10px] mt-1 block",
                              message.sender === "user"
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-3 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      size="icon"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
