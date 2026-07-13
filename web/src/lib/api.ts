const BASE = 'http://localhost:8080/api'

export type Kind = 'EXPENSE' | 'INCOME'

export interface CategorySummary {
    categoryId: number
    name: string
    kind: Kind
    total: number
    budget: number | null
}

export interface Summary {
    month: string
    income: number
    expense: number
    balance: number
    byCategory: CategorySummary[]
}

export interface Category {
    id: number
    name: string
    kind: Kind
}

export interface Transaction {
    id: number
    description: string
    amount: number
    occurredOn: string
    categoryId: number
    categoryName: string
    kind: Kind
}

export interface CreateTransaction {
    description: string
    amount: number
    occurredOn: string
    categoryId: number
}

export async function getSummary(month?: string): Promise<Summary> {
    const url = month ? `${BASE}/summary?month=${month}` : `${BASE}/summary`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`summary ${res.status}`)
    return res.json()
}

export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE}/categories`)
    if (!res.ok) throw new Error(`categories ${res.status}`)
    return res.json()
}

export async function getTransactions(month?: string): Promise<Transaction[]> {
    const url = month ? `${BASE}/transactions?month=${month}` : `${BASE}/transactions`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`transactions ${res.status}`)
    return res.json()
}

export async function createTransaction(body: CreateTransaction): Promise<Transaction> {
    const res = await fetch(`${BASE}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    if (!res.ok) throw new Error(`create ${res.status}`)
    return res.json()
}

export async function deleteTransaction(id: number): Promise<void> {
    const res = await fetch(`${BASE}/transactions/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error(`delete ${res.status}`)
}

export async function putBudget(categoryId: number, monthlyLimit: number): Promise<void> {
    const res = await fetch(`${BASE}/budgets/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyLimit }),
    })
    if (!res.ok) throw new Error(`budget ${res.status}`)
}

export interface HealthScore {
    month: string
    score: number | null
    level: 'SOLIDA' | 'ESTABLE' | 'ATENCION' | 'EN_RIESGO' | 'SIN_DATOS'
    savingsRate: number
    fixedRatio: number
    budgetsOk: number
    budgetsTotal: number
    components: { savings: number; budgets: number; fixedLoad: number }
}

export async function getHealth(month?: string): Promise<HealthScore> {
    const url = month ? `${BASE}/health?month=${month}` : `${BASE}/health`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`health ${res.status}`)
    return res.json()
}
