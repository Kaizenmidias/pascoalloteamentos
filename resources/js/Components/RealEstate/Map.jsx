export default function Map({ latitude, longitude, address = '', title = 'Localização' }) {
    const numericLatitude = Number(latitude);
    const numericLongitude = Number(longitude);
    const hasCoordinates = Number.isFinite(numericLatitude) && Number.isFinite(numericLongitude);

    if (!hasCoordinates && !address) {
        return <div className="grid min-h-80 place-items-center rounded-card bg-surface text-sm text-muted">Localização disponível sob consulta.</div>;
    }

    const url = hasCoordinates
        ? `https://www.google.com/maps?q=${numericLatitude},${numericLongitude}&z=16&output=embed`
        : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    const mapsQuery = hasCoordinates ? `${numericLatitude},${numericLongitude}` : address;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`;

    return <div className="space-y-3"><iframe title={title} src={url} loading="lazy" className="min-h-80 w-full rounded-card border-0" referrerPolicy="no-referrer-when-downgrade" /><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="brand-button inline-flex w-full justify-center gap-2"><svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" /><circle cx="12" cy="10" r="2" /></svg>Ver no Google Maps</a></div>;
}
