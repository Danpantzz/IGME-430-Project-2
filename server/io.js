const http = require('http');
const { Server } = require('socket.io');

let io;

// called when anyone enters a room
const handleRoomChange = async (socket, roomName, username) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;
        socket.leave(room);
    });
    socket.join(roomName);

    // send message to everyone in the same room that someone joined
    io.to(roomName).emit('joined or left', 'has joined!', username, socket.request.session.account.premium);

    const sockets = await io.in(roomName).fetchSockets();
    const userArray = [];
    sockets.forEach(thisSocket => {
        const thisUsername = thisSocket.request.session.account.username;
        const premium = thisSocket.request.session.account.premium;
        userArray.push({ "username": thisUsername, "premium": premium });
    })

    // update room list to display all users in the room
    io.to(roomName).emit('update room size', userArray);

}

// called when a message is sent
const handleChatMessage = (socket, msg, username) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        const premium = socket.request.session.account.premium;
        io.to(room).emit('chat message', msg, username, premium);
    });
}

// called when just clicking on the canvas
const handleDot = (socket, currX, currY, x, y) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        io.to(room).emit('dot', currX, currY, x, y);
    })
}

// called when drawing on the canvas
const handleDraw = (socket, prevX, prevY, currX, currY, x, y) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        io.to(room).emit('draw', prevX, prevY, currX, currY, x, y);
    })
}

// called when drawing a circle on the canvas
const handleCircle = (socket, currX, currY, x, y) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        io.to(room).emit('circle', currX, currY, x, y);
    })
}

// called when clear canvas button is pressed
const handleClearCanvas = (socket) => {
    socket.rooms.forEach(room => {
        if (room === socket.id) return;

        io.to(room).emit('clear canvas');
    })
}

// initial setup
const socketSetup = (app, sessionMiddleware) => {
    const server = http.createServer(app);
    io = new Server(server);
    io.engine.use(sessionMiddleware);

    io.on('connection', (socket) => {
        const username = socket.request.session.account.username;

        socket.join('0');
        console.log(`${username} connected`);

        // called before user leaves room, emit a message to that room
        socket.on('disconnecting', async () => {

            // if not disconnecting from room 0
            if (!socket.rooms.has('0')) {
                // get the room this socket is in
                const room = Array.from(socket.rooms)[1];

                // get whether or not this user has premium
                const premium = socket.request.session.account.premium

                // tell room they left
                io.to(room).emit('joined or left', 'has left!', username, premium);

                // update list of users in that room
                const sockets = await io.in(room).fetchSockets();
                const userArray = [];
                sockets.forEach(thisSocket => {
                    if (thisSocket === socket) { return; }
                    const thisUsername = thisSocket.request.session.account.username;
                    const thisPremium = thisSocket.request.session.account.premium;
                    userArray.push({ "username": thisUsername, "premium": thisPremium });
                });

                io.to(room).emit('update room size', userArray);
            }

        });

        socket.on('disconnect', () => {
            console.log(`${username} disconnected`);
        });

        socket.on('room selected', (room) => handleRoomChange(socket, room, username));
        socket.on('chat message', (msg) => handleChatMessage(socket, msg, username));
        socket.on('dot', (currX, currY, x, y) => handleDot(socket, currX, currY, x, y));
        socket.on('draw', (prevX, prevY, currX, currY, x, y) => handleDraw(socket, prevX, prevY, currX, currY, x, y));
        socket.on('circle', (currX, currY, x, y) => handleCircle(socket, currX, currY, x, y));
        socket.on('clear canvas', () => handleClearCanvas(socket));

        socket.on('play', () => {

        });
    });

    return server;
};

module.exports = socketSetup;