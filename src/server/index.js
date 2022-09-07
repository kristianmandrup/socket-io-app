// Server
const { createCertApp } = require('./app');
const app = createCertApp()
const io = require('socket.io')(app);
const jwt = require('jsonwebtoken');
const clientMap = require('./clients');
const eventNames = ['denied', 'cancelled', 'completed']
const idMap = {}

const socketMap = {
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)

    jwt.verify(token, jwtAccessToken, (err, user) => {
        console.log(err)
        if (err) return res.sendStatus(403)
        req.user = user
        next()
    })
}

const isValidEventName = (eventName) => eventNames[eventName]

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
        jwt.verify(token, jwtAccessToken, (err, decoded) => {
            if (err) {
                next(new Error('Hey hacker! you like jwt?'))
                return
            }
            const { name } = decoded || {}
            if (name !== id) {
                next(new Error(`invalid user for namespace access`))
                return
            }
            next();
        });
    });

    subscriptions.forEach(room => subscribeRoomInNamespace(id, { namespace, room }))
}

app.post(`/client`, authenticateToken, (req) => {
    const { body } = req
    const { clientId, payload } = body
    if (clientMap[clientId]) {
        res.json({ success: false, msg: 'client already registered' })
        return
    }
    clientMap[clientId] = payload
    createNamespace(payload)
    res.json({ success: true })
})


app.delete(`/client`, authenticateToken, (req) => {
    const { params } = req
    const { id } = params
    clientMap[id] = {}
    const clSocketMap = socketMap[id]
    if (!clSocketMap) {
        res.json({ success: false, msg: 'no such client' })
        return
    }
    const nsSocket = clSocketMap['namespace']
    nsSocket.disconnectSockets(true)
    // TODO: examine if we need this
    const sockets = Object.values(clSocketMap)
    sockets.forEach(socket => socket.disconnectSockets(true))
    res.json({ success: true })
})


app.post(`/event`, authenticateToken, (req, res) => {
    const { body } = req
    const { clientId, eventName } = body
    const clSocketMap = socketMap[clientId]
    if (!clSocketMap) {
        res.json({ success: false, msg: 'no such client' })
        return
    }
    if (!isValidEventName(eventName)) {
        res.json({ success: false, msg: `invalid event name: ${eventName}` })
        return
    }
    const namespace = clSocketMap['namespace']
    subscribeRoomInNamespace(clientId, { namespace, room: eventName })
    res.json({ success: true })
})


app.delete(`/event`, authenticateToken, (req) => {
    const { params } = req
    const { clientId, eventName } = params
    clientMap[clientId] = {}
    const clSocketMap = socketMap[clientId]
    if (!clSocketMap) {
        res.json({ success: false, msg: 'no such client' })
        return
    }
    if (!isValidEventName(eventName)) {
        res.json({ success: false, msg: `invalid event name: ${eventName}` })
        return
    }
    const socket = clSocketMap[eventName]
    if (!socket) {
        res.json({ success: false, msg: `no client socket for: ${eventName}` })
        return
    }
    socket.disconnectSockets(true)
    res.json({ success: true })
})

const onEventPostEmitToClientSocket = (eventName) => {

    app.post(`/${eventName}`, authenticateToken, (req) => {
        const { body } = req
        const { clientId } = body
        const clSocketMap = socketMap[clientId]
        if (!clSocketMap) {
            res.json({ success: false, msg: 'no such client' })
            return
        }
        const socket = clSocketMap[eventName]
        if (!socket) {
            res.json({ success: false, msg: `no client socket for: ${eventName}` })
            return
        }
        socket.emit(eventName, body)
        res.json({ success: true })
    })
}

eventNames.forEach(onEventPostEmitToClientSocket)

io.on("connection", (socket) => {
    console.log(socket.rooms);
});

const clients = Object.values(clientMap)
clients.forEach(createNamespace)

