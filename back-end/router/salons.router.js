const express = require('express');
const router = express.Router();
const verifieToken = require('../middlewares/auth');
const SalonsController = require('../controllers/salons.controller');

// ROUTES PUBLIQUES
router.get('/', SalonsController.getAllSalons);
router.get("/available", SalonsController.getSalonsLibres);
router.get("/:salonId", SalonsController.getSalonDetails);

// ROUTES PROTEGEES
router.post("/create", verifieToken, SalonsController.createSalon);
router.post("/join/:salonId", verifieToken, SalonsController.joinSalon);
router.put("/user/my-salons", verifieToken, SalonsController.getUserSalons);
router.delete("/:salonId", verifieToken, SalonsController.deleteSalon);

module.exports = router