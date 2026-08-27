const icons = {
    instagram: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.4" cy="6.6" r="1" className="fill-current stroke-none" />
        </>
    ),
    facebook: <path className="fill-current stroke-none" d="M13.2 22v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V4.6c-.8-.1-1.7-.2-2.5-.2-2.5 0-4.2 1.5-4.2 4.3v2.2H7V14h2.8v8h3.4Z" />,
    youtube: (
        <>
            <path d="M21.3 7.1a2.8 2.8 0 0 0-2-2C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.3.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.2 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.7.5 7.3.5 7.3.5s5.6 0 7.3-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.9 29 29 0 0 0-.5-4.9Z" />
            <path d="m10 15.2 5.2-3.2L10 8.8v6.4Z" className="fill-current stroke-none" />
        </>
    ),
    linkedin: <path className="fill-current stroke-none" d="M5.3 7.8A2.3 2.3 0 1 0 5.3 3a2.3 2.3 0 0 0 0 4.7ZM3.3 21h4V9.2h-4V21Zm6.4 0h4v-6.6c0-1.7.3-3.4 2.5-3.4 2.1 0 2.2 2 2.2 3.5V21h4v-7.3c0-3.6-.8-6.3-4.9-6.3-2 0-3.3 1.1-3.9 2.1h-.1V7.9H9.7V21Z" />,
    whatsapp: <path className="fill-current stroke-none" d="M12 2a9.7 9.7 0 0 0-8.4 14.6L2.3 21.7l5.2-1.3A9.7 9.7 0 1 0 12 2Zm0 17.5a7.7 7.7 0 0 1-3.9-1.1l-.3-.2-3.1.8.8-3-.2-.3A7.7 7.7 0 1 1 12 19.5Zm4.2-5.8c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-1.4-.7-2.4-1.3-3.4-3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.8.8-1.1 1.9-.8 3 .4 2.2 2 4.2 4.1 5.5 1.6 1 4.1 1.9 5.5.7.4-.4.7-1 .8-1.6 0-.2 0-.4-.2-.5l-.9-.6Z" />,
};

export default function SocialIcon({ network, className = 'size-5' }) {
    const icon = icons[network];
    if (!icon) return null;

    return <svg viewBox="0 0 24 24" aria-hidden="true" className={`${className} shrink-0 fill-none stroke-current stroke-[1.8]`} strokeLinecap="round" strokeLinejoin="round">{icon}</svg>;
}
