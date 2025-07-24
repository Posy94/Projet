const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const ENV = require('./config/env');
const connectMongoDB = require('./config/db')

connectMongoDB();

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: ENV.PORT_APPLICATION_FRONT,
        methods: ["GET", "POST"],
        credentials: true
    }
});

require('./socket/gameSocket')(io);

// PORT
const PORT = ENV.PORT || 8080;
// LISTEN
server.listen(PORT, () => {
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
})