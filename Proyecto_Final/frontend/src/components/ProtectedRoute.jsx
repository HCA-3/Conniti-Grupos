import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ROLE_ALIASES } from '../services/authService';
import styles from '../styles/components/ProtectedRoute.module.css';

/**
 * Normaliza un rol a su forma canónica (UPPERCASE Grupo 1).
 * Acepta tanto el rol directo como sus aliases legacy.
 */
function canonicalRole(role) {
    if (!role) return '';
    const upper = role.trim().toUpperCase();
    return ROLE_ALIASES[role.trim().toLowerCase()] ?? upper;
}

/**
 * ProtectedRoute — envuelve rutas que requieren autenticación y/o un rol específico.
 *
 * @param {{ children: React.ReactNode, roles?: string[] }} props
 *   - roles: array de roles permitidos (ej: ['ADMIN', 'SUPER_ADMIN']).
 *            Si se omite, solo requiere que el usuario esté autenticado.
 */
export default function ProtectedRoute({ children, roles }) {
    const { user, isLoading } = useContext(AuthContext);

    // Muestra indicador de carga mientras se verifica la sesión
    if (isLoading) {
        return (
            <div className={styles.loader}>
                <span className={styles.spinner} />
            </div>
        );
    }

    // Redirige al login si no hay sesión activa
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirige al inicio si el rol del usuario no está en la lista permitida
    if (roles) {
        const userCanonical = canonicalRole(user.role);
        const allowed = roles.map(canonicalRole);
        if (!allowed.includes(userCanonical)) {
            return <Navigate to="/" replace />;
        }
    }

    return children;
}
