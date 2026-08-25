import { useMemo, useState } from 'react';
import { useForm } from '@inertiajs/react';
import AdminLayout from '../../../Components/Layout/AdminLayout';
import Button from '../../../Components/UI/Button';
import Field from '../../../Components/Forms/Field';

const blankSlide = { image: '', title: '', excerpt: '' };
const blankDifferential = { title: '', text: '' };
const defaultHomeNumbers = [
    { value: '20+', title: 'Anos de experiência', description: 'de atuação no mercado.' },
    { value: '15+', title: 'Empreendimentos', description: 'entregues com excelência.' },
    { value: '2+', title: 'Cidades', description: 'com presença consolidada.' },
    { value: '2', title: 'Distritos', description: 'atendidos pela empresa.' },
];

export default function Home({ homeHero = {}, homeDifferentials = [], homeNumbers = [] }) {
    const safeHero = useMemo(() => (homeHero && typeof homeHero === 'object' && !Array.isArray(homeHero) ? homeHero : {}), [homeHero]);
    const safeDifferentials = useMemo(() => (Array.isArray(homeDifferentials)
        ? homeDifferentials.filter((item) => item && typeof item === 'object')
        : []), [homeDifferentials]);
    const safeNumbers = useMemo(() => (Array.isArray(homeNumbers) ? homeNumbers : []), [homeNumbers]);

    const initialHero = useMemo(() => ({
        title: safeHero.title || 'Encontre o lugar onde sua próxima história começa.',
        description: safeHero.description || 'Empreendimentos de alto padrão, condomínios e loteamentos planejados para viver melhor.',
        slides: Array.isArray(safeHero.slides) && safeHero.slides.length ? safeHero.slides.filter((slide) => slide && typeof slide === 'object') : [{ ...blankSlide, image: '/reference-assets/hero-home.jpg' }],
    }), [safeHero]);

    const initialDifferentials = useMemo(() => (
        safeDifferentials.length ? safeDifferentials : [
            { title: 'Arquitetura autoral', text: 'Projetos exclusivos desenvolvidos para unir estética, funcionalidade e conforto.' },
            { title: 'Localizações estratégicas', text: 'Empreendimentos em regiões com alto potencial de valorização.' },
            { title: 'Sustentabilidade', text: 'Práticas conscientes e soluções inteligentes para reduzir impactos ambientais.' },
            { title: 'Alto padrão construtivo', text: 'Materiais selecionados e processos rigorosos para garantir qualidade.' },
            { title: 'Equipe especializada', text: 'Profissionais experientes dedicados a entregar projetos com eficiência.' },
            { title: 'Atendimento personalizado', text: 'Relacionamento próximo, transparente e focado em compreender cada cliente.' },
        ]
    ), [safeDifferentials]);

    const initialNumbers = useMemo(() => defaultHomeNumbers.map((fallback, index) => ({
        ...fallback,
        ...(safeNumbers[index] && typeof safeNumbers[index] === 'object' ? safeNumbers[index] : {}),
    })), [safeNumbers]);

    const { data, setData, put, processing } = useForm({
        home_hero: initialHero,
        home_differentials: initialDifferentials,
        home_numbers: initialNumbers,
    });

    const [tab, setTab] = useState('hero');

    const submit = (event) => {
        event.preventDefault();
        put('/admin/pages/home', { preserveScroll: true });
    };

    const updateHero = (key, value) => setData('home_hero', { ...data.home_hero, [key]: value });
    const updateSlide = (index, key, value) => setData('home_hero', {
        ...data.home_hero,
        slides: data.home_hero.slides.map((slide, slideIndex) => (slideIndex === index ? { ...slide, [key]: value } : slide)),
    });

    const addSlide = () => setData('home_hero', { ...data.home_hero, slides: [...data.home_hero.slides, { ...blankSlide }] });
    const removeSlide = (index) => setData('home_hero', { ...data.home_hero, slides: data.home_hero.slides.filter((_, slideIndex) => slideIndex !== index) });

    const updateDifferential = (index, key, value) => setData('home_differentials', data.home_differentials.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));
    const addDifferential = () => setData('home_differentials', [...data.home_differentials, { ...blankDifferential }]);
    const removeDifferential = (index) => setData('home_differentials', data.home_differentials.filter((_, itemIndex) => itemIndex !== index));

    const updateHomeNumber = (index, key, value) => setData('home_numbers', data.home_numbers.map((item, itemIndex) => (itemIndex === index ? { ...item, [key]: value } : item)));

    return (
        <AdminLayout title="Home CMS">
            <form onSubmit={submit} className="space-y-6">
                <div className="flex flex-wrap gap-2">
                    {[
                        ['hero', 'Hero'],
                        ['differentials', 'Diferenciais'],
                        ['numbers', 'Números'],
                    ].map(([key, label]) => (
                        <button key={key} type="button" onClick={() => setTab(key)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${tab === key ? 'bg-brand text-white' : 'bg-white text-gray-700 shadow-sm hover:bg-gray-50'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {tab === 'hero' && (
                    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-medium text-gray-900">Hero da Home</h2>
                        <div className="grid gap-5 tablet:grid-cols-2">
                            <Field label="Título principal" value={data.home_hero.title} onChange={(e) => updateHero('title', e.target.value)} />
                            <Field label="Descrição" as="textarea" value={data.home_hero.description} onChange={(e) => updateHero('description', e.target.value)} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium uppercase text-gray-500">Slides</h3>
                                <Button type="button" variant="secondary" onClick={addSlide}>Adicionar slide</Button>
                            </div>
                            {data.home_hero.slides.map((slide, index) => (
                                <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                    <div className="grid gap-4 tablet:grid-cols-2">
                                        <Field label="Imagem" value={slide.image} onChange={(e) => updateSlide(index, 'image', e.target.value)} />
                                        <Field label="Título do slide" value={slide.title} onChange={(e) => updateSlide(index, 'title', e.target.value)} />
                                        <Field label="Chamada" as="textarea" value={slide.excerpt} onChange={(e) => updateSlide(index, 'excerpt', e.target.value)} className="tablet:col-span-2" />
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button type="button" onClick={() => removeSlide(index)} className="text-sm font-medium text-red-700">Remover slide</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {tab === 'differentials' && (
                    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Diferenciais</h2>
                                <p className="text-sm text-gray-500">Cards exibidos na Home logo após os empreendimentos em destaque.</p>
                            </div>
                            <Button type="button" variant="secondary" onClick={addDifferential}>Adicionar card</Button>
                        </div>
                        <div className="space-y-4">
                            {data.home_differentials.map((item, index) => (
                                <div key={index} className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 tablet:grid-cols-[1fr_1fr_auto]">
                                    <Field label="Título" value={item.title} onChange={(e) => updateDifferential(index, 'title', e.target.value)} />
                                    <Field label="Texto" as="textarea" value={item.text} onChange={(e) => updateDifferential(index, 'text', e.target.value)} />
                                    <button type="button" onClick={() => removeDifferential(index)} className="self-start pt-8 text-sm font-medium text-red-700">Remover</button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {tab === 'numbers' && (
                    <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div>
                            <h2 className="text-lg font-medium text-gray-900">Números da Home</h2>
                            <p className="text-sm text-gray-500">Edite os quatro indicadores exibidos na página inicial.</p>
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            {data.home_numbers.map((number, index) => (
                                <div key={index} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                    <p className="mb-4 text-xs font-semibold uppercase tracking-[.08em] text-gray-500">Indicador {index + 1}</p>
                                    <div className="grid gap-4 tablet:grid-cols-2">
                                        <Field label="Valor" value={number.value} onChange={(e) => updateHomeNumber(index, 'value', e.target.value)} />
                                        <Field label="Título" value={number.title} onChange={(e) => updateHomeNumber(index, 'title', e.target.value)} />
                                        <Field label="Descrição" as="textarea" value={number.description} onChange={(e) => updateHomeNumber(index, 'description', e.target.value)} className="tablet:col-span-2" placeholder="Escreva um texto curto sobre o indicador." />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <Button type="submit" disabled={processing}>Salvar Home</Button>
            </form>
        </AdminLayout>
    );
}
