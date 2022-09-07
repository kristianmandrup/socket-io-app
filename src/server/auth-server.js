require('dotenv').config()

const express = require('express')

const { privateKey, certificate, ca } = require('./certificates')
const app = express.createServer({ key: privateKey, cert: certificate, ca: ca });
const jwt = require('jsonwebtoken')

app.use(express.json())

let refreshTokens = []

// TODO
const verifyUser = ({ username, password }) => {
    return true
}

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
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
        user = { username: 'ADMIN' }
    } else {
        const { username, password } = req.body
        user = { username }
        if (!verifyUser({ username, password })) {
            res.json({ success: false, msg: "Invalid user" })
            return
        }
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' })
}

app.listen(4000)