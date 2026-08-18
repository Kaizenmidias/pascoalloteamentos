import { useEffect, useMemo, useState } from 'react';

function uniqueCities(items) {
    return Array.from(new Map(items.filter((item) => item.city?.id).map((item) => [item.city.id, item.city])).values())
        .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
}

export default function HomeEntityFilter({ categories = [], items = [], onChange }) {
    const [category, setCategory] = useState(categories[0]?.slug || '');
    const [cityId, setCityId] = useState('');
    const categoryItems = useMemo(() => items.filter((item) => item.category === category), [category, items]);
    const cities = useMemo(() => uniqueCities(categoryItems), [categoryItems]);

    useEffect(() => {
        if (cityId && cities.some((city) => String(city.id) === String(cityId))) return;
        const nextCityId = cities[0]?.id || '';
        setCityId(nextCityId);
        onChange?.({ category, cityId: nextCityId });
    }, [category, cities, cityId, onChange]);

    const chooseCategory = (nextCategory) => {
        setCategory(nextCategory);
        setCityId('');
    };

    const chooseCity = (nextCityId) => {
        setCityId(nextCityId);
        onChange?.({ category, cityId: nextCityId });
    };

    return (
        <div className="mx-auto max-w-[76rem] py-10">
            <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden tablet:gap-5">
                {categories.map((item) => (
                    <button key={item.slug} type="button" onClick={() => chooseCategory(item.slug)} className={`min-h-[5.2rem] min-w-[12rem] shrink-0 rounded-[10px] border bg-white px-6 py-4 text-center text-[1.1rem] transition tablet:min-w-[12.8rem] tablet:text-[1.25rem] ${category === item.slug ? 'border-[#1f4e5f] text-[#1f4e5f]' : 'border-[#dedede] text-[#78909a] hover:border-[#9eb0b7]'}`}>
                        {item.name}
                    </button>
                ))}
            </div>

            <div className="mt-10">
                <p className="mb-4 text-xs font-medium uppercase tracking-[.12em] text-brand">Cidades</p>
                <div className="flex flex-wrap gap-x-9 gap-y-3 text-[1.1rem] tablet:gap-x-12">
                    {cities.map((city) => <button key={city.id} type="button" onClick={() => chooseCity(city.id)} className={`transition ${String(cityId) === String(city.id) ? 'font-semibold text-[#123f4e]' : 'text-[#78909a] hover:text-[#123f4e]'}`}>{city.name}{city.state?.code ? `/${city.state.code}` : ''}</button>)}
                </div>
            </div>
        </div>
    );
}
