const mongoose = require('mongoose');

const salonsSchema = new mongoose.Schema(
    {
        salonId: {
            type: String,
            required: true,
            unique:true
        },
        name: {
            type: String,
            required: true
        },
        userCreator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        players: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'users'
            },
            choice: {
                type: String,
                enum: ['rock', 'paper', 'scissors', null],
                default: null
            },
            ready: {
                type: Boolean,
                default: false
            },
            socketId: String
        }],
        maxPlayers: {
            type: Number,
            default: 2
        },
        status: {
            type: String,
            enum: ['waiting', 'playing', 'finished'],
            default: 'waiting'
        },
        currentRound: {
            type: Number,
            default: 1
        },
        maxRounds: {
            type: Number,
            default: 3
        },
        roundStartTime: {
            type: Date,
            default: null
        },
        scores: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            wins: {
                type: Number,
                default: 0
            }
        }],
        gameType: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('salons', salonsSchema);