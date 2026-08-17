import { useEffect, useMemo, useState } from 'react';

function uniqueBySlug(items) {
    return Array.from(new Map(items.filter(Boolean).map((item) => [item.slug, item])).values());
}

export default function HomeEntityFilter({ categories = [], items = [], onChange }) {
    const [category, setCategory] = useState(categories[0]?.slug || '');
    const [city, setCity] = useState('');
    const [enterprise, setEnterprise] = useState('');

    const categoryItems = useMemo(() => items.filter((item) => item.category === category), [category, items]);
    const cities = useMemo(() => uniqueBySlug(categoryItems.map((item) => item.city)), [categoryItems]);
    const cityItems = useMemo(() => categoryItems.filter((item) => !city || item.city?.slug === city), [categoryItems, city]);

    useEffect(() => {
        if (city && cities.some((item) => item.slug === city)) return;
        const nextCity = cities[0]?.slug || '';
        setCity(nextCity);
        setEnterprise('');
        onChange?.({ category, city: nextCity, enterprise: '' });
    }, [category, cities, city, onChange]);

    const chooseCategory = (nextCategory) => {
        setCategory(nextCategory);
        setCity('');
        setEnterprise('');
    };

    const chooseCity = (nextCity) => {
        setCity(nextCity);
        setEnterprise('');
        onChange?.({ category, city: nextCity, enterprise: '' });
    };

    const chooseEnterprise = (slug) => {
        const next = enterprise === slug ? '' : slug;
        setEnterprise(next);
        onChange?.({ category, city, enterprise: next });
    };

    return (
        <div className="mx-auto max-w-[76rem] py-10">
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden tablet:gap-5">
                {categories.map((item) => (
                    <button key={item.slug} type="button" onClick={() => chooseCategory(item.slug)} className={`min-h-[6.2rem] min-w-[12.8rem] shrink-0 rounded-[10px] border bg-white px-7 py-5 text-[1.2rem] transition tablet:text-[1.35rem] ${category === item.slug ? 'border-[#1f4e5f] text-[#1f4e5f]' : 'border-[#dedede] text-[#78909a] hover:border-[#9eb0b7]'}`}>
                        {item.name}
                    </button>
                ))}
            </div>

            <div className="mt-12 flex flex-wrap gap-x-9 gap-y-3 text-[1.1rem] tablet:gap-x-12">
                {cities.map((item) => <button key={item.slug} type="button" onClick={() => chooseCity(item.slug)} className={`transition ${city === item.slug ? 'font-semibold text-[#123f4e]' : 'text-[#78909a] hover:text-[#123f4e]'}`}>{item.name}{item.state?.code && item.state.code !== 'PR' ? `/${item.state.code}` : ''}</button>)}
            </div>

            {cityItems.length > 0 && (
                <div className="mt-8 border-t border-line pt-6">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[.12em] text-brand">Empreendimento</p>
                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm tablet:text-base">
                        {cityItems.map((item) => <button key={`${item.category}-${item.id}`} type="button" onClick={() => chooseEnterprise(item.slug)} className={`text-left transition ${enterprise === item.slug ? 'font-semibold text-[#123f4e]' : 'text-[#78909a] hover:text-[#123f4e]'}`}>{item.title}</button>)}
                    </div>
                </div>
            )}
        </div>
    );
}
