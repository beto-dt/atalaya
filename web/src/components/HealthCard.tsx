import type { HealthScore } from '../lib/api'

const LEVELS: Record<string, { label: string; color: string }> = {
    SOLIDA: { label: 'Sólida', color: 'text-up' },
    ESTABLE: { label: 'Estable', color: 'text-accent' },
    ATENCION: { label: 'Atención', color: 'text-warn' },
    EN_RIESGO: { label: 'En riesgo', color: 'text-down' },
}

function ComponentRow({ label, detail, points, max }: {
    label: string; detail: string; points: number; max: number
}) {
    return (
        <div className="flex items-baseline justify-between text-sm">
      <span>
        {label} <span className="text-xs text-ink-soft">{detail}</span>
      </span>
            <span className="font-mono text-xs text-ink-soft">{points}/{max}</span>
        </div>
    )
}

export function HealthCard({ health }: { health: HealthScore }) {
    if (health.score == null) {
        return (
            <section className="rounded-2xl border border-line bg-surface/50 p-5">
                <p className="text-xs uppercase tracking-widest text-ink-soft">Salud financiera</p>
                <p className="mt-2 text-sm text-ink-soft">Sin ingresos este mes — registra tu sueldo para calcular el score.</p>
            </section>
        )
    }

    const level = LEVELS[health.level]

    return (
        <section className="rounded-2xl border border-line bg-surface/50 p-5">
            <p className="mb-3 text-xs uppercase tracking-widest text-ink-soft">Salud financiera</p>
            <div className="flex items-center gap-6">
                <div className="text-center">
                    <p className={`font-mono text-5xl font-bold ${level.color}`}>{health.score}</p>
                    <p className={`text-xs font-bold uppercase tracking-widest ${level.color}`}>{level.label}</p>
                </div>
                <div className="flex flex-1 flex-col gap-2">
                    <ComponentRow
                        label="Ahorro"
                        detail={`${Math.round(health.savingsRate * 100)}% del ingreso`}
                        points={health.components.savings} max={50}
                    />
                    <ComponentRow
                        label="Presupuestos"
                        detail={health.budgetsTotal === 0 ? 'sin definir' : `${health.budgetsOk}/${health.budgetsTotal} en línea`}
                        points={health.components.budgets} max={30}
                    />
                    <ComponentRow
                        label="Gastos fijos"
                        detail={`${Math.round(health.fixedRatio * 100)}% del ingreso`}
                        points={health.components.fixedLoad} max={20}
                    />
                </div>
            </div>
        </section>
    )
}
