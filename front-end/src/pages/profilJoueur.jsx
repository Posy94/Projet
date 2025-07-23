import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

function ProfilJoueur() {
    const { register, handleSubmit, reset } = useForm();
    const [user, setUser] = useState(null);

    // SIMULER UN FETCH DES DONNEES UTILISATEUR
    useEffect(() => {
        const mockUser = {
            username: "JoueurTest",
            email: "test@example.com",
            stats: {
                gamesPlayed: 42,
                wins: 20,
                losses: 15,
                draws: 7
            }
        };
        setUser(mockUser);
        reset(mockUser);
    }, [reset]);

    const onSubmit = (data) => {
        console.log("Données mises à jour :", data);
        // ENVOI AU BACKEND ICI        
    };

    if (!user) return <p>Chargement du profil...</p>;    
    
    return (
        <div className="max-x-2xl mx-auto p-6 bg-white rounded shadow-md mt-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Profil du joueur</h2>

            {/* FORMULAIRE DE MISE A JOUR DE L4UTILISATEUR */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <input 
                className="w-full border px-4 py-2 rounded"
                placeholder="Pseudo"
                {...register("username")}
                />
                <input 
                className="w-full border px-4 py-2 rounded"
                type="email"
                placeholder="Email"
                {...register("email")}
                />
                <input 
                className="w-full border px-4 py-2 rounded"
                type="password"
                placeholder="Nouveau mot de passe"
                {...register("password")}
                />
                <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
                    Enregistrer
                </button>
            </form>

            {/* STATISTIQUES */}
            <div className="mt-8">
                <h3 className="text-xl font-semibold mb-2">Statistiques</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Parties jouées : {user.stats.gamesPlayed}</li>
                    <li>Vicoires : {user.stats.wins}</li>
                    <li>Défaites : {user.stats.losses}</li>
                    <li>Egalités : {user.stats.draws}</li>
                </ul>
            </div>

            {/* LIENS COMPLEMENTAIRES */}
            <div className="mt-6 flex flex-col space-y-2 text-center">
                <Link to="/historiques" className="text-blue-600 hover:underline">Voir l'historique</Link>
                <Link to="/recompenses" className="text-blue-600 hover:underline">Voir les récompenses</Link>
            </div>
        </div>
    );
}

export default ProfilJoueur;