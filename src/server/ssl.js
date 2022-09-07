const https = require('https');
const fs = require('fs');

export const server = https.createServer({
    cert: fs.readFileSync('../certs/certificate.pem'),
    key: fs.readFileSync('../certs/key.pem')
});