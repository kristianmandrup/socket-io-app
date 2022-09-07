# Socket.io app with dynamic namespaces

Allow clients to subscribe to transactions specific namespaces

A transaction can be:

- `declined`
- `completed`
- `cancelled`

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