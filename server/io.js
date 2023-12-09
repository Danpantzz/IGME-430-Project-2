const http = require('http');
const { Server } = require('socket.io');

let io;

const handleRoomChange = (socket, roomName, username) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;
        socket.leave(room);
    });
    socket.join(roomName);

    io.to(roomName).emit('joined or left', 'has joined!', username);
    io.to(roomName).emit('update room size', io.sockets.adapter.rooms.get(roomName).size);

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

const handleClearCanvas = (socket) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        io.to(room).emit('clear canvas');
    })
}

const socketSetup = (app, sessionMiddleware) => {
    const server = http.createServer(app);
    io = new Server(server);
    io.engine.use(sessionMiddleware);

    io.on('connection', (socket) => {
        const username = socket.request.session.account.username;

        socket.join('0');
        console.log(`${username} connected`);

        // called before user leaves room, emit a message to that room
        socket.on('disconnecting', () => {

            // if not disconnecting from room 0
            if (!socket.rooms.has('0')) {
                io.to(Array.from(socket.rooms)[1]).emit('joined or left', 'has left!', username);
                io.to(Array.from(socket.rooms)[1]).emit('update room size', io.sockets.adapter.rooms.get(Array.from(socket.rooms)[1]).size);
            }

        });

        socket.on('disconnect', () => {
            console.log(`${username} disconnected`);
        });

        socket.on('room selected', (room) => handleRoomChange(socket, room, username));
        socket.on('chat message', (msg) => handleChatMessage(socket, msg, username));
        socket.on('draw', (prevX, prevY, currX, currY, x, y) => handleDraw(socket, prevX, prevY, currX, currY, x, y));
        socket.on('clear canvas', () => handleClearCanvas(socket));
    });

    return server;
};

module.exports = socketSetup;