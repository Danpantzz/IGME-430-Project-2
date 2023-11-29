const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const socket = io();

var canvas, ctx, flag = false,
    prevX = 0,
    currX = 0,
    prevY = 0,
    currY = 0,
    dot_flag = false;

var x = "black",
    y = 2;

const handleDraw = (c, e) => {
    // send data to socket so all users see the drawing
    canvas = document.getElementById('myCanvas');
    ctx = canvas.getContext('2d');

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

const changeCanvasSize = () => {
    //let canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth * .5;
    canvas.height = window.innerHeight * .8;
}

const init = () => {
    canvas = document.getElementById('myCanvas');
    const changePasswordButton = document.getElementById('changePassword');

    // canvas.width = window.innerWidth * .5;
    // canvas.height = window.innerHeight * .8;

    changePasswordButton.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('domos').remove();
        ReactDOM.render(
            <ChangePasswordWindow />,
            document.getElementById('makeDomo'));
        return false;
    });


    handleDraw();
    // handleDraw();
    socket.on('draw', displayDrawing);

}

window.onload = init;
// window.onresize = changeCanvasSize;