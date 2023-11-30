const http = require('http');
const { Server } = require('socket.io');

let io;

const handleRoomChange = (socket, roomName) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;
        socket.leave(room);
    });
    socket.join(roomName);
    console.log(roomName);
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

        // socket.on('chat message', (msg) => handleChatMessage(socket, msg));
        socket.on('room selected', (room) => handleRoomChange(socket, room));
        socket.on('draw', (prevX, prevY, currX, currY, x, y) => handleDraw(socket, prevX, prevY, currX, currY, x, y));
    });

    return server;
};

module.exports = socketSetup;