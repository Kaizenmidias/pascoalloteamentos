export default function Container({ as: Tag = 'div', className = '', children }) { return <Tag className={`site-container ${className}`}>{children}</Tag>; }
