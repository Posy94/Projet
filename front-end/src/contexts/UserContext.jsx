import React, { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error('Erreur parsing user localStorage:', error);
            localStorage.removeItem("user");            
        } finally {
            setLoading(false);
        }
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
        logout
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