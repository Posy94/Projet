import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const WaitingRoom = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [salon, setSalon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            console.log('🔍 SalonID depuis URL:', id);
        fetchSalonInfo();
        }
    }, [id]);

    const fetchSalonInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token);

            const response = await axios.get(`http://localhost:8000/api/salons/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type' : 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Salon non trouvé');
            }

            const data = await response.json();
            setSalon(response.data);
        } catch (error) {
            console.error('Erreur récupération salon:', error);
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                <div className="text-white text-xl">Chargement...</div>
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
                        {salon.name}
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