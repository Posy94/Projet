const express = require('express');
const router = express.Router();
const InvitationsController = require('../controllers/invitations.controller');
const verifieToken = require('../middlewares/auth');

// RECUPERER LES UTILISATEURS EN LIGNE
router.get('/players/online', verifieToken, InvitationsController.getOnlineUsers);

// RECUPERER MES INVITATIONS RECUES
router.get('/received', verifieToken, InvitationsController.getUserInvitations);

// ACCEPTER UNE INVITATION
router.post('/accept/:invitationId', verifieToken, InvitationsController.acceptInvitation);

// DECLINER UNE INVITATION
router.post('/decline/:invitationId', verifieToken, InvitationsController.declineInvitation);

module.exports = router;