import React from "react";
import { useSocket } from "../contexts/SocketContext";
import { useUser } from "../contexts/UserContext";
import { FaUserPlus, FaGamepad, FaTimes, FaCheck, FaClock, FaUsers } from 'react-icons/fa';

const InvitationSystem = () => {
    const { invitations, acceptInvitation, declineInvitation } = useSocket();
    const { user } = useUser();

    console.log('🎯 Invitations reçues:', invitations);
    invitations.forEach((inv, index) => {
        console.log(`🔍 Invitation ${index}:`, inv);
        console.log(`👤 fromUser:`, inv.from);
        console.log(`🏠 salonId:`, inv.salonId);
    });

    if (!invitations || invitations.length === 0) {
        return null;       
    }
    
    return (
        <div className="fixed top-4 right-4 z-50 space-y-3">
            {invitations.map((invitation, index) => (
                <div
                    key={invitation.id || index}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 p-4 w-80 transform transition-all duration-300 animate-slideInRight"
                >
                    {/* En-tête */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                            <FaGamepad className="text-lg" />
                            <span className="font-semibold">Invitation de jeu</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                            <FaClock className="text-xs" />
                            <span>Maintenant</span>
                        </div>
                    </div>

                    {/* Corps du message */}
                    <div className="flex items-start space-x-3 mb-4">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                {invitation.from?.avatar ||
                                    invitation.from?.username?.charAt(0).toUpperCase() ||
                                    '?'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        </div>

                        {/* Contenu */}
                        <div className="flex-1">
                            <div className="font-semibold text-gray-900 dark:text-white mb-1">
                                {invitation.from?.username || 'Utilisateur inconnu'}
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 text-sm mb-2">
                                <FaUsers className="text-xs" />
                                <span>Vous invite à jouer !</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Salon : <span className="font-mono font-semibold">
                                    {invitation.salonId || 'ID non disponible'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Boutons d'action */}
                    <div className="flex space-x-2">
                        <button
                            onClick={() => acceptInvitation(invitation.id)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <FaCheck className="text-sm" />
                            <span>Accepter</span>
                        </button>
                        <button
                            onClick={() => declineInvitation(invitation.id)}
                            className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <FaTimes className="text-sm" />
                            <span>Refuser</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default InvitationSystem;