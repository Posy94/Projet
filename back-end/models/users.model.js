const mongoose = require('mongoose');

const usersSchema = mongoose.Schema(
    {
        username: {
            type: String,
            minLength: 2,
            maxLength: 20,
            require: true,
            unique: true
        },
        email: {
            type: String,
            require: true,
            unique: true
        },
        password: {
            type: String,
            // minLength: 12,
            require: true,
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
                defaumt: 0
            }
        }
    }, { timestamp: true }
);

module.exports = mongoose.model('users', usersSchema)