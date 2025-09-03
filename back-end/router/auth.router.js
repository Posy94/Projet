const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const verifieToken = require('../middlewares/auth');

// 🔐 Routes publiques (pas de token requis)
router.post('/register', authController.register);
router.get('/activate/:token', authController.activateAccount);
router.post('/resend-activation', authController.resendActivationEmail);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// 🛡️ Routes protégées (token requis)
router.get('/profile', verifieToken, authController.getProfile);
router.put('/profile', verifieToken, authController.updateProfile);
router.put('/profile/avatar', verifieToken, authController.updateAvatar);
router.put('/profile/password', verifieToken, authController.changePassword);
router.get('/profile/stats', verifieToken, authController.getStats);



module.exports = router;
