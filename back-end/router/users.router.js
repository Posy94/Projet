const express = require('express');
const router = express.Router();

// IMPORT DU CONTROLLEUR
const UsersController = require('../controllers/users.controller');
const verifieToken = require('../middlewares/auth')

//ROUTE D'AUTHENTIFICATION
router.post('/register', UsersController.register);
router.post('/login', UsersController.login);
router.post('/logout', UsersController.logout);

//ROUTE PROTEGEES
router.get('/getProfile', verifieToken, UsersController.getProfile);
router.put('/updateProfile', verifieToken, UsersController.updateProfile);
router.get('/stats', verifieToken, UsersController.getStats);

module.exports = router;