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
            const salon = await SalonsModel.findOne({ salonId }).populate('players.user userCreator');

            if (!salon) {
                return res.status(404).json({ error: 'Salon introuvable' });
            }

            if (salon.players.length >= salon.maxPlayers) {
                return res.status(400).json({ error: 'Salon complet' });
            }

            // VERIFIER SI LE JOUEUR EST DEJA DANS LE SALON
            const isAlreadyInSalon = salon.players.some(player => {
                // VERIFIER SI PLAYER.USER EXISTE ET A UN _ID
                if (player.user && player.user._id) {
                    return player.user._id.toString() === userId;
                }
                // SI PAS DE POPULATE, COMPARER DIRECTEMENT AVEC L'OBJECTIF
                return player.user && player.user.toString() === userId;
            });

            if (isAlreadyInSalon) {
                return res.status(400).json({ error: 'Vous êtes déjà dans ce salon' });
            }

            salon.players.push({
                user: req.user.id,
                score: 0,
                isReady: false
            });

            const isSalonFull = salon.players.length >= salon.maxPlayers;

            if (isSalonFull) {
                salon.status = 'playing';
                console.log('🎮 Salon plein ! Démarrage du jeu...');
            }
            
            await salon.save();

            const io = req.app.get('io');
            if (io) {
                const updatedSalon = await SalonsModel.findOne({ salonId }).populate('players.user userCreator')

                // 🆕 VÉRIFIER COMBIEN DE CLIENTS SONT CONNECTÉS
                const socketsInRoom = await io.in(salonId).fetchSockets();
                console.log(`🔍 Nombre de sockets dans la room ${salonId}:`, socketsInRoom.length);

                io.to(salonId).emit('player-joined', {
                    salon: updatedSalon,
                    newPlayer: req.user
                });

                // SI SALON PLEIN, DEMARRER LE JEU
                if (isSalonFull) {
                    console.log('🚀 Émission de game-start pour salon:', salonId);
                    console.log('🔍 Données émises:', { salon: updatedSalon, message: 'La partie commence !' });

                    io.to(salonId).emit('game-start', {
                        salon: updatedSalon,
                        message: 'La partie commence !'
                    });

                    console.log('✅ game-start émis avec succès');
                }
            } else {
                console.log('⚠️ Socket.IO non disponible');
            }            

            res.json({
                message: 'Vous avez rejoint le salon',
                salon
            })

        } catch (error) {
            console.error('❌ Erreur joinSalon:', error);
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
            console.log("🔍 getAllSalons appelé");

            const salons = await SalonsModel.find({})
                .populate('userCreator', 'username email')
                .populate('players.user', 'username email')
                .sort({ createdAt: -1 });

            console.log("🔍 Salons trouvés:", salons.length);

            res.status(200).json({
                success: true,
                message: `${salons.length} salon(s) trouvé(s)`,
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

    // MODIFIER UN SALON
    updateSalon: async (req, res) => {
        try {
            const { salonId } = req.params;
            const updateData = req.body;

            // 🔍 CHERCHER LE SALON PAR salonId (pas _id)
            const salon = await SalonsModel.findOneAndUpdate(
                { salonId: salonId },
                updateData,
                { new: true, runValidators: true }
            )
            .populate('userCreator', 'username email')
            .populate('players.user', 'username email');

            if (!salon) {
                return res.status(404).json({ 
                    success: false,
                    message: "Salon non trouvé" 
                });
            }

            // 🔄 NOTIFY VIA SOCKET.IO
            const io = req.app.get('io');
            if (io) {
                io.to(salonId).emit('salon-updated', {
                    salon: salon,
                    message: 'Salon mis à jour'
                });
            }

            res.status(200).json({ 
                success: true,
                message: "Salon mis à jour avec succès",
                salon 
            });

        } catch (error) {
            console.error('❌ Erreur updateSalon:', error);
            res.status(500).json({ 
                success: false,
                message: "Erreur lors de la mise à jour",
                error: error.message 
            });
        }
    },

    // SUPPRIMER UN SALON
    deleteSalon: async (req, res) => {
        try {
            const { salonId } = req.params;
            console.log("🗑️ Suppression salon:", salonId);
            console.log("👤 Par utilisateur:", req.user.id, "- Rôle:", req.user.role);

            // ✅ Plus besoin de vérifier le créateur, le middleware s'en charge
            const salon = await SalonsModel.findOne({ salonId });

            if (!salon) {
                console.log("❌ Salon non trouvé");
                return res.status(404).json({
                    success: false,
                    error: 'Salon introuvable'
                });
            }

            console.log("✅ Salon trouvé:", salon.name);
            console.log("👤 Créateur du salon:", salon.userCreator);

            await SalonsModel.deleteOne({ salonId });

            console.log("✅ Salon supprimé par", req.user.role);
            res.json({
                success: true,
                message: `Salon supprimé par ${req.user.role}`
            });

        } catch (error) {
            console.error("❌ Erreur suppression:", error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },


    // CREER PARTIE IA
    createAISalon: async (req, res) => {
        console.log('🔍 Date serveur:', new Date());
        console.log('🔍 Locale serveur:', new Date().toLocaleString());
        console.log('🔍 Timezone serveur:', Intl.DateTimeFormat().resolvedOptions().timeZone);
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