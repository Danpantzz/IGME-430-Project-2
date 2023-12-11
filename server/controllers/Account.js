const models = require('../models');

const { Account } = models;

const loginPage = (req, res) => res.render('login');

const logout = (req, res) => {
  req.session.destroy();
  return res.redirect('/');
};

const login = (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;

  if (!username || !pass) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  return Account.authenticate(username, pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    req.session.account = Account.toAPI(account);

    return res.json({ redirect: '/app' });
  });
};

const signup = async (req, res) => {
  const username = `${req.body.username}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  try {
    const hash = await Account.generateHash(pass);
    const newAccount = new Account({ username, password: hash });
    await newAccount.save();
    req.session.account = Account.toAPI(newAccount);
    return res.json({ redirect: '/app' });
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Username already in use!' });
    }
    return res.status(500).json({ error: 'An error occured!' });
  }
};

const changePassword = async (req, res) => {
  const username = `${req.session.account.username}`;
  const currpass = `${req.body.currpass}`;
  const pass = `${req.body.pass}`;
  const pass2 = `${req.body.pass2}`;

  if (!username || !currpass || !pass || !pass2) {
    return res.status(400).json({ error: 'All fields are required!' });
  }

  if (pass !== pass2) {
    return res.status(400).json({ error: 'Passwords do not match!' });
  }

  return Account.authenticate(username, currpass, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password!' });
    }

    try {
      const hash = await Account.generateHash(pass);
      const acc = account;
      acc.password = hash;
      await acc.save();
      return res.json({ redirect: '/app' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'An error occured!' });
    }
  });
};

const buyPremium = async (req, res) => {
  console.log(`${req.session.account.username} buying premium`);
  const username = `${req.session.account.username}`;
  const password = `${req.body.password}`;

  return Account.authenticate(username, password, async (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong password!' });
    }
    try {
      const acc = account;
      acc.premium = true;
      req.session.account.premium = true;
      await acc.save();
      return res.json({ redirect: '/app' });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'An error occured!' });
    }
  });
}

const getPremiumStatus = async (req, res) => {
  const premiumStatus = req.session.account.premium;
  console.log(`premium status: ${premiumStatus}`);

  return res.json({ premiumStatus });
}

module.exports = {
  loginPage,
  login,
  logout,
  signup,
  changePassword,
  buyPremium,
  getPremiumStatus
};
