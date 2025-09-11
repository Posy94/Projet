import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"

const APropos = () => {

    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGames: 0,
        onlineUsers: 0,
        activeGames: 0,
        loading: true,
        error: null
    });

    // RÉCUPÉRATION DES STATS AU CHARGEMENT
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/suivis/global-stats', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Erreur lors de la récupération des statistiques');
                }

                const data = await response.json();

                if (data.success) {
                    setStats({
                        totalUsers: data.data.totalUsers || 0,
                        totalGames: data.data.totalGames || 0,
                        onlineUsers: data.data.onlineUsers || 0,
                        activeGames: data.data.activeGames || 0,
                        loading: false,
                        error: null
                    });
                } else {
                    throw new Error(data.message || 'Données invalides');
                }
            } catch (error) {
                console.error('Erreur stats:', error);
                setStats(prev => ({
                    ...prev,
                    loading: false,
                    error: error.message
                }));
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const handlePlayClick = () => {
        navigate('/');
    }

    const handleContactClick = () => {
        navigate('/contact');
    }

    // 🎨 COMPOSANT STAT ANIMÉ
    const StatCard = ({ value, label, color, icon }) => (
        <div className="transform hover:scale-105 transition-all duration-200">
            <div className={`text-3xl font-bold ${color} mb-1 flex items-center justify-center gap-2`}>
                <span>{icon}</span>
                {stats.loading ? (
                    <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
                ) : (
                    <span>{value.toLocaleString()}</span>
                )}
            </div>
            <div className="text-sm text-gray-600">{label}</div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg mt-10 space-y-8">
            {/* 🎯 EN-TÊTE PRINCIPAL */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-green-700 mb-4">
                    À propos du jeu
                </h1>
                <p className="text-xl text-gray-600">
                    Découvrez l'univers passionnant de notre jeu multijoueur en temps réel
                </p>
            </div>

            {/* 🎲 CONCEPT DU JEU */}
            <section className="bg-gradient-to-r from-green-50 to-purple-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    🎯 Le Concept
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                    Plongez dans une expérience de jeu unique où stratégie et chance se rencontrent ! 
                    Notre plateforme vous propose des parties multijoueurs en temps réel où chaque 
                    décision compte.
                </p>
                <p className="text-gray-700 leading-relaxed">
                    Que vous soyez débutant ou expert, jouez en solo contre l'ordinateur ou contre vos amis dans des parties passionnantes.
                </p>
            </section>

            {/* 🚀 FONCTIONNALITÉS */}
            <section>
                <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
                    ⚡ Fonctionnalités Principales
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <h3 className="font-bold text-green-700 mb-2">🌐 Multijoueur en Temps Réel</h3>
                        <p className="text-gray-700 text-sm">
                            Affrontez des joueurs du monde entier grâce à notre technologie WebSocket avancée
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                        <h3 className="font-bold text-purple-700 mb-2">🏆 Système de Classement</h3>
                        <p className="text-gray-700 text-sm">
                            Grimpez dans les classements et prouvez votre talent face à la communauté
                        </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                        <h3 className="font-bold text-green-700 mb-2">📊 Statistiques Détaillées</h3>
                        <p className="text-gray-700 text-sm">
                            Suivez vos progrès avec des stats complètes : victoires, défaites, temps de jeu
                        </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                        <h3 className="font-bold text-purple-700 mb-2">🎨 Interface Moderne</h3>
                        <p className="text-gray-700 text-sm">
                            Design responsive et intuitif pour une expérience optimale sur tous vos appareils
                        </p>
                    </div>
                </div>
            </section>

            {/* 🎮 COMMENT JOUER */}
            <section className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-700 mb-4 flex items-center gap-2">
                    🎮 Comment Jouer ?
                </h2>
                <div className="space-y-3">
                    <div className="flex items-start gap-3">
                        <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <p className="text-gray-700"><strong>Créez votre compte</strong> et personnalisez votre profil</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <p className="text-gray-700"><strong>Rejoignez une partie</strong> ou créez votre propre salon</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <p className="text-gray-700"><strong>Affrontez vos adversaires</strong> en temps réel</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="bg-green-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                        <p className="text-gray-700"><strong>Grimpez dans le classement !</strong></p>
                    </div>
                </div>
            </section>

            {/* 🛠️ TECHNOLOGIES */}
            <section>
                <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
                    🛠️ Technologies Utilisées
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { name: "React", icon: "⚛️", color: "bg-indigo-100 text-purple-800" },
                        { name: "Node.js", icon: "🟢", color: "bg-green-100 text-green-800" },
                        { name: "MongoDB", icon: "🍃", color: "bg-grass-100 text-emerald-800" },
                        { name: "Socket.io", icon: "🔌", color: "bg-purple-100 text-purple-800" }
                    ].map((tech, index) => (
                        <div key={index} className={`${tech.color} p-3 rounded-lg text-center`}>
                            <div className="text-2xl mb-1">{tech.icon}</div>
                            <div className="font-semibold text-sm">{tech.name}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 📈 STATISTIQUES TEMPS RÉEL */}
            <section className="bg-gradient-to-r from-green-50 to-purple-50 p-6 rounded-lg relative overflow-hidden">
                {/* 🔄 INDICATEUR DE MISE À JOUR */}
                <div className="absolute top-4 right-4">
                    {stats.loading && (
                        <div className="animate-spin w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    📈 Statistiques de la Communauté
                </h2>

                {/* ❌ GESTION DES ERREURS */}
                {stats.error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <strong>Erreur:</strong> {stats.error}
                    </div>
                )}

                {/* 📊 GRILLE DES STATISTIQUES */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <StatCard
                        value={stats.totalUsers}
                        label="Joueurs Inscrits"
                        color="text-blue-600"
                        icon="👥"
                    />
                    <StatCard
                        value={stats.totalGames}
                        label="Parties Jouées"
                        color="text-green-600"
                        icon="🎮"
                    />
                    <StatCard
                        value={stats.onlineUsers}
                        label="Joueurs en Ligne"
                        color="text-purple-600"
                        icon="🟢"
                    />
                    <StatCard
                        value={stats.activeGames}
                        label="Parties Actives"
                        color="text-orange-600"
                        icon="⚡"
                    />
                </div>

                {/* 🕐 DERNIÈRE MISE À JOUR */}
                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500">
                        🔄 Mise à jour automatique toutes les 30 secondes
                    </p>
                </div>
            </section>

            {/* 👥 ÉQUIPE */}
            <section>
                <h2 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    👥 L'Équipe de Développement
                </h2>
                <div className="bg-white border rounded-lg p-6 text-center">
                    <p className="text-gray-700 mb-4">
                        Projet développé avec passion par Olivier MEUNIER
                    </p>
                    <div className="flex justify-center gap-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-2">
                                OM
                            </div>
                            <p className="text-sm font-medium text-gray-700">Dev Web</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 📞 CONTACT */}
            <section className="bg-green-700 text-white p-6 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">
                    🚀 Prêt à Jouer ?
                </h2>
                <p className="mb-4">
                    Rejoignez notre communauté grandissante et montrez vos talents !
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handlePlayClick}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        🎮 Commencer à Jouer
                    </button>
                    <button
                        onClick={handleContactClick}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                        📞 Nous Contacter
                    </button>
                </div>
            </section>
        </div>
    );
};

export default APropos;
