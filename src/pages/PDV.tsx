import { useState } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Barcode,
  ShoppingBag,
  Receipt,
  X,
  Percent,
  Tag,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock products data
const productsData = [
  { id: 1, name: "Vestido Floral Primavera", sku: "VFP-001", price: 289.90, stock: 15, category: "Vestidos", image: "👗" },
  { id: 2, name: "Camisa Social Slim", sku: "CSS-002", price: 159.90, stock: 32, category: "Camisas", image: "👔" },
  { id: 3, name: "Calça Jeans Skinny", sku: "CJS-003", price: 199.90, stock: 28, category: "Calças", image: "👖" },
  { id: 4, name: "Blazer Executivo", sku: "BEX-004", price: 459.90, stock: 8, category: "Blazers", image: "🧥" },
  { id: 5, name: "Saia Midi Plissada", sku: "SMP-005", price: 179.90, stock: 18, category: "Saias", image: "👗" },
  { id: 6, name: "Blusa de Seda", sku: "BDS-006", price: 229.90, stock: 12, category: "Blusas", image: "👚" },
  { id: 7, name: "Casaco de Lã", sku: "CDL-007", price: 399.90, stock: 6, category: "Casacos", image: "🧥" },
  { id: 8, name: "Short Jeans", sku: "SHJ-008", price: 129.90, stock: 22, category: "Shorts", image: "🩳" },
];

const categories = ["Todos", "Vestidos", "Camisas", "Calças", "Blazers", "Saias", "Blusas", "Casacos", "Shorts"];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  discount: number;
}

const PDV = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customer, setCustomer] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isCustomerOpen, setIsCustomerOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState<number | null>(null);
  const [discountValue, setDiscountValue] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState("");

  // Filter products
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Cart operations
  const addToCart = (product: typeof productsData[0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1, discount: 0 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const applyDiscount = () => {
    if (selectedCartItem === null || !discountValue) return;
    const discount = parseFloat(discountValue);
    if (isNaN(discount) || discount < 0 || discount > 100) return;
    
    setCart((prev) =>
      prev.map((item) =>
        item.id === selectedCartItem ? { ...item, discount } : item
      )
    );
    setIsDiscountOpen(false);
    setDiscountValue("");
    setSelectedCartItem(null);
  };

  const clearCart = () => {
    setCart([]);
    setCustomer(null);
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + (item.price * item.quantity * item.discount) / 100, 0);
  const total = subtotal - totalDiscount;
  const change = paymentMethod === "cash" && cashReceived ? parseFloat(cashReceived) - total : 0;

  // Mock customers
  const customers = [
    { id: 1, name: "Ana Oliveira", cpf: "123.456.789-00", phone: "(11) 99999-1111" },
    { id: 2, name: "Carlos Silva", cpf: "234.567.890-11", phone: "(11) 99999-2222" },
    { id: 3, name: "Maria Santos", cpf: "345.678.901-22", phone: "(11) 99999-3333" },
    { id: 4, name: "Pedro Costa", cpf: "456.789.012-33", phone: "(11) 99999-4444" },
  ];

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.cpf.includes(customerSearch)
  );

  const finalizeSale = () => {
    // Here you would process the sale
    alert(`Venda finalizada!\nTotal: R$ ${total.toFixed(2).replace(".", ",")}\nCliente: ${customer || "Consumidor Final"}\nPagamento: ${paymentMethod}`);
    clearCart();
    setIsPaymentOpen(false);
    setPaymentMethod(null);
    setCashReceived("");
  };

  return (
    <>
      <PageHeader title="PDV - Ponto de Venda" subtitle="Registre vendas de forma rápida e detalhada" />
      <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Products Section */}
        <div className="lg:col-span-2 flex flex-col">
          {/* Search and Categories */}
          <Card className="border-0 shadow-md mb-4">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto ou código de barras..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-secondary/50 border-0"
                  />
                </div>
                <Button variant="outline" className="bg-secondary/50 border-0">
                  <Barcode className="w-4 h-4 mr-2" />
                  Leitor
                </Button>
              </div>

              {/* Categories */}
              <ScrollArea className="mt-4">
                <div className="flex gap-2 pb-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className={
                        selectedCategory === category
                          ? "bg-gradient-rose hover:opacity-90 border-0"
                          : "bg-secondary/50 border-0"
                      }
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card className="border-0 shadow-md flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-200 text-left group hover:shadow-md"
                    >
                      <div className="text-3xl mb-2">{product.image}</div>
                      <p className="font-medium text-sm line-clamp-2 mb-1">{product.name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{product.sku}</p>
                      <p className="font-bold text-primary">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </p>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        Estoque: {product.stock}
                      </Badge>
                    </button>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    Nenhum produto encontrado.
                  </div>
                )}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="flex flex-col">
          <Card className="border-0 shadow-md flex-1 flex flex-col overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Carrinho
                  {cart.length > 0 && (
                    <Badge className="bg-gradient-rose border-0">{cart.length}</Badge>
                  )}
                </CardTitle>
                {cart.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart} className="text-destructive hover:text-destructive">
                    <X className="w-4 h-4 mr-1" />
                    Limpar
                  </Button>
                )}
              </div>
            </CardHeader>

            {/* Customer Selection */}
            <div className="p-4 border-b">
              <Button
                variant="outline"
                className="w-full justify-start bg-secondary/50 border-0"
                onClick={() => setIsCustomerOpen(true)}
              >
                <User className="w-4 h-4 mr-2" />
                {customer || "Selecionar Cliente"}
              </Button>
            </div>

            {/* Cart Items */}
            <ScrollArea className="flex-1 p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Carrinho vazio</p>
                  <p className="text-sm">Adicione produtos para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-secondary/30 group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            R$ {item.price.toFixed(2).replace(".", ",")} cada
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-0 bg-secondary"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-0 bg-secondary"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          {item.discount > 0 && (
                            <Badge variant="secondary" className="text-xs bg-success/10 text-success">
                              -{item.discount}%
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setSelectedCartItem(item.id);
                              setDiscountValue(item.discount.toString());
                              setIsDiscountOpen(true);
                            }}
                          >
                            <Percent className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-2 text-right">
                        {item.discount > 0 && (
                          <p className="text-xs text-muted-foreground line-through">
                            R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                          </p>
                        )}
                        <p className="font-semibold">
                          R$ {((item.price * item.quantity) * (1 - item.discount / 100)).toFixed(2).replace(".", ",")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t bg-secondary/20">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-success">
                      <span>Descontos</span>
                      <span>- R$ {totalDiscount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-rose hover:opacity-90 transition-opacity h-12 text-base"
                  onClick={() => setIsPaymentOpen(true)}
                >
                  <Receipt className="w-5 h-5 mr-2" />
                  Finalizar Venda
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerOpen} onOpenChange={setIsCustomerOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Selecionar Cliente</DialogTitle>
            <DialogDescription>
              Busque pelo nome ou CPF do cliente.
            </DialogDescription>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="pl-10 bg-secondary/50 border-0"
            />
          </div>

          <ScrollArea className="h-64">
            <div className="space-y-2">
              <button
                className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                onClick={() => {
                  setCustomer(null);
                  setIsCustomerOpen(false);
                }}
              >
                <p className="font-medium">Consumidor Final</p>
                <p className="text-sm text-muted-foreground">Sem identificação</p>
              </button>

              {filteredCustomers.map((c) => (
                <button
                  key={c.id}
                  className="w-full p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-left"
                  onClick={() => {
                    setCustomer(c.name);
                    setIsCustomerOpen(false);
                    setCustomerSearch("");
                  }}
                >
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.cpf} • {c.phone}</p>
                </button>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Aplicar Desconto</DialogTitle>
            <DialogDescription>
              Informe o percentual de desconto para este item.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <div className="relative">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="bg-secondary/50 border-0 pr-10"
                  placeholder="0"
                />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex gap-2">
              {[5, 10, 15, 20].map((val) => (
                <Button
                  key={val}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-secondary/50 border-0"
                  onClick={() => setDiscountValue(val.toString())}
                >
                  {val}%
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDiscountOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-gradient-rose hover:opacity-90" onClick={applyDiscount}>
              Aplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Finalizar Venda</DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {/* Sale Summary */}
            <div className="p-4 rounded-lg bg-secondary/30 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Cliente</span>
                <span className="font-medium">{customer || "Consumidor Final"}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Itens</span>
                <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>R$ {total.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <Tabs value={paymentMethod || undefined} onValueChange={setPaymentMethod}>
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="credit" className="flex flex-col items-center gap-1 py-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Crédito</span>
                </TabsTrigger>
                <TabsTrigger value="debit" className="flex flex-col items-center gap-1 py-3">
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Débito</span>
                </TabsTrigger>
                <TabsTrigger value="pix" className="flex flex-col items-center gap-1 py-3">
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs">PIX</span>
                </TabsTrigger>
                <TabsTrigger value="cash" className="flex flex-col items-center gap-1 py-3">
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs">Dinheiro</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="credit" className="mt-4">
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Insira ou aproxime o cartão de crédito na máquina
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="debit" className="mt-4">
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Insira ou aproxime o cartão de débito na máquina
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="pix" className="mt-4">
                <div className="p-4 rounded-lg bg-secondary/30 text-center">
                  <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                    <Tag className="w-16 h-16 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    QR Code PIX gerado • Aguardando pagamento
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="cash" className="mt-4">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="cashReceived">Valor Recebido</Label>
                    <Input
                      id="cashReceived"
                      type="number"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="bg-secondary/50 border-0 text-lg h-12"
                      placeholder="0,00"
                    />
                  </div>

                  <div className="flex gap-2">
                    {[total, Math.ceil(total / 10) * 10, Math.ceil(total / 50) * 50, Math.ceil(total / 100) * 100].map((val, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-secondary/50 border-0"
                        onClick={() => setCashReceived(val.toFixed(2))}
                      >
                        R$ {val.toFixed(0)}
                      </Button>
                    ))}
                  </div>

                  {parseFloat(cashReceived) >= total && (
                    <div className="p-4 rounded-lg bg-success/10 text-success text-center">
                      <p className="text-sm">Troco</p>
                      <p className="text-2xl font-bold">R$ {change.toFixed(2).replace(".", ",")}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-gradient-rose hover:opacity-90"
              onClick={finalizeSale}
              disabled={!paymentMethod || (paymentMethod === "cash" && parseFloat(cashReceived) < total)}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
};

export default PDV;
