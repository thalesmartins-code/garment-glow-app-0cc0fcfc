// Financial Mock Data - Fashion Retail

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "receita" | "despesa";
  category: string;
  competencyDate: string;
  cashDate: string;
  status: "efetivado" | "pendente" | "cancelado";
  paymentMethod: string;
  installments?: number;
  currentInstallment?: number;
  account: string;
}

export interface Account {
  id: string;
  name: string;
  type: "caixa" | "banco" | "adquirente";
  balance: number;
  bank?: string;
  icon?: string;
}

export interface Receivable {
  id: string;
  clientId: number;
  clientName: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  status: "a_vencer" | "vencido" | "pago" | "renegociado";
  installmentNumber: number;
  totalInstallments: number;
  protestStatus: "nenhum" | "protestado" | "negativado";
  description: string;
  paymentMethod: string;
}

export interface Payable {
  id: string;
  supplier: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  category: string;
  status: "a_vencer" | "vencido" | "pago";
  nfNumber?: string;
  description: string;
}

export interface DRELine {
  label: string;
  value: number;
  type: "receita" | "deducao" | "custo" | "despesa" | "resultado";
  level: number;
}

export interface ConciliationEntry {
  id: string;
  date: string;
  description: string;
  systemAmount: number;
  acquirerAmount: number;
  difference: number;
  status: "conciliado" | "divergente" | "pendente";
}

// Categories
export const revenueCategories = [
  "Vendas à Vista",
  "Vendas Cartão Crédito",
  "Vendas Cartão Débito",
  "Vendas Pix",
  "Vendas Crediário",
  "Outras Receitas",
];

export const expenseCategories = [
  "Compra de Mercadorias",
  "Aluguel",
  "Salários e Encargos",
  "Energia Elétrica",
  "Água",
  "Internet/Telefone",
  "Marketing",
  "Embalagens",
  "Manutenção",
  "Impostos",
  "Taxas de Cartão",
  "Outras Despesas",
];

export const paymentMethods = [
  "Dinheiro",
  "Pix",
  "Cartão Crédito",
  "Cartão Débito",
  "Crediário",
  "Boleto",
  "Transferência",
];

// Mock Accounts
export const mockAccounts: Account[] = [
  { id: "acc1", name: "Caixa Físico 1", type: "caixa", balance: 3420.50 },
  { id: "acc2", name: "Caixa Físico 2", type: "caixa", balance: 1850.00 },
  { id: "acc3", name: "Itaú - Conta Corrente", type: "banco", balance: 45670.80, bank: "Itaú" },
  { id: "acc4", name: "Bradesco - Conta Corrente", type: "banco", balance: 12340.25, bank: "Bradesco" },
  { id: "acc5", name: "Stone", type: "adquirente", balance: 8920.00, bank: "Stone" },
  { id: "acc6", name: "Cielo", type: "adquirente", balance: 5430.60, bank: "Cielo" },
];

// Mock Receivables
export const mockReceivables: Receivable[] = [
  { id: "rec1", clientId: 1, clientName: "Maria Silva", dueDate: "2026-02-25", amount: 350.00, paidAmount: 0, status: "a_vencer", installmentNumber: 3, totalInstallments: 5, protestStatus: "nenhum", description: "Vestido Festa + Acessórios", paymentMethod: "Crediário" },
  { id: "rec2", clientId: 2, clientName: "Ana Oliveira", dueDate: "2026-02-10", amount: 280.00, paidAmount: 0, status: "vencido", installmentNumber: 2, totalInstallments: 4, protestStatus: "nenhum", description: "Conjunto Casual", paymentMethod: "Crediário" },
  { id: "rec3", clientId: 3, clientName: "Carla Santos", dueDate: "2026-01-15", amount: 520.00, paidAmount: 0, status: "vencido", installmentNumber: 1, totalInstallments: 3, protestStatus: "protestado", description: "Coleção Inverno", paymentMethod: "Crediário" },
  { id: "rec4", clientId: 4, clientName: "Fernanda Lima", dueDate: "2026-02-20", amount: 180.00, paidAmount: 180.00, status: "pago", installmentNumber: 4, totalInstallments: 4, protestStatus: "nenhum", description: "Blusa Seda", paymentMethod: "Crediário" },
  { id: "rec5", clientId: 5, clientName: "Juliana Costa", dueDate: "2026-03-05", amount: 450.00, paidAmount: 0, status: "a_vencer", installmentNumber: 1, totalInstallments: 6, protestStatus: "nenhum", description: "Look Completo Verão", paymentMethod: "Crediário" },
  { id: "rec6", clientId: 6, clientName: "Patrícia Mendes", dueDate: "2026-01-20", amount: 890.00, paidAmount: 400.00, status: "renegociado", installmentNumber: 1, totalInstallments: 3, protestStatus: "negativado", description: "Renegociação - Compras Dez/25", paymentMethod: "Crediário" },
  { id: "rec7", clientId: 7, clientName: "Renata Alves", dueDate: "2026-02-28", amount: 320.00, paidAmount: 0, status: "a_vencer", installmentNumber: 2, totalInstallments: 3, protestStatus: "nenhum", description: "Calça + Camisa Social", paymentMethod: "Crediário" },
  { id: "rec8", clientId: 8, clientName: "Beatriz Ferreira", dueDate: "2026-02-05", amount: 670.00, paidAmount: 0, status: "vencido", installmentNumber: 3, totalInstallments: 5, protestStatus: "nenhum", description: "Vestido Casamento", paymentMethod: "Crediário" },
];

// Mock Payables
export const mockPayables: Payable[] = [
  { id: "pay1", supplier: "Fornecedor Têxtil SP", dueDate: "2026-02-28", amount: 12500.00, paidAmount: 0, category: "Compra de Mercadorias", status: "a_vencer", nfNumber: "NF-4521", description: "Coleção Outono 2026" },
  { id: "pay2", supplier: "Imobiliária Centro", dueDate: "2026-03-01", amount: 4500.00, paidAmount: 0, category: "Aluguel", status: "a_vencer", description: "Aluguel Março/2026" },
  { id: "pay3", supplier: "CEMIG", dueDate: "2026-02-20", amount: 890.00, paidAmount: 890.00, category: "Energia Elétrica", status: "pago", description: "Energia Fev/2026" },
  { id: "pay4", supplier: "Confecções Moda RJ", dueDate: "2026-02-15", amount: 8700.00, paidAmount: 0, category: "Compra de Mercadorias", status: "vencido", nfNumber: "NF-3287", description: "Coleção Verão - 2ª parcela" },
  { id: "pay5", supplier: "Agência Digital", dueDate: "2026-03-05", amount: 2200.00, paidAmount: 0, category: "Marketing", status: "a_vencer", description: "Campanha Instagram Mar/2026" },
  { id: "pay6", supplier: "Folha de Pagamento", dueDate: "2026-03-05", amount: 15800.00, paidAmount: 0, category: "Salários e Encargos", status: "a_vencer", description: "Salários Fev/2026" },
  { id: "pay7", supplier: "Embalagens Premium", dueDate: "2026-02-22", amount: 1350.00, paidAmount: 0, category: "Embalagens", status: "a_vencer", nfNumber: "NF-892", description: "Sacolas e caixas personalizadas" },
];

// Mock Transactions
export const mockTransactions: Transaction[] = [
  { id: "t1", date: "2026-02-23", description: "Venda - Maria Silva", amount: 780.00, type: "receita", category: "Vendas Cartão Crédito", competencyDate: "2026-02-23", cashDate: "2026-03-25", status: "efetivado", paymentMethod: "Cartão Crédito", installments: 3, currentInstallment: 1, account: "acc5" },
  { id: "t2", date: "2026-02-23", description: "Venda - Cliente Avulso", amount: 245.00, type: "receita", category: "Vendas Pix", competencyDate: "2026-02-23", cashDate: "2026-02-23", status: "efetivado", paymentMethod: "Pix", account: "acc3" },
  { id: "t3", date: "2026-02-22", description: "Venda - Ana Oliveira", amount: 1200.00, type: "receita", category: "Vendas à Vista", competencyDate: "2026-02-22", cashDate: "2026-02-22", status: "efetivado", paymentMethod: "Dinheiro", account: "acc1" },
  { id: "t4", date: "2026-02-22", description: "Pagamento Energia", amount: 890.00, type: "despesa", category: "Energia Elétrica", competencyDate: "2026-02-01", cashDate: "2026-02-22", status: "efetivado", paymentMethod: "Boleto", account: "acc3" },
  { id: "t5", date: "2026-02-21", description: "Venda - Fernanda Lima", amount: 560.00, type: "receita", category: "Vendas Cartão Débito", competencyDate: "2026-02-21", cashDate: "2026-02-22", status: "efetivado", paymentMethod: "Cartão Débito", account: "acc6" },
  { id: "t6", date: "2026-02-21", description: "Compra Embalagens", amount: 1350.00, type: "despesa", category: "Embalagens", competencyDate: "2026-02-21", cashDate: "2026-02-21", status: "efetivado", paymentMethod: "Pix", account: "acc3" },
  { id: "t7", date: "2026-02-20", description: "Venda - Juliana Costa", amount: 2700.00, type: "receita", category: "Vendas Crediário", competencyDate: "2026-02-20", cashDate: "2026-03-20", status: "pendente", paymentMethod: "Crediário", installments: 6, currentInstallment: 1, account: "acc1" },
  { id: "t8", date: "2026-02-20", description: "Venda - Cliente Avulso", amount: 189.00, type: "receita", category: "Vendas à Vista", competencyDate: "2026-02-20", cashDate: "2026-02-20", status: "efetivado", paymentMethod: "Dinheiro", account: "acc1" },
  { id: "t9", date: "2026-02-19", description: "Pagamento Aluguel", amount: 4500.00, type: "despesa", category: "Aluguel", competencyDate: "2026-02-01", cashDate: "2026-02-19", status: "efetivado", paymentMethod: "Transferência", account: "acc3" },
  { id: "t10", date: "2026-02-19", description: "Venda - Beatriz Ferreira", amount: 1450.00, type: "receita", category: "Vendas Cartão Crédito", competencyDate: "2026-02-19", cashDate: "2026-03-19", status: "efetivado", paymentMethod: "Cartão Crédito", installments: 2, currentInstallment: 1, account: "acc5" },
];

// Mock Conciliation
export const mockConciliation: ConciliationEntry[] = [
  { id: "conc1", date: "2026-02-23", description: "Vendas Cartão Crédito", systemAmount: 3450.00, acquirerAmount: 3346.50, difference: -103.50, status: "conciliado" },
  { id: "conc2", date: "2026-02-22", description: "Vendas Cartão Débito", systemAmount: 1890.00, acquirerAmount: 1861.35, difference: -28.65, status: "conciliado" },
  { id: "conc3", date: "2026-02-21", description: "Vendas Cartão Crédito", systemAmount: 2100.00, acquirerAmount: 2037.00, difference: -63.00, status: "conciliado" },
  { id: "conc4", date: "2026-02-20", description: "Vendas Cartão Débito", systemAmount: 780.00, acquirerAmount: 0, difference: -780.00, status: "divergente" },
  { id: "conc5", date: "2026-02-19", description: "Vendas Cartão Crédito", systemAmount: 4200.00, acquirerAmount: 4200.00, difference: 0, status: "pendente" },
];

// Monthly summary for charts
export const monthlyData = [
  { month: "Set", receitas: 68500, despesas: 42300 },
  { month: "Out", receitas: 72100, despesas: 45800 },
  { month: "Nov", receitas: 89400, despesas: 51200 },
  { month: "Dez", receitas: 125600, despesas: 68900 },
  { month: "Jan", receitas: 54200, despesas: 39100 },
  { month: "Fev", receitas: 78300, despesas: 44600 },
];

export const paymentMethodDistribution = [
  { name: "Cartão Crédito", value: 38, fill: "hsl(15, 45%, 65%)" },
  { name: "Pix", value: 25, fill: "hsl(142, 70%, 45%)" },
  { name: "Dinheiro", value: 15, fill: "hsl(38, 92%, 50%)" },
  { name: "Cartão Débito", value: 12, fill: "hsl(24, 10%, 40%)" },
  { name: "Crediário", value: 10, fill: "hsl(350, 50%, 60%)" },
];

// DRE - Demonstrativo de Resultado do Exercício
export interface DREData {
  label: string;
  currentMonth: number;
  previousMonth: number;
  type: "receita" | "deducao" | "custo" | "despesa" | "resultado";
  level: number; // 0 = total, 1 = subtotal, 2 = item
  bold?: boolean;
}

export const dreData: DREData[] = [
  { label: "RECEITA BRUTA DE VENDAS", currentMonth: 78300, previousMonth: 72100, type: "receita", level: 0, bold: true },
  { label: "Vendas de Mercadorias", currentMonth: 74500, previousMonth: 68200, type: "receita", level: 2 },
  { label: "Serviços (Ajustes/Customização)", currentMonth: 3800, previousMonth: 3900, type: "receita", level: 2 },

  { label: "(-) DEDUÇÕES DA RECEITA", currentMonth: -6264, previousMonth: -5768, type: "deducao", level: 0, bold: true },
  { label: "Impostos sobre Vendas (SIMPLES)", currentMonth: -4698, previousMonth: -4326, type: "deducao", level: 2 },
  { label: "Devoluções e Abatimentos", currentMonth: -1566, previousMonth: -1442, type: "deducao", level: 2 },

  { label: "= RECEITA LÍQUIDA", currentMonth: 72036, previousMonth: 66332, type: "resultado", level: 0, bold: true },

  { label: "(-) CUSTO DAS MERCADORIAS VENDIDAS (CMV)", currentMonth: -31320, previousMonth: -28840, type: "custo", level: 0, bold: true },
  { label: "Custo de Aquisição das Mercadorias", currentMonth: -29400, previousMonth: -27100, type: "custo", level: 2 },
  { label: "Frete sobre Compras", currentMonth: -1920, previousMonth: -1740, type: "custo", level: 2 },

  { label: "= LUCRO BRUTO", currentMonth: 40716, previousMonth: 37492, type: "resultado", level: 0, bold: true },

  { label: "(-) DESPESAS OPERACIONAIS", currentMonth: -24580, previousMonth: -23150, type: "despesa", level: 0, bold: true },
  { label: "Salários e Encargos", currentMonth: -15800, previousMonth: -15800, type: "despesa", level: 2 },
  { label: "Aluguel", currentMonth: -4500, previousMonth: -4500, type: "despesa", level: 2 },
  { label: "Energia Elétrica", currentMonth: -890, previousMonth: -820, type: "despesa", level: 2 },
  { label: "Marketing e Publicidade", currentMonth: -2200, previousMonth: -1200, type: "despesa", level: 2 },
  { label: "Embalagens", currentMonth: -1350, previousMonth: -980, type: "despesa", level: 2 },
  { label: "Internet/Telefone", currentMonth: -340, previousMonth: -340, type: "despesa", level: 2 },
  { label: "Manutenção", currentMonth: -500, previousMonth: -510, type: "despesa", level: 2 },

  { label: "(-) DESPESAS FINANCEIRAS", currentMonth: -3420, previousMonth: -3180, type: "despesa", level: 0, bold: true },
  { label: "Taxas de Cartão/Adquirentes", currentMonth: -2870, previousMonth: -2680, type: "despesa", level: 2 },
  { label: "Tarifas Bancárias", currentMonth: -550, previousMonth: -500, type: "despesa", level: 2 },

  { label: "= RESULTADO OPERACIONAL (EBITDA)", currentMonth: 12716, previousMonth: 11162, type: "resultado", level: 0, bold: true },

  { label: "(-) Depreciação", currentMonth: -800, previousMonth: -800, type: "despesa", level: 2 },

  { label: "= LUCRO LÍQUIDO DO EXERCÍCIO", currentMonth: 11916, previousMonth: 10362, type: "resultado", level: 0, bold: true },
];

export const dreMonthlyComparison = [
  { month: "Set", receitaLiquida: 63200, cmv: -25280, lucBruto: 37920, despesas: -26400, lucLiquido: 11520 },
  { month: "Out", receitaLiquida: 66500, cmv: -26600, lucBruto: 39900, despesas: -27100, lucLiquido: 12800 },
  { month: "Nov", receitaLiquida: 82400, cmv: -32960, lucBruto: 49440, despesas: -29200, lucLiquido: 20240 },
  { month: "Dez", receitaLiquida: 115800, cmv: -46320, lucBruto: 69480, despesas: -38600, lucLiquido: 30880 },
  { month: "Jan", receitaLiquida: 49900, cmv: -19960, lucBruto: 29940, despesas: -23500, lucLiquido: 6440 },
  { month: "Fev", receitaLiquida: 72036, cmv: -31320, lucBruto: 40716, despesas: -28000, lucLiquido: 11916 },
];

// DFC - Demonstrativo de Fluxo de Caixa
export interface DFCCategory {
  label: string;
  currentMonth: number;
  previousMonth: number;
  type: "entrada" | "saida" | "subtotal" | "total";
  section: "operacional" | "investimento" | "financiamento" | "resultado";
  bold?: boolean;
}

export const dfcData: DFCCategory[] = [
  // Atividades Operacionais
  { label: "ATIVIDADES OPERACIONAIS", currentMonth: 0, previousMonth: 0, type: "subtotal", section: "operacional", bold: true },
  { label: "Recebimentos de Clientes - À Vista", currentMonth: 29400, previousMonth: 27200, type: "entrada", section: "operacional" },
  { label: "Recebimentos de Clientes - Cartão", currentMonth: 24800, previousMonth: 22100, type: "entrada", section: "operacional" },
  { label: "Recebimentos de Clientes - Crediário", currentMonth: 8200, previousMonth: 7500, type: "entrada", section: "operacional" },
  { label: "Recebimentos de Clientes - Pix", currentMonth: 12500, previousMonth: 10800, type: "entrada", section: "operacional" },
  { label: "(-) Pagamentos a Fornecedores", currentMonth: -31200, previousMonth: -28400, type: "saida", section: "operacional" },
  { label: "(-) Salários e Encargos", currentMonth: -15800, previousMonth: -15800, type: "saida", section: "operacional" },
  { label: "(-) Impostos Pagos", currentMonth: -4698, previousMonth: -4326, type: "saida", section: "operacional" },
  { label: "(-) Despesas Gerais Pagas", currentMonth: -9780, previousMonth: -8350, type: "saida", section: "operacional" },
  { label: "(-) Taxas de Cartão/Adquirentes", currentMonth: -2870, previousMonth: -2680, type: "saida", section: "operacional" },
  { label: "= Caixa Gerado nas Operações", currentMonth: 10552, previousMonth: 8044, type: "subtotal", section: "operacional", bold: true },

  // Atividades de Investimento
  { label: "ATIVIDADES DE INVESTIMENTO", currentMonth: 0, previousMonth: 0, type: "subtotal", section: "investimento", bold: true },
  { label: "(-) Compra de Equipamentos (Manequins/Expositores)", currentMonth: -2400, previousMonth: 0, type: "saida", section: "investimento" },
  { label: "(-) Reforma e Melhorias na Loja", currentMonth: -1500, previousMonth: -3200, type: "saida", section: "investimento" },
  { label: "= Caixa Usado em Investimentos", currentMonth: -3900, previousMonth: -3200, type: "subtotal", section: "investimento", bold: true },

  // Atividades de Financiamento
  { label: "ATIVIDADES DE FINANCIAMENTO", currentMonth: 0, previousMonth: 0, type: "subtotal", section: "financiamento", bold: true },
  { label: "Empréstimo Bancário Recebido", currentMonth: 0, previousMonth: 15000, type: "entrada", section: "financiamento" },
  { label: "(-) Amortização de Empréstimos", currentMonth: -2500, previousMonth: -2500, type: "saida", section: "financiamento" },
  { label: "(-) Juros Pagos", currentMonth: -380, previousMonth: -420, type: "saida", section: "financiamento" },
  { label: "= Caixa de Financiamentos", currentMonth: -2880, previousMonth: 12080, type: "subtotal", section: "financiamento", bold: true },

  // Resultado
  { label: "VARIAÇÃO LÍQUIDA DE CAIXA", currentMonth: 3772, previousMonth: 16924, type: "total", section: "resultado", bold: true },
  { label: "Saldo Inicial de Caixa", currentMonth: 73859.15, previousMonth: 56935.15, type: "total", section: "resultado" },
  { label: "SALDO FINAL DE CAIXA", currentMonth: 77631.15, previousMonth: 73859.15, type: "total", section: "resultado", bold: true },
];

// Projeção de fluxo de caixa (próximos 30 dias)
export const cashFlowProjection = [
  { date: "23/02", saldo: 77631, entradas: 3200, saidas: -1800 },
  { date: "25/02", saldo: 79031, entradas: 4500, saidas: -2300 },
  { date: "28/02", saldo: 78231, entradas: 2100, saidas: -4900 },
  { date: "01/03", saldo: 73831, entradas: 1500, saidas: -5900 },
  { date: "03/03", saldo: 70931, entradas: 3800, saidas: -2700 },
  { date: "05/03", saldo: 56231, entradas: 2200, saidas: -18900 },
  { date: "08/03", saldo: 58431, entradas: 5400, saidas: -3200 },
  { date: "10/03", saldo: 61631, entradas: 6200, saidas: -3000 },
  { date: "12/03", saldo: 63831, entradas: 4800, saidas: -2600 },
  { date: "15/03", saldo: 62031, entradas: 3100, saidas: -4900 },
  { date: "18/03", saldo: 63231, entradas: 5600, saidas: -4400 },
  { date: "20/03", saldo: 66431, entradas: 7200, saidas: -4000 },
  { date: "23/03", saldo: 68631, entradas: 5800, saidas: -3600 },
  { date: "25/03", saldo: 72831, entradas: 8200, saidas: -4000 },
];

// Helpers
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "pago": case "efetivado": case "conciliado": return "bg-emerald-100 text-emerald-700";
    case "a_vencer": case "pendente": return "bg-amber-100 text-amber-700";
    case "vencido": case "divergente": return "bg-red-100 text-red-700";
    case "renegociado": return "bg-blue-100 text-blue-700";
    case "cancelado": return "bg-gray-100 text-gray-500";
    default: return "bg-gray-100 text-gray-600";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "pago": return "Pago";
    case "a_vencer": return "A Vencer";
    case "vencido": return "Vencido";
    case "renegociado": return "Renegociado";
    case "efetivado": return "Efetivado";
    case "pendente": return "Pendente";
    case "cancelado": return "Cancelado";
    case "conciliado": return "Conciliado";
    case "divergente": return "Divergente";
    default: return status;
  }
}
