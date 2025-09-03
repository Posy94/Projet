const UsersModel = require('../models/users.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const createError = require('../middlewares/error');
const emailServices = require('../services/emailServices');
const usersModel = require('../models/users.model');

// Générer JWT Token avec TON nom de cookie
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.TOKEN_SIGNATURE, { expiresIn: '7d' });
};

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        
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
        
        // GENERER TOKEN D'ACTIVATION
        const activationToken = emailServices.generateActivationToken();
        const activationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // CREATION DE L'UTILISATEUR (NON ACTIVE)
        const user = new usersModel({
            username: username.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            isActivated: false,
            activationToken,
            activationTokenExpires: activationExpires
        });

        await user.save();
        console.log('✅ Utilisateur créé (non activé):', email);
        
        // ENVOYER EMAIL D'ACTIVATION
        try {
            await emailServices.sendActivationEmail(user.email, activationToken);

            res.status(201).json({
                success: true,
                message: `📧 Inscription réussie ! Un email d'activation a été envoyé à ${email}. Vérifiez votre boîte mail (et vos spams).`,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    isActivated: user.isActivated
                }
            });
        } catch (emailError) {
            console.error('❌ Erreur envoi email:', emailError);

            await UsersModel.findByIdAndDelete(user._id);

            res.status(500).json({
                success: false,
                message: 'Erreur lors de l\'envoi de l\'email d\'activation. Veuillez réessayer.'
            });
        }

        // // Générer token
        // const token = generateToken(user._id);
        
        // // Cookie avec TON nom "token"
        // res.cookie('token', token, {
        //     httpOnly: true,
        //     maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
        //     sameSite: 'lax'
        // });
        
        // res.status(201).json({
        //     message: 'Inscription réussie',
        //     user: {
        //         id: user._id,
        //         username: user.username,
        //         email: user.email,
        //         stats: user.stats
        //     }
        // });
        
    } catch (error) {
        console.error('❌ Erreur inscription:', error);
        next(createError(500, error.message));
    }
};

module.exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        console.log('🔍 LOGIN ATTEMPT:', { email, password: password ? 'PROVIDED' : 'MISSING' });
        
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return next(createError(400, 'Email et mot de passe requis'));
        }
        
        // Trouver user avec password
        const user = await UsersModel.findOne({ email }).select('+password');
        console.log('👤 USER FOUND:', user ? {
            id: user._id,
            email: user.email,
            username: user.username,
            isActivated: user.isActivated,
            hasPassword: !!user.password
        } : 'NO USER FOUND');
        
        if (!user) {
            console.log('❌ User not found');
            return next(createError(400, 'Email ou mot de passe incorrect'));
        }

        // VERIFIER SI LE COMPTE EST ACTIVE
        if (!user.isActivated) {
            console.log('❌ Account not activated');
            return res.status(403).json({
                success: false,
                message: '⚠️ Votre compte n\'est pas encore activé. Vérifiez votre boîte mail et cliquez sur le lien d\'activation.',
                needsActivation: true,
                email: user.email
            })
        }
        
        // Vérifier password
        console.log('🔐 Comparing password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔐 Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return next(createError(400, 'Email ou mot de passe incorrect'));
        }

        console.log('✅ LOGIN SUCCESS');
        
        // Générer token
        const token = generateToken(user._id);
        
        // Cookie avec TON nom "token"
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });

        // METTRE A JOUR lastLogin
        user.updatedAt = new Date();
        await user.save();

        // 🔧 DEBUG - METTRE USER EN LIGNE
        console.log('🔄 Setting user online...');
        try {
            const updatedUser = await UsersModel.setUserOnline(user._id, null);
            console.log('✅ User set online:', {
                id: updatedUser._id,
                username: updatedUser.username,
                isOnline: updatedUser.isOnline,
                lastSeen: updatedUser.lastSeen
            });
        } catch (setOnlineError) {
            console.error('❌ Erreur setUserOnline:', setOnlineError);
        }
               
        res.json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                stats: user.stats,
                isActivated: user.isActivated
            },
            token
        });
        
    } catch (error) {
        console.error('❌ Erreur connexion:', error);
        next(createError(500, error.message));
    }
};

module.exports.logout = (req, res) => {
    try {
        
        // 🍪 Supprime le cookie avec les mêmes options que la création
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'lax'
        });
        
        res.status(200).json({ 
            success: true,
            message: 'Déconnexion réussie' 
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la déconnexion'
        });
    }
};

module.exports.getProfile = async (req, res, next) => {
    try {
       
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
        next(createError(500, error.message));
    }
};

module.exports.updateProfile = async (req, res, next) => {
    try {
        const { username, email, bio } = req.body;
               
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
        next(createError(500, error.message));
    }
};

module.exports.updateAvatar = async (req, res, next) => {
    try {
        const { avatar } = req.body;
               
        const updatedUser = await UsersModel.findByIdAndUpdate(
            req.user.id,
            { avatar, updatedAt: new Date() },
            { new: true }
        );
        
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
        next(createError(500, error.message));
    }
};

module.exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
                
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
        
        res.json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        next(createError(500, error.message));
    }
};

module.exports.getStats = async (req, res, next) => {
    try {
        
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
        next(createError(500, error.message));
    }
};

module.exports.activateAccount = async (req, res) => {
    try {
        const { token } = req.params;

        console.log('🔍 Tentative d\'activation avec token:', token);

        // TROUVER L'UTILISATEUR AVEC CE TOKEN
        const user =await UsersModel.findOne({
            activationToken: token,
            activationTokenExpires: { $gt: Date.now() } // Token non expiré
        });

        if (!user) {
            console.log('❌ Token invalide ou expiré:', token);
            return res.status(400).json({
                success: false,
                message: '❌ Token d\'activation invalide ou expiré'
            });
        }

        // ACTIVER L'UTILISATEUR
        user.isActivated = true;
        user.activationToken = null;
        user.activationTokenExpires = null;
        user.updatedAt = new Date();

        await user.save();

        console.log('✅ Compte activé pour:', user.email);

        res.json({
            success: true,
            message: `🎉 Compte activé avec succès ! Vous pouvez maintenant vous connecter.`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                isActivated: user.isActivated
            }
        });       
    } catch (error) {
        console.error('❌ Erreur activation:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur serveur lors de l\'activation'
        });
    }
};

module.exports.resendActivationEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email requis"
            });
        }

        const user = await UsersModel.findOne({
            email: email.toLowerCase().trim(),
            isActivated: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Aucun compte non activé trouvé avec cet email'
            });
        }

        // GENERER UN NOUVEAU TOKEN SI EXPIRE
        const now = new Date();
        if (!user.activationToken || user.activationTokenExpires < now) {
            user.activationToken = emailServices.generateActivationToken();
            user.activationTokenExpires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            await user.save();
        }

        // RENVOYER L'EMAIL
        await emailServices.sendActivationEmail(user, user.activationToken);

        res.json({
            success: true,
            message: `📧 Email d'activation renvoyé à ${email}`
        });

    } catch (error) {
        console.error('❌ Erreur renvoi email:', error);
        next(createError(500, error.message));
    }
};


