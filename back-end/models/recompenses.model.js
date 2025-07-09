const mongoose = require('mongoose');

const recompensesSchema = mongoose.Schema(
    {
        badgePartie: {
            type: String,
            minLength: 2,
            maxLength: 20,
            picture: "",
            require: true
        },
        
        badgeVictoire: {
            type: String,
            minLength: 2,
            maxLength: 20,
            picture: "",
            require: true
        },

        badgetemps: {
            type: String,
            minLength: 2,
            maxLength: 20,
            picture: "",
            require: true
        }
    }, 
    { timestamp: { createAt: true } }
)

module.exports = mongoose.model('recompenses', recompensesSchema)