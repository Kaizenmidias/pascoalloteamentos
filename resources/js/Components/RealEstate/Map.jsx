export default function Map({ latitude, longitude, address = '', title = 'Localização' }) {
    const hasCoordinates = latitude != null && longitude != null && latitude !== '' && longitude !== '';

    if (!hasCoordinates && !address) {
        return <div className="grid min-h-80 place-items-center rounded-card bg-surface text-sm text-muted">Localização disponível sob consulta.</div>;
    }

    const url = hasCoordinates
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - .01}%2C${Number(latitude) - .01}%2C${Number(longitude) + .01}%2C${Number(latitude) + .01}&layer=mapnik&marker=${latitude}%2C${longitude}`
        : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

    return <iframe title={title} src={url} loading="lazy" className="min-h-80 w-full rounded-card border-0" referrerPolicy="no-referrer-when-downgrade" />;
}
