const path = require('path');
const http = require('http');
const axios = require('axios');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

var connected_users = 0;

var userColors = [];

io.on('connection', async (socket) => {
    var getColor = await axios.get('http://www.colr.org/json/color/random');
    userColors[socket.id] = getColor.data.colors[0].hex;

    console.log(userColors);

    connected_users++;

    io.emit('connectionsChanged', {connections: connected_users});
    socket.emit('setColor', {color: userColors[socket.id]});

    socket.on('pianoKeyPressed', (data) => {
        socket.broadcast.emit('pressPianoKey', {key: data.key, divid: data.divid, color: userColors[socket.id]});
    });

    socket.on('saxKeyPressed', (data) => {
        socket.broadcast.emit('pressSaxKey', {key: data.key, divid: data.divid, color: userColors[socket.id]});
    });

    socket.on('drumKeyPressed', (data) => {
        socket.broadcast.emit('pressDrumKey', {key: data.key, divid: data.divid, color: userColors[socket.id]});
    });

    socket.on('disconnect', () => {
        delete userColors[socket.id];
        connected_users--;
        io.emit('connectionsChanged', {connections: connected_users});
    });
});

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});