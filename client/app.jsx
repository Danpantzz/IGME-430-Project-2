const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const { useState, useEffect } = React;

const socket = io();

// utilizes a lot from this comprehensive drawing example
// https://stackoverflow.com/questions/2368784/draw-on-html5-canvas-using-a-mouse

var canvas, ctx;
var x = "black",
    y = 2;

var line = true, circle = false, square = false;

// Handlers ~~~~~~~~~~~~~~~~~~~

// method for drawing on canvas and sending to socket.io
const handleDraw = (c, e) => {
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

            if (e.touches) {
                currX = e.touches["0"].clientX - canvas.offsetLeft;
                currY = e.touches["0"].clientY - canvas.offsetTop;
            }
            else {
                currX = e.clientX - canvas.offsetLeft;
                currY = e.clientY - canvas.offsetTop;
            }

            if (line) {
                flag = true;
                dot_flag = true;
                if (dot_flag) {
                    ctx.beginPath();
                    ctx.fillStyle = x;
                    ctx.fillRect(currX, currY, y, y);
                    ctx.closePath();
                    dot_flag = false;

                    socket.emit('dot', currX, currY, x, y);
                }
            }
            if (circle) {
                ctx.beginPath();
                ctx.fillStyle = x;
                ctx.arc(currX, currY, y * 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.closePath();

                socket.emit('circle', currX, currY, x, y);
            }
        }
        if (res == 'up' || res == "out") {
            flag = false;
        }
        if (res == 'move') {
            if (flag) {
                prevX = currX;
                prevY = currY;
                if (e.touches) {
                    currX = e.touches["0"].clientX - canvas.offsetLeft;
                    currY = e.touches["0"].clientY - canvas.offsetTop;
                }
                else {
                    currX = e.clientX - canvas.offsetLeft;
                    currY = e.clientY - canvas.offsetTop;
                }
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

        // send data to socket so all users see the drawing
        socket.emit('draw', prevX, prevY, currX, currY, x, y);
    }

    // mouse events
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

    // touchscreen events
    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        findxy('move', ctx, e)
    }, false);
    canvas.addEventListener("touchstart", function (e) {
        findxy('down', ctx, e)
    }, false);
    canvas.addEventListener("touchend", function (e) {
        findxy('up', ctx, e)
    }, false);
}

// method for changing drawing color
const handleChangeColor = (color) => {
    x = color;
}

// method for changing width size
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

// originally would have handled starting the gameplay loop, disabling the canvas for non-host players, and displaying
// the word to draw to the host/current drawer
const handlePlayGame = (e) => {
    e.preventDefault();
    helper.hideError();

    helper.handleError('Feature not implemented yet!');
    return false;
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

// sends post request to server to change status of premium to 'true'
const handleBuyPremium = (e) => {
    e.preventDefault();
    helper.hideError();

    const password = e.target.querySelector('#currpass').value;

    if (!password) {
        helper.handleError('You must enter your password to confirm!');
        return false;
    }

    helper.sendPost(e.target.action, { password });
    return false;
}

// save canvas to user device
// https://fjolt.com/article/html-canvas-save-as-image
const handleSave = (e) => {
    e.preventDefault();

    let canvasUrl = canvas.toDataURL();

    const createEl = document.createElement('a');
    createEl.href = canvasUrl;

    createEl.download = "my-canvas";

    createEl.click();
    createEl.remove();
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
const displayMessage = (msg, username, premium) => {
    const messageDiv = document.createElement('div');
    const messages = document.getElementById('messages');

    if (premium) messageDiv.innerHTML = `<b style="color:gold">${username}:</b> ${msg}`;
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
        userElement.innerHTML = `${user.username}`;

        // change username color if user is premium
        if (user.premium) {
            userElement.style.color = 'white';
            userElement.style.textShadow = '#000 2px 1px 3px, #E80 3px 0 10px';
        }
        usersContainer.appendChild(userElement);
    })
    userList.appendChild(usersContainer);

}

// display drawing to all users in channel
const displayDot = (_currX, _currY, _x, _y) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = _x;
    ctx.fillRect(_currX, _currY, _y, _y);
    ctx.closePath();
    ctx.restore();
}

// display drawing to all users in channel
const displayDrawing = (_prevX, _prevY, _currX, _currY, _x, _y) => {
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

const displayCircle = (_currX, _currY, _x, _y) => {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = _x;
    ctx.arc(_currX, _currY, _y * 2, 0, 2 * Math.PI);
    ctx.fill();
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
        <form id="channelForm" className='mainForm'>
            <h2>Choose a Room and Start Drawing!</h2>

            <select name="channel" id="channelSelect">
                <option value="1">Room 1</option>
                <option value="2">Room 2</option>
                <option value="3">Room 3</option>
                <option value="4">Room 4</option>
                <option value="5">Room 5</option>
            </select>
            <input type="submit" className='formSubmit' value='Join Room' />
        </form>
    )
}

// window for playing the game
const CanvasWindow = (props) => {
    const [premium, setPremium] = useState(props.premium);

    // get premium status of current client
    useEffect(() => {
        const requestPremiumStatus = async () => {
            const response = await fetch('/getPremiumStatus');
            setPremium(await response.json());
        };
        requestPremiumStatus();
    }, '');

    document.getElementById('title').style.display = 'none';

    canvas.style.display = 'block';

    // if premium is not defined yet (happens on first render) or user is not premium
    if (premium.premiumStatus === false) {
        return (
            // div for canvasControls
            <div id='controlsDiv'>
                <div id="colorsDiv">
                    <div>
                        <button id="green" onClick={() => handleChangeColor("green")} style={{ background: `green` }}></button>
                        <button id="blue" onClick={() => handleChangeColor("blue")} style={{ background: `blue` }}></button>
                        <button id="red" onClick={() => handleChangeColor("red")} style={{ background: `red` }}></button>
                        <button id="yellow" onClick={() => handleChangeColor("yellow")} style={{ background: `yellow` }}></button>
                        <button id="orange" onClick={() => handleChangeColor("orange")} style={{ background: `orange` }}></button>
                        <button id="black" onClick={() => handleChangeColor("black")} style={{ background: `black` }}></button>
                    </div>
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
                    <option value='10'>width 10</option>
                    <option value='12'>width 12</option>
                    <option value='14'>width 14</option>
                </select>
            </div>
        )
    }

    // user is premium, render special controls
    else if (premium.premiumStatus === true) {
        return (
            // div for canvasControls
            <div id='controlsDiv'>
                <div id="colorsDiv">
                    <div>
                        <button id="green" onClick={() => handleChangeColor("green")} style={{ background: `green` }}></button>
                        <button id="blue" onClick={() => handleChangeColor("blue")} style={{ background: `blue` }}></button>
                        <button id="red" onClick={() => handleChangeColor("red")} style={{ background: `red` }}></button>
                        <button id="yellow" onClick={() => handleChangeColor("yellow")} style={{ background: `yellow` }}></button>
                        <button id="orange" onClick={() => handleChangeColor("orange")} style={{ background: `orange` }}></button>
                        <button id="black" onClick={() => handleChangeColor("black")} style={{ background: `black` }}></button>
                    </div>

                    <div>
                        <button id="purple" onClick={() => handleChangeColor("purple")} style={{ background: `purple` }}></button>
                        <button id="pink" onClick={() => handleChangeColor("pink")} style={{ background: `pink` }}></button>
                        <button id="gold" onClick={() => handleChangeColor("gold")} style={{ background: `gold` }}></button>
                        <button id="brown" onClick={() => handleChangeColor("brown")} style={{ background: `brown` }}></button>
                        <button id="teal" onClick={() => handleChangeColor("teal")} style={{ background: `teal` }}></button>
                        <button id="silver" onClick={() => handleChangeColor("silver")} style={{ background: `silver` }}></button>
                    </div>

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
                    <option value='10'>width 10</option>
                    <option value='12'>width 12</option>
                    <option value='14'>width 14</option>
                </select>
                <div id='shapesDiv'>
                    <button id='line' onClick={() => { line = true; circle = false; square = false; }}>Line</button>
                    <button id='circle' onClick={() => { line = false; circle = true; square = false; }}>Circle</button>
                    {/* <button id='square' onClick={() => { line = false; circle = false; square = true; }}>Square</button> */}
                </div>
                <div id='saveDiv'>
                    <button onClick={handleSave}>Save as PNG</button>
                </div>
            </div>
        )

    }
}

// window for the chat room
const ChatWindow = (props) => {
    return (
        <form id="chatForm">
            <div id="messages"></div>
            <div id='formElements'>
                <input id="editBox" type="text" placeholder='Type here...' />
                <input type="submit" />
            </div>
        </form>
    )
}

// renders play button and sets up onClick event
const PlayButton = (props) => {
    return (
        <button id='playButton' onClick={(e) => handlePlayGame(e)}>Play Game</button>
    )
}

// window for purchasing premium
const PremiumWindow = (props) => {
    const [premium, setPremium] = useState(props.premium);

    // get premium status of current client
    useEffect(() => {
        const requestPremiumStatus = async () => {
            const response = await fetch('/getPremiumStatus');
            setPremium(await response.json());
        };
        requestPremiumStatus();
    }, '');


    if (premium.premiumStatus === false) {
        return (
            <div id='premiumDiv'>
                <form id='premiumForm'
                    name='premiumForm'
                    onSubmit={handleBuyPremium}
                    action='/buyPremium'
                    method='POST'
                    className='mainForm'
                >
                    <h2>Would you like to buy Premium?</h2>
                    <h3>It comes with these amazing features:</h3>
                    <ul>
                        <li>More color options</li>
                        <li>Shapes to draw with</li>
                        <li>And More!</li>
                    </ul>
                    <label htmlFor='currpass'>Please enter your password to confirm:</label>
                    <input id='currpass' type='password' name='currpass' placeholder='password' />
                    <input className='formSubmit' type='submit' value='Confirm' />
                </form>

                <form action="/app">
                    <input className='formSubmit' type='submit' value='Go Back' />
                </form>
            </div>
        );
    }
    else {
        return (
            <div id='premiumDiv'>
                <form id='premiumForm'
                    name='premiumForm'
                    action='/app'
                    className='mainForm'
                >
                    <h2>You already have Premium!</h2>
                    <h3>you get these amazing features:</h3>
                    <ul>
                        <li>More color options</li>
                        <li>Shapes to draw with</li>
                        <li>And More!</li>
                    </ul>
                    <input className='formSubmit' type='submit' value='Confirm' />
                </form>

                <form action="/app">
                    <input className='formSubmit' type='submit' value='Go Back' />
                </form>
            </div>
        );
    }
}


const init = () => {
    canvas = document.getElementById('myCanvas');
    const changePasswordButton = document.getElementById('changePassword');
    const premiumButton = document.getElementById('buyPremium');

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('channelForm').style.display = 'none';
        ReactDOM.render(
            <ChangePasswordWindow />,
            document.getElementById('userControls'));
        return false;
    });

    premiumButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (document.getElementById('channelForm')) {
            document.getElementById('channelForm').style.display = 'none';
        }
        else {
            canvas.style.display = 'none';
            document.getElementById('users').style.display = 'none';
            document.getElementById('controlsDiv').style.display = 'none';
            document.getElementById('chatForm').style.display = 'none';
            document.getElementById('playButton').style.display = 'none';
        }

        ReactDOM.render(
            <PremiumWindow premium={{ "premiumStatus": false }} />,
            document.getElementById('app')
        );
    });

    ReactDOM.render(
        <MainWindow />,
        document.getElementById('userControls')
    );

    const channelForm = document.getElementById('channelForm');

    channelForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const channelSelect = document.getElementById('channelSelect');

        // rendering canvas controls
        ReactDOM.render(
            <CanvasWindow premium={{ "premiumStatus": false }} />,
            document.getElementById('canvasControls')
        );

        // rendering chat message box
        ReactDOM.render(
            <ChatWindow />,
            document.getElementById('userControls')
        );
        ReactDOM.render(
            <PlayButton />,
            document.getElementById('playControls')
        );
        socket.emit('room selected', channelSelect.value);
        handleChatMessage();
    });


    handleDraw();
    socket.on('update room size', displayRoomSize);
    socket.on('joined or left', displayJoinOrLeftMessage);
    socket.on('chat message', displayMessage);
    socket.on('dot', displayDot);
    socket.on('draw', displayDrawing);
    socket.on('circle', displayCircle);
    socket.on('clear canvas', clearCanvas);

}

window.onload = init;