const mongoose = require('mongoose');

const usersSchema = mongoose.Schema(
    {
        username: {
            type: String,
            minLength: 2,
            maxLength: 20,
            require: true
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
        }
    }, 
    { timestamp: { createAt: true } }
)

module.exports = mongoose.model('users', usersSchema)