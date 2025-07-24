const express = require('express');
const connectMongoDB = require('./config/db');
const ENV = require('./config/env');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { RecompenseDefinition } = require('./models/recompenses.model')
RecompenseDefinition.initializerRecompensesByDefault();

// IMPORT ROUTER
const usersRouter = require('./router/users.router');
const salonsRouter = require('./router/salons.router');
const recompensesRouter = require('./router/recompenses.router');
const suivisRouter = require('./router/suivis.router');

// CONNEXION MONGO
connectMongoDB(ENV.MONGO_URI_LOCAL, ENV.DB_NAME);


// MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.PORT_APPLICATION_FRONT || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
}));

// URL API (PREFIXES)
app.use("/api/user", usersRouter);
app.use("/api/salons", salonsRouter);
app.use("/api/recompenses", recompensesRouter);
app.use("/api/suivis", suivisRouter);

// MIDDLEWARE GESTION D ERREURS

module.exports = app;