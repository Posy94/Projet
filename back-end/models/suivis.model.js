const mongoose = require('mongoose');

const suivisSchema = mongoose.Schema(
    {
        
    }, 
    { timestamp: { createAt: true } }
)

module.exports = mongoose.model('suivis', suivisSchema)