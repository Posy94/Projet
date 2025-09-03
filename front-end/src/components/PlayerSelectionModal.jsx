import React, { useState, useEffect } from "react";

const PlayerSelectionModal = ({ onClose, onSelect }) => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // CHARGER LA LISTE DES JOUEURS EN LIGNE
    useEffect(() => {
        // const fetchOnlinePlayers = async () => {
        //     try {
        //         const response = await fetch(`${import.meta.env.PORT_APPLICATION_BACK}/api/invitations/players/online`, {
        //             headers: {
        //                 'Authorization': `Bearer ${localStorage.getItem('token')}`
        //             }
        //         });

        //         if (response.ok) {
        //             const result = await response.json();
        //             setPlayers(result.data || []);
        //         } else {
        //             setError('Erreur lors du chargement des joueurs');
        //         }
        //     } catch (error) {
        //         setError('Erreur orde connexion');
        //         console.error('Erreur:', error);
        //     } finally {
        //         setLoading(false);
        //     }
        // };

        const fetchOnlinePlayers = async () => {
            try {
                setLoading(true);
                setError('');

                const token = localStorage.getItem('token');
                console.log('🔐 Token:', token ? 'Présent' : 'MANQUANT');

                console.log('🔧 Variables env:', {
                    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
                    VITE_PORT_APPLICATION_BACK: import.meta.env.VITE_PORT_APPLICATION_BACK,
                    all: import.meta.env
                });


                const url = 'http://localhost:8000/api/invitations/players/online';
                console.log('🌐 URL appelée:', url);

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 Response status:', response.status);
                console.log('📡 Response headers:', response.headers);

                // ⚠️ VÉRIFICATION AVANT PARSING JSON
                const textResponse = await response.text();
                console.log('📄 Raw response:', textResponse.substring(0, 200));

                if (response.ok) {
                    const data = JSON.parse(textResponse);
                    setPlayers(data.data || []);
                } else {
                    setError('Erreur de chargement des joueurs');
                }
            } catch (error) {
                console.error('❌ Erreur complète:', error);
                setError('Erreur de connexion');
            } finally {
                setLoading(false);
            }
        };


        fetchOnlinePlayers();
    }, []);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">

                {/* HEADER */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Inviter un ami</h2>
                            <p className="text-purple-100">Choisissez votre adversaire</p>
                        </div>
                        <button
                        onClick={onClose}
                        className="text-white hover:text-purple-200 text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* CONTENU */}
                <div className="p-6">

                    {/* LOADING */}
                    {loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                            <span className="ml-2 text-gray-600">Chargement...</span>
                        </div>
                    )}

                    {/* ERREUR */}
                    {error && (
                        <div className="text-center py-8">
                            <span className="text-4xl">😞</span>
                            <p className="text-red-500 mt-2">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg"
                            >
                                Réssayer
                            </button>
                        </div>
                    )}

                    {/* LISTE DES JOUEURS */}
                    {!loading && !error && (
                        <>
                            {players.length === 0 ? (
                                <div className="text-center py-8">
                                    <span className="text-4xl">👻</span>
                                    <p className="text-gray-500 mt-2">Aucun joueur en ligne</p>
                                    <p className="text-sm text-gray-400 mt-1">Revenez plus tard</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {players.map(player => (
                                        <div
                                        key={player._id}
                                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            {/* INFO JOUEUR */}
                                            <div className="flex items-center space-x-3">

                                                {/* AVATAR */}
                                                <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                                                    {player.username.charAt(0).toUpperCase()}
                                                </div>

                                                {/* NOM + STATUS */}
                                                <div>
                                                    <p className="font-semibold text-gray-800 dark:text-white">
                                                        {player.username}
                                                    </p>
                                                    <div className="flex items-center space-x-1">
                                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                        <span className="text-xs text-gray-500">En ligne</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* BOUTON INVITER */}
                                            <button
                                                onClick={() => onSelect(player._id)}
                                                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                                            >
                                                Inviter
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* FOOTER */}
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayerSelectionModal;