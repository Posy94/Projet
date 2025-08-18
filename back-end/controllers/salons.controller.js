const SalonsModel = require ('../models/salons.model');
const { v4: uuidv4 } = require('uuid');

const salonController = {

    // CREER UN SALON
    createSalon: async (req, res) => {
        try {
            const { name, maxRounds, isPrivate } = req.body;
            const salonId = Math.random().toString(36).substring(2, 15);

            const salon = new SalonsModel({
                salonId,
                name,
                userCreator: req.user.id,
                maxRounds: maxRounds || 3,
                isPrivate: isPrivate || false
            });

            const savedSalon = await salon.save();
            const populatedSalon = await SalonsModel.findById(savedSalon._id)
                .populate('userCreator', 'username');

            res.status(201).json({
                message: 'Salon créé avec succés',
                salon: populatedSalon
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

            if (!salon) {
                return res.status(404).json({ error: 'Salon introuvable' });
            }

            if (salon.participants.length >= salon.maxParticipants) {
                return res.status(400).json({ error: 'Salon complet' });
            }

            // VERIFIER SI LE JOUEUR EST DEJA DANS LE SALON
            const isAlreadyInSalon = salon.participants.some(
                participant => participant._id.toString() === req.user.id
            );

            if (isAlreadyInSalon) {
                return res.status(400).json({ error: 'Vous êtes déjà dans ce salon' });
            }

            salon.particpants.push(req.user.id);
            await salon.save();

            res.json({
                message: 'Vous avez rejoint le salon',
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
            const { id } = req.params;

            const salonBrut = await SalonsModel.findOne({ id });
            console.log('🔵 SALON BRUT players:', JSON.stringify(salonBrut.players, null, 2));

            const salon = await SalonsModel.findOne({ id })
                .populate('userCreator', 'username email')
                .populate('players.user', 'username email');

            console.log('🟢 SALON POPULÉ players:', JSON.stringify(salon.players, null, 2));
            
            if (!salon) {
                return res.status(404).json({ error: 'Salon introuvable' })
            }

            res.json(salon);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // LES SALONS
    getAllSalons: async (req, res) => {
        try {
            const salons = await SalonsModel.find()
                .populate('userCreator', 'username')
                .populate('players.user', 'username')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                salons: salons
            });
        } catch (error) {
            console.error('Erreur getAllSalons:', error);            
            res.status(500).json({
                success: false,
                message: "Erreur serveur",
                error: error.message
            });
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
    },

    // CREER PARTIE IA
    createAISalon: async (req, res) => {
        try {
            const userId = req.user.id;
            const salonId = uuidv4();

            const salon = new SalonsModel({
                salonId,
                name: `Partie IA ${new Date().toLocaleString()}`,
                userCreator: userId,
                gameType: 'ai',
                maxPlayers: 2,
                status: 'waiting',
                currentRound: 1,
                maxRounds: 5
            });

            await salon.save();

            res.json({
                success: true,
                salonId,
                message: 'Salon IA créé'
            });
        } catch (error) {
            console.error('Erreur créer salon IA', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },

    // CREER PARTIE PVP
    createPvPSalon: async (req, res) => {
        try {
            const userId = req.user.id;
            const salonId = uuidv4();

            const salon = new SalonsModel({
                salonId,
                name: `Salon PVP ${salonId.substring(0, 8)}`,
                userCreator: userId,
                gameType: 'pvp',
                maxPlayers: 2,
                status: 'waiting',
                currentRound: 1,
                maxRounds: 5
            });

            await salon.save();

            res.json({
                success: true,
                salonId,
                message: 'Salon PVP créé'
            });
        } catch (error) {
            console.error('Erreur créer salon PVP', error);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    },
};

module.exports = salonController;