import SocialIcon from './SocialIcon';

const profiles = [
    ['instagram', 'instagram_url', 'Instagram'],
    ['facebook', 'facebook_url', 'Facebook'],
    ['youtube', 'youtube_url', 'YouTube'],
];

export default function SocialLinks({ links = {}, className = '', linkClassName = '' }) {
    return (
        <div className={`flex flex-wrap gap-3 ${className}`}>
            {profiles.map(([network, key, label]) => links[key] && (
                <a
                    key={network}
                    href={links[key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${label} da Pascoal Loteamentos`}
                    title={`${label} da Pascoal Loteamentos`}
                    className={`grid size-11 shrink-0 place-items-center rounded-full transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 active:scale-95 ${linkClassName}`}
                >
                    <SocialIcon network={network} />
                </a>
            ))}
        </div>
    );
}
