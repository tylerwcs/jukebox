const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store the queue in memory
let songQueue = [];

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send current queue to newly connected users
    socket.emit('updateQueue', songQueue);

    socket.on('newRequest', (data) => {
        const request = {
            id: Date.now().toString(),
            name: data.name,
            song: data.song,
            timestamp: new Date().toLocaleTimeString()
        };
        songQueue.push(request);
        io.emit('updateQueue', songQueue);
    });

    socket.on('removeRequest', (id) => {
        songQueue = songQueue.filter(req => req.id !== id);
        io.emit('updateQueue', songQueue);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

