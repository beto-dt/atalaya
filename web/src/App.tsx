import { useCallback, useEffect, useState } from 'react'
import {
    getCategories, getSummary, getTransactions,
    type Category, type Summary, type Transaction,
} from './lib/api'
import { AddTransaction } from './components/AddTransaction'
import { TransactionList } from './components/TransactionList'
import { CategoryBars } from './components/CategoryBars'

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
    const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
    const [summary, setSummary] = useState<Summary | null>(null)
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [error, setError] = useState(false)

    const shiftMonth = (delta: number) => {
        const [y, m] = month.split('-').map(Number)
        const d = new Date(y, m - 1 + delta, 1)
        setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
    }

    const reload = useCallback(() => {
        Promise.all([getSummary(month), getTransactions(month)])
            .then(([s, t]) => { setSummary(s); setTransactions(t) })
            .catch(() => setError(true))
    }, [month])

    useEffect(() => {
        getCategories().then(setCategories).catch(() => setError(true))
    }, [])

    useEffect(() => {
        reload()
    }, [reload])

    return (
        <div className="mx-auto max-w-3xl px-6 py-10">
            <header className="mb-10 flex items-end justify-between">
                <div>
                    <h1 className="font-display text-3xl font-bold">
                        Atalaya <span className="text-accent">▮</span>
                    </h1>
                    <p className="text-sm text-ink-soft">tus finanzas, vigiladas desde la torre</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => shiftMonth(-1)}
                        className="rounded-lg border border-line px-3 py-1 text-ink-soft hover:text-accent"
                    >
                        ‹
                    </button>
                    <span className="font-mono text-sm">{month}</span>
                    <button
                        onClick={() => shiftMonth(1)}
                        className="rounded-lg border border-line px-3 py-1 text-ink-soft hover:text-accent"
                    >
                        ›
                    </button>
                </div>
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

                {summary && <CategoryBars items={summary.byCategory} />}

                <AddTransaction categories={categories} onCreated={reload} />
                <TransactionList items={transactions} onChanged={reload} />
            </div>
        </div>
    )
}
