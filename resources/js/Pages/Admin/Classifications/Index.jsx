import { router, useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import AdminTable from '../../../Components/Admin/AdminTable';
import Button from '../../../Components/UI/Button';
import Field from '../../../Components/Forms/Field';
import SelectField from '../../../Components/Forms/SelectField';

const emptyForm = {
    name: '',
    slug: '',
    sort_order: 0,
    is_active: true,
    icon: '',
};

function GroupCard({ group }) {
    const { data, setData, post, processing, reset, errors } = useForm(emptyForm);

    const submit = (e) => {
        e.preventDefault();
        post(`/admin/classifications/${group.slug}`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div>
                <h2 className="text-lg font-medium text-gray-900">{group.label}</h2>
                <p className="mt-1 text-sm text-gray-500">Gerencie os itens usados nos formulários e filtros públicos.</p>
            </div>

            <form onSubmit={submit} className="grid gap-4 tablet:grid-cols-2">
                <Field label="Nome" value={data.name} onChange={(e) => setData('name', e.target.value)} error={errors.name} />
                <Field label="Slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} error={errors.slug} />
                <Field label="Ordem" type="number" min="0" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} error={errors.sort_order} />
                {group.slug === 'features' && <Field label="Ícone (nome ou classe)" value={data.icon} onChange={(e) => setData('icon', e.target.value)} error={errors.icon} />}
                <SelectField
                    label="Situação"
                    options={[
                        { id: 1, name: 'Ativo' },
                        { id: 0, name: 'Inativo' },
                    ]}
                    value={data.is_active ? 1 : 0}
                    onChange={(e) => setData('is_active', e.target.value === '1')}
                />
                <div className="tablet:col-span-2">
                    <Button type="submit" disabled={processing}>Adicionar</Button>
                </div>
            </form>

            <AdminTable
                headers={['Nome', 'Slug', 'Ordem', 'Situação', 'Ações']}
                items={{ data: group.items }}
                empty="Nenhuma classificação cadastrada."
                renderRow={(item) => <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-5 py-4 text-gray-500">{item.slug}</td>
                    <td className="px-5 py-4 text-gray-500">{item.sort_order}</td>
                    <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs ${item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                            {item.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td className="px-5 py-4">
                        <div className="flex gap-3">
                            <QuickEdit group={group.slug} item={item} />
                            <button
                                type="button"
                                onClick={() => confirm('Remover este item?') && router.delete(`/admin/classifications/${group.slug}/${item.id}`, { preserveScroll: true })}
                                className="text-red-700"
                            >
                                Excluir
                            </button>
                        </div>
                    </td>
                </tr>}
            />
        </section>
    );
}

function QuickEdit({ group, item }) {
    const { data, setData, put, processing } = useForm({
        name: item.name,
        slug: item.slug,
        sort_order: item.sort_order,
        is_active: Boolean(item.is_active),
        icon: item.icon || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(`/admin/classifications/${group}/${item.id}`, { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
            <label className="block">
                <span className="admin-label">Nome</span>
                <input className="admin-input w-40" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            </label>
            <label className="block">
                <span className="admin-label">Slug</span>
                <input className="admin-input w-40" value={data.slug} onChange={(e) => setData('slug', e.target.value)} />
            </label>
            <label className="block">
                <span className="admin-label">Ordem</span>
                <input className="admin-input w-24" type="number" min="0" value={data.sort_order} onChange={(e) => setData('sort_order', e.target.value)} />
            </label>
            {group === 'features' && <label className="block"><span className="admin-label">Ícone</span><input className="admin-input w-40" value={data.icon} onChange={(e) => setData('icon', e.target.value)} /></label>}
            <Button type="submit" variant="secondary" disabled={processing}>Salvar</Button>
        </form>
    );
}

export default function Index({ groups = [] }) {
    return (
        <AdminLayout title="Classificações">
            <div className="space-y-8">
                {groups.map((group) => <GroupCard key={group.slug} group={group} />)}
            </div>
        </AdminLayout>
    );
}
