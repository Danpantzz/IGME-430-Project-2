const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const DrawCanvas = (props) => {
    return (
        <canvas id="myCanvas" width={window.innerWidth * .5} height={window.innerHeight * .8}></canvas>
    );
}

const drawPlayer = () => {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 20, 0, 2 * Math.PI);
    ctx.stroke();

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
    let canvas = document.getElementById('myCanvas');
    canvas.width = window.innerWidth * .5;
    canvas.height = window.innerHeight * .8;
}

const init = () => {
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
        <DrawCanvas />,
        document.getElementById('canvasContainer')
    );

    drawPlayer();

}

window.onload = init;
window.onresize = changeCanvasSize;