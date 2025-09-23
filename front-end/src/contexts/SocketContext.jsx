import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [invitations, setInvitations] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { user, loading } = useUser();
    const navigate = useNavigate();

    // USEEFFECT PRINCIPAL
    useEffect(() => {
        console.log('🔄 Socket useEffect - loading:', loading, 'user:', user?.username);

        if (loading) {
            console.log('⏳ Socket en attente du chargement...');
            return;
        }

        if (!user || !user.username) {
            console.log('❌ Pas d\'utilisateur valide pour socket');
            // ✅ NETTOYER LE SOCKET S'IL EXISTE
            if (socket) {
                console.log('🧹 Nettoyage socket existant...');
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        // ✅ ÉVITER LA DOUBLE CONNEXION
        if (socket && socket.connected) {
            console.log('🔌 Socket déjà connecté pour:', user.username);
            return;
        }

        console.log('🔌 Initialisation socket pour user:', user.username);
        console.log('🎭 Role user:', user.role);

        // ✅ NETTOYER L'ANCIEN SOCKET AVANT D'EN CRÉER UN NOUVEAU
        if (socket) {
            console.log('🧹 Suppression ancien socket...');
            socket.disconnect();
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Pas de token pour socket');
            return;
        }

        console.log('🔑 Token trouvé:', !!token);

        // ✅ CONNEXION WEBSOCKET AMÉLIORÉE
        const newSocket = io('http://localhost:8000', {
            auth: {
                token: token
            },
            extraHeaders: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true,
            transports: ['websocket', 'polling'],
            // ✅ OPTIONS DE RECONNEXION AMÉLIORÉES
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
            timeout: 10000,
            forceNew: true // ✅ FORCE UNE NOUVELLE CONNEXION
        });

        // ✅ GESTION DES ÉVÉNEMENTS DE CONNEXION
        newSocket.on('connect', () => {
            console.log('🔌 Socket connecté avec ID:', newSocket.id);
            
            // Authentification immédiate
            newSocket.emit('authenticate', {
                userId: user.id,
                username: user.username,
                role: user.role
            });
            console.log('🔐 Authentification envoyée pour user:', user.username);
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Erreur connexion socket:', error.message);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('🔌 Socket déconnecté:', reason);
            // ✅ NE PAS TENTER DE RECONNECTER MANUELLEMENT
            if (reason === 'io client disconnect') {
                console.log('🛑 Déconnexion manuelle, pas de reconnexion');
            }
        });

        // ✅ GESTION D'ERREUR WEBSOCKET
        newSocket.on('error', (error) => {
            console.error('❌ Erreur socket:', error);
        });

        // ✅ AUTHENTIFICATION CONFIRMÉE
        newSocket.on('authenticated', (data) => {
            console.log('✅ Authentification réussie:', data);
        });

        // ✅ ECOUTE DES INVITATIONS
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

        // QUELQU'UN A REFUSE MON INVITATION
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

        // ✅ CLEANUP AMÉLIORÉ
        return () => {
            console.log('🧹 Nettoyage socket useEffect...');
            if (newSocket) {
                newSocket.removeAllListeners();
                newSocket.disconnect();
            }
        };

    }, [user, loading]);

    // CLEANUP AU DÉMONTAGE DU COMPOSANT
    useEffect(() => {
        return () => {
            console.log('🧹 Nettoyage final SocketContext...');
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
                setSocket(null);
            }
        };
    }, []); // UNE SEULE FOIS AU DÉMONTAGE

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
                        receiverId: toUserId
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
        console.log('👤 USER CONTEXT:', user);
        console.log('👤 USER USERNAME:', user?.username);
        console.log('🔌 Socket connecté ?', socket?.connected);

        if (socket && socket.connected && user) {
            console.log('📤 ENVOI accept_invitation vers serveur...');
            socket.emit('accept_invitation', { 
                invitationId,
                userId: user.id,
                username: user.username 
            });

            setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        } else {
            console.error('❌ Socket non connecté ou user manquant');
        }
    };

    const declineInvitation = (invitationId) => {
        console.log('🚫 FONCTION declineInvitation appelée avec ID:', invitationId);
        console.log('🔌 Socket connecté ?', socket?.connected);

        if (socket && socket.connected) {
            console.log('📤 ENVOI decline_invitation vers serveur...');
            socket.emit('decline_invitation', { 
                invitationId,
                userId: user.id,
                username: user.username 
            });

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