import { useCallback, useEffect, useState } from 'react'
import {
    getCategories, getSummary, getTransactions,
    type Category, type Summary, type Transaction,
} from './lib/api'
import { AddTransaction } from './components/AddTransaction'
import { TransactionList } from './components/TransactionList'

const money = (n: number) =>
    n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'up' | 'down' }) {
    const color = tone === 'up' ? 'text-up' : tone === 'down' ? 'text-down' : 'text-ink'
    return (
        <div className="flex-1 rounded-2xl border border-line bg-surface p-5">
            <p className="text-xs uppercase tracking-widest text-ink-soft">{label}</p>
            <p className={`mt-1 font-mono text-2xl font-bold ${color}`}>{money(value)}</p>
        </div>
    )
}

export default function App() {
    const [summary, setSummary] = useState<Summary | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [error, setError] = useState(false)

    const reload = useCallback(() => {
        Promise.all([getSummary(), getTransactions()])
            .then(([s, t]) => { setSummary(s); setTransactions(t) })
            .catch(() => setError(true))
    }, [])

    useEffect(() => {
        getCategories().then(setCategories).catch(() => setError(true))
        reload()
    }, [reload])

    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-10">
                <h1 className="font-display text-3xl font-bold">
                    Atalaya <span className="text-accent">▮</span>
                </h1>
                <p className="text-sm text-ink-soft">tus finanzas, vigiladas desde la torre</p>
            </header>

            {error && (
                <p className="mb-6 text-down">No pude hablar con la API — ¿está corriendo el backend?</p>
            )}

            <div className="flex flex-col gap-6">
                {summary && (
                    <section className="flex flex-col gap-4 sm:flex-row">
                        <Stat label="Balance" value={summary.balance} />
                        <Stat label="Ingresos" value={summary.income} tone="up" />
                        <Stat label="Gastos" value={summary.expense} tone="down" />
                    </section>
                )}

                <AddTransaction categories={categories} onCreated={reload} />
                <TransactionList items={transactions} onChanged={reload} />
            </div>
        </div>
    )
}
