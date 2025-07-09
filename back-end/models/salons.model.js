const mongoose = require('mongoose');

const salonsSchema = mongoose.Schema(
    {
        name: {
            type: String,
            minLength: 2,
            maxLength: 20,
            require: true
        },
        
        userCreator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            require: true
        },

        userInvited: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Users",
            require: false
        }
    }, 
    { timestamp: { createAt: true } }
)

module.exports = mongoose.model('salons', salonsSchema)