import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // RECUPERER LE PROFIL COMPLET
    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Pas de token, pas de fetch profile');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            console.log('📡 Appel fetchUserProfile...');

            const response = await axios.get('http://localhost:8000/api/auth/profile', {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });

            console.log('📦 Response complète:', response);
            console.log('📄 Response.data:', response.data);
            console.log('👤 Response.data.user:', response.data.user);
            console.log('🎭 Role trouvé:', response.data.user?.role);

            // ✅ CORRECTION
            if (response.data.user) {
                console.log('✅ SETUSER avec:', response.data.user);
                const userData = response.data.user;
                setUser(userData);
                localStorage.setItem("user", JSON.stringify(userData));
            } else {
                console.log('❌ Pas de user dans la réponse');
                setUser(null);
            }

        } catch (error) {
            console.error('❌ Erreur fetchUserProfile:', error);
            if (error.response?.status === 401) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        const initUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const storedUser = localStorage.getItem("user");

                console.log('🔍 Init user - Token:', !!token, 'Stored user:', !!storedUser);

                if (token && storedUser) {
                    // Utilisateur en cache + token valide -> utilise le cache temporairement
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setLoading(false);

                    // Puis récupère la version fraîche en arrière-plan
                    await fetchUserProfile();
                } else if (token) {
                    // Token mais pas d'user en cache -> récupère le profil
                    await fetchUserProfile();
                } else {
                    // Pas de token -> pas d'utilisateur
                    setLoading(false);
                }

            } catch (error) {
                console.error('Erreur init user:', error);
                localStorage.removeItem("user");
                setLoading(false);
            }
        };

        initUser();
    }, []);

    // FONCTION POUR METTRE A JOUR L'UTILISATEUR
    const updateUser = (newUserData) => {
        console.log('🔄 updateUser appelé avec:', newUserData);
        setUser(newUserData);
        if (newUserData) {
            localStorage.setItem("user", JSON.stringify(newUserData));
        } else {
            localStorage.removeItem("user");
        }
    };

    // FONCTION LOGOUT
    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
    };

    const value = {
        user,
        loading,
        updateUser,
        logout,
        fetchUserProfile,
        refreshUser: fetchUserProfile
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

// HOOK POUR UTILISER LE CONTEXT
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser doit être utilisé dans un UserProvider');
    }
    return context;
};