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
    const navigate = useNavigate();

    useEffect(() => {

        if (user) {

            console.log('🔌 Initialisation socket pour user:', user.username);

            const token = localStorage.getItem('token');
            console.log('🔑 Token trouvé:', !!token);
 
            // CONNEXION WEBSOCKET AVEC L'UTILISATEUR AUTHENTIFIE
            const newSocket = io('http://localhost:8000', {
                auth: {
                    token: token
                },
                extraHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });

            newSocket.on('connect', () => {
                console.log('🔌 Socket connecté avec ID:', newSocket.id);
            });

            // AUTHENTIFICATION AUTOMATIQUE
            newSocket.emit('authenticate', {
                userId: user.id,
                username: user.username
            });

            console.log('🔐 Authentification envoyée pour user:', user.username);

            // ECOUTE DES INVITATIONS
            newSocket.on('invitation_received', (invitation) => {
                console.log('🔔 INVITATION REÇUE VIA WEBSOCKET:', invitation);
                setInvitations(prev => [...prev, invitation]);
            });

            // ACCEPTATION CONFIRMEE POUR CELUI QUI ACCEPTE
            newSocket.on('invitation_accepted', (data) => {
                console.log('✅ Mon acceptation confirmée:', data);
                if (data.success && data.salonId) {
                    navigate(`/jeu/${data.salonId}`);
                    // Nettoyer les invitations
                    setInvitations([]);
                }
            });

            // QUELQU'UN ACCEPTE MON INVITATION
            newSocket.on('invitation_accepted_by_user', (data) => {
                console.log('🎉 Mon invitation a été acceptée:', data);
                // Redirection vers le salon
                navigate(`/jeu/${data.salonId}`);
                // Nettoyer les invitations  
                setInvitations([]);
            });

            // REFUS CONFIRME POUR CELUI QUI REFUSE
            newSocket.on('invitation_declined', (data) => {
                console.log('❌ Mon refus confirmé:', data);
                navigate('/dashboard');
                setInvitations([]);
            });

            // QUELQU4UN A REFUSE MON INVITATION
            newSocket.on('invitation_declined_by_user', (data) => {
                console.log('💔 Mon invitation a été refusée:', data);
                // Rester sur la page actuelle mais nettoyer les invitations
                setInvitations(prev => prev.filter(inv => inv.id !== data.invitationId));

                // Optionnel : afficher une notification
                alert(`${data.declinedBy.username} a refusé votre invitation`);
            });

            newSocket.on('user_online', ({ userId }) => {
                setOnlineUsers(prev => [...prev, userId]);
            });

            newSocket.on('user_offline', ({ userId }) => {
                setOnlineUsers(prev => prev.filter(id => id !== userId));
            });

            // Gestion des erreurs
            newSocket.on('invitation_error', (data) => {
                console.error('❌ Erreur invitation:', data);
                alert(data.message);
            });

            setSocket(newSocket);

            return () => {
                console.log('🧹 Nettoyage socket...');
                newSocket.removeAllListeners();
                newSocket.disconnect();
            };
        }
    }, [user, navigate]);

    // FONCTIONS UTILITAIRES
    const sendInvitation = async (toUserId) => {
        if (user) {
            try {
                console.log('📤 Envoi invitation vers:', toUserId);
                console.log('📤 User connecté:', user);

                const response = await fetch('http://localhost:8000/api/invitations/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                        receiverId: toUserId  // 🔥 CHANGÉ de targetUserId à receiverId
                    })
                });

                console.log('📊 Status réponse:', response.status);

                // Debug de la réponse
                const responseText = await response.text();
                console.log('📋 Réponse brute:', responseText);

                if (!response.ok) {
                    let errorData;
                    try {
                        errorData = JSON.parse(responseText);
                        console.log('❌ Erreur serveur:', errorData);
                    } catch {
                        console.log('❌ Erreur non-JSON:', responseText);
                    }
                    throw new Error(errorData?.message || 'Erreur serveur');
                }

                const data = JSON.parse(responseText);
                console.log('✅ Invitation envoyée:', data);

                return data;

            } catch (error) {
                console.error('💥 Erreur envoi invitation:', error);
                throw error;
            }
        }
    };

    const acceptInvitation = (invitationId) => {
        console.log('🎯 FONCTION acceptInvitation appelée avec ID:', invitationId);
        console.log('👤 USER CONTEXT:', user); // ← AJOUTE ÇA
        console.log('👤 USER USERNAME:', user?.username); // ← ET ÇA

        if (socket && socket.connected) {
            // ✅ FORCE L'AUTHENTIFICATION AVANT
            if (user) {
                console.log('🔐 Envoi authentification avant acceptation...');
                socket.emit('authenticate', user.username);

                // ✅ PETIT DÉLAI POUR L'AUTH
                setTimeout(() => {
                    console.log('📤 ENVOI accept_invitation vers serveur...');
                    socket.emit('accept_invitation', { invitationId });
                }, 100); // 100ms de délai
            }

            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        }
    };

    const declineInvitation = (invitationId) => {
        console.log('🚫 FONCTION declineInvitation appelée avec ID:', invitationId);
        console.log('🔌 Socket connecté ?', socket?.connected);

        if (socket && socket.connected) {
            console.log('📤 ENVOI decline_invitation vers serveur...');
            socket.emit('decline_invitation', { invitationId });

            // ✅ Retirer immédiatement de la liste locale
            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

            // ✅ Redirection vers l'accueil pour celui qui refuse
            navigate('/dashboard');
        } else {
            console.error('❌ Socket non connecté');
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