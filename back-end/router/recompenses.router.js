const express = require ('express')
const router = express.Router()

const RecompensesController = require('../controllers/recompenses.controller')

router.post("/create", RecompensesController.createRecompenses)
router.get("/read", RecompensesController.readRecompenses)
router.get("/detail", RecompensesController.detailRecompenses)
router.put("/update", RecompensesController.updateRecompenses)
router.delete("/delete", RecompensesController.deleteRecompenses)

module.exports = router