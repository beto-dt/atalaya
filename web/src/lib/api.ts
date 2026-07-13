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
