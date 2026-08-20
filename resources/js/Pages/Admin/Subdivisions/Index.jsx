import AdminLayout from '../../../Components/Layout/AdminLayout';
import EntityTable from '../../../Components/Admin/EntityTable';
import Button from '../../../Components/UI/Button';
export default function Index({ items, filters, filterOptions }) { return <AdminLayout title="Loteamentos"><div className="mb-5 flex justify-end"><Button href="/admin/subdivisions/create">Novo loteamento</Button></div><EntityTable items={items} filters={filters} filterOptions={filterOptions} basePath="/admin/subdivisions" publicPath="/loteamentos" typeLabel="Loteamento" entityType="subdivision" typeRelation="subdivision_type" /></AdminLayout>; }
