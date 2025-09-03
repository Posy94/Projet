import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user } = useUser();

    useEffect(() => {

        if (user) {
 
            // CONNEXION WEBSOCKET AVEC L'UTILISATEUR AUTHENTIFIE
            const newSocket = io('http://localhost:8000');

            // AUTHENTIFICATION AUTOMATIQUE
            newSocket.emit('authenticate', {
                userId: user.id,
                username: user.username
            });

            // ECOUTE DES INVITATIONS
            newSocket.on('invitation_received', (invitation) => {
                setInvitations(prev => [...prev, invitation]);
            });

            newSocket.on('invitation_accepted', (data) => {
                console.log('✅ Invitation acceptée:', data);
                // REDIRECTION VERS LE SALON SI C'EST L'EXPEDITEUR
                if (data.fromUserId === user.id) {
                    // NAVIGATION VERS LE SALON
                    window.location.href = `/salon/${data.salonId}`
                }
            });

            newSocket.on('invitation_declined', (data) => {
                console.log('❌ Invitation refusée:', data);
            });

            newSocket.on('user_online', ({ userId }) => {
                setOnlineUsers(prev => [...prev, userId]);
            });

            newSocket.on('user_offline', ({ userId }) => {
                setOnlineUsers(prev => prev.filter(id => id !== userId));
            });

            setSocket(newSocket);

            return () => {
                console.log('🧹 Nettoyage socket...');
                newSocket.disconnect();
            };
        }
    }, [user]);

    // FONCTIONS UTILITAIRES
    const sendInvitation = (toUserId, salonId) => {
        if (socket && user) {
            socket.emit('send_invitation', {
                toUserId,
                salonId,
                fromUsername: user.username
            });
        }
    };

    const acceptInvitation = (invitationId) => {
        if (socket) {
            socket.emit('accept_invitation', { invitationId });
            // RETIRER DE LA LISTE LOCALE
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        }
    };

    const declineInvitation = (invitationId) => {
        if (socket) {
            socket.emit('decline_invitation', { invitationId });
            // RETIRER DE LA LISTE LOCALE
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        }
    };

    const value = {
        socket,
        invitations,
        onlineUsers,
        sendInvitation,
        acceptInvitation,
        declineInvitation
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket doit être utilisé dans un SocketProvider');
    }
    return context;
};