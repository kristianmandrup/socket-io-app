# Socket.io app with dynamic namespaces

Allow clients to subscribe to transactions specific namespaces

A transaction can be:

- `declined`
- `completed`
- `cancelled`

## API endpoints

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

DELETE `/client?id=xyz`

Removes client from server and disconnects all sockets for that client