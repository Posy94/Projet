const express = require('express');
const router = express.Router();

// IMPORT DU CONTROLLEUR
const UsersController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/auth')

router.post('/register', UsersController.register);
router.get('/all', UsersController.getAllUsers);
router.get('/get/:id', UsersController.getUserByID);
router.post('/sign', UsersController.sign);

module.exports = router;