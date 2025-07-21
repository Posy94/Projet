const mongoose = require('mongoose');

const suivisSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        gameId: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Salon',
            required: true
        },
        roundNumber: {
            type: Number,
            required: true
        },
        choicUsed: {
            type:String,
            enum: ['rock', 'paper', 'scissors'],
            required: true
        },
        result: {
            type: String,
            enum: ['win', 'lose', 'draw'],
            required: true
        },
        gameDuration: {
            type: Number,
            required: true
        },
        metadata: {
            consecutiveWins: { type: Number, default: 0 },
            consecutiveLosses: { type: Number, default: 0 },
            isPersonalBest: { type: Boolean, default: false }
        }
    }, { timestamp: true });

    // INDEX POUR OPTIMISER LES REQUETES
    suivisSchema.index({ userId: 1, createdAt: -1 });
    suivisSchema.index({ userId: 1, choicUsed: 1 });
    suivisSchema.index({ userId: 1, result: 1 });

module.exports = mongoose.model('suivis', suivisSchema)