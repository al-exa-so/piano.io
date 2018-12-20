const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

var connected_users = 0;

io.on('connection', (socket) => {
    connected_users++;

    io.emit('connectionsChanged', {connections: connected_users});

    socket.on('pianoKeyPressed', (data) => {
        socket.broadcast.emit('pressPianoKey', data.key);
    });

    socket.on('saxKeyPressed', (data) => {
        socket.broadcast.emit('pressSaxKey', data.key);
    });

    socket.on('drumKeyPressed', (data) => {
        socket.broadcast.emit('pressDrumKey', data.drum);
    });

    socket.on('disconnect', () => {
        connected_users--;
        io.emit('connectionsChanged', {connections: connected_users});
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});