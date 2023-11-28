const helper = require('./helper.js');
const React = require('react');
const ReactDOM = require('react-dom');

const handleDomo = (e) => {
    e.preventDefault();
    helper.hideError();

    const name = e.target.querySelector('#domoName').value;
    const age = e.target.querySelector('#domoAge').value;
    const level = e.target.querySelector('#domoLevel').value;

    if (!name || !age || !level) {
        helper.handleError('All fields are required!');
        return false;
    }

    helper.sendPost(e.target.action, { name, age, level }, loadDomosFromServer);

    return false;
}

const DomoForm = (props) => {
    return (
        <form id='domoForm'
            onSubmit={handleDomo}
            name='domoForm'
            action='/maker'
            method='POST'
            className='domoForm'
        >
            <label htmlFor='name'>Name: </label>
            <input id='domoName' type='text' name='name' placeholder='Domo Name' />
            <label htmlFor='age'>Age: </label>
            <input id='domoAge' type='number' min='0' name='age' />
            <label htmlFor='level'>Level: </label>
            <input id='domoLevel' type='number' min='0' name='level' />
            <input className='makeDomoSubmit' type='submit' value='Make Domo' />
        </form>
    );
}

const DomoList = (props) => {
    if (props.domos.length === 0) {
        return (
            <div className='domoList'>
                <h3 className='emptyDomo'>No Domos Yet!</h3>
            </div>
        );
    }

    const domoNodes = props.domos.map(domo => {
        return (
            <div key={domo._id} className='domo'>
                <img src='/assets/img/domoface.jpeg' alt='domo face' className='domoFace' />
                <h3 className='domoName'> Name: {domo.name} </h3>
                <h3 className='domoAge'> Age: {domo.age} </h3>
                <h3 className='domoLevel'> Level: {domo.level} </h3>
            </div>
        );
    });

    return (
        <div className='domoList'>
            {domoNodes}
        </div>
    );
}

const loadDomosFromServer = async () => {
    const response = await fetch('/getDomos');
    const data = await response.json();
    ReactDOM.render(
        <DomoList domos={data.domos} />,
        document.getElementById('domos')
    );
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
        <DomoForm />,
        document.getElementById('makeDomo')
    );

    ReactDOM.render(
        <DomoList domos={[]} />,
        document.getElementById('domos')
    );

    loadDomosFromServer();
}

window.onload = init;