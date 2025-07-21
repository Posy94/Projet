const express = require ('express')
const router = express.Router()
const verifieToken = require('../middlewares/auth')
const SuivisController = require('../controllers/suivis.controller');

// TOUTES LES ROUTES SONT PROTEGEES
router.use(verifieToken);

// STATISTIQUES GLOBALES DE L'UTILISATEUR
router.get('/stats', SuivisController.getUserStats)

// STATISTIQUES PAR CHOIX
router.get('/choice-stats', SuivisController.getChoiceStats)

// HISTORIQUE DES PARTIES RECENTES
router.get('/recent-games', SuivisController.getRecentGames)

// PROGRESSION DANS LE TEMPS
router.get('/progression', SuivisController.getProgressionStats)

// COMPARAISON AVEC LES AUTRES JOUEURS
router.get('/comparison', SuivisController.getComparisonStats)

module.exports = router