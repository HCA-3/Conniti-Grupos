import { Link } from 'react-router-dom';

export default function PlaceholderPage({ title = 'Página en construcción' }) {
    return (
        <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-family)',
            background: 'var(--color-bg)',
        }}>
            <h1 style={{ color: 'var(--color-primary-dark)', fontSize: '2.5rem', marginBottom: '1rem' }}>{title}</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '600px' }}>
                Este contenido se encuentra actualmente en desarrollo y estará disponible próximamente.
            </p>
            <Link
                to="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.5rem',
                    background: 'var(--color-primary)',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    minHeight: '44px',
                    transition: 'all 0.2s ease',
                }}
            >
                Volver al inicio
            </Link>
        </div>
    );
}
