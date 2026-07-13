import { useState } from 'react'
import { putBudget, type CategorySummary } from '../lib/api'

const money = (n: number) =>
    n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })

function barColor(pct: number) {
    if (pct >= 100) return 'bg-down'
    if (pct >= 75) return 'bg-warn'
    return 'bg-accent'
}

function Row({ item, editing, onSaved }: {
    item: CategorySummary
    editing: boolean
    onSaved: () => void
}) {
    const [value, setValue] = useState(item.budget?.toString() ?? '')
    const hasBudget = item.budget != null && item.budget > 0
    const pct = hasBudget ? (item.total / item.budget!) * 100 : 0

    async function save() {
        const limit = Number(value)
        if (limit > 0 && limit !== item.budget) {
            await putBudget(item.categoryId, limit)
            onSaved()
        }
    }

    return (
        <div>
            <div className="mb-1 flex items-center justify-between text-sm">
                <span>{item.name}</span>
                <span className="flex items-center gap-2 font-mono text-ink-soft">
          {money(item.total)}
                    {hasBudget && <span className="text-xs">/ {money(item.budget!)}</span>}
                    {hasBudget && (
                        <span className={`text-xs font-bold ${pct >= 100 ? 'text-down' : pct >= 75 ? 'text-warn' : 'text-up'}`}>
              {Math.round(pct)}%
            </span>
                    )}
                    {editing && (
                        <input
                            className="w-20 rounded-lg border border-line bg-bg px-2 py-0.5 text-right text-xs outline-none focus:border-accent"
                            placeholder="límite"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            onBlur={save}
                            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                        />
                    )}
        </span>
            </div>
            <div className="h-2 rounded-full bg-line">
                {hasBudget ? (
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${barColor(pct)}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                ) : (
                    <div className="h-2 w-full rounded-full bg-line" title="Sin presupuesto" />
                )}
            </div>
        </div>
    )
}

export function CategoryBars({ items, onChanged }: {
    items: CategorySummary[]
    onChanged: () => void
}) {
    const [editing, setEditing] = useState(false)
    const expenses = items.filter((c) => c.kind === 'EXPENSE')
    if (expenses.length === 0) return null

    return (
        <section className="rounded-2xl border border-line bg-surface/50 p-5">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-ink-soft">Gastos vs presupuesto</p>
                <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs text-ink-soft hover:text-accent"
                >
                    {editing ? 'listo' : 'editar presupuestos'}
                </button>
            </div>
            <div className="flex flex-col gap-3">
                {expenses.map((c) => (
                    <Row key={c.categoryId} item={c} editing={editing} onSaved={onChanged} />
                ))}
            </div>
        </section>
    )
}
