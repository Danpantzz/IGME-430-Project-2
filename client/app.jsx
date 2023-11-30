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
        ctx.lineWidth = y;
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

const handleChangeColor = (color) => {
    x = color;
}

const handleChatMessage = () => {
    const chatForm = document.getElementById('chatForm');
    const editBox = document.getElementById('editBox');

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (editBox.value) {
            const response = await fetch('/getUsername', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const result = await response.json();

            if (result.error) {
                return false;
            }

            socket.emit('chat message', editBox.value, result);
            editBox.value = '';
        }

        return false;
    })
}

const handleChangePassword = (e) => {
    e.preventDefault();
    helper.hideError();

    const username = e.target.querySelector('#user').value;
    const currpass = e.target.querySelector('#currpass').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !currpass || !pass || !pass2) {
        helper.handleError('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleError('New passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, currpass, pass, pass2 });

    return false;
}

// Socket.io displays ~~~~~~~~~~~~~~~~~~~~

const displayMessage = (msg, username) => {
    const messageDiv = document.createElement('div');
    messageDiv.innerText = `${username}: ${msg}`;
    document.getElementById('messages').appendChild(messageDiv);
}

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
                <label htmlFor='username'>Username: </label>
                <input id='user' type='text' name='username' placeholder='username' />
                <label htmlFor='currpass'>Password: </label>
                <input id='currpass' type='password' name='currpass' placeholder='password' />
                <label htmlFor='pass'>New Password: </label>
                <input id='pass' type='password' name='pass' placeholder='new password' />
                <label htmlFor='pass'>New Password: </label>
                <input id='pass2' type='password' name='pass2' placeholder='retype password' />
                <input className='formSubmit' type='submit' value='Change Password' />
            </form>

            <form action="/maker">
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
    canvas.style.display = 'block';

    return (
        // div for canvasControls
        <div id="colorsDiv">
            <button id="green" onClick={() => handleChangeColor("green")}></button>
            <button id="blue" onClick={() => handleChangeColor("blue")}></button>
            <button id="red" onClick={() => handleChangeColor("red")}></button>
            <button id="yellow" onClick={() => handleChangeColor("yellow")}></button>
            <button id="orange" onClick={() => handleChangeColor("orange")}></button>
            <button id="black" onClick={() => handleChangeColor("black")}></button>
        </div>
    )
}

// window for the chat room
const ChatWindow = (props) => {
    return (
        <div id="chatDiv">
            <div id="messages"></div>
            <form id="chatForm">
                <input id="editBox" type="text" />
                <input type="submit" />
            </form>
        </div>
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
        document.getElementById('domos').remove();
        ReactDOM.render(
            <ChangePasswordWindow />,
            document.getElementById('makeDomo'));
        return false;
    });

    ReactDOM.render(
        <MainWindow />,
        document.getElementById('app')
    );

    const channelForm = document.getElementById('channelForm');

    channelForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const channelSelect = document.getElementById('channelSelect');
        socket.emit('room selected', channelSelect.value);

        ReactDOM.render(
            <CanvasWindow />,
            document.getElementById('canvasControls')
        );
        ReactDOM.render(
            <ChatWindow />,
            document.getElementById('app')
        );
        handleChatMessage();
    });


    handleDraw();
    socket.on('chat message', displayMessage);
    socket.on('draw', displayDrawing);

}

window.onload = init;
// window.onresize = changeCanvasSize;