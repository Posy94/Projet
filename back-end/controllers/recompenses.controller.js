const RecompensesModel = require('../models/recompenses.model')

const createRecompenses = async (req, res) => {
    try {
        const recompenses = await RecompensesModel.create(req.body)

        res.status(201).json({message: "Recompense created", recompenses})
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)        
    }
}
const readRecompenses = async (req, res) => {
    try {
        const recompenses = await RecompensesModel.find(req.body)

        res.status(201).json({message: "All Recompenses affichées", recompenses})
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)        
    }
}
const detailRecompenses = async (req, res) => {
    try {
        const recompenses = await RecompensesModel.findById(req.body)

        res.status(201).json({message: "Recompense Affichée", recompenses})
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)        
    }
}
const updateRecompenses = async (req, res) => {
    try {
        const recompenses = await RecompensesModel.findOneAndUpdate(req.body)

        res.status(201).json({message: "Recompense modifiée", recompenses})
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)        
    }
}
const deleteRecompenses = async (req, res) => {
    try {
        const recompenses = await RecompensesModel.findByIdAndDelete(req.body)

        res.status(201).json({message: "Recompense supprimée", recompenses})
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)        
    }
}

module.exports = {
    createRecompenses,
    readRecompenses,
    updateRecompenses,
    deleteRecompenses,
    detailRecompenses
}