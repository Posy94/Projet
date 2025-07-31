import { useState, useEffect } from "react";

export default function useUser() {
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

    return { user, loading, logout, updateUser };
}