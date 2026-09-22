export function formatBrazilianPhoneInput(value) {
    let digits = String(value ?? '').replace(/\D/g, '');

    if (digits.startsWith('55') && digits.length >= 12) {
        digits = digits.slice(2);
    }

    digits = digits.slice(0, 11);
    if (!digits) return '';
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;

    const area = digits.slice(0, 2);
    const subscriber = digits.slice(2);
    const split = digits.length === 11 ? 5 : 4;

    return `(${area}) ${subscriber.slice(0, split)}-${subscriber.slice(split)}`;
}
