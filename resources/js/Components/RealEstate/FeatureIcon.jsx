export default function FeatureIcon({ feature, className = 'size-8' }) {
    const url = feature.icon_media?.url || (String(feature.icon || '').match(/^(https?:\/\/|\/)/) ? feature.icon : null);

    if (url) {
        return <img src={url} alt="" className={`${className} object-contain`} loading="lazy" />;
    }

    return feature.icon ? <span aria-hidden="true" className="text-brand">{feature.icon}</span> : null;
}
