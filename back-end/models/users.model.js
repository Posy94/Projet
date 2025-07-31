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
        }

    }, { timestamps: true }
);

module.exports = mongoose.model('users', usersSchema)