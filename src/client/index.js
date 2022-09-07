const server_url = 'https://server-domain.com/'
const io = require('socket.io-client')

// Client
io(`${server_url}/${client_id}`, {
    query: {
        jwt: cookies.get('adyen-ws-token')
    },
    transports: ['websocket'],
    secure: true
});
