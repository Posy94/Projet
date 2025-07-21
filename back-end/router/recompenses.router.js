const express = require ('express');
const router = express.Router();
const RecompensesController = require('../controllers/recompenses.controller');
const verifieToken = require('../middlewares/auth');

// ROUTES PUBLIQUES
router.get('/classement', RecompensesController.getRank);

// ROUTES PROTEGEES
router.get('/user/:userId', verifieToken, RecompensesController.getRecompenseUser);
router.post('/verifier/:userId', verifieToken, RecompensesController.verifieRecompensesUser);

module.exports = router