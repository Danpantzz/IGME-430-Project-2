const http = require('http');
const { Server } = require('socket.io');

let io;

const handleDraw = (prevX, prevY, currX, currY, x, y) => {
    console.log('here');
    io.emit('draw', prevX, prevY, currX, currY, x, y);
}

const socketSetup = (app) => {
    const server = http.createServer(app);
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('a user connected');
        // socket.join('general');

        socket.on('disconnect', () => {
            console.log('a user disconnected');
        });

        // socket.on('chat message', (msg) => handleChatMessage(socket, msg));
        // socket.on('room change', (room) => handleRoomChange(socket, room));
        socket.on('draw', (prevX, prevY, currX, currY, x, y) => handleDraw(prevX, prevY, currX, currY, x, y));
    });

    return server;
};

module.exports = socketSetup;