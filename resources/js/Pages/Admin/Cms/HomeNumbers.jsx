import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Button from '../../../Components/UI/Button';

const blankItem = { value: '', title: '', description: '', sort_order: 0, is_active: true };

function NumberRow({ item, index, data, setData, remove }) {
    const update = (key, value) => setData('numbers', data.numbers.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));

    return (
        <div className="grid gap-4 rounded-xl border border-line bg-surface p-4 tablet:grid-cols-2 desktop:grid-cols-5">
            <input className="admin-input" placeholder="Valor" value={item.value} onChange={(e) => update('value', e.target.value)} />
            <input className="admin-input" placeholder="Título" value={item.title} onChange={(e) => update('title', e.target.value)} />
            <input className="admin-input" placeholder="Descrição" value={item.description || ''} onChange={(e) => update('description', e.target.value)} />
            <input className="admin-input" type="number" min="0" placeholder="Ordem" value={item.sort_order ?? 0} onChange={(e) => update('sort_order', e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={Boolean(item.is_active)} onChange={(e) => update('is_active', e.target.checked)} />
                Ativo
                <Button type="button" variant="secondary" className="ml-auto" onClick={remove}>Remover</Button>
            </label>
        </div>
    );
}

export default function HomeNumbers({ numbers = [] }) {
    const { data, setData, put, processing } = useForm({
        numbers: numbers.length ? numbers : [blankItem],
    });

    const submit = (e) => {
        e.preventDefault();
        put('/admin/cms/home-numbers', { preserveScroll: true });
    };

    return (
        <AdminLayout title="Números da Home">
            <form onSubmit={submit} className="space-y-6">
                <section className="rounded-xl border border-line bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-medium text-ink">Nossos números</h2>
                            <p className="mt-1 text-sm text-muted">Edite os números exibidos na Home sem mexer no código.</p>
                        </div>
                        <Button type="button" variant="secondary" onClick={() => setData('numbers', [...data.numbers, { ...blankItem, sort_order: data.numbers.length }])}>Adicionar item</Button>
                    </div>
                    <div className="space-y-4">
                        {data.numbers.map((item, index) => (
                            <NumberRow
                                key={index}
                                item={item}
                                index={index}
                                data={data}
                                setData={setData}
                                remove={() => setData('numbers', data.numbers.filter((_, rowIndex) => rowIndex !== index))}
                            />
                        ))}
                    </div>
                </section>
                <Button type="submit" disabled={processing}>Salvar números</Button>
            </form>
        </AdminLayout>
    );
}
