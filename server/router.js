const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);
  app.post('/buyPremium', mid.requiresLogin, controllers.Account.buyPremium);

  app.get('/app', mid.requiresLogin, controllers.Main.appPage);
  app.get('/getPremiumStatus', mid.requiresLogin, controllers.Account.getPremiumStatus);

  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
