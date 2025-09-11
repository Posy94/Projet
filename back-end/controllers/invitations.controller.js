const UsersModel = require('../models/users.model');
const InvitationsModel = require('../models/invitations.model');
const SalonModel = require('../models/salons.model');


const InvitationsController = {

    // RECUPERER LES UTILISATEURS EN LIGNE
    getOnlineUsers: async (req, res) => {
        try {
            const currentUserId = req.user.id;
            console.log('🎯 Current user ID:', currentUserId);

            // Récupérer les utilisateurs en ligne
            const onlineUsers = await UsersModel.getOnlineUsers();
            console.log('📋 Tous les users en ligne:', onlineUsers.map(u => ({
                id: u._id.toString(),
                username: u.username,
                isCurrentUser: u._id.toString() === currentUserId
            })));

            // Filtrer l'utilisateur actuel
            const availableUsers = onlineUsers.filter(user => {
                const isCurrentUser = user._id.toString() === currentUserId;
                console.log(`🔍 User ${user.username}: currentUser=${isCurrentUser}`);
                return !isCurrentUser;
            }); 
            console.log('🎯 Users disponibles après filtre:', availableUsers.length);

            res.json({
                success: true,
                message: `${availableUsers.length} joueur(s) en ligne`,
                data: availableUsers
            });

        } catch (error) {
            console.error('❌ Erreur getOnlineUsers:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des joueurs en ligne',
                error: error.message
            });
        }
    },

    // CREER UNE INVITATION
    createInvitation: async (fromUserId, toUserId, salonId) => {
        try {
            // VERIFIER QUE L'UTILISATEUR CIBLE EST DISPONIBLE
            const targetUser = await UsersModel.isUserAvailable(toUserId);
            if (!targetUser) {
                throw new Error('Le joueur n\'est pas disponible');
            }

            // VERIFIER S'IL Y A DEJA UNE INVITATION EN ATTENTE
            const existingInvitation = await InvitationsModel.getPendingInvitation(fromUserId, toUserId);
            if (existingInvitation) {
                throw new Error('Vous avez déjà une invitation en attente pour ce joueur');
            }

            // CREER L'INVITATION
            const invitation = new InvitationsModel({
                salonId,
                fromUser: fromUserId,
                toUser: toUserId
            });

            await invitation.save();

            // POPULATE LES DONNEES DES UTILISATEURS
            await invitation.populate('fromUser', 'username avatar');
            await invitation.populate('toUser', 'username avatar');

            return invitation;

        } catch (error) {
            console.error('❌ Erreur createInvitation:', error);
            throw error;
        }
    },

    // ACCEPTER UNE INVITATION
    acceptInvitation: async (req, res) => {
        try {
            const { invitationId } = req.params;
            const userId = req.user.id;

            const invitation = await InvitationsModel.findById(invitationId)
                .populate('fromUser', 'username avatar')
                .populate('toUser', 'username avatar');
            
            if (!invitation) {
                return res.status(404).json({
                    success: false,
                    message: 'Invitation introuvable'
                });
            }

            // VERIFIER QUE C'EST BIEN LE DESTINATAIRE
            if (invitation.toUser._id.toString() !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Vous n\'êtes pas autorisé à accepter cette invitation'
                });
            }

            // VERIFIER LE STATUT ET L'EXPIRATION
            if (invitation.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cette invitation a déjà été traitée'
                });
            }

            if (invitation.expiresAt < new Date()) {
                invitation.status = 'expired';
                await invitation.save();
                return res.status(400).json({
                    success: false,
                    message: 'Cette invitation a expiré'
                });
            }

            // ACCEPTER L'INVITATION
            await invitation.accept();

            // AJOUTE LE JOUEUR AU SALON
            const salon = await SalonModel.findOne({ salonId: invitation.salonId });

            if (salon) {
                const toUser = await UsersModel.findById(userId);

                console.log('🔍 USER ID ACCEPTATION:', userId);
                console.log('🔍 REQ.USER:', req.user);
                console.log('🔍 TO USER RÉCUPÉRÉ:', toUser);
                console.log('🔍 TO USER USERNAME:', toUser?.username);

                salon.players.push({
                    user: userId,
                    userId: userId,
                    username: toUser.username,
                    ready: false,
                    socketId: null
                });

                await salon.save();
                console.log('✅ JOUEUR AJOUTÉ AU SALON:', toUser.username);
            }

            res.json({
                success: true,
                message: 'Invitation acceptée avec succès',
                data: {
                    salonId: invitation.salonId,
                    fromUser: invitation.fromUser,
                    invitation: invitation
                }
            });

        } catch (error) {
            console.error('❌ Erreur acceptInvitation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'acceptation de l\'invitation',
                error: error.message
            });
        }
    },

    // DECLINER UNE INVITATION
    declineInvitation: async (req, res) => {
        try {
            const { invitationId } = req.params;
            const userId = req.user.id;

            const invitation = await InvitationsModel.findById(invitationId);

            if (!invitation) {
                return res.status(404).json({
                    success: false,
                    message: 'Invitation introuvable'
                });
            }

            if (invitation.status !== 'pending') {
                return res.status(400).json({
                    success: false,
                    message: 'Cette invitation a déjà été traitée'
                });
            }

            // DECLINER L'INVITATION
            await invitation.decline();

            res.json({
                success: true,
                message: 'Invitation déclinée'
            });

        } catch (error) {
            console.error('❌ Erreur declineInvitation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors du déclin de l\'invitation',
                error: error.message
            });
        }
    },

    // RECUPERER LES INVITATIONS RECUES
    getUserInvitations: async (req, res) => {
        try {
            const userId = req.user.id;

            // EXPIRER LES ANCIENNES INVITATIONS
            await InvitationsModel.expireOldInvitations();

            const invitations = await InvitationsModel.getUserPendingInvitations(userId);

            res.json({
                success: true,
                message: `${invitations.length} invitation(s) en attente`,
                data: invitations
            });

        } catch (error) {
            console.error('❌ Erreur getUserInvitations:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des invitations',
                error: error.message
            });
        }
    },

    sendInvitation: async (req, res) => {
        try {
            console.log('📥 Données reçues:', req.body);

            const { receiverId } = req.body;
            const senderId = req.user?.id;

            // CREATION DU SALON
            const salonId = `salon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Récupérer les infos des users
            const fromUser = await UsersModel.findById(senderId);
            const toUser = await UsersModel.findById(receiverId);

            const newSalon = new SalonModel({
                salonId,
                name: `Partie ${fromUser.username} vs ${toUser.username}`,
                userCreator: senderId,
                maxPlayers: 2,
                players: [
                    {
                        user: senderId,
                        userId: senderId,
                        username: fromUser.username,
                        ready: false,
                        socketId: null
                    }
                    // Le 2ème joueur sera ajouté lors de l'acceptation
                ],
                statut: 'waiting',
                typePartie: 'multiplayer',
                createdAt: new Date()
            });

            await newSalon.save();
            console.log('✅ SALON CRÉÉ:', newSalon.salonId); 

            // CRÉER L'INVITATION EN BASE
            const newInvitation = await InvitationsModel.create({
                fromUser: senderId,
                toUser: receiverId,
                salonId: salonId,
                status: 'pending',
                expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 min
            });

            const populatedInvitation = await InvitationsModel
                .findById(newInvitation._id)
                .populate('fromUser', 'username avatar')
                .populate('toUser', 'username avatar');

            console.log('✅ Invitation créée:', populatedInvitation);

            // 🔥 ÉMETTRE VIA WEBSOCKET au destinataire
            const io = req.app.get('io'); // Récupérer l'instance Socket.IO
            if (io) {
                io.to(`user_${receiverId}`).emit('invitation_received', {
                    id: populatedInvitation._id,
                    from: populatedInvitation.fromUser,
                    to: populatedInvitation.toUser,
                    salonId: populatedInvitation.salonId,
                    createdAt: populatedInvitation.createdAt,
                    expiresAt: populatedInvitation.expiresAt
                });
                console.log('📡 Invitation émise via WebSocket vers:', receiverId);
            }

            res.status(201).json({
                success: true,
                message: 'Invitation envoyée avec succès',
                data: populatedInvitation
            });

        } catch (error) {
            console.error('❌ Erreur sendInvitation:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur serveur',
                error: error.message
            });
        }
    },
}

module.exports = InvitationsController;