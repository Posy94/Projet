const SalonsModel = require('../models/salons.model');
const suiviController = require('../controllers/suivis.controller');
const RecompensesController = require('../controllers/recompenses.controller');
const mongoose = require('mongoose');

const UsersModel = require('../models/users.model');
const InvitationsModel = require('../models/invitations.model');
const invitationsModel = require('../models/invitations.model');
const usersModel = require('../models/users.model');

const handleUserConnection = async (socket, userId) => {
    try {
        await UsersModel.setUserOnline(userId, socket.id);
        socket.join(`user_${userId}`);
        console.log(`✅ Utilisateur ${userId} connecté avec socket ${socket.id}`);
        socket.broadcast.emit('user_online', { userId });
    } catch (error) {
        console.error('❌ Erreur handleUserConnection:', error);
    }
};

const handleSendInvitation = async (io, socket, data) => {
    try {
        const { fromUserId, toUserId, salonId, fromUsername } = data;

        // VERIFIER QUE LE DESTINATAIRE EST EN LIGNE
        const targetUser = await UsersModel.findById(toUserId);
        if (!targetUser || !targetUser.isOnline) {
            return socket.emit('invitation_error', {
                success: false,
                message: 'Le joueur n\'est pas en ligne'
            });
        }

        // CREER L'INVITATION
        const invitation = await InvitationsModel.create({
            salonId,
            fromUser: fromUserId,
            toUser: toUserId,
            status: 'pending',
            expiresAt: new Date(Date.now() + 2 * 60 * 1000)
        });

        await invitation.populate('fromUser', 'username avatar');

        // ENVOYER L'INVITATION AU DESTINATAIRE
        io.to(`user_${toUserId}`).emit('invitation_received', {
            id: invitation._id,
            salonId: invitation.salonId,
            fromUser: {
                id: invitation.fromUser._id,
                username: invitation.fromUser.username,
                avatar: invitation.fromUser.avatar
            },
            expiresAt: invitation.expiresAt,
            message: `${invitation.fromUser.username} vous invite à jouer !`
        });

        // CONFIRMER A L'EXPEDITEUR
        socket.emit('invitation_sent', {
            success: true,
            message: `Invitation envoyée`,
            invitationId: invitation._id
        });

        console.log(`📨 Invitation envoyée: ${fromUsername} → user_${toUserId}`);

    } catch (error) {
        console.error('❌ Erreur handleSendInvitation:', error);
        socket.emit('invitation_error', {
            success: false,
            message: error.message || 'Erreur lors de l\'envoi de l\'invitation'
        });
    }
};

const handleAcceptInvitation = async (io, socket, data) => {
    try {
        const { invitationId } = data;

        const invitation = await invitationsModel.findById(invitationId)
            .populate('fromUser', 'username avatar currentSocketId')
            .populate('toUser', 'username avatar')
        
            if (!invitation || invitation.status !== 'pending') {
                return socket.emit('invitation_error', {
                    success: false,
                    message: 'Invitation introuvable ou expirée'
                });
            }

            // MARQUER COMME ACCEPTEE
            invitation.status = 'accepted';
            invitation.respondedAt = new Date();
            await invitation.save();

            // MARQUER COMME ACCEPTEE
            invitation.status = 'accepted';
            invitation.respondedAt = new Date();
            await invitation.save();

            // NOTIFIER L'EXPEDITEUR
            if (invitation.fromUser,currentSocketId) {
                io.to(invitation.fromUser.currentSocketId).emit('invitation_accepted_by_user', {
                    invitationId: invitation._id,
                    acceptedBy: {
                        id: invitation.toUser._id,
                        username: invitation.toUser.username,
                        avatar: invitation.toUSer.avatar
                    },
                    salonId: invitation.salonId,
                    message: `${invitation.toUser.username} a accepté votre invitation !`
                });
            }

            // CONFIRMER A CELUI QUI ACCEPTE
            socket.emit('invitation_accepted', {
                success: true,
                salonId: invitation.salonId,
                message: 'Invitation acceptée ! Redirection vers le salon...'
            });

            console.log(`✅ Invitation acceptée: ${invitation.toUser.username} → salon ${invitation.salonId}`);

    } catch (error) {
        console.error('❌ Erreur handleAcceptInvitation:', error);
        socket.emit('invitation_error', {
            success: false,
            message: 'Erreur lors de l\'acceptation'
        });
    }
};

const handleDeclineInvitation = async (io, socket, data) => {
    try {
        const { invitationId } = data;

        const invitation = await invitationsModel.findById(invitationId)
            .populate('fromUser', 'username avatar currentSocketId')
            .populate('toUser', 'username avatar')

        if (!invitation) {
            return socket.emit('invitation_error', {
                success: false,
                message: 'Invitation introuvable'
            });
        }

        // MARQUER COMME DECLINEE
        invitation.status = 'declined';
        invitation.respondedAt = new Date();
        await invitation.save();

        // NOTIFIER L'EXPEDITEUR
        if (invitation.fromUser.currentSocketId) {
            io.to(invitation.fromUser.currentSocketId).emit('invitation_declined_by_user', {
                invitationId: invitation._id,
                declinedBy: {
                    id: invitation.toUSer._id,
                    username: invitation.toUser.username,
                    avatar: invitation.toUSer.avatar
                },
                message: `${invitation.toUser.username} a decliné votre invitation`
            });
        }

        // CONFIRMER A CELUI QUI DECLINE
        socket.emit('invitation_declined', {
            success: true,
            message: 'Invitation déclinée'
        });

        console.log(`❌ Invitation déclinée: ${invitation.toUser.username} de ${invitation.fromUser.username}`);

    } catch (error) {
        console.error('❌ Erreur handleDeclineInvitation:', error);
        socket.emit('invitation_error', {
            success: false,
            message: 'Erreur lors du déclin'
        });
    }
};

const handleUserDisconnection = async (socket) => {
    try {
        const user = await usersModel.findOne({ currentSocketId: socket.id });

        if (user) {
            console.log(`🔌 Déconnexion détectée pour: ${user.username}`);

            // DELAI DE GRACE AVANT DE MARQUER OFFLINE
            setTimeout(async () => {
                const stillConnected = await UsersModel.findOne({
                    _id: user._id,
                    currentSocketId: socket.id
                });

                if (stillConnected) {
                    await usersModel.setUserOffline(user._id);
                    console.log(`❌ Utilisateur ${user.username} marqué offline`);

                    socket.broadcast.emit('user_offline', {
                        userId: user._id,
                        username: user.username
                    });

                    // ANNULER LES INVITATIONS EN ATTENTE
                    await invitationsModel.cancelPendingInvitations(user._id);
                }
            }, 15000);
        }

    } catch (error) {
        console.error('❌ Erreur handleUserDisconnection:', error);
    }
}

// NETTOYAGE PERIODIQUE
const startCleanupInterval = () => {
    setInterval(async () => {
        try {
            // await usersModel.cleanupInactiveUsers();
            await invitationsModel.expireOldInvitations();
            console.log('🧹 Nettoyage effectué');
        } catch (error) {
            console.error('❌ Erreur nettoyage:', error);
        }
    }, 5 * 60 * 1000);
};

const updateUserStats = async (userId, result) => {
    try {
        const User = require('../models/users.model');
        
        console.log('📊 MISE À JOUR STATS:', { userId, result });
        
        const updateFields = {};
        
        if (result === 'win') {
            updateFields.$inc = { 
                'stats.wins': 1,
                'stats.gamesPlayed': 1 
            };
        } else if (result === 'lose') {
            updateFields.$inc = { 
                'stats.losses': 1,
                'stats.gamesPlayed': 1 
            };
        } else if (result === 'draw') {
            updateFields.$inc = { 
                'stats.draws': 1,
                'stats.gamesPlayed': 1 
            };
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateFields,
            { new: true }
        );
        
        console.log('✅ STATS MISES À JOUR:', updatedUser?.stats);
        return updatedUser;
        
    } catch (error) {
        console.error('❌ Erreur mise à jour stats:', error);
    }
};


const savedGameStats = async (salon, finalResult) => {
    try {
        console.log('🎮 Sauvegarde de la partie...');

        let gagnant;

        if (finalResult === 'ai') {
            gagnant = {
                user: { _id: 'ai', username: 'IA' },
                choice: 'unknow'
            };
        } else if (finalResult === 'player') {
            const humanPlayer = salon.players[0];
            
            gagnant = {
                user: {
                    _id: humanPlayer.user.id,
                    username: humanPlayer.username
                },
                choice: humanPlayer.choice || 'unknown'
            };
        }

        console.log('🏆 GAGNANT IDENTIFIÉ:', gagnant);

        const gameData = {
            userId: salon.players[0].userId,
            gameId: salon._id,
            choiceUsed: salon.players[0].choice,
            result: finalResult === 'player' ? 'win' : 'lose',
            roundNumber: 1,
            gameDuration: new Date() - salon.createdAt || 30000
        };

        console.log('🎮 DONNÉES FINALES:', gameData);

        await suiviController.createSuivi(gameData);

        if (finalResult === 'player') {
            await updateUserStats(salon.players[0].userId, 'win');
        } else {
            await updateUserStats(salon.players[0].userId, 'lose');
        }

        console.log('✅ Partie sauvegardée avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
    }
}

const savedGameStatsPVP = async (salon, result) => {
    try {
        console.log('🎮 Sauvegarde de la partie PVP...');
        console.log('🎯 RESULT REÇU:', result); // ← AJOUTE ce log

        const winner = result.winner;
        const loser = result.loser;

        // Sauvegarde pour le GAGNANT
        const winnerData = {
            userId: winner.playerId,
            gameId: salon._id,
            choiceUsed: salon.players.find(p => p.user.toString() === winner.playerId.toString())?.choice || 'unknown',
            result: 'win',
            roundNumber: salon.currentRound || 1,
            gameDuration: new Date() - salon.createdAt || 30000
        };

        console.log('🏆 DONNÉES WINNER:', winnerData);

        await suiviController.createSuivi(winnerData);

        // Sauvegarde pour le PERDANT
        const loserData = {
            userId: loser.playerId,
            gameId: salon._id,
            choiceUsed: salon.players.find(p => p.user.toString() === loser.playerId.toString())?.choice || 'unknown',
            result: 'lose',
            roundNumber: salon.currentRound || 1,
            gameDuration: new Date() - salon.createdAt || 30000
        };

        console.log('🥺 DONNÉES LOSER:', loserData);

        await suiviController.createSuivi(loserData);

        await updateUserStats(winner.playerId, 'win');
        await updateUserStats(loser.playerId, 'lose');

        console.log('✅ Partie PVP sauvegardée avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde PVP:', error);
    }
}


module.exports = (io) => {

    // DEMARRER LE NETTOYAGE DES INVITATIONS AU LANCEMENT
    startCleanupInterval();

    io.on('connection', (socket) => {
        console.log('Utilisateur connecté:', socket.id);

        const populateSalon = () => [
            { path: 'players.user', select: 'username email' },
            { path: 'userCreator', select: 'username email' }
        ]

        // REJOINDRE UN SALON
        socket.on('joinSalon', async ({ salonId, userId, username }) => {
            try {
                console.log(`🎯 Tentative de rejoindre salon: ${salonId} par user: ${userId}`);
                
                // REJOINDRE IMMEDIATEMENT LE SALON
                await socket.join(salonId);
                console.log(`🏠 Socket ${socket.id} a rejoint la room: ${salonId}`);

                // VERIFIER QUE LE SOCKET EST BIEN DANS LE SALON
                const socketsInSalonBefore = await io.in(salonId).fetchSockets();
                console.log(`🔍 Sockets dans la room AVANT traitement: ${socketsInSalonBefore.length}`);

                console.log('🔵 AVANT POPULATE - salonId:', salonId);

                const salon = await SalonsModel.findOne({ salonId })
                    .populate(populateSalon());

                console.log('🟢 APRÈS POPULATE - salon:', JSON.stringify(salon, null, 2));
                console.log('🟡 PLAYERS DÉTAILLÉS:', salon?.players?.map(p => ({
                    userId: p?.user?._id,
                    username: p?.user?.username,
                    userObject: p?.user
                })));

                if (!salon) {
                    return socket.emit('error', 'Salon introuvable');
                }

                // DETECTION DU TYPE DE SALON
                if (salon.gameType === 'ai') {
                    // SALON IA
                    await handleAISalon(socket, salon, userId, username, salonId);
                } else {
                    // SALON MULTIJOUEUR
                    await handleMultiplayerSalon(socket, salon, userId, username, salonId);
                }
            
            } catch (error) {
                console.error('Erreur joinSalon:', error);
                socket.emit('error', error.message);                
            }
        });

        // FONCTION MULTIJOUEUR
        async function handleMultiplayerSalon(socket, salon, userId, username, salonId) {
            console.log('🎮 Gestion salon multijoueur');

            // VERIFIER SI LE JOUEUR N'EST PAS DEJA DANS LE SALON
            const isAlreadyInSalon = salon.players.some(player => {
                // VERIFIER SI PLAYER.USER EXISTE ET A UN _ID
                if (player.user && player.user._id) {
                    return player.user._id.toString() === userId;
                }
                // SI PAS DE POPULATE, COMPARER DIRECTEMENT AVEC L'OBJECTID
                return player.user && player.user.toString() === userId;
            });

            const existingPlayerIndex = salon.players.findIndex(player => {
                if (player.user && player.user._id) {
                    return player.user._id.toString() === userId;
                }
                return player.user && player.user.toString() === userId;
            });

            if (existingPlayerIndex === -1) {
                // 🆕 NOUVEAU JOUEUR
                salon.players.push({
                    user: userId,
                    choice: null,
                    ready: false,
                    socketId: socket.id
                });
                console.log(`✅ Nouveau joueur ${username} ajouté au salon`);
            } else {
                // 🔄 JOUEUR EXISTANT = METTRE À JOUR SA SOCKET !
                salon.players[existingPlayerIndex].socketId = socket.id;
                console.log(`🔄 Socket mise à jour pour ${username}: ${socket.id}`);
            }

            await salon.save();

            socket.userId = userId;
            socket.salonId = salonId;

            // VERIFIER LE SALON
            const socketsInSalon = await io.in(salonId).fetchSockets();
            console.log(`🔍 Nombre de sockets dans la room ${salonId}: ${socketsInSalon.length}`);

            // RECUPERER LE SALON MIS A JOUR
            const updatedSalon = await SalonsModel.findOne({ salonId })
                .populate('players.user', 'username email')                
                .populate('userCreator', 'username email');

            // INFORMER TOUS LES JOUEURS
            io.to(salonId).emit('salonUpdated', updatedSalon);
            io.to(salonId).emit('player-joined', { salon: updatedSalon });

            console.log(`${username} a rejoint le salon ${salonId}`);
            
            // DEMARRER SI LE SALON EST PLEIN
            if (updatedSalon.players.length >= updatedSalon.maxPlayers) {
                console.log('🎮 Salon plein ! Démarrage du jeu...');

                // METTRE A JOUR LE STATUT DU SALON
                updatedSalon.status = 'playing';
                await updatedSalon.save();

                // DEMARRER LA PARTIE
                io.to(salonId).emit('game-start', {
                    salon: updatedSalon,
                    message: 'La partie commence !'
                });

                console.log(`🚀 Émission de game-start pour salon: ${salonId}`);
            }
        }

        // FONCTION IA
        async function handleAISalon(socket, salon, userId, username, salonId) {
            console.log('🔴 DÉBUT handleAISalon - salonId:', salonId);

            // NETTOYER LES ANCIENS JOUEURS DÉCONNECTÉS
            salon.players = salon.players.filter(p => {
                // Garde seulement l'IA et les joueurs avec des sockets actifs
                if (p.userId === 'ai') return true;

                // Pour un salon IA, garde SEULEMENT le joueur actuel
                if (salon.gameType === 'ai') {
                    if (p.userId === userId) return true;
                    console.log(`🧹 SUPPRESSION joueur salon IA: ${p.username}`);
                    return false;
                }

                // Vérifie si le socket existe encore
                const socketExists = io.sockets.sockets.has(p.socketId);
                if (!socketExists) {
                    console.log(`🧹 SUPPRESSION joueur déconnecté: ${p.username} (${p.socketId})`);
                    return false;
                }
                return true;
            });

            // POUR SALON IA : MAX 2 JOUEURS (1 humain + 1 IA)
            if (salon.gameType === 'ai') {
                salon.players = salon.players.filter(p =>
                    p.userId === 'ai' || p.userId === userId
                );
            }

            console.log('🧹 PLAYERS APRÈS NETTOYAGE:', salon.players.length);

            if (!salon.scores || salon.scores.length === 0) {
                salon.scores = [
                    {
                        user: new mongoose.Types.ObjectId(userId), // Joueur humain
                        wins: 0
                    },
                    {
                        user: null, // IA (pas d'ObjectId)
                        wins: 0
                    }
                ];
                console.log('🎯 SCORES INITIALISÉS:', salon.scores);
            } else {
                console.log('🔄 SCORES EXISTANTS CONSERVÉS:', salon.scores);
            }

            const existingPlayer = salon.players.find(p => {
                const playerUserId = p.user?._id ? p.user._id.toString() : p.user?.toString();
                console.log('🔍 Comparaison:', playerUserId, 'vs', userId);
                return playerUserId === userId;
            });

            if (!existingPlayer) {
                console.log('🟢 AJOUT du joueur...');
                salon.players.push({
                    user: new mongoose.Types.ObjectId(userId),
                    userId: userId,
                    username: username,
                    ready: false,
                    choice: null,
                    socketId: socket.id
                });
                console.log('✅ Joueur ajouté:', userId);

                const aiPlayer = salon.players.find(p => p.userId === 'ai');

                if (!aiPlayer) {
                    console.log('🤖 AJOUT de l\'IA...');
                    salon.players.push({
                        user: null,
                        userId: 'ai',
                        username: 'IA',
                        isAI: true,
                        ready: true,
                        choice: null,
                        socketId: 'ai-socket'
                    });
                    console.log('✅ IA ajoutée !');                    
                }

                await salon.save();
                console.log('🟢 Salon avec IA sauvegardé ! Scores:', salon.scores);
            } else {
                existingPlayer.socketId = socket.id;
                await salon.save();
            }

            socket.join(salonId);
            socket.userId = userId;
            socket.salonId = salonId;
            socket.username = username;

            const updatedSalon = await SalonsModel.findOne({ salonId })
                .populate('userCreator', 'username email');

            console.log('🟡 FINAL updatedSalon.players:', updatedSalon.players);
            console.log('📊 FINAL updatedSalon.scores:', updatedSalon.scores);
            console.log('🤖 Nombre de joueurs final:', updatedSalon.players.length);

            io.to(salonId).emit('salonUpdated', updatedSalon);
            console.log(`${username} a rejoint le salon IA ${salonId}`);
        }


        // JOUEUR PRET
        socket.on('playerReady', async ({ salonId, userId, username }) => {
            console.log('🔴 EVENT playerReady REÇU !');
            console.log('🔍 salonId:', salonId);
            console.log('🔍 userId:', userId);

            try {
                const salon = await SalonsModel.findOne({ salonId })
                    .populate('userCreator', 'username email');

                console.log('🔍 SALON DIRECT:', salon.players.map(p => ({ userId: p.userId, username: p.username })));

                salon.players = salon.players.filter(p =>
                    (p.user && p.user._id) || p.userId === 'ai'  // ✅ Garde l'IA !
                );

                // 🔍 DEBUG - Au début de playerReady
                console.log('🔍 DÉBUT playerReady - salon.players:', salon.players.map(p => ({ userId: p.userId, username: p.username })));
                console.log('🔍 DÉBUT playerReady - salon.scores:', salon.scores.map(s => ({ user: s.user, wins: s.wins })));


                const playerIndex = salon.players.findIndex(p =>
                    p.user && p.user._id && p.user._id.toString() === userId.toString()
                );
                console.log('🔍 PlayerIndex trouvé:', playerIndex);

                if (playerIndex !== -1) {
                    salon.players[playerIndex].ready = true;

                    if (salon.gameType === 'ai') {
                        console.log('🤖 Salon IA détecté - Auto-ready IA');
                        console.log('🔍 Tous les players avant recherche IA:', salon.players.map(p => ({ userId: p.userId, username: p.username })));
                        const aiPlayerIndex = salon.players.findIndex(p => p.userId === 'ai');
                        console.log('🤖 AI PlayerIndex:', aiPlayerIndex);
                        if (aiPlayerIndex !== -1) {
                            salon.players[aiPlayerIndex].ready = true;
                            console.log('🤖 IA mise en ready !');
                        }                        
                    }

                    await salon.save();

                    // VERIFIER SI TOUS LES JOUEURS SON PRETS
                    const allReady = salon.players.every(p => p.ready);
                    console.log('🔍 Tous prêts ?', allReady);
                    console.log('🔍 Nombre de joueurs:', salon.players.length);
                    console.log('🔍 GameType:', salon.gameType);

                    const canStart = allReady && (
                        salon.gameType === 'ai' ? salon.players.length >= 2 : salon.players.length === salon.maxPlayers
                    );

                    console.log('🔍 Peut démarrer ?', canStart);

                    if (canStart) {
                        console.log('🚀 DÉMARRAGE DU JEU !');
                        salon.status = 'playing';
                        salon.roundStartTime = new Date();
                        await salon.save();

                        console.log('📡 ÉMISSION gameStart vers salon:', salonId);
                        console.log('📡 DONNÉES gameStart:', { round: 1, message: 'La partie commence !' });

                        io.to(salonId).emit('gameStarted', {
                            message: 'La partie commence !',
                            round: salon.currentRound
                        });
                    } else {
                        console.log('❌ Conditions pas remplies pour démarrer');
                    }

                    const updatedSalon = await SalonsModel.findOne({ salonId })
                        .populate(populateSalon());
                    io.to(salonId).emit('salonUpdated', updatedSalon);
                } else {
                    console.log('🚨 Joueur introuvable ! Tentative de reconstruction...');
                    await handleAISalon(socket, salon, userId, username, salonId);
                    return;
                }
            } catch (error) {
                console.error('❌ Erreur:', error);
                socket.emit('error', error.message);
            }
        });

        // FAIRE UN CHOIX
        socket.on('playerChoice', async ({ salonId, userId, choice }) => {
            console.log('🎯 CHOIX REÇU:', { salonId, userId, choice });
            try {
                const salon = await SalonsModel.findOne({ salonId });
                console.log('🎯 SALON TROUVÉ:', salon ? 'OUI' : 'NON');

                const playerIndex = salon.players.findIndex(p => {
                    if (!p?.user?._id || !userId) return false;
                    return p.user._id.toString() === userId.toString();
                });


                if (playerIndex === -1) {
                    return socket.emit('error', 'Joueur non trouvé dans ce salon');
                }

                salon.players[playerIndex].choice = choice;
                await salon.save();

                // GESTION IA
                if (salon.gameType === 'ai') {
                    console.log('🤖 MODE IA ACTIVÉ');

                    // SIMULATION CHOIX IA
                    const aiChoices = ['rock', 'paper', 'scissors'];
                    const aiChoice = aiChoices[Math.floor(Math.random() * 3)];
                    console.log('🤖 CHOIX IA:', aiChoice);

                    // CREER JOUEUR IA VIRTUEL
                    const aiResult = calculateWinner([
                        { user: userId, choice },
                        { user: 'AI', choice: aiChoice }
                    ]);
                    console.log('🎯 RÉSULTAT CALCULÉ:', aiResult);

                    // MET A JOUR LES SCORES
                    if (aiResult === 'player1') {
                        salon.scores[0].wins++;
                        console.log('🏆 JOUEUR GAGNE ! Score:', salon.scores[0].wins);
                    } else if (aiResult === 'player2') {
                        salon.scores[1].wins++;
                        console.log('🤖 IA GAGNE ! Score:', salon.scores[1].wins);
                    }
                    console.log('📊 SCORES ACTUELS:', salon.scores);

                    console.log('💾 AVANT SAVE - scores:', salon.scores);
                    await salon.save();
                    console.log('✅ APRÈS SAVE - scores sauvegardés');

                    // ENVOYER RESULTAT IMMEDIAT
                    socket.emit('roundResult', {
                        result: aiResult,
                        choices: [
                            { userId, choice },
                            { userId: 'AI', choice: aiChoice }
                        ],
                        round: salon.currentRound,
                        scores: [
                            salon.scores[0]?.wins || 0,
                            salon.scores[1]?.wins || 0
                        ]
                    });
                    console.log('📤 RÉSULTAT ENVOYÉ AU CLIENT');

                    const maxScore = Math.max(...salon.scores.map(scoreObj => scoreObj.wins));
                    if (maxScore >= 3) {
                        console.log('🏁 FIN DE PARTIE !');

                        const winner = salon.scores[0].wins >= 3 ? 'player' : 'ai';

                        await savedGameStats(salon, winner);

                        socket.emit('gameEnd', {
                            winner: winner,
                            finalScores: salon.scores,
                            message: winner === 'player' ? 'Félicitations ! Vous avez gagné !' : 'L\'IA a gagné ! Réessayez !'
                        });

                        console.log('🏆 GAGNANT:', winner);
                        return;                        
                    }

                    console.log('🔴 SCORES AVANT setTimeout:', salon.scores);

                    setTimeout(async () => {
                        salon.currentRound += 1;

                        salon.players.forEach(player => {
                            if (player.id.toString() === userId) {
                                player.currentChoice = null;
                            }
                        });

                        await salon.save(); // ⚡ SAVE !
                        console.log('🔄 ROUND SAUVEGARDÉ:', salon.currentRound);

                        const simpleScores = salon.scores.map(scoreObj => scoreObj.wins);
                        console.log('📤 NEXT ROUND - SCORES ENVOYÉS (FORMAT SIMPLE):', simpleScores);

                        socket.emit('nextRound', {
                            round: salon.currentRound,
                            scores: simpleScores
                        });

                        console.log('📤 NEXT ROUND ENVOYÉ');

                    }, 2000)

                    return;
                }

                // GESTION PVP
                // INFORMER QUE LE JOUEUR A FAIT SON CHOIX SANS LE REVELER
                socket.to(salonId).emit('playerMadeChoice', {
                    playerId: userId,
                    hasChosen:true
                });

                // VERIFIER SI TOUS LES JOUEURS ONT FAIT LEUR CHOIX
                const allChoicesMade = salon.players.every(p => p.choice !== null);

                if (allChoicesMade) {
                    const result = calculateWinner(salon.players);
                    const roundEndTime = new Date();
                    const gameDuration = roundEndTime - salon.roundStartTime;

                    // MISE A JOUR DES SCORES PVP
                    console.log('📊 AVANT - Scores PVP:', salon.scores);

                    if (!salon.scores[0]) {
                        salon.scores[0] = {
                            wins: 0,
                            user: salon.players[0].user
                        };
                        console.log('🆕 Score 0 créé:', salon.scores[0]);
                        console.log('🆕 Player 0 user:', salon.players[0].user);
                    }
                    
                    if (!salon.scores[1]) {
                        salon.scores[1] = {
                            wins: 0,
                            user: salon.players[1].user
                        };
                    }

                    if (result === 'player1') {
                        salon.scores[0].wins++;
                    } else if (result === 'player2') {
                        salon.scores[1].wins++;
                    }

                    console.log('📊 APRÈS - Scores PVP:', salon.scores);
                    await salon.save();

                    console.log('🔍 SCORES APRÈS SAVE:', salon.scores);
                    console.log('🔍 SALON ID:', salon._id);


                    // ENREGISTRER LES SUIVIS POUR CHAQUE JOUEUR
                    for (let i = 0; i < salon.players.length; i++) {
                        const player = salon.players[i];
                        const opponent = salon.players[1 - i];

                        let playerResult;
                        if (result === 'draw') {
                            playerResult = 'draw';
                        } else if (result === `player${i + 1}`) {
                            playerResult = 'win';
                        } else {
                            playerResult = 'lose';
                        }

                        // APPELER LE CONTROLER DE SUIVI
                        await suiviController.createSuivi({
                            userId:player.user,
                            gameId: salon._id,
                            roundNumber: salon.currentRound,
                            choiceUsed: player.choice,
                            result: playerResult,
                            opponent: opponent.user,
                            gameDuration: gameDuration
                        });
                    }

                    

                    // ENVOYER LE RESULTAT A TOUS LES JOUEURS

                    console.log('🚀 ENVOI roundResult à tous les joueurs');
                    console.log('🔍 Nombre de joueurs:', salon.players.length);

                    salon.players.forEach((player, index) => {

                        console.log(`🔍 Joueur ${index}:`, {
                            userId: player.user,
                            socketId: player.socketId,
                            socketExists: !!io.sockets.sockets.get(player.socketId)
                        });

                        const playerSocket = io.sockets.sockets.get(player.socketId);
                        if (playerSocket) {
                            console.log(`✅ ENVOI à joueur ${index}`);
                            let winnerId = null;

                            // 🏆 DÉTERMINE L'ID DU GAGNANT
                            if (result === 'draw') {
                                winnerId = 'draw';
                            } else if (result === 'player1') {
                                winnerId = salon.players[0].user; // ID du premier joueur
                            } else if (result === 'player2') {
                                winnerId = salon.players[1].user; // ID du deuxième joueur
                            }

                            playerSocket.emit('roundResult', {
                                result: winnerId,  // ✅ ID du gagnant ou "draw"
                                winnerId: winnerId,  // ✅ Pour plus de clarté
                                choices: salon.players.map(p => ({
                                    userId: p.user,
                                    choice: p.choice
                                })),
                                round: salon.currentRound,
                                scores: [
                                    salon.scores[0]?.wins || 0,
                                    salon.scores[1]?.wins || 0
                                ]
                            });
                        }
                    });


                    console.log('🏆 Score 1:', salon.scores[0]);
                    console.log('🏆 Score 2:', salon.scores[1]);

                    let finalResult = null;
                    const currentMaxWins = Math.max(salon.scores[0]?.wins || 0, salon.scores[1]?.wins || 0);
                    const MAX_WINS = 3;

                    console.log('🏆 MaxWins atteintes:', currentMaxWins);
                    console.log('👥 ENVOI gameEnd À TOUS LES JOUEURS DU SALON');
                    console.log('📡 Salon ID:', salonId);
                    console.log('🎮 Résultat final:', finalResult);

                    console.log('✅ gameEnd envoyé à tous les joueurs connectés au salon !');

                    // 🔄 LOGIQUE SIMPLIFIÉE - UNE SEULE VÉRIFICATION
                    console.log('🔍 VÉRIFICATION CONDITION:', currentMaxWins, '>=', 3, '=', currentMaxWins >= 3);

                    if (currentMaxWins >= MAX_WINS) {
                        console.log(`🏁 PARTIE TERMINÉE - ${currentMaxWins} >= ${MAX_WINS}`);

                        console.log('🎯 === DEBUG AVANT calculateFinalWinner ===');
                        console.log('📊 salon:', salon);
                        console.log('📊 salon.scores:', salon?.scores);
                        console.log('👥 salon.players:', salon?.players);

                        finalResult = calculateFinalWinner(salon);
                        console.log('🎯 Debug calculateFinalWinner:');
                        console.log('🏆 finalResult:', finalResult);
                        console.log('❓ finalResult est null?', finalResult === null);

                        if (!finalResult) {
                            console.log('❌ ERREUR: calculateFinalWinner retourne null !');
                            // Protection d'urgence
                            finalResult = {
                                winner: { playerId: salon?.players?.[0]?.user, username: 'Joueur 1' },
                                loser: { playerId: salon?.players?.[1]?.user, username: 'Joueur 2' },
                                finalScore: { winner: 1, loser: 0 }
                            };
                        }

                        // 🏁 PARTIE TERMINEE
                        salon.status = 'finished';
                        await salon.save();
                        await savedGameStatsPVP(salon, finalResult);

                        // METTRE A JOUR STATS ET RECOMPENSES
                        const updateStatsAndRecompenses = async (winId, loseId, winMovePlayed) => {
                            try {
                                const winRecompenses = await RecompensesController.verifieAndUnlockRecompenses(winId);
                                const loseRecompenses = await RecompensesController.verifieAndUnlockRecompenses(loseId);

                                return {
                                    winRecompenses,
                                    loseRecompenses
                                };
                            } catch (error) {
                                console.error('Erreur lors de la mise à jour des récompenses:', error);
                            }
                        };

                        // Envoyer gameEnd aux clients
                        console.log('📡 ENVOI gameEnd avec ces données:');
                        console.log('🏆 winner:', finalResult.winner);
                        console.log('🆔 winnerId:', finalResult.winner?.playerId?.toString());
                        console.log('🆔 loserId:', finalResult.loser?.playerId?.toString());

                        io.to(salonId).emit('gameEnd', {
                            message: 'Partie terminée !',
                            winner: finalResult.winner,
                            winnerId: finalResult.winner?.playerId?.toString(),
                            loserId: finalResult.loser?.playerId?.toString(),
                            // 🎯 AJOUTE ÇA POUR DEBUG
                            debug: {
                                winnerName: finalResult.winner?.username,
                                loserName: finalResult.loser?.username
                            }
                        });
                        console.log('✅ gameEnd envoyé à tous les joueurs connectés au salon !');
                        return;

                    } else {
                        console.log(`🔍 VÉRIFICATION CONDITION: ${currentMaxWins} >= ${MAX_WINS} = false`);

                        // 🔄 PROCHAIN ROUND (supprime la vérification maxRounds)
                        setTimeout(async () => {
                            console.log('⏰ EXÉCUTION DU PROCHAIN ROUND !');
                            salon.currentRound += 1;
                            console.log('🔄 Nouveau round:', salon.currentRound);

                            salon.players.forEach(p => {
                                p.choice = null;
                                p.ready = false;
                            });
                            salon.roundStartTime = new Date();
                            await salon.save();

                            console.log('📡 ENVOI nextRound à tous les joueurs');
                            io.to(salonId).emit('nextRound', {
                                round: salon.currentRound,
                                message: `Round ${salon.currentRound}`,
                                scores: [
                                    salon.scores[0]?.wins || 0,
                                    salon.scores[1]?.wins || 0
                                ]
                            });
                            console.log('✅ nextRound envoyé !');
                        }, 3000); // 3 SECONDES AVANT LE PROCHAIN ROUND
                    }
                    console.log('🔍 FIN DE LA LOGIQUE DE JEU');
                }
            } catch (error) {
                socket.emit('error', error.message);
                console.error('❌ ERREUR:', error);
            }
        });

        // REJOUER UNE PARTIE
        socket.on('requestReplay', async (data) => {
            console.log('🔄 BACKEND: Demande de replay reçue:', data);

            const { salonId, userId, username } = data;

            try {
                // D'abord récupérer le salon actuel
                const salon = await SalonsModel.findOne({ salonId: salonId });

                if (!salon) {
                    return socket.emit('error', { message: 'Salon non trouvé' });
                }

                // Reset PROPRE selon la structure de ton modèle
                salon.status = 'waiting';
                salon.currentRound = 1;
                salon.roundStartTime = null;

                // Reset players choices et ready
                salon.players.forEach(player => {
                    player.choice = null;
                    player.ready = false;
                });

                // Reset scores EN GARDANT LA STRUCTURE
                salon.scores.forEach(scoreObj => {
                    scoreObj.wins = 0;
                });

                console.log('🔄 BACKEND: Scores après reset:', salon.scores);

                await salon.save();

                // Notifier tous les joueurs
                io.to(salonId).emit('gameRestarted', {
                    message: 'Nouvelle partie démarrée !',
                    salon: {
                        status: 'waiting',
                        currentRound: 1,
                        scores: salon.scores
                    }
                });

                console.log('🔄 BACKEND: Event gameRestarted envoyé');

            } catch (error) {
                console.error('❌ Erreur lors du replay:', error);
                socket.emit('error', { message: 'Erreur lors du redémarrage' });
            }
        });


        // CHAT EN TEMPS REEL
        socket.on('chatMessage', async ({ salonId, userId, username, message }) => {
            try {
                const time = new Date().toISOString();
                const chatPayload = {
                    userId,
                    username,
                    message,
                    time
                };

                // EMETTRE LE MESSAGE DANS LE SALON
                io.to(salonId).emit('chatMessage', chatPayload);

                console.log(`[Chat][${salonId}] ${username}: ${message}`);
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // QUITTER UN SALON
        socket.on('leaveSalon', async ({ salonId, userId }) => {
            try {
                const salon = await SalonsModel.findOne({ salonId });
                if (salon) {
                    salon.players = salon.players.filter(p => p.user.toString() !== userId);
                    await salon.save();

                    socket.leave(salonId);

                    const updatedSalon = await SalonsModel.findOne({ salonId }).populate('players.user');
                    io.to(salonId).emit('salonUpdated', updatedSalon);

                    console.log(`Utilisateur ${userId} a quitté le salon ${salonId}`);
                }
            } catch (error) {
                socket.emit('error', error.message);
            }
        });
        
        // ENVOI D'INVITATION
        socket.on ('send_invitation', (data) => {
            if (!socket.userId) {
                return socket.emit('auth_error', { message: 'Non authentifié' });
            }
            
            data.fromUserId = socket.userId;
            handleSendInvitation(io, socket, data);
        });
        
        // ACCEPTATION D'INVITATION
        socket.on('accept_invitation', (data) => {
            if (!socket.userId) {
                return socket.emit('auth_error', { message: 'Non authentifié' });
            }
            
            handleAcceptInvitation(io, socket, data);
        });
        
        // DECLIN D'INVITATION
        socket.on('decline_invitation', (data) => {
            if (!socket.userId) {
                return socket.emit('auth_error', { message: 'Non authentifié' });
            }
            
            handleDeclineInvitation(io, socket, data);
        });

        // DECONNEXION
        socket.on('disconnect', async () => {
            try {
                const { salonId, userId, username } = socket;

                if (salonId && userId) {
                    const salon = await SalonsModel.findOne({ salonId }).populate('players.user', 'username email').populate('userCreator', 'username email');

                    if (salon) {
                        if (salon.gameType === 'ai') {
                            console.log(`Utilisateur ${username || 'inconnu'} s'est déconnecté du salon IA ${salonId}`);
                            return;                        
                        }

                        salon.players = salon.players.filter(
                            player => player.user._id.toString() !== userId
                        );

                        await salon.save();

                        const updatedSalon = await SalonsModel.findOne({ salonId }).populate('players.user', 'username email').populate('userCreator', 'username email');
                        socket.to(salonId).emit('salonUpdated', updatedSalon);

                        console.log(`Utilisateur ${username || 'inconnu'} a quitté le salon multijoueur ${salonId}`);                        
                    }
                }

                handleUserDisconnection(socket);

            } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
                
            }   
        });
    });
};

// FONCTIONS UTILITAIRES
function calculateWinner(players) {
    if (players.length !== 2) return 'error';

    const [player1, player2] = players;
    const choice1 = player1.choice;
    const choice2 = player2.choice;

    if (choice1 === choice2) return 'draw';

    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };

    return winConditions[choice1] === choice2 ? 'player1' : 'player2';
}

function calculateFinalWinner(salon) {
    console.log('🎯 === CALCULATE FINAL WINNER ===');
    console.log('🔍 SALON ID reçu:', salon._id);
    console.log('📊 Scores reçus dans calculate:', salon.scores);
    console.log('🏆 CALCUL DU VAINQUEUR:');
    console.log('📊 Scores complets:', salon.scores);
    console.log('👥 Players:', salon.players.map(p => p.user));

    const player1Id = salon.players[0].user.toString();
    const player2Id = salon.players[1].user.toString();    
    
    const player1Score = salon.scores.find(score =>
        score.user && score.user.toString() === player1Id.toString()
    );
    const player2Score = salon.scores.find(score =>
        score.user && score.user.toString() === player2Id.toString() 
    );


    console.log('🎯 player1Score trouvé:', player1Score);
    console.log('🎯 player2Score trouvé:', player2Score);
    
    const player1Wins = player1Score?.wins || 0;
    const player2Wins = player2Score?.wins || 0;
    
    console.log('🏆 Victoires J1:', player1Wins);
    console.log('🏆 Victoires J2:', player2Wins);

    if (player1Wins > player2Wins) {
        return {
            winner: { playerId: salon.players[0].user, username: 'Joueur 1' },
            loser: { playerId: salon.players[1].user, username: 'Joueur 2' },
            finalScore: { winner: player1Wins, loser: player2Wins }
        };
    } else if (player2Wins > player1Wins) {
        return {
            winner: { playerId: salon.players[1].user, username: 'Joueur 2' },
            loser: { playerId: salon.players[0].user, username: 'Joueur 1' },
            finalScore: { winner: player2Wins, loser: player1Wins }
        };
    } else {
        // Égalité - on peut décider arbitrairement ou gérer différemment
        return {
            winner: { playerId: salon.players[0].user, username: 'Joueur 1' },
            loser: { playerId: salon.players[1].user, username: 'Joueur 2' },
            finalScore: { winner: player1Wins, loser: player2Wins }
        };
    }
}



