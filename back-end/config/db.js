const mongoose = require('mongoose');
require('dotenv').config();

const connectMongoDB = () => {
    const mongoURI = process.env.MONGO_URI_LOCAL;
    const dbName = process.env.DB_NAME;

    mongoose
        .connect(mongoURI, { dbName })
        .then(() => console.log('✅ Connexion à mongo réussi'))
        .catch(error => {
            console.error('❌ Erreur de connexion à MongoDB :', error.message);
            process.exit(1);
        });
};

module.exports = connectMongoDB;