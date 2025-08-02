const express = require('express');
const router = express.Router();
const verifieToken = require('../middlewares/auth');
const SalonsController = require('../controllers/salons.controller');
const salonController = require('../controllers/salons.controller');

// ROUTES PUBLIQUES
router.get('/', SalonsController.getAllSalons);
router.get("/available", SalonsController.getSalonsLibres);

// ROUTES PROTEGEES
router.post("/create", verifieToken, SalonsController.createSalon);
router.post("/join/:salonId", verifieToken, SalonsController.joinSalon);
router.put("/user/my-salons", verifieToken, SalonsController.getUserSalons);
router.delete("/:salonId", verifieToken, SalonsController.deleteSalon);
router.post('/create-ai', verifieToken, salonController.createAISalon);
router.post('/create-pvp', verifieToken, salonController.createPvPSalon);
router.get("/:salonId", verifieToken, SalonsController.getSalonDetails);

module.exports = router