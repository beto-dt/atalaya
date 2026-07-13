import type { CategorySummary } from '../lib/api'

const money = (n: number) =>
    n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })

export function CategoryBars({ items }: { items: CategorySummary[] }) {
    const expenses = items.filter((c) => c.kind === 'EXPENSE')
    if (expenses.length === 0) return null
    const max = Math.max(...expenses.map((c) => c.total))

    return (
        <section className="rounded-2xl border border-line bg-surface/50 p-5">
            <p className="mb-4 text-xs uppercase tracking-widest text-ink-soft">Gastos por categoría</p>
            <div className="flex flex-col gap-3">
                {expenses.map((c) => (
                    <div key={c.categoryId}>
                        <div className="mb-1 flex justify-between text-sm">
                            <span>{c.name}</span>
                            <span className="font-mono text-ink-soft">{money(c.total)}</span>
                        </div>
                        <div className="h-2 rounded-full bg-line">
                            <div
                                className="h-2 rounded-full bg-accent transition-all duration-500"
                                style={{ width: `${(c.total / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
