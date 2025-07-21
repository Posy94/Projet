const SalonsModel = require ('../models/salons.model');
const UsersModel = require('../models/users.model');

const salonController = {

    // CREER UN SALON
    createSalon: async (req, res) => {
        try {
            const { name, maxRounds, isPrivate } = req.body;
            const salonId = Math.random().toString(36).substring(2, 15);

            const salon = new SalonsModel({
                salonId,
                name,
                creator: req.user.id,
                maxRounds: maxRounds || 3,
                isPrivate: isPrivate || false
            });

            await salon.save();
            await salon.populate('creator', 'username');

            res.status(201).json({
                message: 'Salon créé avec succés',
                salon
            });
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    },

    // REJOINDRE UN SALON
    joinSalon: async (req, res) => {
        try {
            const { salonId } = req.params;
            const salon = await SalonsModel.findOne({ salonId }).populate('players.user creator');

            if (!SalonsModel) {
                return res.status(404).json({ error: 'Salon introuvable' });
            }

            if (SalonsModel.players.length >= SalonsModel.maxPlayers) {
                return res.status(400).json({ error: 'Salon complet' });
            }

            // VERIFIER SI LE JOUEUR EST DEJA DANS LE SALON
            const isAlreadyInSalon = salon.players.some(
                player => player.user._id.toString() === req.user.id
            );

            if (isAlreadyInSalon) {
                return res.status(400).json({ error: 'Vous êtes déjà dans ce salon' });
            }

            res.json({
                message: 'Salon trouvé',
                salon
            })

        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // LISTER LES SALONS DISPONIBLES
    getSalonsLibres: async (req, res) => {
        try {
            const salons = await SalonsModel.find({
                status: 'waiting',
                isPrivate: false,
                $expr: { $lt: [{ $size: "$players" }, "$maxPlayers"] }
            })
            .populate('creator', 'username')
            .sort({ createdAt: -1 });

            res.json(salons);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // DETAIL D'UN SALON
    getSalonDetails: async (req, res) => {
        try {
            const { salonId } = req.params;
            const salon = await SalonsModel.findOne({ salonId })
                .populate('creator players.user', 'username');
            
            if (!salon) {
                return res.status(404).json({ error: 'Salon introuvable' })
            }

            res.json(salon);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // LES SALONS DE L'UTILISATEUR
    getUserSalons: async (req, res) => {
        try {
            const salons = await SalonsModel.find({ creator: req.user.id })
                .populate('players.user', 'username')
                .sort({ createdAt: -1 });
            
            res.json(salons);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // SUPPRIMER UN SALON
    deleteSalon: async (req, res) => {
        try {
            const { salonId } = req.params;
            const salon = await SalonsModel.findOne({ salonId, creator: req.user.id });

            if (!salon) {
                return res.status(404).json({
                    error: 'Salon introuvable ou vous n\'êtes pas le créateur du salon'
                });
            }

            await SalonsModel.deleteOne({ salonId });
            res.json({ message: 'Salon supprimé avec succès' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = salonController;