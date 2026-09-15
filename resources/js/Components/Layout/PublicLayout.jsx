import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import FloatingWhatsApp from '../Public/FloatingWhatsApp';

export default function PublicLayout({ children, headerTone = 'auto' }) {
    return <div className="public-site flex min-h-screen flex-col"><SiteHeader tone={headerTone} /><main className="flex-1">{children}</main><SiteFooter /><FloatingWhatsApp /></div>;
}
