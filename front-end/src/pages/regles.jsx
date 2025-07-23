import React from "react";

const Regles = () => {
    return (
        <div className="mx-w-3xl mx-auto px-6 py-10 bg-white shadow-md rounded-lg mt-10">
            <h1 className="text-3xl font-bold text-blue-600 text-center mb-6">
                Règles du jeu : Pierre - Feuille - Ciseaux ✊✋✌️
            </h1>
            <div className="space-y-4 text-gray-700 text-lg">
                <ul className="list-disc list-inside">
                <li><strong>Pierre</strong> écrase les <strong>Ciseaux</strong></li>
                <li><strong>Feuille</strong> recouvre la <strong>Pierre</strong></li>
                <li><strong>Ciseaux</strong> coupent la <strong>Feuille</strong></li>
            </ul>

            <p>Si les deux joueurs choisissent la même option, c'est une égalité.</p>

            <p>
                Dans notre version en ligne, tu peux défier des amis ou d'autres joueurs connectés. Chaque victoire te fait gagner des ponts et des récompenses !
            </p>
            </div>
            <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">Bonne chance et amuse-toi bien ! 🎮</p>
            </div>            
        </div>
    );
};
export default Regles;