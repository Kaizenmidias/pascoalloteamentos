import { Link } from '@inertiajs/react';

const variants = {
    primary: 'bg-brand text-white border-brand-dark hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-60',
    secondary: 'brand-button--secondary',
};

export default function Button({ href, type = 'button', variant = 'primary', className = '', children, ...props }) {
    const classes = `brand-button min-h-11 rounded-[7px] px-6 py-2.5 text-xs focus:outline-none ${variants[variant] || variants.primary} ${className}`;
    const content = children || props['aria-label'] || props.title || 'Acao';

    return href
        ? <Link href={href} className={classes} {...props}>{content}</Link>
        : <button type={type} className={classes} {...props}>{content}</button>;
}
