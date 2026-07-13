import { useState, type FormEvent } from 'react'
import { login } from '../lib/api'

export function Login({ onLogged }: { onLogged: () => void }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState(false)

    async function submit(e: FormEvent) {
        e.preventDefault()
        if (busy) return
        setBusy(true)
        setError(false)
        try {
            await login(email.trim(), password)
            onLogged()
        } catch {
            setError(true)
        } finally {
            setBusy(false)
        }
    }

    const field =
        'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-accent'

    return (
        <div className="flex min-h-screen items-center justify-center px-6">
            <form onSubmit={submit} className="w-full max-w-sm">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl font-bold">
                        Atalaya <span className="text-accent">▮</span>
                    </h1>
                    <p className="text-sm text-ink-soft">tus finanzas, vigiladas desde la torre</p>
                </div>
                <div className="flex flex-col gap-3">
                    <input
                        className={field}
                        type="email"
                        placeholder="Email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className={field}
                        type="password"
                        placeholder="Contraseña"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="text-sm text-down">Credenciales incorrectas.</p>}
                    <button
                        type="submit"
                        disabled={busy || !email || !password}
                        className="rounded-xl bg-accent py-3 text-sm font-bold text-on-accent disabled:opacity-40"
                    >
                        {busy ? 'Entrando…' : 'Entrar a la torre'}
                    </button>
                </div>
            </form>
        </div>
    )
}
