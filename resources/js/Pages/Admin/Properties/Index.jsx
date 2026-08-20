import AdminLayout from '../../../Components/Layout/AdminLayout';
import EntityTable from '../../../Components/Admin/EntityTable';
import Button from '../../../Components/UI/Button';
export default function Index({ items, filters, filterOptions }) { return <AdminLayout title="Imoveis"><div className="mb-5 flex justify-end"><Button href="/admin/properties/create">Novo imovel</Button></div><EntityTable items={items} filters={filters} filterOptions={filterOptions} basePath="/admin/properties" publicPath="/imoveis" typeLabel="Imovel" entityType="property" typeRelation="property_type" /></AdminLayout>; }
