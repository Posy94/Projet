const { RecompenseDefinition, UserRecompense } = require('../models/recompenses.model');
const UsersModel = require('../models/users.model');

class RecompensesController {
    
    // RECUPERER LES RECOMPENSES D'UN UTILISATEUR
    static async getRecompenseUser(req, res) {
        try {
            const { userId } = req.params;

            // VERIFIER QUE L'UTILISATEUR EXISTE
            const user = await UsersModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Utilisateur non trouvé'
                });
            }

            const recompenses = await RecompenseDefinition.find({ actif: true }).sort({ category: 1, points: 1 });
            const userRecompenses = await UserRecompense.find({ userId });
            const userStats = user.stats || {};

            const recompenseMap = new Map(UserRecompense.map(ur => [ur.recompenseId, ur]));

            const recompensesWithProgression = recompenses.map(recompense => {
                const userRecompense = recompenseMap.get(recompense.id);
                const isUnlocked = UserRecompense && UserRecompense.progression === 1;

                return {
                    ...recompense.toObject(),
                    isUnlocked,
                    progression: userRecompense ? userRecompense.progression : this.calculateProgression(recompense, userStats),
                    unlockedTime: userRecompense ? userRecompense.unlockedTime : null
                };
            });

            const nbUnlocked = recompensesWithProgression.filter(r => r.isUnlocked).length;
            const totalRecompenses = recompensesWithProgression.length;

            res.json({
                success:true,
                data: {
                    recompenses: recompensesWithProgression,
                    resume: {
                        nbUnlocked,
                        totalRecompenses,
                        ratecompletion: Math.round((nbUnlocked / totalRecompenses) * 100),
                        totalPoints: userStats.totalPoints || 0,
                        level: userStats.level || 1
                    }
                }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des récompenses', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la récupération des récompenses'
            });            
        }
    }

    // VERIFIER ET DEBLOQUER DE NOUVELLES RECOMPENSES
    static async verifieRecompensesUser(req, res) {
        try {
            const { userId } = req.params;

            const newRecompenses = await this.verifieRecompensesUser(userId);
            res.json({
                success: true,
                data: {
                    newRecompenses,
                    message: newRecompenses.length > 0
                    ? `${newRecompenses.length} nouvelle(s) récompense(s) débloquée(s) !` : 'Aucune nouvele récompense débloquée'
                }
            });
        } catch (error) {
            console.error('Erreur lors de la vérification des récompenses:', error);
            res.status(500).json({
                success: false,
                message: 'Erreur lors de la vérification des récompenses'
            });            
        }
    }

    // CLASSEMENT DES JOUEURS PAR RECOMPENSES
    static async getRank(req, res) {
        try {
            const rank = await UsersModel.aggregate([
                {
                    $lookup: {
                        from: 'userrecompenses',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'recompenses'
                    }
                },
                {
                    $addFields: {
                        nbRecompenses: {
                            $size: {
                                $filter: {
                                    input: '$recompenses',
                                    cond: { $eq: ['$$this.progression', 1] }
                                }
                            }
                        }
                    }
                },
                {
                    $sort: {
                        nbRecompenses: -1,
                        'stats.totalPoints': -1
                    }
                }, 
                {
                    $limit: 10
                },
                {
                    $project: {
                        username: 1,
                        nbRecompenses: 1,
                        totalPoints: '$stats.totalPoints',
                        level: '$stats.level',
                        totalGames: '$stats.totalGames',
                        wins: '$stats.wins'
                    }
                }
            ]);

            res.json({
                success: true,
                data: { rank }
            });
        } catch (error) {
            console.error('Erreur lors de la récupération du classement:', error);
            res.status(500).json({
                success:false,
                message: 'Erreur lors de la récupération du classement'
            });            
        }
    }

    // METHODES UTILITAIRES
    static async verifieAndUnlockRecompenses(userId) {
        const user = await UsersModel.findById(userId);
        if (!user || !user.stats) return [];

        const recompenses = await RecompenseDefinition.find({ actif: true });
        const newRecompenses = [];

        for (const recompense of recompenses) {
            const isUnlocked = this.verifieConditionRecompense(recompense, user.stats);

            if (isUnlocked) {
                const recompenseExists = await UserRecompense.findOne({
                    userId,
                    recompenseId: recompense.id
                });

                if (!recompenseExists) {
                    // DEBLOQUER LA RECOMPENSE
                    const userRecompense = new UserRecompense({
                        userId,
                        recompenseId: recompense.id,
                        progression: 1
                    });
                    await userRecompense.save();

                    // AJOUTER LES POINTS A L'UTILISATEUR
                    if (!user.stats.totalPoints) user.stats.totalPoints = 0;
                    user.stats.totalPoints += recompense.points;
                    await userRecompense.save();

                    newRecompenses.push({
                        recompense,
                        justUnlocked: true
                    });
                }
            } else {
                // METTRE A JOUR LA PROGRESSION
                const progression = this.calculateProgression(recompense, user.stats);
                await UserRecompense.findOneAndUpdate(
                    { userId, recompenseId: recompense.id },
                    { progression },
                    { upsert: true }
                );
            }
        } return newRecompenses;
    }

    static verifieConditionRecompense(recompense, stats) {
        const { type, value, movePlayed } = recompense.conditions;

        switch (type) {
            case 'parties_jouees':
                return (stats.totalGames || 0) >= value;
            case 'victoires':
                return (stats.wins || 0) >= value;
            case 'serie_victoires':
                return (stats.maxSerieWins || 0) >= value;
            case 'jours_consecutifs':
                return (stats.daysConsecutives || 0) >= value;
            case 'victoires_coup':
                const fieldWins = `victoires${movePlayed.charAt(0).toUpperCase() + movePlayed.slice(1)}`;
                return (stats[fieldWins] || 0) >= value;
            case 'victoires_equilibrees':
                return (stats.winsRock || 0) >= value &&
                       (stats.winsLeaf || 0) >= value &&
                       (stats.winsScissors || 0) >= value;
            default:
                return false;
        }
    }

    static calculateProgression(recompense, stats) {
        const { type, value, movePlayed } = recompense.conditions;

        switch (type) {
            case 'parties_jouees':
                return Math.min((stats.totalGames || 0) / value, 1);
            case 'victoires':
                return Math.min((stats.wins || 0) / value, 1);
            case 'serie_victoires':
                return Math.min((stats.maxSerieWins || 0) / value, 1);
            case 'jours_consecutifs':
                return Math.min((stats.daysConsecutives || 0) / value, 1);
            case 'victoires_coup':
                const fieldWins = `victoires${movePlayed.charAt(0).toUpperCase() + movePlayed.slice(1)}`;
                return Math.min((stats[fieldWins] || 0) / value, 1);
            case 'victoires_equilibrees':
                const minWins = Math.min(
                    stats.winsRock || 0,
                    stats.winsLeaf || 0,
                    stats.winsScissors || 0
                );
                return Math.min(minWins / value, 1);
            default:
                return 0;
        }
    }
}

module.exports = RecompensesController;