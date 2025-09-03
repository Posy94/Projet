import React from "react";
import { useSocket } from "../contexts/SocketContext";
import { useUser } from "../contexts/UserContext";
import { FaUserPlus, FaGamepad, FaTimes, FaCheck } from 'react-icons/fa';

const InvitationSystem = () => {
    const { invitations, acceptInvitation, declineInvitation } = useSocket();
    const { user } = useUser();

    if (!user || invitations.length === 0) return null;       
    
    return (
        <>
            {/* OVERLAY BACKDROP */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">

                {/* CONTAINER PRINCIPAL */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full max-h-96 overflow-y-auto">

                    {/* HEADER */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <FaGamepad className='text-xl animate-pulse' />
                            <h2 className="text-xl font-bold">
                                Invitation{invitations.length > 1 ? 's' : ''} de jeu
                            </h2>
                            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm font-medium">
                                {invitations.length}
                            </span>
                        </div>
                    </div>

                    {/* LISTE DES INVITATIONS */}
                    <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                        {invitations.map((invitation, index) => (
                            <div
                            key={invitation.id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
                            style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* INFO UTILISATEUR */}
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center text-white font-bold text-lg shadow-lg">
                                        {invitation.fromUser.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 drak:text-white text-lg">
                                            {invitation.fromUser.username}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1">
                                            <FaUserPlus className="text-xs" />
                                            Vous invite à jouer !
                                        </p>
                                    </div>

                                    {/* TEMPS */}
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {new Date(invitation.createdAt).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                {/* DETAILS DU JEU */}
                                <div className="bg-white dark:bg-gray-600 rounded-lg p-3 mb-4 border border-gray-100 dark:border-gray-500">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Salon :</span>
                                        <span className="font-mono font-medium text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            #{invitation.salonId.slice(-6)}
                                        </span>
                                    </div>
                                </div>

                                {/* BOUTON D'ACTION */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => acceptInvitation(invitation.id)}
                                        className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <FaCheck className="text-sm" />
                                        Accepter
                                    </button>

                                    <button
                                        onClick={() => declineInvitation(invitation.id)}
                                        className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <FaCheck className="text-sm" />
                                        Refuser
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default InvitationSystem;