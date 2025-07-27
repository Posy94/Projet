const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ENV = require('../config/env');

const UsersModel = require('../models/users.model');

const usersController = {
    
    //INSCRIPTION
    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // VERIFIER SI L'UTILSATEUR EXISTE DEJA
            const existingUser = await UsersModel.findOne({
                $or: [{ email }, { username}]
            });

            if (existingUser) {
                return res.status(409).json({
                    error: 'Utilisateur ou email existant'
                });
            }
            
            const passwordHashed = await bcrypt.hash(password, 10);
            const user = new UsersModel({ username, email, password: passwordHashed });
            await user.save();

            const token = jwt.sign({ userId: user._id }, ENV.TOKEN_SIGNATURE, { expiresIn: '2h' });
            //DEFINITION DU COOKIE
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            res.status(201).json({
                message: 'Inscription réussie',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // CONNEXION
    login: async (req, res) => {

        try {
            const { email, password } = req.body;
            const user = await UsersModel.findOne({ email });

            if(!user || !await bcrypt.compare(password, user.password)) {
                return res.status(404).json({ error: 'Identifiants invalides' });
            }

            const token = jwt.sign(
                { userId: user._id },
                ENV.TOKEN_SIGNATURE,
                { expiresIn: "2h" }
            );

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production'
            });

            res.json({
                message: 'Connexion réussie',
                token,
                user: {
                    id:user._id,
                    username: user.username,
                    email: user.email,
                    stats: user.stats
                }
            });
        } catch (error) {
            console.error("🔥 Erreur dans login :", error.message);
            res.status(400).json({ error: error.message });        
        }
    },

    // DECONNEXION
    logout: (req, res) => {
        res.clearCookie('token');
        res.json({ message: 'Déconnexion réussie' });
    },
    
    // POUR ACCEDER AU PROFIL UTILISATEUR
    getProfile: async (req, res) => {
        
        try {
            console.log('🔥 getProfile MongoDB appelé !');
            
            // Test connexion + récupération des données
            const user = await UsersModel.findOne().select('username email stats');
            
            if (!user) {
                return res.status(404).json({ error: "Aucun utilisateur trouvé" });
            }
            
            console.log('✅ User trouvé dans MongoDB:', user);
            res.json(user);
            
        } catch (error) {
            console.error('❌ Erreur MongoDB:', error);
            res.status(400).json({ error: error.message });
        }
    },


    // MISE A JOUR DU PROFIL UTILISATEUR
    updateProfile: async (req, res) => {
        try {
            const { username, email } = req.body;
            const user = await UsersModel.findByIdAndUpdate(
                req.user.id,
                { username, email },
                { new: true }
            ).select('-password');

            res.json({
                message: 'Profil mis à jour',
                user
            });
        } catch (error) {
            res.status(400).json({ error: error.message }); 
        }
    },

    // VOIR LES STATISTIQUES DES JOUEURS
    getStats: async (req, res) => {
        try {
            const user = await UsersModel.findById(req.user.id).select('stats username');
            res.json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = usersController;