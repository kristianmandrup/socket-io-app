// Server
/**
 * App.
 */
const privateKey = fs.readFileSync('./certs//key').toString();
const certificate = fs.readFileSync('./certs/crt').toString();
const ca = fs.readFileSync('./certs/intermediate.crt').toString();

const app = express.createServer({ key: privateKey, cert: certificate, ca: ca });
const io = require('socket.io')(app);
const jwt = require('jsonwebtoken');
const clientMap = require('./clients');
const eventTypes = ['denied', 'cancelled', 'completed']
const idMap = {}

const socketMap = {
}

const subscribeRoomInNamespace = (id, { namespace, room }) => {
    const socket = namespace.in(room)
    socketMap[id][room] = socket
}


const createNamespace = ({ id, subscriptions }) => {
    if (!id) return
    if (idMap[id]) return
    idMap[id] = true
    socketMap[id] = socketMap[id] || {}
    const namespace = io.of(`/${id}`);
    socketMap[id]['namespace'] = namespace
    namespace.use((socket, next) => {
        const token = socket.handshake.query.jwt;
        jwt.verify(token, jwtKey, (err, decoded) => {
            if (err) next(new Error('Hey hacker! you like jwt?'))
            else next();
        });
    });

    subscriptions.forEach(room => subscribeRoomInNamespace(id, { namespace, room }))
}

app.post(`/client`, (req) => {
    const { body } = req
    const { clientId, payload } = body
    if (clientMap[clientId]) {
        res.json({ success: false, msg: 'client already registered' })
        return
    }
    clientMap[clientId] = payload
    createNamespace(payload)
})

app.delete(`/client`, (req) => {
    const { params } = req
    const { clientId } = params
    clientMap[clientId] = {}
    const clSocketMap = socketMap[clientId]
    if (!clSocketMap) {
        res.json({ success: false, msg: 'no such client' })
        return
    }
    const sockets = Object.values(clSocketMap)
    sockets.forEach(socket => socket.disconnectSockets(true))
})

app.post(`/event`, (req, res) => {
    const { body } = req
    const { clientId, eventName } = body
    const clSocketMap = socketMap[clientId]
    if (!clSocketMap) {
        res.json({ success: false, msg: 'no such client' })
        return
    }
    const namespace = clSocketMap['namespace']
    subscribeRoomInNamespace(clientId, { namespace, room: eventName })
    res.json({ success: true })
})

app.delete(`/event`, (req) => {
    const { params } = req
    const { clientId, eventName } = params
    clientMap[clientId] = {}
    const clSocketMap = socketMap[clientId]
    if (!clSocketMap) {
        res.json({ success: false, msg: 'no such client' })
        return
    }
    const socket = clSocketMap[eventName]
    socket.disconnectSockets(true)
})

const onEventPostEmitToClientSocket = (eventType) => {
    app.post(`/${eventType}`, (req) => {
        const { body } = req
        const { clientId } = body
        const clSocketMap = socketMap[clientId]
        if (!clSocketMap) {
            res.json({ success: false, msg: 'no such client' })
            return
        }
        const socket = clSocketMap[eventType]
        socket.emit(eventType, body)
    })
}

eventTypes.forEach(onEventPostEmitToClientSocket)

io.on("connection", (socket) => {
    console.log(socket.rooms); // Set { <socket.id> }
    // socket.join("room1");
});

const clients = Object.values(clientMap)
clients.forEach(createNamespace)

