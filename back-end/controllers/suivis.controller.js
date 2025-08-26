const { default: mongoose } = require('mongoose');
const SuivisModel = require('../models/suivis.model');
const UsersModel = require('../models/users.model');
const recompensesController = require('./recompenses.controller');

const suivisController = {

    // ENREGISTRER UN NOUVEAU SUIVI APRES CHAQUE ROUND
    createSuivi: async (gameData) => {
        try {
            const { userId, gameId, roundNumber, choiceUsed, opponentChoice, result, opponent, gameDuration } = gameData;

            // CALCULER LES SERIES CONSECUTIVES
            const consecutiveStats = await calculateConsecutiveStats(userId, result);

            const suivi = new SuivisModel({
                userId,
                gameId,
                roundNumber,
                choiceUsed,
                opponentChoice,
                result,
                opponent,
                gameDuration,
                metadata: {
                    consecutiveWins: result === 'win' ? consecutiveStats.wins : 0,
                    consecutiveLosses: result === 'lose' ? consecutiveStats.losses : 0
                }
            });

            await suivi.save();

            // METTRE A JOUR LES STATS DE L'UTILISATEUR
            await updateUserStats(userId, result, choiceUsed);

            // VERIFIER LES NOUVEAUX BADGES A DEBLOQUER
            // await recompensesController.checkAndUnlockBadges(userId);

            return suivi;

        } catch (error) {
            console.error('Erreur lors de la création du suivi:', error);
            throw error;
        }
    },

    // STATISTIQUES GLOBALES D'UN UTILISATEUR
    getUserStats: async (req, res) => {
        try {
            const userId = req.user.id;

            const stats = await SuivisModel.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        totalGames: { $sum: 1 },
                        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
                        losses: { $sum: { $cond: [{ $eq: ['$result', 'lose'] }, 1, 0] } },
                        draws: { $sum: { $cond: [{ $eq: ['$result', 'draw'] }, 1, 0] } },
                        rockUsed: { $sum: { $cond: [{ $eq: ['$choiceUsed', 'rock'] }, 1, 0] } },
                        paperUsed: { $sum: { $cond: [{ $eq: ['$choiceUsed', 'paper'] }, 1, 0] } },
                        scissorsUsed: { $sum: { $cond: [{ $eq: ['$choiceUsed', 'scissors'] }, 1, 0] } },
                        avgGameDuration: { $avg: 'gameDuration' },
                        maxConsecutiveWins: { $max: '$metadata.consecutiveWins' },
                        maxConsecutiveLosses: { $max: '$metadata.consecutiveLosses' }
                    }
                }
            ]);

            const userStats = stats[0] || {
                totalGames: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                rockUsed: 0,
                paperUsed: 0,
                scissorsUsed: 0,
                avgGameDuration: 0,
                maxConsecutiveWins: 0,                
                maxConsecutiveLosses: 0                
            };

            // CALCULER LE RATIO DE VICTOIRE
            userStats.winRate = userStats.totalGames > 0 ?
                ((userStats.wins / userStats.totalGames)*100).toFixed(1) : 0;

            res.json(userStats);

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // STATISTIQUES DETAILLEES PAR CHOIX
    getChoiceStats: async (req, res) => {
        try {
            const userId = req.user.id;

            const choiceStats = await SuivisModel.aggregate([
                { $match: { userId: mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: '$choiceUsed',
                        total: { $sum: 1 },
                        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
                        losses: { $sum: { $cond: [{ $eq: ['$result', 'lose'] }, 1, 0] } },
                        draws: { $sum: { $cond: [{ $eq: ['$result', 'draw'] }, 1, 0] } }
                    }
                },
                {
                    $project: {
                        choice: '$_id',
                        total: 1,
                        wins: 1,
                        losses: 1,
                        draws: 1,
                        winRate: {
                            $cond: [
                                { $gt: ['$total', 0] },
                                { $multiply: [{ $divide: ['$wins', '$total'] }, 100] },
                                0
                            ]
                        }
                    }
                }
            ]);

            res.json(choiceStats);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // HISTORIQUE DES PARTIES RECENTES
    getRecentGames: async (req, res) => {
        try {
            const userId = req.user.id;
            const limit = parseInt(req.query.limit) || 10;
            const page = parseInt(req.query.page) || 1;

            const recentGames = await SuivisModel.find({ userId })
                .populate('opponent', 'username')
                .populate('gameId', 'name')
                .sort({ createAt: -1 })
                .limit(limit)
                .skip((page - 1) * limit);

            const totalGames = await SuivisModel.countDocuments({ userId });

            res.json({
                games: recentGames,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalGames / limit),
                    totalGames
                }
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // PROGRESSION DANS LE TEMPS POUR LES GRAPHIQUES
    getProgressionStats: async (req, res) => {
        try {
            const userId = req.user.id;
            const period = req.query.period || '7d';

            const dateFilter = getDateFilter(period);

            const progression = await SuivisModel.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(userId),
                        createdAt: { $gte: dateFilter }
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' }
                        },
                        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
                        losses: { $sum: { $cond: [{ $eq: ['$result', 'lose'] }, 1, 0] } },
                        draws: { $sum: { $cond: [{ $eq: ['$result', 'draw'] }, 1, 0] } },
                        totalGames: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.mont':1, '_id.day': 1 } }
            ]);

            res.json(progression);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // COMPARAISON AVEC D'AUTRES JOUEURS
    getComparisonStats: async (req, res) => {
        try {
            const userId = req.user.id;

            //STATISTIQUES GLOBALES DE TOUS LES JOUEURS POUR COMPARAISON
            const globalStats = await SuivisModel.aggregate([
                {
                    $group: {
                        _id: '$userId',
                        totalGames: { $sum: 1 },
                        wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
                        winRate: {
                            $avg: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] }
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgGamesPerPlayer: { $avg: '$totalGames' },
                        avgWinRate: { $avg: '$winRate' },
                        playerCount: { $sum: 1 }
                    }
                }
            ]);

            res.json(globalStats[0] || {});
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

// FONCTIONS UTILITAIRES
async function calculateConsecutiveStats(userId, currentResult) {
    const lastGames = await SuivisModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10);

    let consecutiveWins = 0;
    let consecutiveLosses = 0;

    if (currentResult === 'win') {
        consecutiveWins = 1;
        for (const game of lastGames) {
            if (game.result === 'win') consecutiveWins++;
            else break;
        }
    } else if (currentResult === 'lose') {
        consecutiveLosses = 1;
        for (const game of lastGames) {
            if (game.result === 'lose') consecutiveLosses++;
            else break;
        }
    }

    return { wins: consecutiveWins, losses: consecutiveLosses };
}

async function updateUserStats(userId, result, choiceUsed) {
    const updateQuery = { $inc: {} };

    // INCREMENTER LES STATISTIQUES GENERALES
    updateQuery.$inc['stats.gamesPlayed'] = 1;

    if (result === 'win') updateQuery.$inc['stats.wins'] = 1;
    else if (result === 'lose') updateQuery.$inc['stats.losses'] = 1;
    else updateQuery.$inc['stats.draws'] = 1;

    // INCREMENTER LES STATISTIQUES PAR CHOIX
    updateQuery.$inc[`stats.choices.${choiceUsed}`] = 1;

    await UsersModel.findByIdAndUpdate(userId, updateQuery, { new: true });
}

function getDateFilter(period) {
    const now = new Date();
    switch (period) {
        case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        case '3m': return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        case '1y': return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        default: return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
}

module.exports = suivisController;