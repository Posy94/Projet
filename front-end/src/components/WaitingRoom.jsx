import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { io } from 'socket.io-client';

const socket = io("http://localhost:8000");

const WaitingRoom = () => {
    const { user } = useUser();
    const { salonId } = useParams();
    const navigate = useNavigate();
    const [salon, setSalon] = useState(null);
    const [loading, setLoading] = useState(true);
    const socketRef = useRef(null);

    console.log('🔍 SalonID au début du composant:', salonId);

    useEffect(() => {
        if (!socketRef.current) {
            console.log('🔌 Création nouvelle connexion socket');
            socketRef.current = io("http://localhost:8000");
        }

        return () => {
            if (socketRef.current) {
                console.log('🧹 Fermeture socket');
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        console.log('🔥 useEffect fetchSalon lancé avec id:', salonId);
        if (salonId && user?.id) {
            console.log('✅ ID et user trouvés, calling fetchSalon');

            const fetchSalonAndJoin = async () => {
                try {
                    setLoading(true);

                    const token = localStorage.getItem('token');

                    console.log('🔍 Token:', token);
                    console.log('🔍 User:', user);
                    console.log('🔍 SalonId:', salonId);

                    // 1️⃣ RÉCUPÈRE LE SALON
                    const salonResponse = await axios.get(`http://localhost:8000/api/salons/${salonId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('📦 Salon récupéré:', salonResponse.data);
                    setSalon(salonResponse.data);

                    // 2️⃣ VÉRIFIER SI LE USER EST DÉJÀ DANS LE SALON
                    const isAlreadyInSalon = salonResponse.data.players?.some(
                        player => player.user._id === user.id || player.user === user.id
                    ); 

                    if (!isAlreadyInSalon) {
                        console.log('🚪 Tentative de rejoindre le salon...');
                        // 3️⃣ REJOINS LE SALON 
                        const joinResponse = await axios.post(`http://localhost:8000/api/salons/join/${salonId}`, {}, {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        console.log('✅ Salon rejoint:', joinResponse.data);
                        setSalon(joinResponse.data.salon);
                    } else {
                        console.log('ℹ️ Utilisateur déjà dans le salon');
                    }

                } catch (error) {
                    console.error('❌ Erreur:', error);                    
                    console.error('❌ Réponse serveur:', error.response?.data);
                    navigate('/');
                } finally {
                    setLoading(false);
                }
            };

            fetchSalonAndJoin();
        } else {
            console.log('❌ Pas d\'ID trouvé ou d\'user trouvé');
        }
    }, [salonId, navigate, user?.id]);

    // GESTION DES EVENEMENTS SOCKET
    useEffect(() => {
        if (!salonId || !socketRef.current) return;

        console.log('🔌 Configuration listeners socket pour salon:', salonId);

        const socket = socketRef.current;
        
        // 🆕 VÉRIFIER L'ÉTAT DE LA CONNEXION
        console.log('🔍 Socket connecté ?', socket.connected);
        console.log('🔍 Socket ID:', socket.id);

        // REJOINDRE LA ROOM DU SALON
        socket.emit('joinSalon', {
            salonId: salonId,
            userId: user._id,
            username: user.username
        });

        // ECOUTER LES EVENEMENTS
        socket.on('player-joined', (data) => {
            console.log('👥 EVENT REÇU - Nouveau joueur rejoint:', data);
            setSalon(data.salon);
        });

        socket.on('player-left', (data) => {
            console.log('👋 EVENT REÇU - Joueur parti:', data);
            setSalon(data.salon);
        });

        // ECOUTER LE DEMARRAGE DU JEU
        socket.on('game-start', (data) => {
            console.log('🚀🚀 EVENT REÇU - GAME START !', data);
            alert('Le jeu démarre !'); // 🆕 Test visuel
            // REDIRIGER VERS LA PAGE DU JEU
            navigate(`/jeu/${salonId}`);
        });

        // 🆕 ÉCOUTER TOUS LES ÉVÉNEMENTS (DEBUG)
        socket.onAny((eventName, ...args) => {
            console.log(`📡 EVENT REÇU: ${eventName}`, args);
        });

        return () => {
            console.log('🧹 Nettoyage listeners socket');
            socket.off('player-joined');
            socket.off('player-left');
            socket.off('game-start');
            socket.offAny(); // 🆕 Nettoyer le listener debug
            socket.emit('leave-salon', salonId);
        };
    }, [salonId, navigate]);

    useEffect(() => {
        console.log('🔄 salon a changé:', salon);
    }, [salon]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-white text-xl">Chargement...</div>
            </div>
        );
    }

    if (!salon) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-white text-xl">Salon introuvable</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex tems-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    🎮 Salle d'attente
                </h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">
                        {salon.name || 'Partie IA' + new Date().toLocaleDateString()}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-medium">ID:</span>{salonId}</p>
                        <p><span className="font-medium">Statut:</span>
                            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                                {salon.status}
                            </span>
                        </p>
                        <p><span className="font-medium">Joueurs:</span>
                            <span className="ml-2 font-bold text-blue-600">
                                {salon.players?.length || 0}/{salon.maxPlayers}
                            </span>
                        </p>
                    </div>

                    {/* LISTE DES JOUEURS */}
                    {salon.players && salon.players.length > 0 && (
                        <div className="mt-4">
                            <p className="font-medium text-gray-700 mb-2">Joueurs connectés:</p>
                            <ul className="space-y-1">
                                {salon.players.map((player, index) => (
                                    <li key={player.user._id || index} className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span className="text-sm">{player.user?.username || 'Joueur inconnu'}</span>
                                        {player.user._id === user.id && <span className="text-xs text-blue-600">(Vous)</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => navigate('/')}
                    className='w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300'
                >
                    ← Retour à l'accueil
                </button>
            </div>
        </div>
    );
};

export default WaitingRoom;