const BASE = 'http://localhost:8080/api'

export type Kind = 'EXPENSE' | 'INCOME'

export interface CategorySummary {
    categoryId: number
    name: string
    kind: Kind
    total: number
}

export interface Summary {
    month: string
    income: number
    expense: number
    balance: number
    byCategory: CategorySummary[]
}

export async function getSummary(month?: string): Promise<Summary> {
    const url = month ? `${BASE}/summary?month=${month}` : `${BASE}/summary`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`summary ${res.status}`)
    return res.json()
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

export async function getCategories(): Promise<Category[]> {
    const res = await fetch(`${BASE}/categories`)
    if (!res.ok) throw new Error(`categories ${res.status}`)
    return res.json()
}

export async function getTransactions(): Promise<Transaction[]> {
    const res = await fetch(`${BASE}/transactions`)
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
