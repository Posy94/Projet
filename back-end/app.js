const express = require('express');
const connectMongoDB = require('./config/db');
const ENV = require('./config/env');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');

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
app.use(cors());

// URL API (PREFIXES)
app.use("/api/user", usersRouter);
app.use("/api/salons", salonsRouter);
app.use("/api/recompenses", recompensesRouter);
app.use("/api/suivis", suivisRouter);

// MIDDLEWARE GESTION D ERREURS

module.exports = app;