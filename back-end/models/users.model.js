const mongoose = require('mongoose');

const usersSchema = mongoose.Schema(
    {
        username: {
            type: String,
            minLength: 2,
            maxLength: 20,
            required: true,
            unique: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            // minLength: 12,
            required: true,
            select: false
        },
        role: {
            type: String,
            enum: ['user', 'admin', 'SuperAdmin'],
            default: 'user'
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        activationToken: {
            type: String,
            default: null
        },
        activationTokenExpires: {
            type: Date,
            default: null
        },
        isActivated: {
            type: Boolean,
            default: false
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isOnline: {
            type: Boolean,
            default: false
        },
        lastSeen: {
            type: Date,
            default: Date.now
        },
        currentSocketId: {
            type: String,
            default: null
        },
        stats: {
            gamesPlayed: {
                type: Number,
                default: 0
            },
            wins: {
                type: Number,
                default: 0
            },
            losses: {
                type: Number,
                default: 0
            },
            draws: {
                type: Number,
                default: 0
            }
        },
        avatar: {
            type: String,
            default: '👤',
            maxLength: 4
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        },
        bio: {
            type: String,
            default: null,
            maxLength: 50
        }

    }, { timestamps: true }
);

// METHODE STATISTIQUE POUR LES INVITATIONS
usersSchema.statics.getOnlineUsers = function() {
    return this.find({
        isOnline: true,
        isActive: true,
        isActivated: true,
        lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    }).select('username email avatar isOnline lastSeen')
};

usersSchema.statics.setUserOnline = function(userId, socketId = null) {
    console.log('📡 setUserOnline appelée pour:', userId);
    return this.findByIdAndUpdate(userId, {
        isOnline: true,
        lastSeen: new Date(),
        currentSocketId: socketId,
        updatedAt: new Date()
    }, { new: true });
};

usersSchema.statics.setUserOffline = function(userId) {
    return this.findByIdAndUpdate(userId, {
        isOnline: false,
        currentSocketId: null,
        updatedAt: new Date()
    }, { new: true });
};

// METHODE POUR VERIFIER SI UN UTILISATEUR EST DISPONIBLE
usersSchema.statics.isUserAvailable = function(userId) {
    return this.findOne({
        _id: userId,
        isOnline: true,
        isActive: true,
        isActivated: true,
        lastSeen: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
};

// METHODE POUR NETTOYER LES UTILISATEURS INACTIFS
usersSchema.statics.cleanupInactiveUsers = function() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.updateMany(
        {
            isOnline: true,
            lastSeen: { $lt: fiveMinutesAgo }
        },
        {
            isOnline: false,
            currentSocketId: null,
            updatedAt: new Date()
        }
    );
};

module.exports = mongoose.model('users', usersSchema)