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
            require: true
        },
        userCreator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Users'
        },
        players: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'Users'
            },
            choice: {
                type: String,
                enum: ['rock', 'paper', 'scissors', null],
                default: null
            },
            ready: {
                type: Boolean,
                default: false
            }
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
        }
    }, 
    { timestamp: true }
);

module.exports = mongoose.model('salons', salonsSchema);