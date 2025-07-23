import React from "react";
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 text-center mb-6">
                Bienvenue sur <span className="text-purple-600">Pierre - Feuille - Ciseaux</span>
            </h1>

            <p className="text-lg text-gray-700 text-center max-w-2xl mb-10">
                Défie tes amis, grimpe dans le classement et collectionne des récompenses dans ce jeu légendaire revisité en ligne !
            </p>

            <div className="flex gap-6">
                <Link
                    to="/inscription"
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-200 shadow"
                >
                    Créer un compte
                </Link>

                <Link
                    to="/connexion"
                    className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-200 shadow"
                >
                    Se connecter
                </Link>
            </div>

            <div className="mt16 text-sm text-gray-500">
                <Link to={"/regles"} className="underline hover:text-blue-700">Voir les règles du jeu</Link>
            </div>
        </div>
    );
};

export default Home;