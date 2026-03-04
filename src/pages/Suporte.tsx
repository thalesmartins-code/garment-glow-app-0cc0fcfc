import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle, Search, Send, Clock, CheckCircle2, AlertCircle, User, Calendar, Filter, MoreVertical, Archive, Trash2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Message {
  id: string; content: string; sender: "user" | "support"; senderName: string; timestamp: Date; read: boolean;
}

interface Ticket {
  id: string; ticketNumber: string; subject: string; status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  customer: { name: string; email: string; avatar?: string; };
  assignee?: string; messages: Message[]; createdAt: Date; updatedAt: Date;
}

const mockTickets: Ticket[] = [
  {
    id: "1", ticketNumber: "#001", subject: "Problema com pagamento via PIX", status: "open", priority: "high",
    customer: { name: "Maria Silva", email: "maria@email.com" },
    createdAt: new Date(Date.now() - 3600000), updatedAt: new Date(Date.now() - 1800000),
    messages: [
      { id: "1", content: "Olá, estou tendo problemas para finalizar um pagamento via PIX. O QR Code não está aparecendo.", sender: "user", senderName: "Maria Silva", timestamp: new Date(Date.now() - 3600000), read: true },
      { id: "2", content: "Já tentei atualizar a página mas continua não funcionando.", sender: "user", senderName: "Maria Silva", timestamp: new Date(Date.now() - 3500000), read: true },
    ],
  },
  {
    id: "2", ticketNumber: "#002", subject: "Dúvida sobre troca de produto", status: "in_progress", priority: "medium",
    customer: { name: "João Santos", email: "joao@email.com" }, assignee: "Carlos Atendente",
    createdAt: new Date(Date.now() - 86400000), updatedAt: new Date(Date.now() - 7200000),
    messages: [
      { id: "1", content: "Gostaria de trocar uma blusa que comprei. Ela veio com defeito.", sender: "user", senderName: "João Santos", timestamp: new Date(Date.now() - 86400000), read: true },
      { id: "2", content: "Olá João! Lamentamos o ocorrido. Pode nos enviar uma foto do defeito?", sender: "support", senderName: "Carlos Atendente", timestamp: new Date(Date.now() - 82800000), read: true },
      { id: "3", content: "Claro, vou enviar agora mesmo.", sender: "user", senderName: "João Santos", timestamp: new Date(Date.now() - 79200000), read: true },
    ],
  },
  {
    id: "3", ticketNumber: "#003", subject: "Pedido não chegou", status: "in_progress", priority: "high",
    customer: { name: "Ana Costa", email: "ana@email.com" }, assignee: "Fernanda Suporte",
    createdAt: new Date(Date.now() - 172800000), updatedAt: new Date(Date.now() - 43200000),
    messages: [
      { id: "1", content: "Meu pedido #12345 deveria ter chegado há 3 dias e ainda não recebi.", sender: "user", senderName: "Ana Costa", timestamp: new Date(Date.now() - 172800000), read: true },
      { id: "2", content: "Olá Ana! Vou verificar o status do seu pedido agora.", sender: "support", senderName: "Fernanda Suporte", timestamp: new Date(Date.now() - 169200000), read: true },
    ],
  },
  {
    id: "4", ticketNumber: "#004", subject: "Cupom de desconto não funciona", status: "resolved", priority: "low",
    customer: { name: "Pedro Lima", email: "pedro@email.com" }, assignee: "Carlos Atendente",
    createdAt: new Date(Date.now() - 259200000), updatedAt: new Date(Date.now() - 86400000),
    messages: [
      { id: "1", content: "Estou tentando usar o cupom PROMO10 mas está dando erro.", sender: "user", senderName: "Pedro Lima", timestamp: new Date(Date.now() - 259200000), read: true },
      { id: "2", content: "Olá Pedro! O cupom PROMO10 expirou ontem. Mas vou liberar um cupom especial para você: PEDRO15 com 15% de desconto!", sender: "support", senderName: "Carlos Atendente", timestamp: new Date(Date.now() - 255600000), read: true },
      { id: "3", content: "Muito obrigado! Funcionou perfeitamente!", sender: "user", senderName: "Pedro Lima", timestamp: new Date(Date.now() - 252000000), read: true },
    ],
  },
  {
    id: "5", ticketNumber: "#005", subject: "Como rastrear meu pedido?", status: "closed", priority: "low",
    customer: { name: "Lucia Oliveira", email: "lucia@email.com" }, assignee: "Fernanda Suporte",
    createdAt: new Date(Date.now() - 432000000), updatedAt: new Date(Date.now() - 345600000),
    messages: [
      { id: "1", content: "Onde encontro o código de rastreamento do meu pedido?", sender: "user", senderName: "Lucia Oliveira", timestamp: new Date(Date.now() - 432000000), read: true },
      { id: "2", content: "Olá Lucia! O código de rastreamento é enviado por email assim que o pedido é despachado. Você também pode encontrar em Meus Pedidos > Detalhes do Pedido.", sender: "support", senderName: "Fernanda Suporte", timestamp: new Date(Date.now() - 428400000), read: true },
      { id: "3", content: "Encontrei! Obrigada pela ajuda!", sender: "user", senderName: "Lucia Oliveira", timestamp: new Date(Date.now() - 424800000), read: true },
    ],
  },
];

export default function Suporte() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [newMessage, setNewMessage] = useState("");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved" || t.status === "closed").length,
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    const message: Message = { id: Date.now().toString(), content: newMessage, sender: "support", senderName: "Você", timestamp: new Date(), read: true };
    const updatedTickets = tickets.map((t) =>
      t.id === selectedTicket.id
        ? { ...t, messages: [...t.messages, message], updatedAt: new Date(), status: t.status === "open" ? ("in_progress" as const) : t.status }
        : t
    );
    setTickets(updatedTickets);
    setSelectedTicket(updatedTickets.find((t) => t.id === selectedTicket.id) || null);
    setNewMessage("");
  };

  const handleUpdateStatus = (ticketId: string, newStatus: Ticket["status"]) => {
    const updatedTickets = tickets.map((t) =>
      t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date() } : t
    );
    setTickets(updatedTickets);
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(updatedTickets.find((t) => t.id === ticketId) || null);
    }
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    const config = {
      open: { label: "Aberto", className: "bg-accent/10 text-accent border-accent/20", icon: AlertCircle },
      in_progress: { label: "Em Andamento", className: "bg-warning/10 text-warning border-warning/20", icon: Clock },
      resolved: { label: "Resolvido", className: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
      closed: { label: "Fechado", className: "bg-muted text-muted-foreground border-muted", icon: Archive },
    };
    const Icon = config[status].icon;
    return (
      <Badge variant="outline" className={cn("gap-1", config[status].className)}>
        <Icon className="h-3 w-3" />
        {config[status].label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    const config = {
      low: { label: "Baixa", className: "bg-muted text-muted-foreground" },
      medium: { label: "Média", className: "bg-warning/10 text-warning" },
      high: { label: "Alta", className: "bg-destructive/10 text-destructive" },
    };
    return <Badge variant="secondary" className={config[priority].className}>{config[priority].label}</Badge>;
  };

  const formatTime = (date: Date) => date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return `Hoje às ${formatTime(date)}`;
    if (date.toDateString() === yesterday.toDateString()) return `Ontem às ${formatTime(date)}`;
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <PageHeader title="Suporte" subtitle="Gerencie os chamados dos clientes" />
      <div className="p-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Chamados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.open}</p>
                <p className="text-sm text-muted-foreground">Aguardando</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Resolvidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-320px)]">
        {/* Tickets List */}
        <Card className="lg:col-span-1 flex flex-col border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chamados
            </CardTitle>
            <div className="space-y-3 pt-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar chamados..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-secondary/50 border-0" />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 bg-secondary/50 border-0"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvidos</SelectItem>
                    <SelectItem value="closed">Fechados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="flex-1 bg-secondary/50 border-0"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="p-3 space-y-2">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Nenhum chamado encontrado</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all hover:bg-secondary/30",
                        selectedTicket?.id === ticket.id ? "bg-secondary/50 border-accent/30" : "bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-medium text-sm truncate flex-1">{ticket.subject}</span>
                        <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{ticket.ticketNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{ticket.customer.name}</span>
                        <span className="text-xs text-muted-foreground">{formatDate(ticket.updatedAt)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col border-0 shadow-md">
          {selectedTicket ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{selectedTicket.customer.name}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{selectedTicket.ticketNumber}</span>
                      {getStatusBadge(selectedTicket.status)}
                      {getPriorityBadge(selectedTicket.priority)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket.id, "resolved")}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />Marcar como Resolvido
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleUpdateStatus(selectedTicket.id, "closed")}>
                        <Archive className="h-4 w-4 mr-2" />Fechar Chamado
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />Excluir Chamado
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div key={message.id} className={cn("flex", message.sender === "support" ? "justify-end" : "justify-start")}>
                      <div className={cn(
                        "max-w-[70%] rounded-2xl p-3",
                        message.sender === "support"
                          ? "bg-gradient-rose text-white rounded-br-md"
                          : "bg-secondary rounded-bl-md"
                      )}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-xs font-medium", message.sender === "support" ? "text-white/80" : "text-muted-foreground")}>
                            {message.senderName}
                          </span>
                          <span className={cn("text-xs", message.sender === "support" ? "text-white/60" : "text-muted-foreground")}>
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua resposta..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-secondary/50 border-0"
                  />
                  <Button onClick={handleSendMessage} className="bg-gradient-rose hover:opacity-90 border-0">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Selecione um chamado</p>
                <p className="text-sm">Escolha um chamado da lista para visualizar</p>
              </div>
            </div>
          )}
        </Card>
      </div>
      </div>
    </>
  );
}
