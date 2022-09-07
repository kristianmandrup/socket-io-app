const express = require('express')
const { privateKey, certificate, ca } = require('./certificates')
const createCertApp = () => express.createServer({ key: privateKey, cert: certificate, ca });
const createApp = () => express()

module.exports = {
    createCertApp,
    createApp
}
