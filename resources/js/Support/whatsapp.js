const WHATSAPP_NUMBER = '554591119653';

const typeLabel = { property: 'imóvel', condominium: 'condomínio', subdivision: 'loteamento' };

export function whatsappMessage({ type, title, name = '' }) {
    const productType = typeLabel[type] || 'empreendimento';
    const introduction = name.trim()
        ? `Meu nome é ${name.trim()} e `
        : '';
    const interest = type === 'subdivision'
        ? `tenho interesse no loteamento ${title}. Gostaria de receber mais informações sobre disponibilidade, condições e valores.`
        : `gostaria de receber mais informações sobre o ${productType} ${title}.`;

    return `Olá! Vim pelo site da Pascoal Loteamentos.\n\n${introduction}${interest}\n\nPoderiam me ajudar?`;
}

export function whatsappUrl({ type, title, name = '' }) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappMessage({ type, title, name }))}`;
}

export { WHATSAPP_NUMBER };
