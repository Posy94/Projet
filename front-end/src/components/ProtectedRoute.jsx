import { useUser } from '../contexts/UserContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole = null, allowedRoles = [] }) => {
    const { user, loading } = useUser();

    // ⏳ Affichage pendant le chargement
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Vérification des droits d'accès...</p>
                </div>
            </div>
        );
    }

    // 🚫 Utilisateur non connecté
    if (!user) {
        return <Navigate to="/connexion" replace />;
    }

    // 🛡️ Vérification des rôles
    const hasAccess = () => {
        if (requiredRole) {
            return user.role === requiredRole;
        }
        if (allowedRoles.length > 0) {
            return allowedRoles.includes(user.role);
        }
        return true; // Accès autorisé par défaut si connecté
    };

    // ❌ Accès refusé
    if (!hasAccess()) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-lg">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Accès refusé</h2>
                    <p className="text-gray-600 mb-4">
                        Vous n'avez pas les droits nécessaires pour accéder à cette page.
                    </p>
                    <button 
                        onClick={() => window.history.back()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        ← Retour
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Accès autorisé
    return children;
};

export default ProtectedRoute;