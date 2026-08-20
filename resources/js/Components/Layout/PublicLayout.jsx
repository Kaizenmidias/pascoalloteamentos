import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

export default function PublicLayout({ children }) {
    return <div className="public-site flex min-h-screen flex-col"><SiteHeader /><main className="flex-1">{children}</main><SiteFooter /></div>;
}
