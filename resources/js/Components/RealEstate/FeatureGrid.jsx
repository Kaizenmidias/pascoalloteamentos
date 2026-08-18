export default function FeatureGrid({ items = [] }) {
    return (
        <ul className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
            {items.map((item) => (
                <li key={item.id} className="grid min-h-28 place-items-center rounded-card border border-line bg-white p-5 text-center text-sm font-light text-ink shadow-[0_4px_12px_rgba(17,17,17,0.05)] transition-[box-shadow,border-color] duration-300 hover:border-[#d9d9d9] hover:shadow-[0_6px_16px_rgba(17,17,17,0.07)]">
                    <span className="mb-2 text-2xl text-brand">⌁</span>
                    {item.name}
                </li>
            ))}
        </ul>
    );
}
