# Socket.io app with dynamic namespaces

Allow clients to subscribe to transactions specific namespaces

A transaction can be:

- `declined`
- `completed`
- `cancelled`

## Authentication

The endpoints are protected using JWT base authentication. Provide the following env variables in a `.env` file on deployment.

```txt
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
ACCESS_KEY=
```

Use the `auth-server` to handle authentication such as:

- `login` log in 
- `logout` log out
- `token` generate new token

Login can be done either using an `accessKey` matching a secret `ACCESS_KEY` env var (for `Admin` users) or via `username` and `password` for client users.

A placeholder `verifyUser({ username, password })` function is supplied that must be customized to do proper verification, such as by lookup in a database.

The JWT token is expected to be passed as a `Bearer` token in the `authorization` header

The auth server is set to run on port `4000`

## API endpoints

### Cancelled transaction

POST `/cancelled` transaction

```json
{
    "clientId": "xyz", 
    "payload": {
        // as you wish
    }
}
```

Will emit `cancelled` event with `payload` to socket for that client

### Denied transaction

POST `/denied`

```json
{
    "clientId": "xyz", 
    "payload": {
        // as you wish
    }
}
```

Will emit `denied` event with `payload` to socket for that client

### Completed transaction

POST `/completed`

```json
{
    "clientId": "xyz", 
    "payload": {
        // as you wish
    }
}
```

Will emit `completed` event with `payload` to socket for that client


### Add client

POST `/client`

```json
{
    "clientId": "xyz", 
    "payload": {
        "id": "xyz",
        "name": "Xyz",
        "subscriptions": ["cancelled"]
    }
}
```

## Remove client

DELETE `/client?id=xyz`

Removes client from server and disconnects all sockets for that client

### Add client event socket

POST `/event`

```json
{
    "clientId": "xyz", 
    "eventName": "completed"
}
```

## Remove client event socket

DELETE `/event?clientId=xyz&eventName=completed`

Removes client from server and disconnects all sockets for that client