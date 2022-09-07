const privateKey = fs.readFileSync('./certs//key').toString();
const certificate = fs.readFileSync('./certs/crt').toString();
const ca = fs.readFileSync('./certs/intermediate.crt').toString();
