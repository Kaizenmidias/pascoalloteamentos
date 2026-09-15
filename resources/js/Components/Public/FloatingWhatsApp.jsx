import { usePage } from '@inertiajs/react';
import { whatsappUrl } from '../../Support/whatsapp';

export default function FloatingWhatsApp() {
    const { props } = usePage();
    const number = props.whatsappNumber || undefined;
    const href = whatsappUrl({ number });

    return <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Falar pelo WhatsApp" title="Falar pelo WhatsApp" className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-50 grid size-14 cursor-pointer place-items-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,.28)] transition hover:scale-105 hover:shadow-[0_10px_28px_rgba(37,211,102,.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] tablet:right-7"><svg viewBox="0 0 24 24" aria-hidden="true" className="size-8 fill-current"><path d="M12 2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5.2-1.3A9.7 9.7 0 1 0 12 2Zm0 17.5a7.7 7.7 0 0 1-3.9-1.1l-.3-.2-3.1.8.8-3-.2-.3A7.7 7.7 0 1 1 12 19.5Zm4.2-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-1.4-.7-2.4-1.3-3.4-3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1.1 1.9-.8 3 .4 2.2 2 4.2 4.1 5.5 1.6 1 4.1 1.9 5.5.7.4-.4.7-1 .8-1.6 0-.2 0-.4-.2-.5l-.9-.6Z" /></svg></a>;
}
