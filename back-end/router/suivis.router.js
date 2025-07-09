const express = require ('express')
const router = express.Router()

const SuivisController = require('../controllers/suivis.controller');

router.post('/create', SuivisController.createSuivis)
router.get('/read', SuivisController.readSuivis)
router.get('/detail', SuivisController.detailSuivis)
router.put('/update', SuivisController.updateSuivis)
router.delete('/delete', SuivisController.deleteSuivis)

module.exports = router