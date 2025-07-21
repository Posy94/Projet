const http = require('http');
const socketIo = require('socket.io');
const app = require('/app');
const ENV = require('./config/env');

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: `http://localhost:${PORT}`,
        methods: ["GET", "POST"],
        credentials: true
    }
});

require('./socket/gameSocket')(io);

// PORT
const PORT = ENV.PORT || 8080;

// LISTEN
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port:${PORT}`);
})

// // MIDDLEWARE
// app.use(cors())
// app.use(express.json());

// // CONNEXION A MONGODB
// mongoose.connect('mongo')