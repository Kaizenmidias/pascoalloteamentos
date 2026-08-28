import Field from '../Forms/Field';
import SelectField from '../Forms/SelectField';

const icons = [
    { id: 'building', name: 'Empreendimento' },
    { id: 'units', name: 'Unidades' },
    { id: 'area', name: 'Área' },
    { id: 'availability', name: 'Disponibilidade' },
];

export const emptySummaryFacts = () => Array.from({ length: 4 }, () => ({ label: '', value: '', icon: 'building' }));

export default function CondominiumSummaryFacts({ value = [], onChange }) {
    const rows = emptySummaryFacts().map((fallback, index) => ({ ...fallback, ...(value[index] || {}) }));
    const update = (index, key, nextValue) => onChange(rows.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: nextValue } : row));

    return (
        <section className="rounded-card bg-white p-6 shadow-card">
            <h2 className="text-lg font-medium text-ink">Informações resumidas</h2>
            <p className="mt-1 text-sm text-muted">Preencha até quatro itens. Cards incompletos não serão exibidos no site.</p>
            <div className="mt-5 grid gap-4 tablet:grid-cols-2">
                {rows.map((row, index) => (
                    <div key={index} className="grid gap-3 rounded-xl border border-line bg-surface p-4 tablet:grid-cols-2">
                        <div className="tablet:col-span-2 text-xs font-medium uppercase text-brand">Informação {index + 1}</div>
                        <Field label="Título" value={row.label} onChange={(event) => update(index, 'label', event.target.value)} />
                        <Field label="Valor" value={row.value} onChange={(event) => update(index, 'value', event.target.value)} />
                        <div className="tablet:col-span-2"><SelectField label="Ícone" options={icons} value={row.icon} onChange={(event) => update(index, 'icon', event.target.value)} /></div>
                    </div>
                ))}
            </div>
        </section>
    );
}
