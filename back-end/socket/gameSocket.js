const SalonsModel = require('../models/salons.model');
const suiviController = require('../controllers/suivis.controller');
const RecompensesController = require('../controllers/recompenses.controller')

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Utilisateur connecté:', socket.id);

        // REJOINDRE UN SALON
        socket.on('joinSalon', async ({ salonId, userId, username }) => {
            try {
                const salon = await SalonsModel.findOne({ salonId }).populate('players.user creator');

                if (!salon) {
                    return socket.emit('error', 'Salon introuvable');
                }

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
                const updatedSalon = await SalonsModel.findOne({ salonId }).populate('players.user creator');
                io.to(salonId).emit('salonUpdated', updatedSalon);

                console.log(`${username} a rejoint le salon ${salonId}`);
                
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // JOUEUR PRET
        socket.on('playerReady', async ({ salonId, userId }) => {
            try {
                const salon = await SalonsModel.findOne({ salonId });
                const playerIndex = salon.players.findIndex(p => p.user.toString() === userId);

                if (playerIndex !== -1) {
                    salon.players[playerIndex].ready = true;
                    await salon.save();

                    // VERIFIER SI TOUS LES JOUEURS SON PRETS
                    const allReady = salon.players.every(p => p.ready);

                    if (allReady && salon.players.length == recompensesModel.maxPlayers) {
                        salon.status = 'playing';
                        salon.roundStartTime = new Date();
                        await salon.save();

                        io.to(salonId).emit('gameStart', {
                            message: 'La partie commence !',
                            round: salon.currentRound
                        });
                    }

                    const updatedSalon = await SalonsModel.findOne({ salonId }).populate('players.user');
                    io.to(salonId).emit('salonUpdated', updatedSalon);
                }
            } catch (error) {
                socket.emit('error', error.message);
            }
        });

        // FAIRE UN CHOIX
        socket.on('makeChoice', async ({ salonId, userId, choice }) => {
            try {
                const salon = await SalonsModel.findOne({ salonId });
                const playerIndex = salon.players.findIndex(p => p.user.toString() === userId);

                if (playerIndex === -1) {
                    return socket.emit('error', 'Joueur non trouvé dans ce salon');
                }

                salon.players[playerIndex].choice = choice;
                await salon.save();

                // GESTION IA
                if (salon.gameType === 'ai') {
                    // SIMULATION CHOIX IA
                    const aiChoices = ['pierre', 'feuille', 'ciseaux'];
                    const aiChoice = aiChoices[Math.floor(Math.random() * 3)];

                    // CREER JOUEUR IA VIRTUEL
                    const aiResult = calculateWinner([
                        { user: userId, choice },
                        { user: 'AI', choice: aiChoice }
                    ]);

                    // ENVOYER RESULTAT IMMEDIAT
                    socket.emit('roundResult', {
                        result: aiResult,
                        choices: [
                            { userId, choice },
                            { iserId: 'AI', choice: aiChoice }
                        ],
                        round: salon.currentRound
                    });

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

                        io.to(salonId).emit('gameEnd', {
                                message: 'Partie terminée !',
                                finalResult: calculateFinalWinner(salon)
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
            console.log('Utilisateur déconnecté:', socket.id);

            if (socket.salonId && socket.userId) {
                try {
                    const salon = await SalonsModel.findOne({ salonId: socket.salonId });
                    if (salon) {
                        salon.players = salon.players.filter(p => p.user.toString() !== socket.userId);
                        await salon.save();

                        const updatedSalon = await SalonsModel.findOne({ salonId: socket.salonId }).populate('players.user');
                        io.to(socket.salonId).emit('salonUpdated', updatedSalon);
                    }
                } catch (error) {
                    console.error('Erreur lors de la déconnexion:', error);  
                }
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