const BASE = 'http://localhost:8080/api'
const TOKEN_KEY = 'atalaya_token'

// ---- Token management ----

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
}

let onUnauthorized: (() => void) | null = null

/** App registers what to do when any request comes back 401 (token expired/invalid). */
export function setOnUnauthorized(callback: () => void) {
    onUnauthorized = callback
}

/** Single door for every API call: attaches the token, handles 401 globally. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const token = getToken()
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
            ...(init?.headers ?? {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    })
    if (res.status === 401) {
        setToken(null)
        onUnauthorized?.()
        throw new Error('unauthorized')
    }
    if (!res.ok) throw new Error(`${path} ${res.status}`)
    if (res.status === 204) return undefined as T
    return res.json()
}

// ---- Auth ----

export async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
    if (!res.ok) throw new Error('bad_credentials')
    const data = (await res.json()) as { token: string }
    setToken(data.token)
}

export function logout() {
    setToken(null)
}

// ---- Types ----

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

// ---- Endpoints ----

export function getSummary(month?: string): Promise<Summary> {
    return request(month ? `/summary?month=${month}` : '/summary')
}

export function getCategories(): Promise<Category[]> {
    return request('/categories')
}

export function getTransactions(month?: string): Promise<Transaction[]> {
    return request(month ? `/transactions?month=${month}` : '/transactions')
}

export function createTransaction(body: CreateTransaction): Promise<Transaction> {
    return request('/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
}

export function deleteTransaction(id: number): Promise<void> {
    return request(`/transactions/${id}`, { method: 'DELETE' })
}

export function putBudget(categoryId: number, monthlyLimit: number): Promise<void> {
    return request(`/budgets/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyLimit }),
    })
}

export function getHealth(month?: string): Promise<HealthScore> {
    return request(month ? `/health?month=${month}` : '/health')
}
