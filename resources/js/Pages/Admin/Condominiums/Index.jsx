import AdminLayout from '../../../Components/Layout/AdminLayout';
import EntityTable from '../../../Components/Admin/EntityTable';
import Button from '../../../Components/UI/Button';
export default function Index({ items, filters, filterOptions }) { return <AdminLayout title="Condominios"><div className="mb-5 flex justify-end"><Button href="/admin/condominiums/create">Novo condominio</Button></div><EntityTable items={items} filters={filters} filterOptions={filterOptions} basePath="/admin/condominiums" publicPath="/condominios" typeLabel="Condominio" entityType="condominium" typeRelation="condominium_type" /></AdminLayout>; }
