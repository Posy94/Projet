import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ProfileSlider = ({ isOpen, onClose, user, updateUser, onLogout }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [userStats, setUserStats] = useState(null);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '👤');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Récupérer les stats au chargement
    useEffect(() => {
        if (isOpen && user) {
            fetchUserStats();
            setFormData({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || ''
            });
            setSelectedAvatar(user.avatar || '👤');
        }
    }, [isOpen, user]);

    const fetchUserStats = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/suivis/stats', {
                withCredentials: true
            });

            // ✅ VÉRIFIER LE CONTENT-TYPE
            if (response.headers['content-type']?.includes('application/json')) {
                console.log('✅ Stats reçues:', response.data);
                setUserStats(response.data);
            } else {
                console.log('❌ Réponse non-JSON reçue');
                // Rediriger vers login si HTML d'erreur
                navigate('/connexion');
            }
        } catch (error) {
            console.log('❌ Erreur récupération stats:', error.message);
            console.log('❌ Status:', error.response?.status);
            // Vérifier si c'est un problème d'auth
            if (error.response?.status === 401) {
                navigate('/connexion');
            }
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/auth/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage('✅ Profil mis à jour avec succès !');
                
                if (updateUser) {
                    updateUser ({
                        ...user,
                        username: formData.username,
                        email: formData.email,
                        bio: formData.bio
                    });
                }
            } else {
                setMessage(`❌ ${data.message}`);
            }
        } catch (error) {
            setMessage('❌ Erreur lors de la mise à jour');
        } finally {
            setLoading(false);
        }
    };

    const refreshStats = async () => {
        if (user) {
            await fetchUserStats();
        }
    };

    useEffect(() => {
        window.refreshUserStats = refreshStats;
        return () => {
            delete window.refreshUserStats;
        };
    }, [user]);

    const handleUpdateAvatar = async (newAvatar) => {
        try {
            const response = await fetch('/api/auth/profile/avatar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ avatar: newAvatar })
            });

            if (response.ok) {
                setSelectedAvatar(newAvatar);
                setMessage('✅ Avatar mis à jour !');

                // AUTO EFFACEMENT APRES 3 SECONDES
                setTimeout(() => {
                    setMessage('');
                }, 3000);

                if (updateUser) {
                    updateUser({
                        ...user,
                        avatar: newAvatar
                    });
                }
            }
        } catch (error) {
            setMessage('❌ Erreur mise à jour avatar');

            setTimeout(() => {
                    setMessage('');
                }, 5000);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('❌ Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.put('http://localhost:8000/api/auth/change-password', passwordData, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            alert('✅ Mot de passe modifié avec succès !');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('❌ Erreur lors du changement de mot de passe:', error.response.data.message);
            alert('❌ Erreur : ' + error.response.data.message);
        } finally {
            setLoading(false);
        }
    };

    const avatarOptions = ['👤', '🎮', '🎯', '🎲', '🃏', '🎪', '🎨', '⭐', '🔥', '💎'];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slider Panel */}
            <div
                className={`fixed top-0 right-0 h-full bg-white z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } flex flex-col`}
                style={{
                    width: '350px',        // largeur stable, adaptée au contenu
                    maxWidth: '90vw',      // ne pas dépasser l'écran sur mobile
                    boxSizing: 'border-box',
                }}
                onClick={e => e.stopPropagation()}
            >


                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <h2 className="text-xl font-bold">👤 Mon Profil</h2>
                    <button
                        onClick={onClose}
                        className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                    >
                        ×
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 bg-gray-50 border-b">
                    <div className="flex items-center space-x-3">
                        <div className="text-3xl">{user?.avatar || '👤'}</div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-800">{user?.username}</h3>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b bg-white overflow-x-auto  min-w-0">
                    {[
                        { id: 'profile', label: '📝 Profil', icon: '📝' },
                        { id: 'stats', label: '📊 Stats', icon: '📊' },
                        { id: 'avatar', label: '🖼️ Avatar', icon: '🖼️' },
                        { id: 'password', label: '🔐 MDP', icon: '🔐' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors min-w-0 ${activeTab === tab.id
                                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                }`}
                        >
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden text-lg">{tab.icon}</span>
                        </button>
                    ))}
                </div>

                {/* Message d'état */}
                {message && (
                    <div className={`mx-4 mt-4 p-3 rounded-lg text-sm ${message.includes('✅')
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                        {message}
                    </div>
                )}

                {/* Content */}
                <div className="p-4 min-h-0 overflow-auto">
                    {/* Onglet Profil */}
                    {activeTab === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nom d'utilisateur
                                </label>
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bio
                                </label>
                                <textarea
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Parlez-nous de vous..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '⏳ Mise à jour...' : '✅ Mettre à jour'}
                            </button>
                        </form>
                    )}
                    

                    {/* Onglet Stats */}
                    {activeTab === 'stats' && (
                        <div className="space-y-4">
                            {userStats ? (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border">
                                        <div className="text-2xl font-bold text-blue-600">{userStats.totalGames}</div>
                                        <div className="text-sm text-gray-600">Parties jouées</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border">
                                        <div className="text-2xl font-bold text-green-600">{userStats.wins}</div>
                                        <div className="text-sm text-gray-600">Parties gagnées</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border">
                                        <div className="text-2xl font-bold text-red-600">{userStats.losses}</div>
                                        <div className="text-sm text-gray-600">Parties perdues</div>
                                    </div>

                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border">
                                        <div className="text-2xl font-bold text-orange-600">{userStats.winRate}%</div>
                                        <div className="text-sm text-gray-600">Taux de victoire</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="animate-spin text-2xl mb-2">⏳</div>
                                    <p className="text-gray-500">Chargement des statistiques...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Onglet Avatar */}
                    {activeTab === 'avatar' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-6xl mb-2">{selectedAvatar}</div>
                                <p className="text-gray-600">Avatar actuel</p>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3 text-gray-800">Choisir un nouvel avatar :</h4>
                                <div className="grid grid-cols-5 gap-3">
                                    {avatarOptions.map((avatar) => (
                                        <button
                                            key={avatar}
                                            className={`text-3xl p-3 rounded-lg border-2 hover:scale-110 transition-all flex items-center justify-center ${selectedAvatar === avatar
                                                    ? 'border-blue-500 bg-blue-50 scale-105'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            onClick={() => handleUpdateAvatar(avatar)}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Onglet Mot de passe */}
                    {activeTab === 'password' && (
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mot de passe actuel
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirmer le nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? '⏳ Modification...' : '🔐 Changer le mot de passe'}
                            </button>
                        </form>
                    )}
                </div>
                <div className="p-4 border-t bg-gray-50">
                    <button
                        onClick={onLogout}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-md hover:shadow-lg"
                    >
                        <span>🚪</span>
                        Se déconnecter
                    </button>
                </div>
            </div>
        </>
    );
};

export default ProfileSlider;
