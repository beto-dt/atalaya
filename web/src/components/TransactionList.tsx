import { deleteTransaction, type Transaction } from '../lib/api'

const money = (n: number) =>
    n.toLocaleString('es-EC', { style: 'currency', currency: 'USD' })

export function TransactionList({ items, onChanged }: {
    items: Transaction[]
    onChanged: () => void
}) {
    async function remove(id: number) {
        await deleteTransaction(id)
        onChanged()
    }

    if (items.length === 0) {
        return <p className="text-sm text-ink-soft">Sin movimientos todavía — registra el primero arriba.</p>
    }

    return (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface/50">
            {items.map((t) => (
                <li key={t.id} className="group flex items-center gap-4 px-5 py-3">
                    <div className="flex-1">
                        <p className="text-sm">{t.description}</p>
                        <p className="text-xs text-ink-soft">{t.categoryName} · {t.occurredOn}</p>
                    </div>
                    <span className={`font-mono text-sm font-bold ${t.kind === 'INCOME' ? 'text-up' : 'text-down'}`}>
            {t.kind === 'INCOME' ? '+' : '−'}{money(t.amount)}
          </span>
                    <button onClick={() => remove(t.id)}
                            className="text-xs text-ink-soft opacity-0 transition group-hover:opacity-100 hover:text-down">
                        borrar
                    </button>
                </li>
            ))}
        </ul>
    )
}
