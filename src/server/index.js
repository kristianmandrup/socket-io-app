// Server
/**
 * App.
 */
const privateKey = fs.readFileSync('../key').toString();
const certificate = fs.readFileSync('../crt').toString();
const ca = fs.readFileSync('../intermediate.crt').toString();

const app = express.createServer({ key: privateKey, cert: certificate, ca: ca });
const io = require('socket.io')(app);
const jwt = require('jsonwebtoken');
const clients = require('./clients');
const eventTypes = ['denied', 'cancelled', 'completed']
const idMap = {}

const socketMap = {

}

const createNamespace = ({ id, subscriptions }) => {
    if (!id) return
    if (idMap[id]) return
    idMap[id] = true
    const namespace = io.of(`/${id}`);
    namespace.use((socket, next) => {
        const token = socket.handshake.query.jwt;
        jwt.verify(token, jwtKey, (err, decoded) => {
            if (err) next(new Error('Hey hacker! you like jwt?'))
            else next();
        });
    });

    subscriptions.forEach(room => {
        const socket = namespace.in(room)
        socketMap[id] = socketMap[id] || {}
        socketMap[id][room] = socket
    })
}


const onEventPostEmitToClientSocket = (eventType) => {
    app.post(`/${eventType}`, (req) => {
        const { body } = req
        const { clientId } = body
        const clSocketMap = socketMap[clientId]
        const socket = clSocketMap[eventType]
        socket.emit(eventType, body)
    })
}

eventTypes.forEach(onEventPostEmitToClientSocket)

io.on("connection", (socket) => {
    console.log(socket.rooms); // Set { <socket.id> }
    // socket.join("room1");
});

clients.forEach(createNamespace)

