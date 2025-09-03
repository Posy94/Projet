import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useUser } from "../contexts/UserContext";
import { useSocket } from "../contexts/SocketContext";
import GameModeModal from '../components/GameModeModal';
import PlayerSelectionModal from '../components/PlayerSelectionModal';

const Home = () => {

    const navigate = useNavigate();
    const [creatingGame, setCreatingGame] = useState(false);
    const { user, loading } = useUser();
    const { sendInvitation } = useSocket();
    const [showPlayerList, setShowPlayerList] = useState(false);
    const [showGameModeModal, setShowGameModeModal] = useState(false);

    const handlePlayVsAI = async () => {
        setCreatingGame(true);
        try {
            const response = await fetch('/api/salons/create-ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });

            if (response.ok) {
                const { salonId } = await response.json();
                navigate(`/jeu/${salonId}`);
            } else {
                alert('❌ Erreur lors de la création de la partie');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur de connexion');
        } finally {
            setCreatingGame(false);
        }
    };

    const handlePlayVsPlayer = async () => {
        
        // SALON PUBLIC OU INVITATION PRIVEE
        setShowGameModeModal(true);
    };

    // SALON PUBLIC
    const handleCreatePublicSalon = async () => {
        setCreatingGame(true);
        try {
            const response = await fetch('/api/salons/create-pvp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const { salonId } = await response.json();
                navigate(`/waiting-room/${salonId}`);
            } else {
                alert('❌ Erreur lors de la création du salon');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('❌ Erreur de connexion');
        } finally {
            setCreatingGame(false);
        }
    };

    // INVITATION PRIVEE
    const handleInviteSpecificPlayer = () => {
        setShowPlayerList(true);
    };

    const handleSendInvitation = async (targetUserId) => {
        try {
            await sendInvitation(targetUserId);
            setShowPlayerList(false);
            setShowGameModeModal(false);
            console.log('✅ Invitation envoyée !');
        } catch (error) {
            console.error('Erreur invitation:', error);
            alert('❌ Erreur lors de l\'envoi de l\'invitation');
        }
    }

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 text-center mb-6">
                Bienvenue sur <span className="text-purple-600">Pierre - Feuille - Ciseaux</span>
            </h1>

            <p className="text-lg text-gray-700 text-center max-w-2xl mb-10">
                Défie tes amis, grimpe dans le classement et collectionne des récompenses dans ce jeu légendaire revisité en ligne !
            </p>

            {/* BOUTONS DE JEU VISIBLES SEULEMENT SI CONNECTE */}
            {user && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        👋 Salut {user.username} ! Prêt à jouer ?
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        {/* BOUTON VS IA*/}
                        <button
                            onClick={handlePlayVsAI}
                            disabled={creatingGame}
                            className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blu-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl tranform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:tranform-none"
                        >
                            <div className="flex items-center justify-center space-x-3">
                                <span className="text-2xl">🤖</span>
                                <div className="text-left">
                                    <div className="text-lg">Jouer contre l'IA</div>
                                    <div className="text-sm opacity-90">Partie rapide</div>
                                </div>
                            </div>
                        </button>

                        {/* BOUTON VS JOUEUR */}
                        <button
                            onClick={handlePlayVsPlayer}
                            disabled={creatingGame}
                            className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blu-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl tranform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:tranform-none"
                        >
                            <div className="flex items-center justify-center space-x-3">
                                <span className="text-2xl">👥</span>
                                <div className="text-left">
                                    <div className="text-lg">Inviter un joueur</div>
                                    <div className="text-sm opacity-90">Mode multijoueur</div>
                                </div>
                            </div>
                        </button>
                    </div>

                    {creatingGame && (
                        <div className="mt-6 flex items-center justify-center space-x-2 text-blue-600">
                            <LoadingSpinner />
                            <span>Création de la partie...</span>
                        </div>
                    )}
                </div>
            )}

            {/* MESSAGE SI PAS CONNECTE */}
            {!user && (
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        🔐 Connecte-toi pour jouer !
                    </h3>
                    <p className="text-gray-600 mb-6">
                        Rejoins la communauté et Défie tes amis !
                    </p>
                </div>
            )}

            {!user && (
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
            )}

            <div className="mt-8 text-sm text-gray-500">
                <Link to={"/regles"} className="underline hover:text-blue-700">Voir les règles du jeu</Link>
            </div>

            {/* MODAL DE CHOIX DE MODE */}
            {showGameModeModal && (
                <GameModeModal
                    onClose={() => setShowGameModeModal(false)}
                    onPublicSalon={handleCreatePublicSalon}
                    onPrivateInvite={handleInviteSpecificPlayer}
                />
            )}

            {/* MODAL DE SELECTION DE JOUEUR */}
            {showPlayerList && (
                <PlayerSelectionModal
                    onClose={() => setShowPlayerList(false)}
                    onSelect={handleSendInvitation}
                />
            )}

        </div>
    );
};

export default Home;