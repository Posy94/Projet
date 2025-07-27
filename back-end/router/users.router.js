const express = require('express');
const router = express.Router();

const ENV = require('../config/env')
const jwt = require('jsonwebtoken');

// IMPORT DU CONTROLLEUR
const UsersController = require('../controllers/users.controller');
const verifieToken = require('../middlewares/auth')

//ROUTE D'AUTHENTIFICATION
router.post('/register', UsersController.register);
router.post('/login', UsersController.login);
router.post('/logout', UsersController.logout);

//ROUTE PROTEGEES
router.get('/getProfile', UsersController.getProfile);
router.put('/updateProfile', verifieToken, UsersController.updateProfile);
router.get('/stats', verifieToken, UsersController.getStats);

// ✅ ROUTE DE TEST (temporaire)
router.get('/test', (req, res) => {
  res.json({ message: 'Route accessible !' });
});


module.exports = router;