const http = require('http');
const { Server } = require('socket.io');

let io;

const handleRoomChange = (socket, roomName, username) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;
        socket.leave(room);
    });
    socket.join(roomName);
    io.to(roomName).emit('chat message', 'Has joined!', username);
}

const handleChatMessage = (socket, msg, username) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        io.to(room).emit('chat message', msg, username);
    });
}

const handleDraw = (socket, prevX, prevY, currX, currY, x, y) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        io.to(room).emit('draw', prevX, prevY, currX, currY, x, y);
    })
}

const socketSetup = (app) => {
    const server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.join('0');

        socket.on('disconnect', () => {
            console.log('a user disconnected');
        });

        socket.on('room selected', (room, username) => handleRoomChange(socket, room, username));
        socket.on('chat message', (msg, username) => handleChatMessage(socket, msg, username));
        socket.on('draw', (prevX, prevY, currX, currY, x, y) => handleDraw(socket, prevX, prevY, currX, currY, x, y));
    });

    return server;
};

module.exports = socketSetup;