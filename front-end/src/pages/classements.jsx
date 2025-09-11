import React, { useState, useEffect } from 'react';

function Classements() {
    const [classements, setClassements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortBy, setSortBy] = useState('wins'); // wins, ratio, gamesPlayed
    const [currentUser, setCurrentUser] = useState(null);
    
    // 🎯 RÉCUPÉRATION DES DONNÉES
    useEffect(() => {
        const fetchClassements = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost:8000/api/auth/classements?sortBy=${sortBy}`);
                
                if (!response.ok) {
                    throw new Error('Erreur lors du chargement du classement');
                }
                
                const data = await response.json();
                setClassements(data.users || []);
                
                // Récupérer l'utilisateur actuel depuis le localStorage/context
                const userData = JSON.parse(localStorage.getItem('user') || '{}');
                setCurrentUser(userData);
                
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchClassements();
    }, [sortBy]);

    // 🏅 FONCTION POUR LES MÉDAILLES
    const getMedalIcon = (position) => {
        switch(position) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${position}`;
        }
    };

    // 📈 CALCUL DU RATIO
    const calculateRatio = (wins, losses) => {
        if (losses === 0) return wins > 0 ? wins : 0;
        return (wins / (wins + losses) * 100).toFixed(1);
    };

    // 🎨 STYLE POUR L'UTILISATEUR ACTUEL
    const isCurrentUser = (userId) => {
        return currentUser && userId === currentUser.id;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="max-w-4xl mx-auto mt-10 p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Erreur :</p>
                <p>{error}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto mt-10 p-6">
            {/* 🏆 HEADER */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-green-800 mb-2">
                    🏆 Classement des Joueurs
                </h1>
                <p className="text-gray-600">Découvrez les meilleurs joueurs de la communauté</p>
            </div>

            {/* 🔧 FILTRES */}
            <div className="mb-6 flex justify-center">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <p className="text-sm text-gray-600 mb-2 text-center">Trier par :</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSortBy('wins')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                sortBy === 'wins' 
                                    ? 'bg-green-600 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🏆 Victoires
                        </button>
                        <button
                            onClick={() => setSortBy('ratio')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                sortBy === 'ratio' 
                                    ? 'bg-green-700 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            📈 Ratio
                        </button>
                        <button
                            onClick={() => setSortBy('gamesPlayed')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                sortBy === 'gamesPlayed' 
                                    ? 'bg-green-800 text-white' 
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            🎮 Parties jouées
                        </button>
                    </div>
                </div>
            </div>

            {/* 📊 TABLEAU CLASSEMENT */}
            {classements.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏆</div>
                    <p className="text-xl text-gray-500">Aucun classement disponible</p>
                    <p className="text-gray-400">Soyez le premier à jouer !</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-green-600 to-purple-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left">Position</th>
                                    <th className="px-6 py-4 text-left">Joueur</th>
                                    <th className="px-6 py-4 text-center">🏆 Victoires</th>
                                    <th className="px-6 py-4 text-center">❌ Défaites</th>
                                    <th className="px-6 py-4 text-center">🤝 Égalités</th>
                                    <th className="px-6 py-4 text-center">🎮 Parties</th>
                                    <th className="px-6 py-4 text-center">📈 Ratio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classements.map((user, index) => {
                                    const position = index + 1;
                                    const ratio = calculateRatio(user.stats?.wins || 0, user.stats?.losses || 0);
                                    const isMe = isCurrentUser(user._id);
                                    
                                    return (
                                        <tr 
                                            key={user._id}
                                            className={`border-b transition-colors ${
                                                isMe 
                                                    ? 'bg-green-50 border-green-200' 
                                                    : 'hover:bg-gray-50'
                                            } ${position <= 3 ? 'bg-gradient-to-r from-green-50 to-purple-50' : ''}`}
                                        >
                                            {/* 🏅 POSITION */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <span className="text-2xl mr-2">
                                                        {getMedalIcon(position)}
                                                    </span>
                                                    {isMe && (
                                                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                                            Vous
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 👤 JOUEUR */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                        {user.avatar || user.username?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div>
                                                        <p className={`font-semibold ${isMe ? 'text-purple-700' : 'text-gray-800'}`}>
                                                            {user.username}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Membre depuis {new Date(user.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 📊 STATISTIQUES */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-green-600 font-bold text-lg">
                                                    {user.stats?.wins || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-red-600 font-bold text-lg">
                                                    {user.stats?.losses || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-gray-600 font-bold text-lg">
                                                    {user.stats?.draws || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-pink-400 font-bold text-lg">
                                                    {user.stats?.gamesPlayed || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center">
                                                    <span className="text-purple-600 font-bold text-lg mr-1">
                                                        {ratio}%
                                                    </span>
                                                    {ratio >= 70 && <span className="text-green-500">⭐</span>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 📈 STATISTIQUES GLOBALES */}
            {classements.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-pink-100 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-pink-700">{classements.length}</p>
                        <p className="text-pink-600">Joueurs actifs</p>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-700">
                            {classements.reduce((sum, user) => sum + (user.stats?.gamesPlayed || 0), 0)}
                        </p>
                        <p className="text-green-600">Parties totales</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-700">
                            {classements[0]?.username || 'Aucun'} 🏆
                        </p>
                        <p className="text-yellow-600">Champion actuel</p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-purple-700">
                            {Math.round(classements.reduce((sum, user) => sum + (user.stats?.gamesPlayed || 0), 0) / classements.length) || 0}
                        </p>
                        <p className="text-purple-600">Parties moyenne</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Classements;