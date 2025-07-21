const express = require('express');
const router = express.Router();

// IMPORT DU CONTROLLEUR
const UsersController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/auth')

//ROUTE D'AUTHENTIFICATION
router.post('/register', UsersController.register);
router.post('/login', UsersController.login);
router.post('/logout', UsersController.logout);

//ROUTE PROTEGEES
router.get('/profile', verifyToken, UsersController,getProfile);
router.put('/profile', verifyToken, UsersController.updateProfile);
router.get('/stats', verifyToken, UsersController.getStats);

module.exports = router;