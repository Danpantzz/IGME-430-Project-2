const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

// utilizes a lot from this comprehensive drawing example
// https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse

var canvas, ctx;
var x = "black",
    y = 2;

// Handlers ~~~~~~~~~~~~~~~~~~~

// method for drawing on canvas and sending to socket.io
const handleDraw = (c, e) => {
    // send data to socket so all users see the drawing
    ctx = canvas.getContext('2d');

    var flag = false,
        prevX = 0,
        currX = 0,
        prevY = 0,
        currY = 0,
        dot_flag = false;

    const findxy = (res, ctx, e) => {
        if (res == 'down') {
            prevX = currX;
            prevY = currY;
            currX = e.clientX - canvas.offsetLeft;
            currY = e.clientY - canvas.offsetTop;

            flag = true;
            dot_flag = true;
            if (dot_flag) {
                ctx.beginPath();
                ctx.fillStyle = x;
                ctx.fillRect(currX, currY, 2, 2);
                ctx.closePath();
                dot_flag = false;
            }
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
                draw(ctx);
            }
        }
    }

    const draw = (ctx) => {
        ctx.save()
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.strokeStyle = x;
        if (x == 'white') { ctx.lineWidth = 15; }
        else { ctx.lineWidth = y; }
        ctx.stroke();
        ctx.closePath();
        ctx.restore();

        socket.emit('draw', prevX, prevY, currX, currY, x, y);
    }

    canvas.addEventListener("mousemove", function (e) {
        findxy('move', ctx, e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', ctx, e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', ctx, e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', ctx, e)
    }, false);
}

// method for changing drawing color
const handleChangeColor = (color) => {
    x = color;
}

const handleChangeWidth = (width) => {
    y = width;
}

// method for sending chat message to all users in channel with socket.io
const handleChatMessage = () => {
    const chatForm = document.getElementById('chatForm');
    const editBox = document.getElementById('editBox');

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (editBox.value) {
            //let username = await handleGetUsername();
            socket.emit('chat message', editBox.value);
            editBox.value = '';
        }

        return false;
    })
}

// method for changing password
const handleChangePassword = (e) => {
    e.preventDefault();
    helper.hideError();

    //const username = e.target.querySelector('#user').value;
    const currpass = e.target.querySelector('#currpass').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!currpass || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('New passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { currpass, pass, pass2 });

    return false;
}

// Socket.io displays/methods ~~~~~~~~~~~~~~~~~~~~

// display joined/left message to room
const displayJoinOrLeftMessage = (msg, username) => {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'joinedOrLeft';

    const messages = document.getElementById('messages');

    messageDiv.innerHTML = `<i><b>${username} ${msg}</b></i>`;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// display message to all users in channel
const displayMessage = (msg, username) => {
    const messageDiv = document.createElement('div');
    const messages = document.getElementById('messages');

    messageDiv.innerHTML = `<b>${username}:</b> ${msg}`;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// display usernames in room
const displayRoomSize = (userArray) => {
    const userList = document.getElementById('users');
    userList.innerHTML = '';
    userList.style.display = 'block';

    const usersContainer = document.createElement('div');
    usersContainer.id = 'usersContainer';

    // add user to user list
    userArray.forEach(user => {
        const userElement = document.createElement('h3');

        userElement.id = 'userItem'
        userElement.innerHTML = `${user}`;
        usersContainer.appendChild(userElement);
    })
    userList.appendChild(usersContainer);

}

// display drawing to all users in channel
const displayDrawing = (_prevX, _prevY, _currX, _currY, _x, _y) => {
    // display the drawing to users who are not the ones drawing (because it is already there for them)
    ctx.save()
    ctx.beginPath();
    ctx.moveTo(_prevX, _prevY);
    ctx.lineTo(_currX, _currY);
    ctx.strokeStyle = _x;
    ctx.lineWidth = _y;
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

// clear canvas for all users in channel
const clearCanvas = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Windows ~~~~~~~~~~~~~~~~~~~~~~~~~~

// window for changing your password
const ChangePasswordWindow = (props) => {
    return (
        <div id='changePassDiv'>
            <form id='changePassForm'
                name='changePassForm'
                onSubmit={handleChangePassword}
                action='/changePassword'
                method='POST'
                className='mainForm'
            >
                <label htmlFor='currpass'>Password: </label>
                <input id='currpass' type='password' name='currpass' placeholder='password' />
                <label htmlFor='pass'>New Password: </label>
                <input id='pass' type='password' name='pass' placeholder='new password' />
                <label htmlFor='pass'>New Password: </label>
                <input id='pass2' type='password' name='pass2' placeholder='retype password' />
                <input className='formSubmit' type='submit' value='Change Password' />
            </form>

            <form action="/app">
                <input className='formSubmit' type='submit' value='Go Back' />
            </form>
        </div>
    );
}

// window for choosing room to join and avatar
const MainWindow = (props) => {
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.style.display = 'none';

    return (
        // form for creating room list
        <form id="channelForm">
            <select name="channel" id="channelSelect">
                <option value="1">Room 1</option>
                <option value="2">Room 2</option>
                <option value="3">Room 3</option>
                <option value="4">Room 4</option>
                <option value="5">Room 5</option>
            </select>
            <input type="submit" value='Join Room' />
        </form>
    )
}

// window for playing the game
const CanvasWindow = (props) => {
    document.getElementById('title').style.display = 'none';

    canvas.style.display = 'block';

    return (
        // div for canvasControls
        <div id='controlsDiv'>
            <div id="colorsDiv">
                <button id="green" onClick={() => handleChangeColor("green")}></button>
                <button id="blue" onClick={() => handleChangeColor("blue")}></button>
                <button id="red" onClick={() => handleChangeColor("red")}></button>
                <button id="yellow" onClick={() => handleChangeColor("yellow")}></button>
                <button id="orange" onClick={() => handleChangeColor("orange")}></button>
                <button id="black" onClick={() => handleChangeColor("black")}></button>
            </div>
            <button id='eraser' onClick={() => {
                handleChangeColor('white')
            }}>Eraser</button>
            <button id='clear' onClick={() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                socket.emit('clear canvas');
            }}>Clear</button>
            <select name='width' id='widthSelect' onChange={(e) => handleChangeWidth(e.target.value)}>
                <option value='2'>width 2</option>
                <option value='4'>width 4</option>
                <option value='6'>width 6</option>
                <option value='8'>width 8</option>
            </select>
        </div>
    )
}

// window for the chat room
const ChatWindow = (props) => {
    return (
        <form id="chatForm">
            <div id="messages"></div>
            <div id='formElements'>
                <input id="editBox" type="text" placeholder='Type your guess here...' />
                <input type="submit" />
            </div>
        </form>
    )
}


//// Cannot change canvas size because it cuts off content on smaller screens, and refreshes the canvas
// const changeCanvasSize = () => {
//     //let canvas = document.getElementById('myCanvas');
//     canvas.width = window.innerWidth * .5;
//     canvas.height = window.innerHeight * .8;
// }

const init = () => {
    canvas = document.getElementById('myCanvas');
    const changePasswordButton = document.getElementById('changePassword');

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('channelForm').style.display = 'none';
        ReactDOM.render(
            <ChangePasswordWindow />,
            document.getElementById('userControls'));
        return false;
    });

    ReactDOM.render(
        <MainWindow />,
        document.getElementById('userControls')
    );

    const channelForm = document.getElementById('channelForm');

    channelForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const channelSelect = document.getElementById('channelSelect');

        ReactDOM.render(
            <CanvasWindow />,
            document.getElementById('canvasControls')
        );
        ReactDOM.render(
            <ChatWindow />,
            document.getElementById('userControls')
        );
        socket.emit('room selected', channelSelect.value);
        handleChatMessage();
    });


    handleDraw();
    socket.on('update room size', displayRoomSize);
    socket.on('joined or left', displayJoinOrLeftMessage);
    socket.on('chat message', displayMessage);
    socket.on('draw', displayDrawing);
    socket.on('clear canvas', clearCanvas);

}

window.onload = init;
// window.onresize = changeCanvasSize;