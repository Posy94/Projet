const UsersModel = require('../models/users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const createError = require('../middlewares/error');

// Générer JWT Token avec TON nom de cookie
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.TOKEN_SIGNATURE, { expiresIn: '7d' });
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
        console.log('📝 Tentative d\'inscription:', { username, email });
        
        // Vérification des champs requis
        if (!username || !email || !password) {
            return next(createError(400, 'Tous les champs sont requis'));
        }
        
        // Vérifier si user existe
        const existingUser = await UsersModel.findOne({
            $or: [{ email }, { username }]
        });
        
        if (existingUser) {
            return next(createError(400, 'Username ou email déjà utilisé'));
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Créer user
        const user = await UsersModel.create({
            username,
            email,
            password: hashedPassword,
            stats: { gamesPlayed: 0, wins: 0, losses: 0 }
        });
        
        // Générer token
        const token = generateToken(user._id);
        
        // Cookie avec TON nom "token"
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
            sameSite: 'lax'
        });
        
        console.log('✅ User créé:', user.username);
        
        res.status(201).json({
            message: 'Inscription réussie',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        next(createError(500, error.message));
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔑 Tentative de connexion:', email);
        
        if (!email || !password) {
            return next(createError(400, 'Email et mot de passe requis'));
        }
        
        // Trouver user avec password
        const user = await UsersModel.findOne({ email }).select('+password');
        
        if (!user) {
            return next(createError(400, 'Email ou mot de passe incorrect'));
        }
        
        // Vérifier password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return next(createError(400, 'Email ou mot de passe incorrect'));
        }
        
        // Générer token
        const token = generateToken(user._id);
        
        // Cookie avec TON nom "token"
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });
        
        console.log('✅ Connexion réussie:', user.username);
        
        res.json({
            message: 'Connexion réussie',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                stats: user.stats
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        next(createError(500, error.message));
    }
};

module.exports.logout = (req, res) => {
    console.log('👋 Déconnexion utilisateur');
    res.clearCookie('token');
    res.json({ message: 'Déconnexion réussie' });
};

module.exports.getProfile = async (req, res, next) => {
    try {
        console.log('👤 Récupération profil pour ID:', req.user.id);
        
        const user = await UsersModel.findById(req.user.id);
        
        if (!user) {
            return next(createError(404, 'Utilisateur non trouvé'));
        }
        
        res.json({
            id: user._id,
            username: user.username,
            email: user.email,
            stats: user.stats
        });
    } catch (error) {
        console.error('❌ Erreur profil:', error);
        next(createError(500, error.message));
    }
};

module.exports.updateProfile = async (req, res, next) => {
    try {
        const { username, email, bio } = req.body;
        
        console.log('📝 Mise à jour profil pour:', req.user.id);
        
        // Vérifier si username/email pas déjà pris par un autre user
        if (username || email) {
            const existingUser = await UsersModel.findOne({
                $and: [
                    { _id: { $ne: req.user.id } }, // Pas l'utilisateur actuel
                    { $or: [{ email }, { username }] }
                ]
            });
            
            if (existingUser) {
                return next(createError(400, 'Username ou email déjà utilisé'));
            }
        }
        
        const updatedUser = await UsersModel.findByIdAndUpdate(
            req.user.id,
            { username, email, bio, updatedAt: new Date() },
            { new: true }
        );

        console.log('✅ Profil mis à jour:', updatedUser.username);
        
        res.json({ 
            message: 'Profil mis à jour avec succès', 
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                bio: updatedUser.bio,
                stats: updatedUser.stats
            }
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        next(createError(500, error.message));
    }
};

module.exports.updateAvatar = async (req, res, next) => {
    try {
        const { avatar } = req.body;
        
        console.log('🖼️ Mise à jour avatar pour:', req.user.id);
        
        const updatedUser = await UsersModel.findByIdAndUpdate(
            req.user.id,
            { avatar, updatedAt: new Date() },
            { new: true }
        );

        console.log('✅ Avatar mis à jour');
        
        res.json({ 
            message: 'Avatar mis à jour avec succès', 
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                avatar: updatedUser.avatar,
                stats: updatedUser.stats
            }
        });
    } catch (error) {
        console.error('❌ Erreur mise à jour avatar:', error);
        next(createError(500, error.message));
    }
};

module.exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        console.log('🔐 Changement mot de passe pour:', req.user.id);
        
        if (!currentPassword || !newPassword) {
            return next(createError(400, 'Mot de passe actuel et nouveau requis'));
        }
        
        // Récupérer user avec password
        const user = await UsersModel.findById(req.user.id).select('+password');
        
        // Vérification du mot de passe actuel
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return next(createError(400, 'Mot de passe actuel incorrect'));
        }

        // Hash du nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        
        await UsersModel.findByIdAndUpdate(req.user.id, { 
            password: hashedPassword,
            updatedAt: new Date()
        });

        console.log('✅ Mot de passe changé avec succès');
        
        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        console.error('❌ Erreur changement mot de passe:', error);
        next(createError(500, error.message));
    }
};

module.exports.getStats = async (req, res, next) => {
    try {
        console.log('📊 Récupération stats pour:', req.user.id);
        
        const user = await UsersModel.findById(req.user.id);
        
        const stats = {
            gamesPlayed: user.stats?.gamesPlayed || 0,
            wins: user.stats?.wins || 0,
            losses: user.stats?.losses || 0,
            winRate: user.stats?.gamesPlayed ? 
                Math.round((user.stats.wins / user.stats.gamesPlayed) * 100) : 0,
            level: user.level || 1,
            points: user.points || 0,
            dateInscription: user.createdAt
        };

        res.json(stats);
    } catch (error) {
        console.error('❌ Erreur récupération stats:', error);
        next(createError(500, error.message));
    }
};

