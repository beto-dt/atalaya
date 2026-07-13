import { useState, type FormEvent } from 'react'
import { createTransaction, type Category } from '../lib/api'

export function AddTransaction({ categories, onCreated }: {
    categories: Category[]
    onCreated: () => void
}) {
    const [description, setDescription] = useState('')
    const [amount, setAmount] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [occurredOn, setOccurredOn] = useState(() => new Date().toISOString().slice(0, 10))
    const [busy, setBusy] = useState(false)

    const canSave = description.trim() !== '' && Number(amount) > 0 && categoryId !== ''

    async function submit(e: FormEvent) {
        e.preventDefault()
        if (!canSave || busy) return
        setBusy(true)
        try {
            await createTransaction({
                description: description.trim(),
                amount: Number(amount),
                occurredOn,
                categoryId: Number(categoryId),
            })
            setDescription('')
            setAmount('')
            onCreated()
        } finally {
            setBusy(false)
        }
    }

    const field = 'rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent'

    return (
        <form onSubmit={submit} className="rounded-2xl border border-line bg-surface/50 p-5">
            <p className="mb-3 text-xs uppercase tracking-widest text-ink-soft">Registrar movimiento</p>
            <div className="flex flex-col gap-3 sm:flex-row">
                <input className={`${field} flex-1`} placeholder="Descripción"
                       value={description} onChange={(e) => setDescription(e.target.value)} maxLength={120} />
                <input className={`${field} w-full sm:w-28`} placeholder="0.00" inputMode="decimal"
                       value={amount} onChange={(e) => setAmount(e.target.value)} />
                <select className={`${field} w-full sm:w-44`} value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="" disabled>Categoría</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <input type="date" className={field} value={occurredOn}
                       onChange={(e) => setOccurredOn(e.target.value)} />
                <button type="submit" disabled={!canSave || busy}
                        className="rounded-xl bg-accent px-5 py-2 text-sm font-bold text-on-accent disabled:opacity-40">
                    {busy ? '…' : 'Guardar'}
                </button>
            </div>
        </form>
    )
}
