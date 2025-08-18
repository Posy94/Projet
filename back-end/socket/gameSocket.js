const SalonsModel = require('../models/salons.model');
const suiviController = require('../controllers/suivis.controller');
const RecompensesController = require('../controllers/recompenses.controller');
const mongoose = require('mongoose');

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

        if (finalResult !== 'player') {
            await updateUserStats(gagnant.user._id, 'win', gagnant.choice);
        } else {
            await updateUserStats(salon.players[0].userId, 'lose', salon.players[0].choice);
        }

        console.log('✅ Partie sauvegardée avec succès');

    } catch (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
    }
}

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Utilisateur connecté:', socket.id);

        // REJOINDRE UN SALON
        socket.on('joinSalon', async ({ salonId, userId, username }) => {
            try {

                console.log('🔵 AVANT POPULATE - salonId:', salonId);

                const salon = await SalonsModel.findOne({ salonId })
                    .populate('players.user', 'username email')
                    .populate('userCreator', 'username email');

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
            if (salon.players.length >= salon.maxPlayers) {
                return socket.emit('error', 'Salon complet');
            }
            // VERIFIER SI LE JOUEUR N'EST PAS DEJA DANS LE SALON
            const isAlreadyInSalon = salon.players.some(
                player => player.user._id.toString() === userId
            );
            if (!isAlreadyInSalon) {
                salon.players.push({
                    user: userId,
                    choice: null,
                    ready: false,
                    socketId: socket.id
                });
                await salon.save();
            }
            // REJOINDRE LE SALON SOCKET.IO
            socket.join(salonId);
            socket.userId = userId;
            socket.salonId = salonId;
            // INFORMER TOUS LES JOUEURS DU SALON
            const updatedSalon = await SalonsModel.findOne({ salonId })
                .populate('players.user', 'username email')
                
                .populate('userCreator', 'username email');
            io.to(salonId).emit('salonUpdated', updatedSalon);
            console.log(`${username} a rejoint le salon ${salonId}`);
            
        }

        // FONCTION IA
        async function handleAISalon(socket, salon, userId, username, salonId) {
            
            console.log('🔴 DÉBUT handleAISalon - salonId:', salonId);
            console.log('🔴 SALON RÉCUPÉRÉ - scores actuels:', salon.scores);

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
        socket.on('playerReady', async ({ salonId, userId }) => {
            console.log('🔴 EVENT playerReady REÇU !');
            console.log('🔍 salonId:', salonId);
            console.log('🔍 userId:', userId);

            try {
                const salon = await SalonsModel.findOne({ salonId });

                console.log('🔍 Salon trouvé:', salon ? 'OUI' : 'NON');

                const playerIndex = salon.players.findIndex(p => p.user.toString() === userId);
                console.log('🔍 PlayerIndex trouvé:', playerIndex);

                if (playerIndex !== -1) {
                    salon.players[playerIndex].ready = true;

                    if (salon.gameType === 'ai') {
                        console.log('🤖 Salon IA détecté - Auto-ready IA');
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

                    const canStart = salon.gameType === 'ai' ?
                        allReady && salon.players.length === 2 :
                        allReady && salon.players.length === recompensesModel.maxPlayers;

                    console.log('🔍 Peut démarrer ?', canStart);

                    if (canStart) {
                        console.log('🚀 DÉMARRAGE DU JEU !');
                        salon.status = 'playing';
                        salon.roundStartTime = new Date();
                        await salon.save();

                        io.to(salonId).emit('gameStart', {
                            message: 'La partie commence !',
                            round: salon.currentRound
                        });
                    } else {
                        console.log('❌ Conditions pas remplies pour démarrer');
                    }

                    const updatedSalon = await SalonsModel.findOne({ salonId })
                        .populate('players.user', 'username email')
                        .populate('userCreator', 'username email');
                    io.to(salonId).emit('salonUpdated', updatedSalon);
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
                const playerIndex = salon.players.findIndex(p => p.user.toString() === userId);

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

                    setTimeout(() => {
                        salon.currentRound += 1;

                        salon.players.forEach(player => {
                            if (player.id.toString() === userId) {
                                player.currentChoice = null;
                            }
                        });

                        console.log('🔄 ROUND SUIVANT PRÉPARÉ:', salon.currentRound);

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
                    io.to(salonId).emit('roundResult', {
                        result,
                        choices: salon.players.map(p => ({
                            userId:p.user,
                            choice: p.choice
                        })),
                        round: salon.currentRound
                    });

                    // PREPARER LE PROCHAIN ROUND OU FINIR LA PARTIE
                    if (salon.currentRound < salon.maxRounds) {
                        // PROCHAIN ROUND
                        setTimeout(async () => {
                            salon.currentRound += 1;
                            salon.players.forEach(p => {
                                p.choice = null;
                                p.ready = false;
                            });
                            salon.roundStartTime = new Date();
                            await salon.save();

                            io.to(salonId).emit('nextRound', {
                                round: salon.currentRound,
                                message: `Round ${salon.currentRound}/${salon.maxRounds}`
                            });
                        }, 3000); // 3 SECONDES AVANT LE PROCHAIN ROUND
                    } else {
                        // PARTIE TERMINEE
                        salon.status = 'finished';
                        await salon.save();

                        const finalResult = calculateFinalWinner(salon);
                        console.log('🏁 PARTIE TERMINEE - Résultat final:', finalResult);

                        await savedGameStats(salon, finalResult);

                        io.to(salonId).emit('gameEnd', {
                                message: 'Partie terminée !',
                                finalResult: finalResult,
                                scores: salon.scores || [0, 0]
                        });

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
                    }
                }
            } catch (error) {
                socket.emit('error', error.message);
                console.error('❌ ERREUR:', error);
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
    return 'player1';
}