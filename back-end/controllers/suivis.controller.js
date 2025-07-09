const SuivisModel = require('../models/suivis.model');

const createSuivis = async (req, res) => {
    try {
        const suivis = await SuivisModel.create(req.body)
        
        res.status(201).json({message: "Suivi created", suivis})
    } catch (error) {
        console.log(error.message);
    }
}
const readSuivis = async (req, res) => {
    try {
        const suivis = await SuivisModel.find(req.body)
        
        res.status(201).json({message: "Suivis affichés", suivis})
    } catch (error) {
        console.log(error.message);
    }
}
const detailSuivis = async (req, res) => {
    try {
        const suivis = await SuivisModel.findById(req.body)
        
        res.status(201).json({message: "Suivi affiché", suivis})
    } catch (error) {
        console.log(error.message);
    }
}
const updateSuivis = async (req, res) => {
    try {
        const suivis = await SuivisModel.findByIdAndUpdate(req.body)
        
        res.status(201).json({message: "Suivi updated", suivis})
    } catch (error) {
        console.log(error.message);
    }
}
const deleteSuivis = async (req, res) => {
    try {
        const suivis = await SuivisModel.findByIdAndDelete(req.body)
        
        res.status(201).json({message: "Suivi supprimé", suivis})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    createSuivis,
    readSuivis,
    detailSuivis,
    updateSuivis,
    deleteSuivis
}