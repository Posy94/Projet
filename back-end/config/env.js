const dotenv = require('dotenv');

dotenv.config();

const ENV = {
    PORT: process.env.PORT,
    PORT_APPLICATION_FRONT: process.env.PORT_APPLICATION_FRONT,
    NOM_DOMAINE: process.env.NOM_DOMAINE,
    DB_NAME: process.env.DB_NAME,
    MONGO_URI_ONLINE: process.env.MONGO_URI_ONLINE,
    MONGO_URI_LOCAL: process.env.MONGO_URI_LOCAL,
    TOKEN_SIGNATURE: process.env.TOKEN_SIGNATURE,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS
}

module.exports = ENV;