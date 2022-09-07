require('dotenv').config()
const { createCertApp } = require('./app');
const app = createCertApp()
const jwt = require('jsonwebtoken');
const { jwtRefreshToken, jwtAccessToken } = require('./tokens');

app.use(express.json())

let refreshTokens = []

// TODO
const verifyUser = ({ name, password }) => {
    return true
}

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, jwtRefreshToken, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken })
    })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

app.post('/login', (req, res) => {
    // Authenticate User
    const { accesKey } = req.body
    let user
    if (accesKey) {
        if (accesKey !== process.env.ACCESS_KEY) {
            res.json({ success: false, msg: "Invalid or missing access key" })
            return
        }
        user = { name: 'ADMIN' }
    } else {
        const { name, password } = req.body
        user = { name }
        if (!verifyUser({ name, password })) {
            res.json({ success: false, msg: "Invalid user" })
            return
        }
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, jwtRefreshToken)
    refreshTokens.push(refreshToken)
    res.json({ accessToken, refreshToken })
})

function generateAccessToken(user) {
    return jwt.sign(user, jwtAccessToken, { expiresIn: '15s' })
}

app.listen(4000)