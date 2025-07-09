const SalonsModel = require ('../models/salons.model')

const createSalons = async (req, res) => {
    try {
        const salons = await SalonsModel.create(req.body)

        res.status(201).json({message: "SALON CREATED", salons})
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)
    }
}

const readSalons = async (req, res) => {
    try {
        const salons = await SalonsModel.find(req.body)

        res.status(201).json({message: "SALONS AFFICHES", salons})
    } catch (error) {
        console.log(error.message);
        res.status(500).json(error.message)
    }
}

const detailSalons = async (req, res) => {
    try {
        const salons = await SalonsModel.findById(req.body)

        res.status(201).json({message: "DETAIL DU SALON", salons})
    } catch (error) {
        console.log(error.message);
    }
}

const updateSalons = async (req, res) => {
    try {
        const salons = await SalonsModel.findByIdAndUpdate(req.body)

        res.status(201).json({message: "SALON MODIFIE", salons})
    } catch (error) {
        console.log(error.message);
    }
}

const deleteSalons = async (req, res) => {
    try {
        const salons = await SalonsModel.findByIdAndDelete(req.body)

        res.status(201).json({message: "SALON SUPPRIME", salons})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    createSalons,
    readSalons,
    updateSalons,
    deleteSalons,
    detailSalons
}