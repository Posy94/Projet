const express = require('express');
const router = express.Router();

const SalonsController = require('../controllers/salons.controller');

router.post("/create", SalonsController.createSalons)
router.get("/read", SalonsController.readSalons)
router.get("/detail/:id", SalonsController.detailSalons)
router.put("/update/:id", SalonsController.updateSalons)
router.delete("/delete/:id", SalonsController.deleteSalons)

module.exports = router